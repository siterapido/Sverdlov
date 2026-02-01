"use server";

import { db } from "@/lib/db";
import { members } from "@/lib/db/schema/members";
import { eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auditImport } from "@/lib/audit";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import {
    memberImportRowSchema,
    type MemberImportRow,
} from "@/lib/schemas/member-import";
import type { ValidatedRow, ImportResults } from "@/components/members/import/types";

async function getCurrentUserId(): Promise<string | undefined> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (token) {
            const user = await verifyToken(token);
            return user?.userId;
        }
    } catch {
        return undefined;
    }
    return undefined;
}

/**
 * Helper to parse dates from various formats (Excel serial, DD/MM/YYYY, ISO)
 */
function parseImportDate(value: unknown): string | null {
    if (!value) return null;

    try {
        // Excel serial number
        if (typeof value === 'number') {
            const date = new Date((value - 25569) * 86400 * 1000);
            return date.toISOString().split('T')[0];
        }

        if (typeof value === 'string') {
            const trimmed = value.trim();

            // DD/MM/YYYY format
            if (trimmed.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
                const [day, month, year] = trimmed.split('/');
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }

            // YYYY-MM-DD format (ISO)
            if (trimmed.match(/^\d{4}-\d{2}-\d{2}$/)) {
                return trimmed;
            }

            // Try standard parser as fallback
            const date = new Date(trimmed);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
            }
        }
    } catch (e) {
        console.error("Date parsing error for value:", value, e);
    }

    return null;
}

/**
 * Phase 1: Validate import data without writing to DB
 * Checks for duplicates based on CPF, voterTitle, and email
 */
export async function validateImportData(
    rawRows: Record<string, unknown>[],
    mapping: Record<string, string>
): Promise<{
    success: boolean;
    rows?: ValidatedRow[];
    error?: string;
}> {
    try {
        const validatedRows: ValidatedRow[] = [];

        for (let i = 0; i < rawRows.length; i++) {
            const rawRow = rawRows[i];

            // Map raw data to schema fields
            const mappedData: Record<string, unknown> = {};
            for (const [dbField, sheetColumn] of Object.entries(mapping)) {
                if (sheetColumn && rawRow[sheetColumn] !== undefined) {
                    mappedData[dbField] = rawRow[sheetColumn];
                }
            }

            // Handle date fields specially
            if (mappedData.dateOfBirth) {
                mappedData.dateOfBirth = parseImportDate(mappedData.dateOfBirth);
            }
            if (mappedData.affiliationDate) {
                mappedData.affiliationDate = parseImportDate(mappedData.affiliationDate);
            }

            // Validate with Zod schema
            const validation = memberImportRowSchema.safeParse(mappedData);

            if (!validation.success) {
                validatedRows.push({
                    index: i,
                    data: mappedData as MemberImportRow,
                    status: 'invalid',
                    errors: validation.error.issues.map((issue) => ({
                        field: issue.path.join('.'),
                        message: issue.message,
                    })),
                });
                continue;
            }

            const validData = validation.data;

            // Skip rows without minimum required data
            if (!validData.fullName || validData.fullName.length < 2) {
                validatedRows.push({
                    index: i,
                    data: validData,
                    status: 'invalid',
                    errors: [{ field: 'fullName', message: 'Nome é obrigatório' }],
                });
                continue;
            }

            // Check for duplicates in database
            const searchConditions = [];
            if (validData.cpf) {
                searchConditions.push(eq(members.cpf, validData.cpf));
            }
            if (validData.voterTitle) {
                searchConditions.push(eq(members.voterTitle, validData.voterTitle));
            }
            if (validData.email) {
                searchConditions.push(eq(members.email, validData.email));
            }

            let existingMember = null;
            let matchedField: 'cpf' | 'voterTitle' | 'email' | undefined;

            if (searchConditions.length > 0) {
                const rows = await db.select().from(members).where(or(...searchConditions)).limit(1);
                existingMember = rows[0];

                // Determine which field matched
                if (existingMember) {
                    if (validData.cpf && existingMember.cpf === validData.cpf) {
                        matchedField = 'cpf';
                    } else if (validData.voterTitle && existingMember.voterTitle === validData.voterTitle) {
                        matchedField = 'voterTitle';
                    } else if (validData.email && existingMember.email === validData.email) {
                        matchedField = 'email';
                    }
                }
            }

            if (existingMember && matchedField) {
                validatedRows.push({
                    index: i,
                    data: validData,
                    status: 'duplicate',
                    duplicateInfo: {
                        existingId: existingMember.id,
                        existingName: existingMember.fullName,
                        matchedField,
                    },
                });
            } else {
                validatedRows.push({
                    index: i,
                    data: validData,
                    status: 'valid',
                });
            }
        }

        return { success: true, rows: validatedRows };
    } catch (error) {
        console.error("Error validating import data:", error);
        const msg = error instanceof Error ? error.message : "Erro desconhecido";
        return { success: false, error: `Erro na validação: ${msg}` };
    }
}

/**
 * Phase 2: Execute import with transaction
 * Only processes valid rows and optionally updates duplicates
 */
export async function executeImport(
    validatedRows: ValidatedRow[],
    options: { updateDuplicates: boolean }
): Promise<{
    success: boolean;
    results?: ImportResults;
    error?: string;
}> {
    try {
        const results: ImportResults = {
            imported: 0,
            updated: 0,
            skipped: 0,
            errors: [],
        };

        // Use transaction to ensure atomicity
        await db.transaction(async (tx) => {
            for (const row of validatedRows) {
                // Skip invalid rows
                if (row.status === 'invalid') {
                    results.skipped++;
                    if (row.errors && row.errors.length > 0) {
                        results.errors.push({
                            index: row.index,
                            name: row.data.fullName || `Linha ${row.index + 1}`,
                            reason: row.errors.map(e => e.message).join(', '),
                        });
                    }
                    continue;
                }

                const memberData = {
                    fullName: row.data.fullName,
                    cpf: row.data.cpf || '',
                    voterTitle: row.data.voterTitle,
                    email: row.data.email || '',
                    phone: row.data.phone || '',
                    state: row.data.state || '',
                    city: row.data.city || '',
                    zone: row.data.zone,
                    neighborhood: row.data.neighborhood || '',
                    dateOfBirth: row.data.dateOfBirth || new Date().toISOString().split('T')[0],
                    gender: row.data.gender,
                    affiliationDate: row.data.affiliationDate,
                    party: row.data.party,
                    situation: row.data.situation,
                    disaffiliationReason: row.data.disaffiliationReason,
                    communicationPending: row.data.communicationPending,
                    updatedAt: new Date(),
                };

                try {
                    if (row.status === 'duplicate' && row.duplicateInfo) {
                        if (options.updateDuplicates) {
                            await tx.update(members)
                                .set(memberData)
                                .where(eq(members.id, row.duplicateInfo.existingId));
                            results.updated++;
                        } else {
                            results.skipped++;
                        }
                    } else if (row.status === 'valid') {
                        await tx.insert(members).values({
                            ...memberData,
                            status: 'active', // Imported members are active
                        });
                        results.imported++;
                    }
                } catch (err) {
                    console.error(`Error processing row ${row.index}:`, err);
                    results.errors.push({
                        index: row.index,
                        name: row.data.fullName || `Linha ${row.index + 1}`,
                        reason: err instanceof Error ? err.message : 'Erro desconhecido',
                    });
                    results.skipped++;
                }
            }
        });

        // Audit log for import
        const userId = await getCurrentUserId();
        await auditImport(userId, 'members', {
            imported: results.imported,
            updated: results.updated,
            skipped: results.skipped,
            errorsCount: results.errors.length,
        });

        revalidatePath("/members");
        return { success: true, results };
    } catch (error) {
        console.error("Error executing import:", error);
        const msg = error instanceof Error ? error.message : "Erro desconhecido";
        return { success: false, error: `Erro na importação: ${msg}` };
    }
}
