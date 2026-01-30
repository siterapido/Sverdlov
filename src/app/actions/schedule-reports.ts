'use server';

import { db } from '@/lib/db';
import {
    schedules,
    scheduleSlots,
    slotAssignments,
    members,
} from '@/lib/db/schema';
import { eq, and, gte, lte, sql, desc, count } from 'drizzle-orm';

// ==========================================
// TIPOS DE RELATÓRIOS
// ==========================================

export interface ScheduleReportFilters {
    startDate?: string;
    endDate?: string;
    category?: string;
    territoryScope?: string;
}

export interface ScheduleOverviewStats {
    totalSchedules: number;
    activeSchedules: number;
    totalSlots: number;
    totalAssignments: number;
    confirmationRate: number;
    attendanceRate: number;
}

export interface ParticipationByCategory {
    category: string;
    total: number;
    attended: number;
    rate: number;
}

export interface TopMember {
    memberId: string;
    memberName: string;
    totalAssignments: number;
    attended: number;
    attendanceRate: number;
}

export interface MonthlyTrend {
    month: string;
    year: number;
    totalSlots: number;
    totalAssignments: number;
    attended: number;
}

// ==========================================
// FUNÇÕES DE RELATÓRIOS
// ==========================================

/**
 * Estatísticas gerais de escalas
 */
export async function getScheduleOverviewStats(
    filters?: ScheduleReportFilters
): Promise<ScheduleOverviewStats> {
    try {
        // Total de escalas
        const allSchedules = await db.select().from(schedules);
        const activeSchedules = allSchedules.filter(s => s.status === 'active').length;

        // Total de turnos
        const allSlots = await db.select().from(scheduleSlots);

        // Total de atribuições
        const allAssignments = await db.select().from(slotAssignments);

        const confirmed = allAssignments.filter(a =>
            a.status === 'confirmed' || a.status === 'attended'
        ).length;

        const attended = allAssignments.filter(a => a.status === 'attended').length;
        const needConfirmation = allAssignments.filter(a =>
            a.status === 'pending' || a.status === 'confirmed' || a.status === 'attended' || a.status === 'absent'
        ).length;

        const relevant = allAssignments.filter(a =>
            a.status === 'attended' || a.status === 'absent'
        );

        return {
            totalSchedules: allSchedules.length,
            activeSchedules,
            totalSlots: allSlots.length,
            totalAssignments: allAssignments.length,
            confirmationRate: needConfirmation > 0
                ? Math.round((confirmed / needConfirmation) * 100)
                : 0,
            attendanceRate: relevant.length > 0
                ? Math.round((attended / relevant.length) * 100)
                : 100,
        };
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return {
            totalSchedules: 0,
            activeSchedules: 0,
            totalSlots: 0,
            totalAssignments: 0,
            confirmationRate: 0,
            attendanceRate: 0,
        };
    }
}

/**
 * Participação por categoria
 */
export async function getParticipationByCategory(): Promise<ParticipationByCategory[]> {
    try {
        const results: ParticipationByCategory[] = [];
        const categories = ['vigilancia', 'formacao', 'agitacao', 'administrativa', 'financeira', 'outras'];

        for (const category of categories) {
            // Buscar escalas da categoria
            const categorySchedules = await db
                .select()
                .from(schedules)
                .where(eq(schedules.category, category as typeof schedules.category.enumValues[number]));

            const scheduleIds = categorySchedules.map(s => s.id);

            if (scheduleIds.length === 0) {
                results.push({ category, total: 0, attended: 0, rate: 0 });
                continue;
            }

            // Buscar turnos dessas escalas
            let totalAttended = 0;
            let totalAssignments = 0;

            for (const scheduleId of scheduleIds) {
                const slots = await db
                    .select()
                    .from(scheduleSlots)
                    .where(eq(scheduleSlots.scheduleId, scheduleId));

                for (const slot of slots) {
                    const assignments = await db
                        .select()
                        .from(slotAssignments)
                        .where(eq(slotAssignments.slotId, slot.id));

                    totalAssignments += assignments.length;
                    totalAttended += assignments.filter(a => a.status === 'attended').length;
                }
            }

            results.push({
                category,
                total: totalAssignments,
                attended: totalAttended,
                rate: totalAssignments > 0 ? Math.round((totalAttended / totalAssignments) * 100) : 0,
            });
        }

        return results.sort((a, b) => b.total - a.total);
    } catch (error) {
        console.error('Erro ao buscar participação por categoria:', error);
        return [];
    }
}

/**
 * Top membros por participação
 */
export async function getTopParticipants(limit: number = 10): Promise<TopMember[]> {
    try {
        const allMembers = await db.select().from(members).where(eq(members.status, 'active'));
        const memberStats: TopMember[] = [];

        for (const member of allMembers) {
            const assignments = await db
                .select()
                .from(slotAssignments)
                .where(eq(slotAssignments.memberId, member.id));

            if (assignments.length === 0) continue;

            const attended = assignments.filter(a => a.status === 'attended').length;
            const relevant = assignments.filter(a =>
                a.status === 'attended' || a.status === 'absent'
            ).length;

            memberStats.push({
                memberId: member.id,
                memberName: member.fullName,
                totalAssignments: assignments.length,
                attended,
                attendanceRate: relevant > 0 ? Math.round((attended / relevant) * 100) : 100,
            });
        }

        return memberStats
            .sort((a, b) => b.totalAssignments - a.totalAssignments)
            .slice(0, limit);
    } catch (error) {
        console.error('Erro ao buscar top participantes:', error);
        return [];
    }
}

/**
 * Membros com baixa participação
 */
export async function getLowParticipationMembers(
    threshold: number = 50,
    limit: number = 10
): Promise<TopMember[]> {
    try {
        const allMembers = await db.select().from(members).where(eq(members.status, 'active'));
        const memberStats: TopMember[] = [];

        for (const member of allMembers) {
            const assignments = await db
                .select()
                .from(slotAssignments)
                .where(eq(slotAssignments.memberId, member.id));

            if (assignments.length < 3) continue; // Mínimo de atribuições para considerar

            const attended = assignments.filter(a => a.status === 'attended').length;
            const relevant = assignments.filter(a =>
                a.status === 'attended' || a.status === 'absent'
            ).length;

            if (relevant === 0) continue;

            const rate = Math.round((attended / relevant) * 100);
            if (rate < threshold) {
                memberStats.push({
                    memberId: member.id,
                    memberName: member.fullName,
                    totalAssignments: assignments.length,
                    attended,
                    attendanceRate: rate,
                });
            }
        }

        return memberStats
            .sort((a, b) => a.attendanceRate - b.attendanceRate)
            .slice(0, limit);
    } catch (error) {
        console.error('Erro ao buscar membros com baixa participação:', error);
        return [];
    }
}

/**
 * Tendência mensal de participação
 */
export async function getMonthlyTrend(months: number = 6): Promise<MonthlyTrend[]> {
    try {
        const trends: MonthlyTrend[] = [];
        const today = new Date();

        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
            const monthEnd = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;

            // Buscar turnos do mês
            const slots = await db
                .select()
                .from(scheduleSlots)
                .where(and(
                    gte(scheduleSlots.date, monthStart),
                    lte(scheduleSlots.date, monthEnd)
                ));

            let totalAssignments = 0;
            let attended = 0;

            for (const slot of slots) {
                const assignments = await db
                    .select()
                    .from(slotAssignments)
                    .where(eq(slotAssignments.slotId, slot.id));

                totalAssignments += assignments.length;
                attended += assignments.filter(a => a.status === 'attended').length;
            }

            trends.push({
                month: date.toLocaleDateString('pt-BR', { month: 'short' }),
                year,
                totalSlots: slots.length,
                totalAssignments,
                attended,
            });
        }

        return trends;
    } catch (error) {
        console.error('Erro ao buscar tendência mensal:', error);
        return [];
    }
}

/**
 * Horários mais demandados
 */
export async function getPopularTimeSlots(): Promise<{ time: string; count: number }[]> {
    try {
        const slots = await db.select().from(scheduleSlots);
        const timeCount: Record<string, number> = {};

        for (const slot of slots) {
            const timeKey = slot.startTime;
            timeCount[timeKey] = (timeCount[timeKey] || 0) + 1;
        }

        return Object.entries(timeCount)
            .map(([time, count]) => ({ time, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    } catch (error) {
        console.error('Erro ao buscar horários populares:', error);
        return [];
    }
}

/**
 * Dias da semana mais utilizados
 */
export async function getPopularDays(): Promise<{ day: string; dayOfWeek: number; count: number }[]> {
    try {
        const slots = await db.select().from(scheduleSlots);
        const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const dayCount: Record<number, number> = {};

        for (const slot of slots) {
            const dayOfWeek = new Date(slot.date + 'T12:00').getDay();
            dayCount[dayOfWeek] = (dayCount[dayOfWeek] || 0) + 1;
        }

        return Object.entries(dayCount)
            .map(([dayOfWeek, count]) => ({
                day: dayNames[Number(dayOfWeek)],
                dayOfWeek: Number(dayOfWeek),
                count,
            }))
            .sort((a, b) => b.count - a.count);
    } catch (error) {
        console.error('Erro ao buscar dias populares:', error);
        return [];
    }
}

/**
 * Relatório completo consolidado
 */
export async function getFullReport(): Promise<{
    overview: ScheduleOverviewStats;
    byCategory: ParticipationByCategory[];
    topMembers: TopMember[];
    lowParticipation: TopMember[];
    monthlyTrend: MonthlyTrend[];
    popularTimes: { time: string; count: number }[];
    popularDays: { day: string; dayOfWeek: number; count: number }[];
}> {
    const [overview, byCategory, topMembers, lowParticipation, monthlyTrend, popularTimes, popularDays] = await Promise.all([
        getScheduleOverviewStats(),
        getParticipationByCategory(),
        getTopParticipants(10),
        getLowParticipationMembers(50, 10),
        getMonthlyTrend(6),
        getPopularTimeSlots(),
        getPopularDays(),
    ]);

    return {
        overview,
        byCategory,
        topMembers,
        lowParticipation,
        monthlyTrend,
        popularTimes,
        popularDays,
    };
}
