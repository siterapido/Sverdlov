'use server';

import { db } from '@/lib/db';
import {
    schedules,
    scheduleSlots,
    slotAssignments,
    scheduleExceptions,
    memberAvailability,
    members,
    Schedule,
    NewSchedule,
    ScheduleSlot,
    RecurringPattern,
} from '@/lib/db/schema';
import { eq, and, gte, lte, desc, asc, sql, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { auditCreate, auditUpdate } from '@/lib/audit';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';

async function getCurrentUserId(): Promise<string | undefined> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        if (token) {
            const user = await verifyToken(token);
            return user?.userId;
        }
    } catch {
        return undefined;
    }
    return undefined;
}

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

// ==========================================
// AUTO-ASSIGNMENT E TROCAS DE TURNO
// ==========================================

/**
 * Auto-assign members to a schedule slot based on their availability
 */
export async function autoAssignSlot(slotId: string) {
    try {
        const slot = await db.query.scheduleSlots.findFirst({
            where: eq(scheduleSlots.id, slotId),
        });

        if (!slot) {
            return { success: false, error: 'Turno não encontrado' };
        }

        const dayOfWeek = new Date(slot.date).getDay();

        // Find members with availability matching this slot
        const availableMembers = await db
            .select({
                memberId: members.id,
                fullName: members.fullName,
                email: members.email,
            })
            .from(members)
            .innerJoin(
                memberAvailability,
                eq(members.id, memberAvailability.memberId)
            )
            .where(
                and(
                    eq(members.status, 'active'),
                    eq(memberAvailability.dayOfWeek, dayOfWeek),
                    eq(memberAvailability.isAvailable, true),
                    sql`${memberAvailability.startTime} <= ${slot.startTime}`,
                    sql`${memberAvailability.endTime} >= ${slot.endTime}`
                )
            )
            .orderBy(() => sql`RANDOM()`)
            .limit(slot.maxParticipants || 10);

        const exceptions = await db
            .select({ memberId: scheduleExceptions.memberId })
            .from(scheduleExceptions)
            .where(
                and(
                    eq(scheduleExceptions.type, 'unavailable'),
                    sql`DATE(${scheduleExceptions.date}) = DATE(${slot.date})`
                )
            );

        const unavailableMemberIds = new Set(exceptions.map((e) => e.memberId));
        const membersToAssign = availableMembers.filter(
            (m) => !unavailableMemberIds.has(m.memberId)
        );

        const assigned = [];
        const userId = await getCurrentUserId();

        for (const member of membersToAssign) {
            const existing = await db
                .select()
                .from(slotAssignments)
                .where(
                    and(
                        eq(slotAssignments.slotId, slotId),
                        eq(slotAssignments.memberId, member.memberId)
                    )
                );

            if (existing.length === 0) {
                const [newAssignment] = await db
                    .insert(slotAssignments)
                    .values({
                        slotId,
                        memberId: member.memberId,
                        assignedById: userId,
                        status: 'pending',
                    })
                    .returning();

                await auditCreate(
                    userId,
                    'slot_assignments',
                    newAssignment.id,
                    newAssignment as Record<string, unknown>
                );

                assigned.push(member);
            }
        }

        revalidatePath('/escalas');
        return { success: true, assigned, count: assigned.length };
    } catch (error) {
        console.error('Erro ao auto-atribuir turno:', error);
        return { success: false, error: 'Erro ao auto-atribuir turno' };
    }
}

/**
 * Confirm attendance for a slot assignment
 */
export async function confirmAttendance(assignmentId: string) {
    try {
        const assignment = await db.query.slotAssignments.findFirst({
            where: eq(slotAssignments.id, assignmentId),
        });

        if (!assignment) {
            return { success: false, error: 'Atribuição não encontrada' };
        }

        const [updated] = await db
            .update(slotAssignments)
            .set({
                status: 'confirmed',
                confirmationDate: new Date(),
            })
            .where(eq(slotAssignments.id, assignmentId))
            .returning();

        const userId = await getCurrentUserId();
        await auditUpdate(
            userId,
            'slot_assignments',
            assignmentId,
            assignment as Record<string, unknown>,
            updated as Record<string, unknown>,
            { action: 'confirm_attendance' }
        );

        revalidatePath('/escalas');
        return { success: true };
    } catch (error) {
        console.error('Erro ao confirmar presença:', error);
        return { success: false, error: 'Erro ao confirmar presença' };
    }
}

/**
 * Mark member as attended
 */
export async function recordCheckIn(assignmentId: string, checkInTime: Date) {
    try {
        const assignment = await db.query.slotAssignments.findFirst({
            where: eq(slotAssignments.id, assignmentId),
        });

        if (!assignment) {
            return { success: false, error: 'Atribuição não encontrada' };
        }

        const [updated] = await db
            .update(slotAssignments)
            .set({
                checkInTime,
                status: 'attended',
            })
            .where(eq(slotAssignments.id, assignmentId))
            .returning();

        const userId = await getCurrentUserId();
        await auditUpdate(
            userId,
            'slot_assignments',
            assignmentId,
            assignment as Record<string, unknown>,
            updated as Record<string, unknown>,
            { action: 'check_in' }
        );

        revalidatePath('/escalas');
        return { success: true };
    } catch (error) {
        console.error('Erro ao registrar check-in:', error);
        return { success: false, error: 'Erro ao registrar check-in' };
    }
}

/**
 * Mark member as absent
 */
export async function markAbsent(assignmentId: string, reason?: string) {
    try {
        const assignment = await db.query.slotAssignments.findFirst({
            where: eq(slotAssignments.id, assignmentId),
        });

        if (!assignment) {
            return { success: false, error: 'Atribuição não encontrada' };
        }

        const [updated] = await db
            .update(slotAssignments)
            .set({
                status: 'absent',
                notes: reason || 'Ausência não justificada',
            })
            .where(eq(slotAssignments.id, assignmentId))
            .returning();

        const userId = await getCurrentUserId();
        await auditUpdate(
            userId,
            'slot_assignments',
            assignmentId,
            assignment as Record<string, unknown>,
            updated as Record<string, unknown>,
            { action: 'mark_absent', reason }
        );

        revalidatePath('/escalas');
        return { success: true };
    } catch (error) {
        console.error('Erro ao marcar ausência:', error);
        return { success: false, error: 'Erro ao marcar ausência' };
    }
}

/**
 * Get attendance statistics for a member
 */
export async function getMemberAttendanceStats(memberId: string) {
    try {
        const stats = await db
            .select({
                attended: sql<number>`COUNT(CASE WHEN ${slotAssignments.status} = 'attended' THEN 1 END)`,
                absent: sql<number>`COUNT(CASE WHEN ${slotAssignments.status} = 'absent' THEN 1 END)`,
                excused: sql<number>`COUNT(CASE WHEN ${slotAssignments.status} = 'excused' THEN 1 END)`,
                pending: sql<number>`COUNT(CASE WHEN ${slotAssignments.status} = 'pending' THEN 1 END)`,
                total: sql<number>`COUNT(*)`,
            })
            .from(slotAssignments)
            .where(eq(slotAssignments.memberId, memberId));

        const record = stats[0];
        const attendanceRate =
            record && record.total > 0
                ? ((record.attended / record.total) * 100).toFixed(1)
                : '0';

        return { success: true, stats: { ...record, attendanceRate } };
    } catch (error) {
        console.error('Erro ao buscar estatísticas de presença:', error);
        return { success: false, error: 'Erro ao buscar estatísticas' };
    }
}

// ==========================================
// MANUAL SLOT ASSIGNMENT ACTIONS
// ==========================================

/**
 * Manually assign a member to a slot
 */
export async function manualAssignSlot(
    slotId: string,
    memberId: string,
    role: 'participant' | 'leader' | 'backup' = 'participant'
) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) return { success: false, error: 'Não autorizado' };

        // Check for duplicate assignment
        const existing = await db.query.slotAssignments.findFirst({
            where: and(
                eq(slotAssignments.slotId, slotId),
                eq(slotAssignments.memberId, memberId)
            )
        });

        if (existing) {
            return { success: false, error: 'Membro já está atribuído a este turno' };
        }

        // Get slot to find schedule for revalidation
        const slot = await db.query.scheduleSlots.findFirst({
            where: eq(scheduleSlots.id, slotId),
            with: { schedule: true }
        });

        const [assignment] = await db.insert(slotAssignments).values({
            slotId,
            memberId,
            role,
            assignedById: userId,
            status: 'pending'
        }).returning();

        if (slot?.schedule) {
            revalidatePath(`/schedules/${slot.schedule.id}`);
        }
        revalidatePath(`/members/${memberId}`);

        return { success: true, data: assignment };
    } catch (error) {
        console.error('Erro ao atribuir membro a turno:', error);
        return { success: false, error: 'Falha ao atribuir membro ao turno' };
    }
}

/**
 * Remove a member from a slot
 */
export async function removeSlotAssignment(assignmentId: string) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) return { success: false, error: 'Não autorizado' };

        const [assignment] = await db.delete(slotAssignments)
            .where(eq(slotAssignments.id, assignmentId))
            .returning();

        if (assignment) {
            const slot = await db.query.scheduleSlots.findFirst({
                where: eq(scheduleSlots.id, assignment.slotId),
                with: { schedule: true }
            });

            if (slot?.schedule) {
                revalidatePath(`/schedules/${slot.schedule.id}`);
            }
            revalidatePath(`/members/${assignment.memberId}`);
        }

        return { success: true };
    } catch (error) {
        console.error('Erro ao remover atribuição de turno:', error);
        return { success: false, error: 'Falha ao remover atribuição' };
    }
}

/**
 * Update a member's role in a slot
 */
export async function updateSlotAssignmentRole(
    assignmentId: string,
    role: 'participant' | 'leader' | 'backup'
) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) return { success: false, error: 'Não autorizado' };

        const [assignment] = await db.update(slotAssignments)
            .set({ role, updatedAt: new Date() })
            .where(eq(slotAssignments.id, assignmentId))
            .returning();

        if (assignment) {
            const slot = await db.query.scheduleSlots.findFirst({
                where: eq(scheduleSlots.id, assignment.slotId),
                with: { schedule: true }
            });

            if (slot?.schedule) {
                revalidatePath(`/schedules/${slot.schedule.id}`);
            }
            revalidatePath(`/members/${assignment.memberId}`);
        }

        return { success: true };
    } catch (error) {
        console.error('Erro ao atualizar papel no turno:', error);
        return { success: false, error: 'Falha ao atualizar papel' };
    }
}
