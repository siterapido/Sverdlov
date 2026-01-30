'use server';

import { db } from '@/lib/db';
import {
    scheduleSlots,
    slotAssignments,
    ScheduleSlot,
    NewScheduleSlot,
} from '@/lib/db/schema';
import { eq, and, gte, lte, asc, desc, sql, between } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// ==========================================
// TIPOS AUXILIARES
// ==========================================

export interface SlotWithAssignments extends ScheduleSlot {
    assignments: {
        id: string;
        memberId: string;
        memberName: string;
        role: string;
        status: string;
    }[];
    assignedCount: number;
    availableSpots: number;
}

export interface SlotFilters {
    scheduleId?: string;
    status?: ScheduleSlot['status'];
    startDate?: string;
    endDate?: string;
    location?: string;
}

// ==========================================
// CRUD DE TURNOS
// ==========================================

/**
 * Criar novo turno
 */
export async function createSlot(
    data: NewScheduleSlot
): Promise<{ success: boolean; slot?: ScheduleSlot; error?: string }> {
    try {
        const [slot] = await db
            .insert(scheduleSlots)
            .values({
                ...data,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        revalidatePath(`/escalas/${data.scheduleId}`);
        return { success: true, slot };
    } catch (error) {
        console.error('Erro ao criar turno:', error);
        return { success: false, error: 'Erro ao criar turno' };
    }
}

/**
 * Criar múltiplos turnos de uma vez
 */
export async function createMultipleSlots(
    slots: NewScheduleSlot[]
): Promise<{ success: boolean; count: number; error?: string }> {
    try {
        const now = new Date();
        const slotsWithDates = slots.map(slot => ({
            ...slot,
            createdAt: now,
            updatedAt: now,
        }));

        await db.insert(scheduleSlots).values(slotsWithDates);

        // Revalidar todas as escalas afetadas
        const uniqueScheduleIds = [...new Set(slots.map(s => s.scheduleId))];
        uniqueScheduleIds.forEach(id => {
            revalidatePath(`/escalas/${id}`);
        });

        return { success: true, count: slots.length };
    } catch (error) {
        console.error('Erro ao criar turnos:', error);
        return { success: false, count: 0, error: 'Erro ao criar turnos' };
    }
}

/**
 * Gerar turnos em lote (BATCH GENERATOR)
 */
export async function generateBatchSlots(
    scheduleId: string,
    config: {
        startDate: string;
        endDate: string;
        daysOfWeek: number[]; // 0=Dom, 6=Sab
        startTime: string;
        endTime: string;
        name: string;
        location?: string;
        maxParticipants: number;
    }
): Promise<{ success: boolean; count: number; error?: string }> {
    try {
        const start = new Date(config.startDate);
        const end = new Date(config.endDate);
        const slots: NewScheduleSlot[] = [];

        // Loop através de cada dia no intervalo
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            // Verificar se o dia da semana está incluído (0-6)
            // getDay() retorna 0 para Domingo, 6 para Sábado
            // Certificando que estamos usando UTC ou timezone correto
            // Usando d.getUTCDay() se as datas vierem como YYYY-MM-DD
            // Mas `new Date('2026-01-20')` é UTC 00:00, então getUTCDay é seguro
            const dayOfWeek = d.getUTCDay(); 
            
            if (config.daysOfWeek.includes(dayOfWeek)) {
                slots.push({
                    scheduleId,
                    name: config.name,
                    date: d.toISOString().split('T')[0], // YYYY-MM-DD
                    startTime: config.startTime,
                    endTime: config.endTime,
                    location: config.location,
                    maxParticipants: config.maxParticipants,
                    status: 'open',
                });
            }
        }

        if (slots.length === 0) {
            return { success: false, count: 0, error: 'Nenhuma data corresponde aos dias selecionados no período.' };
        }

        return await createMultipleSlots(slots);
    } catch (error) {
        console.error('Erro ao gerar turnos em lote:', error);
        return { success: false, count: 0, error: 'Erro ao processar geração em lote' };
    }
}

/**
 * Atualizar turno existente
 */
export async function updateSlot(
    id: string,
    data: Partial<NewScheduleSlot>
): Promise<{ success: boolean; slot?: ScheduleSlot; error?: string }> {
    try {
        const [slot] = await db
            .update(scheduleSlots)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(scheduleSlots.id, id))
            .returning();

        if (!slot) {
            return { success: false, error: 'Turno não encontrado' };
        }

        revalidatePath(`/escalas/${slot.scheduleId}`);
        return { success: true, slot };
    } catch (error) {
        console.error('Erro ao atualizar turno:', error);
        return { success: false, error: 'Erro ao atualizar turno' };
    }
}

/**
 * Deletar turno
 */
export async function deleteSlot(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const [deleted] = await db
            .delete(scheduleSlots)
            .where(eq(scheduleSlots.id, id))
            .returning();

        if (deleted) {
            revalidatePath(`/escalas/${deleted.scheduleId}`);
        }

        return { success: true };
    } catch (error) {
        console.error('Erro ao deletar turno:', error);
        return { success: false, error: 'Erro ao deletar turno' };
    }
}

/**
 * Buscar turno por ID com atribuições
 */
export async function getSlotById(id: string): Promise<SlotWithAssignments | null> {
    try {
        const slot = await db.query.scheduleSlots.findFirst({
            where: eq(scheduleSlots.id, id),
            with: {
                assignments: {
                    with: {
                        member: true,
                    },
                },
            },
        });

        if (!slot) return null;

        const assignedCount = slot.assignments.length;
        const availableSpots = (slot.maxParticipants || 10) - assignedCount;

        return {
            ...slot,
            assignments: slot.assignments.map((a) => ({
                id: a.id,
                memberId: a.memberId,
                memberName: a.member?.fullName || 'Membro',
                role: a.role,
                status: a.status,
            })),
            assignedCount,
            availableSpots: Math.max(0, availableSpots),
        };
    } catch (error) {
        console.error('Erro ao buscar turno:', error);
        return null;
    }
}

/**
 * Listar turnos de uma escala
 */
export async function getSlotsBySchedule(
    scheduleId: string
): Promise<ScheduleSlot[]> {
    try {
        return await db
            .select()
            .from(scheduleSlots)
            .where(eq(scheduleSlots.scheduleId, scheduleId))
            .orderBy(asc(scheduleSlots.date), asc(scheduleSlots.startTime));
    } catch (error) {
        console.error('Erro ao listar turnos:', error);
        return [];
    }
}

/**
 * Listar turnos por período (para calendário)
 */
export async function getSlotsByDateRange(
    startDate: string,
    endDate: string,
    territoryScope?: string
): Promise<(ScheduleSlot & { scheduleName: string; scheduleCategory: string; scheduleColor: string })[]> {
    try {
        const result = await db.query.scheduleSlots.findMany({
            where: and(
                gte(scheduleSlots.date, startDate),
                lte(scheduleSlots.date, endDate)
            ),
            with: {
                schedule: true,
            },
            orderBy: [asc(scheduleSlots.date), asc(scheduleSlots.startTime)],
        });

        // Filtrar por território se necessário
        let filtered = result;
        if (territoryScope) {
            filtered = result.filter(
                (slot) => slot.schedule?.territoryScope === territoryScope
            );
        }

        return filtered.map((slot) => ({
            ...slot,
            scheduleName: slot.schedule?.name || '',
            scheduleCategory: slot.schedule?.category || 'outras',
            scheduleColor: slot.schedule?.color || '#3b82f6',
        }));
    } catch (error) {
        console.error('Erro ao listar turnos por período:', error);
        return [];
    }
}

/**
 * Buscar turnos de hoje
 */
export async function getTodaySlots(
    territoryScope?: string
): Promise<(ScheduleSlot & { scheduleName: string })[]> {
    const today = new Date().toISOString().split('T')[0];
    return getSlotsByDateRange(today, today, territoryScope);
}

/**
 * Atualizar status do turno
 */
export async function updateSlotStatus(
    id: string,
    status: ScheduleSlot['status']
): Promise<{ success: boolean; error?: string }> {
    try {
        const [slot] = await db
            .update(scheduleSlots)
            .set({ status, updatedAt: new Date() })
            .where(eq(scheduleSlots.id, id))
            .returning();

        if (slot) {
            revalidatePath(`/escalas/${slot.scheduleId}`);
        }

        return { success: true };
    } catch (error) {
        console.error('Erro ao atualizar status do turno:', error);
        return { success: false, error: 'Erro ao atualizar status' };
    }
}

/**
 * Verificar se turno está lotado e atualizar status
 */
export async function checkAndUpdateSlotCapacity(
    slotId: string
): Promise<{ success: boolean; isFull: boolean }> {
    try {
        const slot = await getSlotById(slotId);
        if (!slot) return { success: false, isFull: false };

        const maxParticipants = slot.maxParticipants || 10;
        const confirmedAssignments = slot.assignments.filter(
            (a) => a.status === 'confirmed' || a.status === 'attended'
        ).length;

        const isFull = confirmedAssignments >= maxParticipants;

        if (isFull && slot.status === 'open') {
            await updateSlotStatus(slotId, 'full');
        } else if (!isFull && slot.status === 'full') {
            await updateSlotStatus(slotId, 'open');
        }

        return { success: true, isFull };
    } catch (error) {
        console.error('Erro ao verificar capacidade:', error);
        return { success: false, isFull: false };
    }
}

/**
 * Contar turnos abertos por escala
 */
export async function countOpenSlotsBySchedule(
    scheduleId: string
): Promise<{ open: number; total: number }> {
    try {
        const slots = await db
            .select()
            .from(scheduleSlots)
            .where(eq(scheduleSlots.scheduleId, scheduleId));

        const open = slots.filter((s) => s.status === 'open').length;

        return { open, total: slots.length };
    } catch (error) {
        console.error('Erro ao contar turnos:', error);
        return { open: 0, total: 0 };
    }
}

/**
 * Duplicar turno para outra data
 */
export async function duplicateSlotToDate(
    slotId: string,
    newDate: string
): Promise<{ success: boolean; slot?: ScheduleSlot; error?: string }> {
    try {
        const original = await db.query.scheduleSlots.findFirst({
            where: eq(scheduleSlots.id, slotId),
        });

        if (!original) {
            return { success: false, error: 'Turno original não encontrado' };
        }

        const { id, createdAt, updatedAt, ...slotData } = original;

        const [newSlot] = await db
            .insert(scheduleSlots)
            .values({
                ...slotData,
                date: newDate,
                status: 'open',
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        revalidatePath(`/escalas/${original.scheduleId}`);
        return { success: true, slot: newSlot };
    } catch (error) {
        console.error('Erro ao duplicar turno:', error);
        return { success: false, error: 'Erro ao duplicar turno' };
    }
}
