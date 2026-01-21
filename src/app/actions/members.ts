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

export async function importMembers(membersList: any[]) {
    try {
        // Simple bulk insert
        // In a real scenario, we might want to handle duplicates or transform data
        await db.insert(members).values(membersList.map(m => {
            const birthDate = parseImportDate(m.dateOfBirth);
            if (!birthDate) throw new Error(`Data de nascimento inválida para: ${m.fullName}`);

            return {
                fullName: m.fullName,
                cpf: m.cpf ? String(m.cpf).replace(/\D/g, '') : '', // Clean CPF
                voterTitle: m.voterTitle ? String(m.voterTitle) : null,
                email: m.email || '',
                phone: m.phone || '',
                state: m.state,
                city: m.city,
                zone: m.zone ? String(m.zone) : null,
                neighborhood: m.neighborhood || '',
                dateOfBirth: birthDate,
                gender: m.gender || null,
                affiliationDate: parseImportDate(m.affiliationDate),
            };
        }));

        revalidatePath("/members");
        return { success: true };
    } catch (error) {
        console.error("Error importing members:", error);
        // Better error message
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
