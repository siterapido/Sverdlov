'use server';

import { db } from '@/lib/db';
import {
    memberAvailability,
    scheduleExceptions,
    MemberAvailability,
    NewMemberAvailability,
    ScheduleException,
    NewScheduleException,
} from '@/lib/db/schema';
import { eq, and, gte, lte, asc, desc, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// ==========================================
// TIPOS AUXILIARES
// ==========================================

export interface WeeklyAvailabilityInput {
    dayOfWeek: number; // 0-6
    slots: {
        startTime: string; // HH:mm
        endTime: string;   // HH:mm
    }[];
}

export interface DayAvailability {
    dayOfWeek: number;
    dayName: string;
    slots: {
        id: string;
        startTime: string;
        endTime: string;
        isAvailable: boolean;
    }[];
}

const DAY_NAMES = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
];

// ==========================================
// DISPONIBILIDADE SEMANAL
// ==========================================

/**
 * Definir disponibilidade semanal do membro
 * Remove a disponibilidade anterior e substitui pela nova
 */
export async function setWeeklyAvailability(
    memberId: string,
    availability: WeeklyAvailabilityInput[]
): Promise<{ success: boolean; error?: string }> {
    try {
        // Remover disponibilidade anterior
        await db
            .delete(memberAvailability)
            .where(eq(memberAvailability.memberId, memberId));

        // Criar novas entradas
        const entries: NewMemberAvailability[] = [];

        for (const day of availability) {
            for (const slot of day.slots) {
                entries.push({
                    memberId,
                    dayOfWeek: day.dayOfWeek,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    isAvailable: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
        }

        if (entries.length > 0) {
            await db.insert(memberAvailability).values(entries);
        }

        revalidatePath(`/escalas/minha-agenda`);
        return { success: true };
    } catch (error) {
        console.error('Erro ao definir disponibilidade:', error);
        return { success: false, error: 'Erro ao salvar disponibilidade' };
    }
}

/**
 * Adicionar slot de disponibilidade
 */
export async function addAvailabilitySlot(
    memberId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string
): Promise<{ success: boolean; availability?: MemberAvailability; error?: string }> {
    try {
        const [availability] = await db
            .insert(memberAvailability)
            .values({
                memberId,
                dayOfWeek,
                startTime,
                endTime,
                isAvailable: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        revalidatePath(`/escalas/minha-agenda`);
        return { success: true, availability };
    } catch (error) {
        console.error('Erro ao adicionar disponibilidade:', error);
        return { success: false, error: 'Erro ao adicionar' };
    }
}

/**
 * Remover slot de disponibilidade
 */
export async function removeAvailabilitySlot(
    availabilityId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await db
            .delete(memberAvailability)
            .where(eq(memberAvailability.id, availabilityId));

        revalidatePath(`/escalas/minha-agenda`);
        return { success: true };
    } catch (error) {
        console.error('Erro ao remover disponibilidade:', error);
        return { success: false, error: 'Erro ao remover' };
    }
}

/**
 * Atualizar slot de disponibilidade
 */
export async function updateAvailabilitySlot(
    availabilityId: string,
    data: { startTime?: string; endTime?: string; isAvailable?: boolean }
): Promise<{ success: boolean; error?: string }> {
    try {
        await db
            .update(memberAvailability)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(memberAvailability.id, availabilityId));

        revalidatePath(`/escalas/minha-agenda`);
        return { success: true };
    } catch (error) {
        console.error('Erro ao atualizar disponibilidade:', error);
        return { success: false, error: 'Erro ao atualizar' };
    }
}

/**
 * Buscar disponibilidade do membro
 */
export async function getAvailability(
    memberId: string
): Promise<DayAvailability[]> {
    try {
        const availability = await db
            .select()
            .from(memberAvailability)
            .where(eq(memberAvailability.memberId, memberId))
            .orderBy(asc(memberAvailability.dayOfWeek), asc(memberAvailability.startTime));

        // Organizar por dia da semana
        const byDay: DayAvailability[] = [];

        for (let day = 0; day < 7; day++) {
            const daySlots = availability.filter((a) => a.dayOfWeek === day);
            byDay.push({
                dayOfWeek: day,
                dayName: DAY_NAMES[day],
                slots: daySlots.map((s) => ({
                    id: s.id,
                    startTime: s.startTime,
                    endTime: s.endTime,
                    isAvailable: s.isAvailable ?? true,
                })),
            });
        }

        return byDay;
    } catch (error) {
        console.error('Erro ao buscar disponibilidade:', error);
        return [];
    }
}

/**
 * Verificar se membro está disponível em determinado horário
 */
export async function checkMemberAvailability(
    memberId: string,
    date: string,
    startTime: string,
    endTime: string
): Promise<{ available: boolean; reason?: string }> {
    try {
        const dateObj = new Date(date);
        const dayOfWeek = dateObj.getDay();

        // Verificar exceções primeiro
        const exception = await db.query.scheduleExceptions.findFirst({
            where: and(
                eq(scheduleExceptions.memberId, memberId),
                eq(scheduleExceptions.date, date)
            ),
        });

        if (exception) {
            if (exception.type === 'unavailable') {
                return { available: false, reason: exception.reason || 'Indisponível nesta data' };
            }
            if (exception.type === 'available') {
                return { available: true };
            }
            // Para 'partial', verificar horário
            if (
                exception.startTime &&
                exception.endTime &&
                startTime >= exception.startTime &&
                endTime <= exception.endTime
            ) {
                return { available: false, reason: 'Indisponível neste horário' };
            }
        }

        // Verificar disponibilidade semanal
        const availability = await db.query.memberAvailability.findFirst({
            where: and(
                eq(memberAvailability.memberId, memberId),
                eq(memberAvailability.dayOfWeek, dayOfWeek),
                eq(memberAvailability.isAvailable, true),
                lte(memberAvailability.startTime, startTime),
                gte(memberAvailability.endTime, endTime)
            ),
        });

        if (availability) {
            return { available: true };
        }

        return { available: false, reason: 'Sem disponibilidade cadastrada' };
    } catch (error) {
        console.error('Erro ao verificar disponibilidade:', error);
        return { available: false, reason: 'Erro ao verificar' };
    }
}

// ==========================================
// EXCEÇÕES DE DISPONIBILIDADE
// ==========================================

/**
 * Adicionar exceção (data específica indisponível)
 */
export async function addException(
    memberId: string,
    date: string,
    reason?: string,
    type: 'unavailable' | 'available' | 'partial' = 'unavailable',
    startTime?: string,
    endTime?: string
): Promise<{ success: boolean; exception?: ScheduleException; error?: string }> {
    try {
        // Remover exceção anterior para a mesma data
        await db
            .delete(scheduleExceptions)
            .where(
                and(
                    eq(scheduleExceptions.memberId, memberId),
                    eq(scheduleExceptions.date, date)
                )
            );

        const [exception] = await db
            .insert(scheduleExceptions)
            .values({
                memberId,
                date,
                type,
                reason,
                startTime,
                endTime,
                createdAt: new Date(),
            })
            .returning();

        revalidatePath(`/escalas/minha-agenda`);
        return { success: true, exception };
    } catch (error) {
        console.error('Erro ao adicionar exceção:', error);
        return { success: false, error: 'Erro ao adicionar exceção' };
    }
}

/**
 * Remover exceção
 */
export async function removeException(
    exceptionId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await db
            .delete(scheduleExceptions)
            .where(eq(scheduleExceptions.id, exceptionId));

        revalidatePath(`/escalas/minha-agenda`);
        return { success: true };
    } catch (error) {
        console.error('Erro ao remover exceção:', error);
        return { success: false, error: 'Erro ao remover exceção' };
    }
}

/**
 * Listar exceções do membro
 */
export async function getExceptions(
    memberId: string,
    options?: { startDate?: string; endDate?: string }
): Promise<ScheduleException[]> {
    try {
        const conditions = [eq(scheduleExceptions.memberId, memberId)];

        if (options?.startDate) {
            conditions.push(gte(scheduleExceptions.date, options.startDate));
        }

        if (options?.endDate) {
            conditions.push(lte(scheduleExceptions.date, options.endDate));
        }

        return await db
            .select()
            .from(scheduleExceptions)
            .where(and(...conditions))
            .orderBy(asc(scheduleExceptions.date));
    } catch (error) {
        console.error('Erro ao listar exceções:', error);
        return [];
    }
}

/**
 * Buscar membros disponíveis para um horário específico
 */
export async function getAvailableMembers(
    date: string,
    startTime: string,
    endTime: string,
    territoryScope?: string
): Promise<{
    memberId: string;
    memberName: string;
    militancyLevel: string;
}[]> {
    try {
        const dateObj = new Date(date);
        const dayOfWeek = dateObj.getDay();

        // Buscar disponibilidades no dia
        const availabilities = await db.query.memberAvailability.findMany({
            where: and(
                eq(memberAvailability.dayOfWeek, dayOfWeek),
                eq(memberAvailability.isAvailable, true),
                lte(memberAvailability.startTime, startTime),
                gte(memberAvailability.endTime, endTime)
            ),
            with: {
                member: true,
            },
        });

        // Buscar exceções para a data
        const memberIds = availabilities.map((a) => a.memberId);
        const exceptions =
            memberIds.length > 0
                ? await db
                    .select()
                    .from(scheduleExceptions)
                    .where(
                        and(
                            inArray(scheduleExceptions.memberId, memberIds),
                            eq(scheduleExceptions.date, date),
                            eq(scheduleExceptions.type, 'unavailable')
                        )
                    )
                : [];

        const exceptionMemberIds = new Set(exceptions.map((e) => e.memberId));

        // Filtrar disponíveis (removendo os com exceções)
        let available = availabilities
            .filter((a) => !exceptionMemberIds.has(a.memberId))
            .filter((a) => a.member?.status === 'active');

        // Filtrar por território
        if (territoryScope) {
            const [state, city] = territoryScope.split(':');
            available = available.filter((a) => {
                if (!a.member) return false;
                if (city) {
                    return a.member.state === state && a.member.city === city;
                }
                return a.member.state === state;
            });
        }

        // Remover duplicatas (mesmo membro pode ter múltiplos slots)
        const uniqueMembers = new Map<
            string,
            { memberId: string; memberName: string; militancyLevel: string }
        >();

        for (const a of available) {
            if (a.member && !uniqueMembers.has(a.memberId)) {
                uniqueMembers.set(a.memberId, {
                    memberId: a.memberId,
                    memberName: a.member.fullName,
                    militancyLevel: a.member.militancyLevel,
                });
            }
        }

        return Array.from(uniqueMembers.values());
    } catch (error) {
        console.error('Erro ao buscar membros disponíveis:', error);
        return [];
    }
}

/**
 * Copiar disponibilidade de um dia para outros dias
 */
export async function copyAvailabilityToOtherDays(
    memberId: string,
    sourceDay: number,
    targetDays: number[]
): Promise<{ success: boolean; count: number; error?: string }> {
    try {
        // Buscar disponibilidade do dia fonte
        const sourceAvailability = await db
            .select()
            .from(memberAvailability)
            .where(
                and(
                    eq(memberAvailability.memberId, memberId),
                    eq(memberAvailability.dayOfWeek, sourceDay)
                )
            );

        if (sourceAvailability.length === 0) {
            return { success: false, count: 0, error: 'Dia origem sem disponibilidade' };
        }

        // Remover disponibilidade dos dias alvo
        await db
            .delete(memberAvailability)
            .where(
                and(
                    eq(memberAvailability.memberId, memberId),
                    inArray(memberAvailability.dayOfWeek, targetDays)
                )
            );

        // Criar novas entradas para cada dia alvo
        const entries: NewMemberAvailability[] = [];

        for (const targetDay of targetDays) {
            for (const slot of sourceAvailability) {
                entries.push({
                    memberId,
                    dayOfWeek: targetDay,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    isAvailable: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
        }

        if (entries.length > 0) {
            await db.insert(memberAvailability).values(entries);
        }

        revalidatePath(`/escalas/minha-agenda`);
        return { success: true, count: entries.length };
    } catch (error) {
        console.error('Erro ao copiar disponibilidade:', error);
        return { success: false, count: 0, error: 'Erro ao copiar' };
    }
}
