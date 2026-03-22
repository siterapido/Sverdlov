"use server";

import { db } from "@/lib/db";
import { members } from "@/lib/db/schema/members";
import { nuclei } from "@/lib/db/schema/nuclei";
import { memberSchema, type MemberSchema } from '@/lib/schemas/member';
import { eq, desc, or, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auditCreate, auditUpdate, auditDelete } from "@/lib/audit";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { canManageMember, buildMemberScopeFilter } from "@/lib/auth/rbac";

async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    return await verifyToken(token);
}

export async function createMemberAction(data: MemberSchema) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        // Validate with Zod
        const validated = memberSchema.parse(data);

        // Check jurisdiction
        if (!canManageMember(user, { state: validated.state, city: validated.city, zone: validated.zone, nucleusId: null })) {
            return { success: false, error: "Sem permissão para cadastrar filiados nesta região." };
        }

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

        const [newMember] = await db.insert(members).values({
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
        }).returning();

        // Audit log
        await auditCreate(user.userId, 'members', newMember.id, newMember as Record<string, unknown>);

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
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        const scopeFilter = buildMemberScopeFilter(user);
        if (scopeFilter === null) return { success: true, data: [] };

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
                email: members.email,
                phone: members.phone,
            })
            .from(members)
            .leftJoin(nuclei, eq(members.nucleusId, nuclei.id))
            .where(scopeFilter)
            .orderBy(desc(members.createdAt));

        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching members:", error);
        return { success: false, error: "Falha ao carregar membros" };
    }
}

export async function getMemberById(id: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        const result = await db.query.members.findFirst({
            where: eq(members.id, id),
            with: {
                nucleus: true,
                politicalResponsible: true,
                plan: true,
            }
        });

        if (!result) return { success: false, error: "Membro não encontrado" };

        if (!canManageMember(user, result)) {
            return { success: false, error: "Acesso negado" };
        }

        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching member by id:", error);
        return { success: false, error: "Falha ao carregar dados do membro" };
    }
}

export async function getPendingMembers() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        const scopeFilter = buildMemberScopeFilter(user);
        if (scopeFilter === null) return { success: true, data: [] };

        const whereClause = scopeFilter
            ? and(eq(members.status, 'interested'), scopeFilter)
            : eq(members.status, 'interested');

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
            .where(whereClause)
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
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        // Get old values for audit
        const oldMember = await db.query.members.findFirst({ where: eq(members.id, id) });
        if (!oldMember) return { success: false, error: "Membro não encontrado" };

        if (!canManageMember(user, oldMember)) {
            return { success: false, error: "Sem permissão para alterar este membro." };
        }

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

        const [updatedMember] = await db.update(members)
            .set(updateData)
            .where(eq(members.id, id))
            .returning();

        // Audit log
        await auditUpdate(
            user.userId,
            'members',
            id,
            oldMember as Record<string, unknown>,
            updatedMember as Record<string, unknown>,
            { action: 'status_change', newStatus: status }
        );

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
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        // Get old values for audit
        const oldMember = await db.query.members.findFirst({ where: eq(members.id, id) });
        if (!oldMember) return { success: false, error: "Membro não encontrado" };

        if (!canManageMember(user, oldMember)) {
            return { success: false, error: "Sem permissão para alterar este membro." };
        }

        const [updatedMember] = await db.update(members)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(members.id, id))
            .returning();

        // Audit log
        await auditUpdate(
            user.userId,
            'members',
            id,
            oldMember as Record<string, unknown>,
            updatedMember as Record<string, unknown>,
            { action: 'organization_update' }
        );

        revalidatePath("/members");
        revalidatePath(`/members/${id}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating member organization:", error);
        return { success: false, error: "Erro ao atualizar organização do membro" };
    }
}

export async function checkDuplicates(data: {
    cpf?: string;
    email?: string;
    phone?: string;
    excludeId?: string;
}): Promise<{ found: boolean; duplicates: any[] }> {
    try {
        const duplicates: any[] = [];

        const conditions: any[] = [];
        if (data.cpf) {
            conditions.push(eq(members.cpf, data.cpf.replace(/\D/g, '')));
        }
        if (data.email) {
            conditions.push(eq(members.email, data.email));
        }
        if (data.phone) {
            conditions.push(eq(members.phone, data.phone.replace(/\D/g, '')));
        }

        if (conditions.length === 0) {
            return { found: false, duplicates: [] };
        }

        const results = await db.select().from(members).where(or(...conditions));

        results.forEach(result => {
            if (result.id !== data.excludeId) {
                duplicates.push({
                    id: result.id,
                    fullName: result.fullName,
                    email: result.email,
                    cpf: result.cpf,
                    phone: result.phone,
                    status: result.status,
                });
            }
        });

        return { found: duplicates.length > 0, duplicates };
    } catch (error) {
        console.error("Error checking duplicates:", error);
        return { found: false, duplicates: [] };
    }
}

export async function deleteMember(id: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        // Get old values for audit
        const oldMember = await db.query.members.findFirst({ where: eq(members.id, id) });
        if (!oldMember) return { success: false, error: "Membro não encontrado" };

        if (!canManageMember(user, oldMember)) {
            return { success: false, error: "Sem permissão para excluir este membro." };
        }

        await db.delete(members).where(eq(members.id, id));

        // Audit log
        await auditDelete(user.userId, 'members', id, oldMember as Record<string, unknown>);

        revalidatePath("/members");
        return { success: true };
    } catch (error) {
        console.error("Error deleting member:", error);
        return { success: false, error: "Erro ao excluir membro" };
    }
}
