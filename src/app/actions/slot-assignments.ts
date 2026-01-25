'use server';

import { db } from '@/lib/db';
import {
    slotAssignments,
    scheduleSlots,
    memberAvailability,
    scheduleExceptions,
    members,
    SlotAssignment,
    NewSlotAssignment,
} from '@/lib/db/schema';
import { eq, and, gte, lte, asc, desc, sql, ne, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { checkAndUpdateSlotCapacity } from './schedule-slots';

// ==========================================
// TIPOS AUXILIARES
// ==========================================

export interface AssignmentWithDetails extends SlotAssignment {
    memberName: string;
    memberPhone?: string;
    slotName: string;
    slotDate: string;
    slotTime: string;
    scheduleName: string;
}

// ==========================================
// ATRIBUIÇÕES DE MEMBROS
// ==========================================

/**
 * Atribuir membro a um turno
 */
export async function assignMemberToSlot(
    slotId: string,
    memberId: string,
    assignedById: string,
    role: 'participant' | 'leader' | 'backup' = 'participant'
): Promise<{ success: boolean; assignment?: SlotAssignment; error?: string }> {
    try {
        // Verificar se membro já está atribuído
        const existing = await db.query.slotAssignments.findFirst({
            where: and(
                eq(slotAssignments.slotId, slotId),
                eq(slotAssignments.memberId, memberId)
            ),
        });

        if (existing) {
            return { success: false, error: 'Membro já está atribuído a este turno' };
        }

        // Verificar capacidade do turno
        const slot = await db.query.scheduleSlots.findFirst({
            where: eq(scheduleSlots.id, slotId),
        });

        if (!slot) {
            return { success: false, error: 'Turno não encontrado' };
        }

        if (slot.status === 'cancelled') {
            return { success: false, error: 'Turno cancelado' };
        }

        // Criar atribuição
        const [assignment] = await db
            .insert(slotAssignments)
            .values({
                slotId,
                memberId,
                assignedById,
                role,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        // Verificar capacidade
        await checkAndUpdateSlotCapacity(slotId);

        revalidatePath(`/escalas`);
        return { success: true, assignment };
    } catch (error) {
        console.error('Erro ao atribuir membro:', error);
        return { success: false, error: 'Erro ao atribuir membro' };
    }
}

/**
 * Atribuir múltiplos membros a um turno
 */
export async function assignMultipleMembersToSlot(
    slotId: string,
    memberIds: string[],
    assignedById: string,
    role: 'participant' | 'leader' | 'backup' = 'participant'
): Promise<{ success: boolean; count: number; errors: string[] }> {
    const errors: string[] = [];
    let count = 0;

    for (const memberId of memberIds) {
        const result = await assignMemberToSlot(slotId, memberId, assignedById, role);
        if (result.success) {
            count++;
        } else if (result.error) {
            errors.push(`${memberId}: ${result.error}`);
        }
    }

    return { success: count > 0, count, errors };
}

/**
 * Remover atribuição
 */
export async function removeAssignment(
    assignmentId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const [deleted] = await db
            .delete(slotAssignments)
            .where(eq(slotAssignments.id, assignmentId))
            .returning();

        if (deleted) {
            await checkAndUpdateSlotCapacity(deleted.slotId);
            revalidatePath(`/escalas`);
        }

        return { success: true };
    } catch (error) {
        console.error('Erro ao remover atribuição:', error);
        return { success: false, error: 'Erro ao remover atribuição' };
    }
}

/**
 * Confirmar participação
 */
export async function confirmAssignment(
    assignmentId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await db
            .update(slotAssignments)
            .set({
                status: 'confirmed',
                confirmationDate: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(slotAssignments.id, assignmentId));

        revalidatePath(`/escalas`);
        return { success: true };
    } catch (error) {
        console.error('Erro ao confirmar participação:', error);
        return { success: false, error: 'Erro ao confirmar' };
    }
}

/**
 * Recusar participação
 */
export async function declineAssignment(
    assignmentId: string,
    reason?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const [assignment] = await db
            .update(slotAssignments)
            .set({
                status: 'declined',
                declineReason: reason,
                updatedAt: new Date(),
            })
            .where(eq(slotAssignments.id, assignmentId))
            .returning();

        if (assignment) {
            await checkAndUpdateSlotCapacity(assignment.slotId);
        }

        revalidatePath(`/escalas`);
        return { success: true };
    } catch (error) {
        console.error('Erro ao recusar participação:', error);
        return { success: false, error: 'Erro ao recusar' };
    }
}

/**
 * Registrar check-in
 */
export async function checkIn(
    assignmentId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await db
            .update(slotAssignments)
            .set({
                status: 'attended',
                checkInTime: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(slotAssignments.id, assignmentId));

        revalidatePath(`/escalas`);
        return { success: true };
    } catch (error) {
        console.error('Erro ao registrar check-in:', error);
        return { success: false, error: 'Erro ao registrar entrada' };
    }
}

/**
 * Registrar check-out
 */
export async function checkOut(
    assignmentId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await db
            .update(slotAssignments)
            .set({
                checkOutTime: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(slotAssignments.id, assignmentId));

        revalidatePath(`/escalas`);
        return { success: true };
    } catch (error) {
        console.error('Erro ao registrar check-out:', error);
        return { success: false, error: 'Erro ao registrar saída' };
    }
}

/**
 * Marcar como ausente
 */
export async function markAbsent(
    assignmentId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await db
            .update(slotAssignments)
            .set({
                status: 'absent',
                updatedAt: new Date(),
            })
            .where(eq(slotAssignments.id, assignmentId));

        revalidatePath(`/escalas`);
        return { success: true };
    } catch (error) {
        console.error('Erro ao marcar ausente:', error);
        return { success: false, error: 'Erro ao marcar ausente' };
    }
}

/**
 * Marcar como justificado
 */
export async function markExcused(
    assignmentId: string,
    reason: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await db
            .update(slotAssignments)
            .set({
                status: 'excused',
                declineReason: reason,
                updatedAt: new Date(),
            })
            .where(eq(slotAssignments.id, assignmentId));

        revalidatePath(`/escalas`);
        return { success: true };
    } catch (error) {
        console.error('Erro ao marcar justificado:', error);
        return { success: false, error: 'Erro ao marcar justificado' };
    }
}

/**
 * Buscar atribuições de um membro
 */
export async function getAssignmentsByMember(
    memberId: string,
    options?: { status?: string; upcoming?: boolean }
): Promise<AssignmentWithDetails[]> {
    try {
        const result = await db.query.slotAssignments.findMany({
            where: eq(slotAssignments.memberId, memberId),
            with: {
                slot: {
                    with: {
                        schedule: true,
                    },
                },
                member: true,
            },
            orderBy: [desc(slotAssignments.createdAt)],
        });

        let filtered = result;

        // Filtrar por status
        if (options?.status) {
            filtered = filtered.filter((a) => a.status === options.status);
        }

        // Filtrar apenas futuros
        if (options?.upcoming) {
            const today = new Date().toISOString().split('T')[0];
            filtered = filtered.filter((a) => a.slot?.date >= today);
        }

        return filtered.map((a) => ({
            ...a,
            memberName: a.member?.fullName || 'Membro',
            memberPhone: a.member?.phone,
            slotName: a.slot?.name || '',
            slotDate: a.slot?.date || '',
            slotTime: `${a.slot?.startTime} - ${a.slot?.endTime}`,
            scheduleName: a.slot?.schedule?.name || '',
        }));
    } catch (error) {
        console.error('Erro ao buscar atribuições do membro:', error);
        return [];
    }
}

/**
 * Buscar atribuições de um turno
 */
export async function getAssignmentsBySlot(
    slotId: string
): Promise<AssignmentWithDetails[]> {
    try {
        const result = await db.query.slotAssignments.findMany({
            where: eq(slotAssignments.slotId, slotId),
            with: {
                slot: {
                    with: {
                        schedule: true,
                    },
                },
                member: true,
            },
            orderBy: [asc(slotAssignments.role)],
        });

        return result.map((a) => ({
            ...a,
            memberName: a.member?.fullName || 'Membro',
            memberPhone: a.member?.phone,
            slotName: a.slot?.name || '',
            slotDate: a.slot?.date || '',
            slotTime: `${a.slot?.startTime} - ${a.slot?.endTime}`,
            scheduleName: a.slot?.schedule?.name || '',
        }));
    } catch (error) {
        console.error('Erro ao buscar atribuições do turno:', error);
        return [];
    }
}

/**
 * Auto-sugerir membros disponíveis para um turno
 */
export async function getAvailableMembersForSlot(
    slotId: string,
    territoryScope?: string
): Promise<{
    memberId: string;
    memberName: string;
    score: number;
    reasons: string[];
}[]> {
    try {
        const slot = await db.query.scheduleSlots.findFirst({
            where: eq(scheduleSlots.id, slotId),
            with: {
                schedule: true,
                assignments: true,
            },
        });

        if (!slot) return [];

        const slotDate = new Date(slot.date);
        const dayOfWeek = slotDate.getDay();

        // IDs já atribuídos
        const assignedIds = slot.assignments.map((a) => a.memberId);

        // Buscar todos os membros ativos do território
        let allMembers = await db.query.members.findMany({
            where: eq(members.status, 'active'),
        });

        // Filtrar por território se especificado
        if (territoryScope) {
            const [state, city] = territoryScope.split(':');
            allMembers = allMembers.filter((m) => {
                if (city) {
                    return m.state === state && m.city === city;
                }
                return m.state === state;
            });
        }

        // Filtrar membros já atribuídos
        const availableMembers = allMembers.filter(
            (m) => !assignedIds.includes(m.id)
        );

        // Buscar disponibilidade
        const memberIds = availableMembers.map((m) => m.id);

        const availabilities = memberIds.length > 0
            ? await db
                .select()
                .from(memberAvailability)
                .where(
                    and(
                        inArray(memberAvailability.memberId, memberIds),
                        eq(memberAvailability.dayOfWeek, dayOfWeek),
                        eq(memberAvailability.isAvailable, true)
                    )
                )
            : [];

        // Buscar exceções para a data
        const exceptions = memberIds.length > 0
            ? await db
                .select()
                .from(scheduleExceptions)
                .where(
                    and(
                        inArray(scheduleExceptions.memberId, memberIds),
                        eq(scheduleExceptions.date, slot.date)
                    )
                )
            : [];

        // Calcular score para cada membro
        const suggestions = availableMembers.map((member) => {
            let score = 50; // Score base
            const reasons: string[] = [];

            // Verificar disponibilidade no dia
            const hasAvailability = availabilities.some(
                (a) => a.memberId === member.id
            );
            if (hasAvailability) {
                score += 30;
                reasons.push('Disponível no dia');
            }

            // Verificar exceções
            const unavailableException = exceptions.find(
                (e) => e.memberId === member.id && e.type === 'unavailable'
            );
            if (unavailableException) {
                score -= 100;
                reasons.push('Indisponível nesta data');
            }

            const availableException = exceptions.find(
                (e) => e.memberId === member.id && e.type === 'available'
            );
            if (availableException) {
                score += 50;
                reasons.push('Disponibilidade confirmada');
            }

            // Bonus por nível de militância
            if (member.militancyLevel === 'leader') {
                score += 15;
                reasons.push('Liderança');
            } else if (member.militancyLevel === 'militant') {
                score += 10;
                reasons.push('Militante ativo');
            }

            return {
                memberId: member.id,
                memberName: member.fullName,
                score,
                reasons,
            };
        });

        // Ordenar por score e retornar os melhores
        return suggestions
            .filter((s) => s.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 20);
    } catch (error) {
        console.error('Erro ao buscar membros disponíveis:', error);
        return [];
    }
}

/**
 * Estatísticas de participação de um membro
 */
export async function getMemberParticipationStats(
    memberId: string
): Promise<{
    total: number;
    attended: number;
    absent: number;
    excused: number;
    pending: number;
    attendanceRate: number;
}> {
    try {
        const assignments = await db
            .select()
            .from(slotAssignments)
            .where(eq(slotAssignments.memberId, memberId));

        const stats = {
            total: assignments.length,
            attended: 0,
            absent: 0,
            excused: 0,
            pending: 0,
            attendanceRate: 0,
        };

        for (const a of assignments) {
            switch (a.status) {
                case 'attended':
                    stats.attended++;
                    break;
                case 'absent':
                    stats.absent++;
                    break;
                case 'excused':
                    stats.excused++;
                    break;
                case 'pending':
                case 'confirmed':
                    stats.pending++;
                    break;
            }
        }

        // Calcular taxa de presença (excluindo pendentes e justificados)
        const totalRelevant = stats.attended + stats.absent;
        stats.attendanceRate =
            totalRelevant > 0
                ? Math.round((stats.attended / totalRelevant) * 100)
                : 100;

        return stats;
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return {
            total: 0,
            attended: 0,
            absent: 0,
            excused: 0,
            pending: 0,
            attendanceRate: 0,
        };
    }
}
