"use server";

import { db } from "@/lib/db";
import { nuclei } from "@/lib/db/schema/nuclei";
import { members } from "@/lib/db/schema/members";
import { eq, desc, sql, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";

async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    return await verifyToken(token);
}

export async function getNuclei() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        let whereClause = undefined;

        if (user.role === 'STATE_COORD') {
            whereClause = eq(nuclei.state, user.scopeState || '');
        } else if (user.role === 'CITY_COORD') {
            whereClause = and(
                eq(nuclei.state, user.scopeState || ''),
                eq(nuclei.city, user.scopeCity || '')
            );
        } else if (user.role === 'ZONE_COORD') {
            whereClause = and(
                eq(nuclei.state, user.scopeState || ''),
                eq(nuclei.city, user.scopeCity || ''),
                eq(nuclei.zone, user.scopeZone || '')
            );
        } else if (user.role === 'LOCAL_COORD') {
            if (!user.scopeNucleusId) return { success: true, data: [] };
            whereClause = eq(nuclei.id, user.scopeNucleusId);
        } else if (user.role !== 'ADMIN') {
            // If not admin and not matched above, return empty or error
            // For safety, return empty
            return { success: true, data: [] };
        }

        // Fetch nuclei with member count
        const result = await db
            .select({
                id: nuclei.id,
                name: nuclei.name,
                type: nuclei.type,
                state: nuclei.state,
                city: nuclei.city,
                status: nuclei.status,
                memberCount: sql<number>`count(${members.id})::int`,
            })
            .from(nuclei)
            .leftJoin(members, eq(members.nucleusId, nuclei.id))
            .where(whereClause)
            .groupBy(nuclei.id)
            .orderBy(desc(nuclei.createdAt));

        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching nuclei:", error);
        return { success: false, error: "Falha ao carregar núcleos" };
    }
}

import { canManageNucleus } from "@/lib/auth/rbac";

export async function getNucleusById(id: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        const result = await db.query.nuclei.findFirst({
            where: eq(nuclei.id, id),
        });

        if (!result) return { success: false, error: "Núcleo não encontrado" };

        if (!canManageNucleus(user, result)) {
            return { success: false, error: "Acesso negado a este núcleo" };
        }

        // Get members of this nucleus
        const nucleusMembers = await db
            .select({
                id: members.id,
                fullName: members.fullName,
                status: members.status,
                militancyLevel: members.militancyLevel,
            })
            .from(members)
            .where(eq(members.nucleusId, id));

        return {
            success: true,
            data: {
                ...result,
                members: nucleusMembers
            }
        };
    } catch (error) {
        console.error("Error fetching nucleus by id:", error);
        return { success: false, error: "Falha ao carregar dados do núcleo" };
    }
}

export async function createNucleus(data: any) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        // Validate creation permission
        let allowed = false;
        if (user.role === 'ADMIN') allowed = true;
        else if (user.role === 'STATE_COORD') {
            if (data.state === user.scopeState) allowed = true;
        }
        else if (user.role === 'CITY_COORD') {
            if (data.state === user.scopeState && data.city === user.scopeCity) allowed = true;
        }
        else if (user.role === 'ZONE_COORD') {
            if (data.state === user.scopeState && data.city === user.scopeCity && data.zone === user.scopeZone) allowed = true;
        }

        if (!allowed) {
            return { success: false, error: "Sem permissão para criar núcleo nesta região." };
        }

        await db.insert(nuclei).values({
            name: data.name,
            type: data.type,
            state: data.state,
            city: data.city,
            zone: data.zone,
            status: data.status || 'in_formation',
        });

        revalidatePath("/members/nucleos");
        return { success: true };
    } catch (error) {
        console.error("Error creating nucleus:", error);
        return { success: false, error: "Erro ao criar núcleo" };
    }
}

export async function updateNucleus(id: string, data: any) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        const existing = await db.query.nuclei.findFirst({
            where: eq(nuclei.id, id),
        });

        if (!existing) return { success: false, error: "Núcleo não encontrado" };

        if (!canManageNucleus(user, existing)) {
            return { success: false, error: "Sem permissão para editar este núcleo." };
        }

        await db.update(nuclei)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(nuclei.id, id));

        revalidatePath("/members/nucleos");
        revalidatePath(`/members/nucleos/${id}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating nucleus:", error);
        return { success: false, error: "Erro ao atualizar núcleo" };
    }
}


export async function assignMemberToNucleus(memberId: string, nucleusId: string | null) {
    try {
        await db.update(members)
            .set({
                nucleusId: nucleusId,
                updatedAt: new Date(),
            })
            .where(eq(members.id, memberId));

        revalidatePath("/members");
        revalidatePath(`/members/${memberId}`);
        if (nucleusId) revalidatePath(`/members/nucleos/${nucleusId}`);
        return { success: true };
    } catch (error) {
        console.error("Error assigning member to nucleus:", error);
        return { success: false, error: "Erro ao vincular membro ao núcleo" };
    }
}
