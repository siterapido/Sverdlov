"use server";

import { db } from "@/lib/db";
import { projectTasks, projectMembers, taskAssignees } from "@/lib/db/schema/projects";
import { members } from "@/lib/db/schema/members";
import { memberAvailability, scheduleExceptions } from "@/lib/db/schema/schedules";
import { eq, and, inArray } from "drizzle-orm";

export async function getAvailableMembersForTask(taskId: string): Promise<{
    memberId: string;
    memberName: string;
    score: number;
    reasons: string[];
}[]> {
    try {
        const task = await db.query.projectTasks.findFirst({
            where: eq(projectTasks.id, taskId),
            with: {
                assignees: true,
            }
        });

        if (!task) return [];

        // Get project members first (prioritize people already in the project)
        const projMembers = await db.query.projectMembers.findMany({
            where: eq(projectMembers.projectId, task.projectId),
            with: { member: true }
        });

        // IDs already assigned to this task
        const assignedIds = new Set(task.assignees.map(a => a.memberId));

        // Determine day of week to check availability
        let targetDayOfWeek: number | null = null;
        if (task.dayOfWeek !== null && task.dayOfWeek !== undefined) {
            targetDayOfWeek = task.dayOfWeek;
        } else if (task.dueDate) {
            targetDayOfWeek = new Date(task.dueDate).getDay();
        }

        // Get all active members (fallback if no project members)
        let candidateMembers = projMembers.length > 0
            ? projMembers.map(pm => pm.member).filter(Boolean)
            : await db.query.members.findMany({
                where: eq(members.status, 'active')
            });

        // Filter out already assigned
        candidateMembers = candidateMembers.filter(m => m && !assignedIds.has(m.id));

        if (candidateMembers.length === 0) return [];

        const memberIds = candidateMembers.map(m => m!.id);

        // Fetch availability data
        let availabilities: any[] = [];
        if (targetDayOfWeek !== null) {
            availabilities = await db
                .select()
                .from(memberAvailability)
                .where(
                    and(
                        inArray(memberAvailability.memberId, memberIds),
                        eq(memberAvailability.dayOfWeek, targetDayOfWeek),
                        eq(memberAvailability.isAvailable, true)
                    )
                );
        }

        // Fetch exceptions for the specific date (if dueDate set)
        let exceptions: any[] = [];
        if (task.dueDate) {
            const dateStr = new Date(task.dueDate).toISOString().split('T')[0];
            exceptions = await db
                .select()
                .from(scheduleExceptions)
                .where(
                    and(
                        inArray(scheduleExceptions.memberId, memberIds),
                        eq(scheduleExceptions.date, dateStr)
                    )
                );
        }

        // Score each member
        const projectMemberIds = new Set(projMembers.map(pm => pm.memberId));

        const suggestions = candidateMembers.map(member => {
            if (!member) return null;
            let score = 50;
            const reasons: string[] = [];

            // Check day availability
            const hasAvailability = availabilities.some(a => a.memberId === member.id);
            if (hasAvailability) {
                score += 30;
                reasons.push('Disponível no dia');

                // Check shift match
                if (task.turno) {
                    const shiftMatch = availabilities.some(
                        a => a.memberId === member.id && a.shift === task.turno
                    );
                    if (shiftMatch) {
                        score += 20;
                        reasons.push(`Disponível no turno ${task.turno}`);
                    }
                }
            }

            // Check exceptions
            const unavailableException = exceptions.find(
                e => e.memberId === member.id && e.type === 'unavailable'
            );
            if (unavailableException) {
                score -= 100;
                reasons.push('Indisponível nesta data');
            }

            const availableException = exceptions.find(
                e => e.memberId === member.id && e.type === 'available'
            );
            if (availableException) {
                score += 50;
                reasons.push('Disponibilidade confirmada');
            }

            // Bonus for being in the project
            if (projectMemberIds.has(member.id)) {
                score += 15;
                reasons.push('Membro do projeto');
            }

            // Bonus for militancy level
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
        }).filter(Boolean) as { memberId: string; memberName: string; score: number; reasons: string[] }[];

        return suggestions
            .filter(s => s.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 20);
    } catch (error) {
        console.error('Error getting available members for task:', error);
        return [];
    }
}
