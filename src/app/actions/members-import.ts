"use server";

import { db } from "@/lib/db";
import { members } from "@/lib/db/schema/members";
import { eq, or, inArray } from "drizzle-orm";
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
 * Uses batch queries for duplicate detection instead of per-row queries
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
        // Step 1: Parse and validate all rows locally
        const parsedRows: {
            index: number;
            data: MemberImportRow;
            errors?: { field: string; message: string }[];
        }[] = [];

        for (let i = 0; i < rawRows.length; i++) {
            const rawRow = rawRows[i];

            const mappedData: Record<string, unknown> = {};
            for (const [dbField, sheetColumn] of Object.entries(mapping)) {
                if (sheetColumn && rawRow[sheetColumn] !== undefined) {
                    mappedData[dbField] = rawRow[sheetColumn];
                }
            }

            if (mappedData.dateOfBirth) {
                mappedData.dateOfBirth = parseImportDate(mappedData.dateOfBirth);
            }
            if (mappedData.affiliationDate) {
                mappedData.affiliationDate = parseImportDate(mappedData.affiliationDate);
            }

            const validation = memberImportRowSchema.safeParse(mappedData);

            if (!validation.success) {
                parsedRows.push({
                    index: i,
                    data: mappedData as MemberImportRow,
                    errors: validation.error.issues.map((issue) => ({
                        field: issue.path.join('.'),
                        message: issue.message,
                    })),
                });
                continue;
            }

            const validData = validation.data;

            if (!validData.fullName || validData.fullName.length < 2) {
                parsedRows.push({
                    index: i,
                    data: validData,
                    errors: [{ field: 'fullName', message: 'Nome é obrigatório' }],
                });
                continue;
            }

            parsedRows.push({ index: i, data: validData });
        }

        // Step 2: Batch query for duplicates (single DB round-trip instead of N)
        const validParsed = parsedRows.filter(r => !r.errors);
        const cpfs = validParsed
            .map(r => r.data.cpf)
            .filter((v): v is string => !!v && v.trim().length > 0);
        const voterTitles = validParsed
            .map(r => r.data.voterTitle)
            .filter((v): v is string => !!v && v.trim().length > 0);
        const emails = validParsed
            .map(r => r.data.email)
            .filter((v): v is string => !!v && v.trim().length > 0);

        const searchConditions = [];
        if (cpfs.length > 0) searchConditions.push(inArray(members.cpf, cpfs));
        if (voterTitles.length > 0) searchConditions.push(inArray(members.voterTitle, voterTitles));
        if (emails.length > 0) searchConditions.push(inArray(members.email, emails));

        let existingMembers: (typeof members.$inferSelect)[] = [];
        if (searchConditions.length > 0) {
            existingMembers = await db
                .select()
                .from(members)
                .where(or(...searchConditions));
        }

        // Build lookup maps for O(1) matching
        const cpfMap = new Map(
            existingMembers.filter(m => m.cpf).map(m => [m.cpf, m])
        );
        const voterTitleMap = new Map(
            existingMembers.filter(m => m.voterTitle).map(m => [m.voterTitle, m])
        );
        const emailMap = new Map(
            existingMembers.filter(m => m.email).map(m => [m.email, m])
        );

        // Step 3: Build final validated rows
        const validatedRows: ValidatedRow[] = parsedRows.map(row => {
            if (row.errors) {
                return {
                    index: row.index,
                    data: row.data,
                    status: 'invalid' as const,
                    errors: row.errors,
                };
            }

            let existingMember = null;
            let matchedField: 'cpf' | 'voterTitle' | 'email' | undefined;

            if (row.data.cpf && cpfMap.has(row.data.cpf)) {
                existingMember = cpfMap.get(row.data.cpf)!;
                matchedField = 'cpf';
            } else if (row.data.voterTitle && voterTitleMap.has(row.data.voterTitle)) {
                existingMember = voterTitleMap.get(row.data.voterTitle)!;
                matchedField = 'voterTitle';
            } else if (row.data.email && emailMap.has(row.data.email)) {
                existingMember = emailMap.get(row.data.email)!;
                matchedField = 'email';
            }

            if (existingMember && matchedField) {
                return {
                    index: row.index,
                    data: row.data,
                    status: 'duplicate' as const,
                    duplicateInfo: {
                        existingId: existingMember.id,
                        existingName: existingMember.fullName,
                        matchedField,
                    },
                };
            }

            return {
                index: row.index,
                data: row.data,
                status: 'valid' as const,
            };
        });

        return { success: true, rows: validatedRows };
    } catch (error) {
        console.error("Error validating import data:", error);
        const msg = error instanceof Error ? error.message : "Erro desconhecido";
        return { success: false, error: `Erro na validação: ${msg}` };
    }
}

/**
 * Build member data object from a validated row for insert/update
 */
function buildMemberData(row: ValidatedRow) {
    return {
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
}

const BATCH_SIZE = 50;

/**
 * Phase 2: Execute import using batch inserts
 * Compatible with neon-http driver (no transactions required)
 * Uses batch inserts for performance with per-row fallback on failure
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

        // Separate rows by status
        const validRows = validatedRows.filter(r => r.status === 'valid');
        const duplicateRows = validatedRows.filter(r => r.status === 'duplicate');
        const invalidRows = validatedRows.filter(r => r.status === 'invalid');

        // Track skipped invalid rows
        for (const row of invalidRows) {
            results.skipped++;
            if (row.errors && row.errors.length > 0) {
                results.errors.push({
                    index: row.index,
                    name: row.data.fullName || `Linha ${row.index + 1}`,
                    reason: row.errors.map(e => e.message).join(', '),
                });
            }
        }

        // Batch insert valid rows
        for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
            const batch = validRows.slice(i, i + BATCH_SIZE);
            const valuesToInsert = batch.map(row => ({
                ...buildMemberData(row),
                status: 'active' as const,
            }));

            try {
                await db.insert(members).values(valuesToInsert);
                results.imported += batch.length;
            } catch {
                // Batch failed (e.g. unique constraint) — fall back to individual inserts
                for (const row of batch) {
                    try {
                        await db.insert(members).values({
                            ...buildMemberData(row),
                            status: 'active' as const,
                        });
                        results.imported++;
                    } catch (err) {
                        console.error(`Error inserting row ${row.index}:`, err);
                        results.errors.push({
                            index: row.index,
                            name: row.data.fullName || `Linha ${row.index + 1}`,
                            reason: err instanceof Error ? err.message : 'Erro desconhecido',
                        });
                        results.skipped++;
                    }
                }
            }
        }

        // Handle duplicates
        if (options.updateDuplicates) {
            for (const row of duplicateRows) {
                if (!row.duplicateInfo) {
                    results.skipped++;
                    continue;
                }
                try {
                    await db.update(members)
                        .set(buildMemberData(row))
                        .where(eq(members.id, row.duplicateInfo.existingId));
                    results.updated++;
                } catch (err) {
                    console.error(`Error updating row ${row.index}:`, err);
                    results.errors.push({
                        index: row.index,
                        name: row.data.fullName || `Linha ${row.index + 1}`,
                        reason: err instanceof Error ? err.message : 'Erro desconhecido',
                    });
                    results.skipped++;
                }
            }
        } else {
            results.skipped += duplicateRows.length;
        }

        // Audit log
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
