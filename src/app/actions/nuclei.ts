"use server";

import { db } from "@/lib/db";
import { nuclei } from "@/lib/db/schema/nuclei";
import { members } from "@/lib/db/schema/members";
import { eq, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getNuclei() {
    try {
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
            .groupBy(nuclei.id)
            .orderBy(desc(nuclei.createdAt));

        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching nuclei:", error);
        return { success: false, error: "Falha ao carregar núcleos" };
    }
}

export async function getNucleusById(id: string) {
    try {
        const result = await db.query.nuclei.findFirst({
            where: eq(nuclei.id, id),
        });

        if (!result) return { success: false, error: "Núcleo não encontrado" };
        
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
        await db.insert(nuclei).values({
            name: data.name,
            type: data.type,
            state: data.state,
            city: data.city,
            status: data.status || 'in_formation',
        });
        
        revalidatePath("/members/nuclei");
        return { success: true };
    } catch (error) {
        console.error("Error creating nucleus:", error);
        return { success: false, error: "Erro ao criar núcleo" };
    }
}

export async function updateNucleus(id: string, data: any) {
    try {
        await db.update(nuclei)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(nuclei.id, id));
        
        revalidatePath("/members/nuclei");
        revalidatePath(`/members/nuclei/${id}`);
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
        if (nucleusId) revalidatePath(`/members/nuclei/${nucleusId}`);
        return { success: true };
    } catch (error) {
        console.error("Error assigning member to nucleus:", error);
        return { success: false, error: "Erro ao vincular membro ao núcleo" };
    }
}
