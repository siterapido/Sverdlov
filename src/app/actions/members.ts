"use server";

import { db } from "@/lib/db";
import { members } from "@/lib/db/schema/members";
import { nuclei } from "@/lib/db/schema/nuclei";
import { eq, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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

export async function importMembers(membersList: any[]) {
    try {
        // Simple bulk insert
        // In a real scenario, we might want to handle duplicates or transform data
        await db.insert(members).values(membersList.map(m => ({
            fullName: m.fullName,
            cpf: m.cpf,
            voterTitle: m.voterTitle,
            email: m.email || '',
            phone: m.phone || '',
            state: m.state,
            city: m.city,
            zone: m.zone,
            neighborhood: m.neighborhood || '',
            dateOfBirth: m.dateOfBirth,
        })));

        revalidatePath("/members");
        return { success: true };
    } catch (error) {
        console.error("Error importing members:", error);
        return { success: false, error: "Erro ao importar planilha" };
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
