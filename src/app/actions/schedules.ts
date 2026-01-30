'use server';

import { db } from '@/lib/db';
import {
    schedules,
    scheduleSlots,
    Schedule,
    NewSchedule,
    ScheduleSlot,
    RecurringPattern,
} from '@/lib/db/schema';
import { eq, and, gte, lte, desc, asc, sql, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// ==========================================
// TIPOS AUXILIARES
// ==========================================

export interface ScheduleFilters {
    status?: Schedule['status'];
    category?: Schedule['category'];
    type?: Schedule['type'];
    territoryScope?: string;
    nucleusId?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
}

export interface ScheduleWithSlots extends Schedule {
    slots: ScheduleSlot[];
    slotsCount: number;
    filledSlots: number;
}

// ==========================================
// CRUD DE ESCALAS
// ==========================================

/**
 * Criar nova escala
 */
export async function createSchedule(data: NewSchedule): Promise<{ success: boolean; schedule?: Schedule; error?: string }> {
    try {
        const [schedule] = await db.insert(schedules).values({
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        revalidatePath('/escalas');
        return { success: true, schedule };
    } catch (error) {
        console.error('Erro ao criar escala:', error);
        return { success: false, error: 'Erro ao criar escala' };
    }
}

/**
 * Atualizar escala existente
 */
export async function updateSchedule(
    id: string,
    data: Partial<NewSchedule>
): Promise<{ success: boolean; schedule?: Schedule; error?: string }> {
    try {
        const [schedule] = await db
            .update(schedules)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(schedules.id, id))
            .returning();

        if (!schedule) {
            return { success: false, error: 'Escala não encontrada' };
        }

        revalidatePath('/escalas');
        revalidatePath(`/escalas/${id}`);
        return { success: true, schedule };
    } catch (error) {
        console.error('Erro ao atualizar escala:', error);
        return { success: false, error: 'Erro ao atualizar escala' };
    }
}

/**
 * Deletar escala (e todos os turnos associados via CASCADE)
 */
export async function deleteSchedule(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const result = await db.delete(schedules).where(eq(schedules.id, id));

        revalidatePath('/escalas');
        return { success: true };
    } catch (error) {
        console.error('Erro ao deletar escala:', error);
        return { success: false, error: 'Erro ao deletar escala' };
    }
}

/**
 * Buscar escala por ID com slots
 */
export async function getScheduleById(id: string): Promise<ScheduleWithSlots | null> {
    try {
        const schedule = await db.query.schedules.findFirst({
            where: eq(schedules.id, id),
            with: {
                slots: {
                    orderBy: [asc(scheduleSlots.date), asc(scheduleSlots.startTime)],
                },
            },
        });

        if (!schedule) return null;

        // Contar slots preenchidos
        const filledSlots = schedule.slots.filter(
            (slot) => slot.status === 'full' || slot.status === 'completed'
        ).length;

        return {
            ...schedule,
            slotsCount: schedule.slots.length,
            filledSlots,
        };
    } catch (error) {
        console.error('Erro ao buscar escala:', error);
        return null;
    }
}

/**
 * Listar escalas com filtros
 */
export async function getSchedules(filters: ScheduleFilters = {}): Promise<Schedule[]> {
    try {
        const conditions = [];

        if (filters.status) {
            conditions.push(eq(schedules.status, filters.status));
        }

        if (filters.category) {
            conditions.push(eq(schedules.category, filters.category));
        }

        if (filters.type) {
            conditions.push(eq(schedules.type, filters.type));
        }

        if (filters.territoryScope) {
            conditions.push(eq(schedules.territoryScope, filters.territoryScope));
        }

        if (filters.nucleusId) {
            conditions.push(eq(schedules.nucleusId, filters.nucleusId));
        }

        if (filters.startDate) {
            conditions.push(gte(schedules.startDate, filters.startDate));
        }

        if (filters.endDate) {
            conditions.push(lte(schedules.startDate, filters.endDate));
        }

        const result = await db
            .select()
            .from(schedules)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(schedules.createdAt));

        // Filtro de busca por nome (case-insensitive)
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            return result.filter(
                (s) =>
                    s.name.toLowerCase().includes(searchLower) ||
                    s.description?.toLowerCase().includes(searchLower)
            );
        }

        return result;
    } catch (error) {
        console.error('Erro ao listar escalas:', error);
        return [];
    }
}

/**
 * Duplicar uma escala existente
 */
export async function duplicateSchedule(
    id: string,
    newName?: string
): Promise<{ success: boolean; schedule?: Schedule; error?: string }> {
    try {
        const original = await getScheduleById(id);
        if (!original) {
            return { success: false, error: 'Escala original não encontrada' };
        }

        // Criar nova escala
        const { id: _, slots, slotsCount, filledSlots, createdAt, updatedAt, ...scheduleData } = original;
        const [newSchedule] = await db
            .insert(schedules)
            .values({
                ...scheduleData,
                name: newName || `${original.name} (Cópia)`,
                status: 'draft',
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        // Duplicar slots
        if (slots.length > 0) {
            const newSlots = slots.map((slot) => ({
                scheduleId: newSchedule.id,
                name: slot.name,
                date: slot.date,
                startTime: slot.startTime,
                endTime: slot.endTime,
                location: slot.location,
                locationDetails: slot.locationDetails,
                maxParticipants: slot.maxParticipants,
                minParticipants: slot.minParticipants,
                notes: slot.notes,
                status: 'open' as const,
            }));

            await db.insert(scheduleSlots).values(newSlots);
        }

        revalidatePath('/escalas');
        return { success: true, schedule: newSchedule };
    } catch (error) {
        console.error('Erro ao duplicar escala:', error);
        return { success: false, error: 'Erro ao duplicar escala' };
    }
}

/**
 * Ativar/Desativar escala
 */
export async function toggleScheduleStatus(
    id: string,
    newStatus: 'active' | 'draft' | 'completed' | 'cancelled'
): Promise<{ success: boolean; error?: string }> {
    try {
        await db
            .update(schedules)
            .set({ status: newStatus, updatedAt: new Date() })
            .where(eq(schedules.id, id));

        revalidatePath('/escalas');
        revalidatePath(`/escalas/${id}`);
        return { success: true };
    } catch (error) {
        console.error('Erro ao alterar status da escala:', error);
        return { success: false, error: 'Erro ao alterar status' };
    }
}

/**
 * Gerar turnos recorrentes para uma escala
 */
export async function generateRecurringSlots(
    scheduleId: string,
    pattern: RecurringPattern,
    startDate: Date,
    endDate: Date,
    slotTemplate: {
        name: string;
        startTime: string;
        endTime: string;
        location?: string;
        maxParticipants?: number;
    }
): Promise<{ success: boolean; slotsCreated: number; error?: string }> {
    try {
        const slots: Array<{
            scheduleId: string;
            name: string;
            date: string;
            startTime: string;
            endTime: string;
            location?: string;
            maxParticipants?: number;
            status: 'open';
        }> = [];

        const currentDate = new Date(startDate);
        const end = new Date(endDate);
        let occurrences = 0;
        const maxOccurrences = pattern.endAfterOccurrences || 365; // Limite de segurança

        while (currentDate <= end && occurrences < maxOccurrences) {
            let shouldAdd = false;

            switch (pattern.frequency) {
                case 'daily':
                    shouldAdd = true;
                    break;

                case 'weekly':
                    if (pattern.daysOfWeek?.includes(currentDate.getDay())) {
                        shouldAdd = true;
                    }
                    break;

                case 'monthly':
                    if (pattern.dayOfMonth === currentDate.getDate()) {
                        shouldAdd = true;
                    }
                    break;
            }

            if (shouldAdd) {
                slots.push({
                    scheduleId,
                    name: slotTemplate.name,
                    date: currentDate.toISOString().split('T')[0],
                    startTime: slotTemplate.startTime,
                    endTime: slotTemplate.endTime,
                    location: slotTemplate.location,
                    maxParticipants: slotTemplate.maxParticipants || 10,
                    status: 'open',
                });
                occurrences++;
            }

            // Avançar para o próximo dia
            currentDate.setDate(currentDate.getDate() + (pattern.interval || 1));
        }

        if (slots.length > 0) {
            await db.insert(scheduleSlots).values(slots);
        }

        revalidatePath(`/escalas/${scheduleId}`);
        return { success: true, slotsCreated: slots.length };
    } catch (error) {
        console.error('Erro ao gerar turnos recorrentes:', error);
        return { success: false, slotsCreated: 0, error: 'Erro ao gerar turnos' };
    }
}

/**
 * Estatísticas de escalas
 */
export async function getScheduleStats(territoryScope?: string): Promise<{
    total: number;
    active: number;
    draft: number;
    completed: number;
    byCategory: Record<string, number>;
}> {
    try {
        const conditions = territoryScope
            ? eq(schedules.territoryScope, territoryScope)
            : undefined;

        const all = await db
            .select()
            .from(schedules)
            .where(conditions);

        const byCategory: Record<string, number> = {};
        let active = 0;
        let draft = 0;
        let completed = 0;

        for (const s of all) {
            // Status
            if (s.status === 'active') active++;
            else if (s.status === 'draft') draft++;
            else if (s.status === 'completed') completed++;

            // Categoria
            byCategory[s.category] = (byCategory[s.category] || 0) + 1;
        }

        return {
            total: all.length,
            active,
            draft,
            completed,
            byCategory,
        };
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return {
            total: 0,
            active: 0,
            draft: 0,
            completed: 0,
            byCategory: {},
        };
    }
}
