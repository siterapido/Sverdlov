"use server";

import { db } from "@/lib/db";
import { members } from "@/lib/db/schema/members";
import { nuclei } from "@/lib/db/schema/nuclei";
import { memberSchema, type MemberSchema } from '@/lib/schemas/member';
import { eq, desc, sql, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createMemberAction(data: MemberSchema) {
    try {
        // Validate with Zod
        const validated = memberSchema.parse(data);

        // Check if CPF or Email already exists
        const [existingMember] = await db.select().from(members).where(or(
            eq(members.cpf, validated.cpf.replace(/\D/g, '')),
            eq(members.email, validated.email)
        )).limit(1);

        if (existingMember) {
            return {
                success: false,
                error: 'Já existe um cadastro com este CPF ou Email.'
            };
        }

        // Map interest to militancy level (internal convention)
        let militancyLevel: 'supporter' | 'militant' | 'leader' = 'supporter';
        if (validated.interest === 'militancy') {
            militancyLevel = 'militant';
        }

        await db.insert(members).values({
            fullName: validated.fullName,
            socialName: validated.socialName,
            cpf: validated.cpf.replace(/\D/g, ''), // Store clean CPF
            dateOfBirth: validated.dateOfBirth,
            email: validated.email,
            phone: validated.phone.replace(/\D/g, ''),
            state: validated.state,
            city: validated.city,
            neighborhood: validated.neighborhood,
            zone: validated.zone,
            voterTitle: validated.voterTitle,
            gender: validated.gender,
            status: 'interested',
            militancyLevel: militancyLevel,
            notes: validated.howDidYouHear ? `Conheceu a UP via: ${validated.howDidYouHear}` : null,
        });

        revalidatePath("/members");
        return { success: true };
    } catch (error: any) {
        console.error('Error creating member:', error);
        return {
            success: false,
            error: error.message || 'Erro interno ao processar cadastro.'
        };
    }
}

export async function getMembers() {
    try {
        const result = await db
            .select({
                id: members.id,
                fullName: members.fullName,
                cpf: members.cpf,
                voterTitle: members.voterTitle,
                state: members.state,
                city: members.city,
                zone: members.zone,
                status: members.status,
                nucleusName: nuclei.name,
                createdAt: members.createdAt,
            })
            .from(members)
            .leftJoin(nuclei, eq(members.nucleusId, nuclei.id))
            .orderBy(desc(members.createdAt));

        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching members:", error);
        return { success: false, error: "Falha ao carregar membros" };
    }
}

export async function getMemberById(id: string) {
    try {
        const result = await db.query.members.findFirst({
            where: eq(members.id, id),
            with: {
                nucleus: true,
                politicalResponsible: true,
            }
        });

        if (!result) return { success: false, error: "Membro não encontrado" };
        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching member by id:", error);
        return { success: false, error: "Falha ao carregar dados do membro" };
    }
}

export async function getPendingMembers() {
    try {
        const result = await db
            .select({
                id: members.id,
                fullName: members.fullName,
                socialName: members.socialName,
                email: members.email,
                phone: members.phone,
                state: members.state,
                city: members.city,
                status: members.status,
                createdAt: members.createdAt,
            })
            .from(members)
            .where(eq(members.status, 'interested'))
            .orderBy(desc(members.createdAt));

        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching pending members:", error);
        return { success: false, error: "Falha ao carregar solicitações pendentes" };
    }
}

export async function updateMemberStatus(
    id: string,
    status: 'interested' | 'in_formation' | 'active' | 'inactive',
    politicalResponsibleId?: string
) {
    try {
        const updateData: any = {
            status,
            updatedAt: new Date(),
        };

        if (status === 'active' || status === 'in_formation') {
            updateData.approvalDate = new Date();
        }

        if (politicalResponsibleId) {
            updateData.politicalResponsibleId = politicalResponsibleId;
        }

        await db.update(members)
            .set(updateData)
            .where(eq(members.id, id));

        revalidatePath("/members");
        revalidatePath("/members/requests");
        revalidatePath(`/members/${id}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating member status:", error);
        return { success: false, error: "Erro ao atualizar status do membro" };
    }
}

export async function updateMemberOrg(
    id: string,
    data: {
        nucleusId?: string | null;
        politicalResponsibleId?: string | null;
        militancyLevel?: 'supporter' | 'militant' | 'leader';
    }
) {
    try {
        await db.update(members)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(members.id, id));

        revalidatePath("/members");
        revalidatePath(`/members/${id}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating member organization:", error);
        return { success: false, error: "Erro ao atualizar organização do membro" };
    }
}

// Helper to parse dates from various formats (Excel serial, DD/MM/YYYY, ISO)
function parseImportDate(value: any): string | null {
    if (!value) return null;

    try {
        // Excel serial number (approximate)
        if (typeof value === 'number') {
            // Excel starts dates from Dec 30 1899
            const date = new Date((value - 25569) * 86400 * 1000);
            return date.toISOString().split('T')[0];
        }

        if (typeof value === 'string') {
            // DD/MM/YYYY
            if (value.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
                const [day, month, year] = value.split('/');
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }

            // Try standard parser
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
            }
        }
    } catch (e) {
        console.error("Date parsing error for value:", value, e);
        return null;
    }

    return null;
}

export async function importMembers(membersList: any[], updateExisting: boolean = false) {
    try {
        const results = {
            imported: 0,
            updated: 0,
            skipped: 0,
            duplicates: [] as any[]
        };

        for (const m of membersList) {
            const birthDate = m.dateOfBirth ? parseImportDate(m.dateOfBirth) : null;
            // CPF is cleaned to digits only
            const cleanCpf = m.cpf ? String(m.cpf).replace(/\D/g, '') : null;
            const voterTitle = m.voterTitle ? String(m.voterTitle).trim() : null;

            // Check if member exists
            let existingMember;
            const searchConditions = [];
            if (cleanCpf) searchConditions.push(eq(members.cpf, cleanCpf));
            if (voterTitle) searchConditions.push(eq(members.voterTitle, voterTitle));

            if (searchConditions.length > 0) {
                const rows = await db.select().from(members).where(or(...searchConditions)).limit(1);
                existingMember = rows[0];
            }

            const memberData: any = {
                fullName: m.fullName,
                cpf: cleanCpf || '',
                voterTitle: voterTitle,
                email: m.email || '',
                phone: m.phone ? String(m.phone).replace(/\D/g, '') : '',
                state: m.state,
                city: m.city,
                zone: m.zone ? String(m.zone) : null,
                neighborhood: m.neighborhood || '',
                dateOfBirth: birthDate,
                gender: m.gender || null,
                affiliationDate: parseImportDate(m.affiliationDate),
                party: m.party || null,
                situation: m.situation || null,
                disaffiliationReason: m.disaffiliationReason || null,
                communicationPending: m.communicationPending || null,
                updatedAt: new Date(),
            };

            if (existingMember) {
                if (updateExisting) {
                    await db.update(members)
                        .set(memberData)
                        .where(eq(members.id, existingMember.id));
                    results.updated++;
                } else {
                    results.duplicates.push({
                        ...m,
                        existingId: existingMember.id,
                        existingName: existingMember.fullName
                    });
                    results.skipped++;
                }
            } else {
                if (!birthDate && !m.fullName) {
                    // Skip empty rows or rows without minimum data
                    results.skipped++;
                    continue;
                }

                await db.insert(members).values({
                    ...memberData,
                    status: 'active', // Imported members are usually active
                });
                results.imported++;
            }
        }

        revalidatePath("/members");
        return { success: true, results };
    } catch (error) {
        console.error("Error importing members:", error);
        const msg = error instanceof Error ? error.message : "Erro desconhecido";
        return { success: false, error: `Erro ao importar: ${msg}` };
    }
}

export async function deleteMember(id: string) {
    try {
        await db.delete(members).where(eq(members.id, id));
        revalidatePath("/members");
        return { success: true };
    } catch (error) {
        console.error("Error deleting member:", error);
        return { success: false, error: "Erro ao excluir membro" };
    }
}
