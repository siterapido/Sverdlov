'use server'

import { db } from '@/lib/db';
import { et_militantes, et_projetos, et_tarefas, et_escalas } from '@/lib/db/schema/escola';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// ==========================================
// MILITANTES
// ==========================================

export async function getMilitantes() {
    return await db.select().from(et_militantes).orderBy(desc(et_militantes.createdAt));
}

export async function createMilitante(data: { nome: string; tipo: 'voluntario' | 'profissional'; habilidades: string; disponibilidade: Record<string, string[]> }) {
    await db.insert(et_militantes).values(data);
    revalidatePath('/escola-trabalho');
}

export async function updateMilitante(id: string, data: Partial<typeof et_militantes.$inferInsert>) {
    await db.update(et_militantes).set(data).where(eq(et_militantes.id, id));
    revalidatePath('/escola-trabalho');
}

export async function deleteMilitante(id: string) {
    await db.delete(et_militantes).where(eq(et_militantes.id, id));
    revalidatePath('/escola-trabalho');
}

// ==========================================
// PROJETOS
// ==========================================

export async function getProjetos() {
    return await db.query.et_projetos.findMany({
        with: {
            tarefas: true
        }
    });
}

export async function createProjeto(data: { nome: string; cor: string }) {
    await db.insert(et_projetos).values(data);
    revalidatePath('/escola-trabalho');
}

// ==========================================
// TAREFAS
// ==========================================

export async function getTarefas() {
    return await db.query.et_tarefas.findMany({
        with: {
            projeto: true
        }
    });
}

export async function createTarefa(data: { projetoId: string; nome: string; frequencia: string; dia?: string; turno?: string }) {
    await db.insert(et_tarefas).values(data);
    revalidatePath('/escola-trabalho');
}

// ==========================================
// ESCALAS
// ==========================================

export async function getEscalas() {
    return await db.query.et_escalas.findMany({
        with: {
            tarefa: {
                with: {
                    projeto: true
                }
            },
            militante: true
        }
    });
}

export async function createEscala(data: { tarefaId: string; militanteId?: string; dia: string; turno: string; observacao?: string }) {
    await db.insert(et_escalas).values(data);
    revalidatePath('/escola-trabalho');
}

export async function updateEscala(id: string, data: Partial<typeof et_escalas.$inferInsert>) {
    await db.update(et_escalas).set(data).where(eq(et_escalas.id, id));
    revalidatePath('/escola-trabalho');
}

export async function deleteEscala(id: string) {
    await db.delete(et_escalas).where(eq(et_escalas.id, id));
    revalidatePath('/escola-trabalho');
}

// ==========================================
// DATA AGGREGATION
// ==========================================

export async function getEscolaData() {
    const militantes = await getMilitantes();
    const projetos = await getProjetos();
    const tarefas = await getTarefas();
    const escalas = await getEscalas();

    return {
        militantes,
        projetos,
        tarefas,
        escalas
    };
}

// ==========================================
// AI / INTELLIGENCE
// ==========================================

export async function suggestMilitantes(dia: string, turno: string) {
    const allMilitantes = await getMilitantes();
    
    // Simple filter logic (can be enhanced with vectors later)
    return allMilitantes.filter(m => {
        const disp = m.disponibilidade as Record<string, string[]> || {};
        const available = disp[dia]?.includes(turno);
        return available;
    });
}
