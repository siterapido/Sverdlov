"use server";

import { db } from "@/lib/db";
import { taskAssignees, projectTasks } from "@/lib/db/schema/projects";
import { projectMembers } from "@/lib/db/schema/projects";
import { members } from "@/lib/db/schema/members";
import { eq, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";

async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    return await verifyToken(token);
}

export async function assignMemberToTask(
    taskId: string,
    memberId: string,
    role: 'assignee' | 'leader' | 'reviewer' | 'backup' = 'assignee'
) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        const existing = await db.query.taskAssignees.findFirst({
            where: and(
                eq(taskAssignees.taskId, taskId),
                eq(taskAssignees.memberId, memberId)
            )
        });

        if (existing) {
            return { success: false, error: "Membro já está escalado para esta tarefa" };
        }

        const [assignment] = await db.insert(taskAssignees).values({
            taskId,
            memberId,
            role,
            assignedById: user.userId,
        }).returning();

        const task = await db.query.projectTasks.findFirst({
            where: eq(projectTasks.id, taskId)
        });
        if (task) {
            revalidatePath(`/projects/${task.projectId}`);
            revalidatePath('/tarefas');
        }

        return { success: true, data: assignment };
    } catch (error) {
        console.error("Error assigning member to task:", error);
        return { success: false, error: "Falha ao escalar membro" };
    }
}

export async function assignMultipleMembersToTask(
    taskId: string,
    memberIds: string[],
    role: 'assignee' | 'leader' | 'reviewer' | 'backup' = 'assignee'
) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        // Get existing assignees to avoid duplicates
        const existing = await db.query.taskAssignees.findMany({
            where: eq(taskAssignees.taskId, taskId)
        });
        const existingIds = new Set(existing.map(a => a.memberId));
        const newIds = memberIds.filter(id => !existingIds.has(id));

        if (newIds.length === 0) {
            return { success: false, error: "Todos os membros já estão escalados" };
        }

        const values = newIds.map(memberId => ({
            taskId,
            memberId,
            role,
            assignedById: user.userId,
        }));

        await db.insert(taskAssignees).values(values);

        const task = await db.query.projectTasks.findFirst({
            where: eq(projectTasks.id, taskId)
        });
        if (task) {
            revalidatePath(`/projects/${task.projectId}`);
            revalidatePath('/tarefas');
        }

        return { success: true, message: `${newIds.length} membros escalados` };
    } catch (error) {
        console.error("Error bulk assigning members to task:", error);
        return { success: false, error: "Falha ao escalar membros em massa" };
    }
}

export async function assignByNucleus(
    taskId: string,
    nucleusId: string,
    role: 'assignee' | 'leader' | 'reviewer' | 'backup' = 'assignee'
) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        // Get active members of this nucleus
        const nucleusMembers = await db.query.members.findMany({
            where: and(
                eq(members.nucleusId, nucleusId),
                eq(members.status, 'active')
            )
        });

        if (nucleusMembers.length === 0) {
            return { success: false, error: "Nenhum membro ativo neste núcleo" };
        }

        const memberIds = nucleusMembers.map(m => m.id);
        return await assignMultipleMembersToTask(taskId, memberIds, role);
    } catch (error) {
        console.error("Error assigning nucleus to task:", error);
        return { success: false, error: "Falha ao escalar núcleo" };
    }
}

export async function removeTaskAssignment(assignmentId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        const [assignment] = await db.delete(taskAssignees)
            .where(eq(taskAssignees.id, assignmentId))
            .returning();

        if (assignment) {
            const task = await db.query.projectTasks.findFirst({
                where: eq(projectTasks.id, assignment.taskId)
            });
            if (task) {
                revalidatePath(`/projects/${task.projectId}`);
                revalidatePath('/tarefas');
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Error removing task assignment:", error);
        return { success: false, error: "Falha ao remover escalamento" };
    }
}

export async function confirmPresence(assignmentId: string) {
    try {
        const [assignment] = await db.update(taskAssignees)
            .set({ status: 'confirmed', updatedAt: new Date() })
            .where(eq(taskAssignees.id, assignmentId))
            .returning();

        if (assignment) {
            const task = await db.query.projectTasks.findFirst({
                where: eq(projectTasks.id, assignment.taskId)
            });
            if (task) {
                revalidatePath(`/projects/${task.projectId}`);
                revalidatePath('/tarefas');
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Error confirming presence:", error);
        return { success: false, error: "Falha ao confirmar presença" };
    }
}

export async function declinePresence(assignmentId: string, reason?: string) {
    try {
        const [assignment] = await db.update(taskAssignees)
            .set({
                status: 'declined',
                notes: reason || null,
                updatedAt: new Date()
            })
            .where(eq(taskAssignees.id, assignmentId))
            .returning();

        if (assignment) {
            const task = await db.query.projectTasks.findFirst({
                where: eq(projectTasks.id, assignment.taskId)
            });
            if (task) {
                revalidatePath(`/projects/${task.projectId}`);
                revalidatePath('/tarefas');
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Error declining presence:", error);
        return { success: false, error: "Falha ao recusar presença" };
    }
}

export async function checkInAssignment(assignmentId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        const [assignment] = await db.update(taskAssignees)
            .set({
                status: 'attended',
                checkInTime: new Date(),
                updatedAt: new Date()
            })
            .where(eq(taskAssignees.id, assignmentId))
            .returning();

        if (assignment) {
            const task = await db.query.projectTasks.findFirst({
                where: eq(projectTasks.id, assignment.taskId)
            });
            if (task) {
                revalidatePath(`/projects/${task.projectId}`);
                revalidatePath('/tarefas');
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Error checking in:", error);
        return { success: false, error: "Falha ao registrar presença" };
    }
}

export async function checkOutAssignment(assignmentId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        const [assignment] = await db.update(taskAssignees)
            .set({
                checkOutTime: new Date(),
                updatedAt: new Date()
            })
            .where(eq(taskAssignees.id, assignmentId))
            .returning();

        if (assignment) {
            const task = await db.query.projectTasks.findFirst({
                where: eq(projectTasks.id, assignment.taskId)
            });
            if (task) {
                revalidatePath(`/projects/${task.projectId}`);
                revalidatePath('/tarefas');
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Error checking out:", error);
        return { success: false, error: "Falha ao registrar saída" };
    }
}

export async function markAbsent(assignmentId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        const [assignment] = await db.update(taskAssignees)
            .set({ status: 'absent', updatedAt: new Date() })
            .where(eq(taskAssignees.id, assignmentId))
            .returning();

        if (assignment) {
            const task = await db.query.projectTasks.findFirst({
                where: eq(projectTasks.id, assignment.taskId)
            });
            if (task) {
                revalidatePath(`/projects/${task.projectId}`);
                revalidatePath('/tarefas');
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Error marking absent:", error);
        return { success: false, error: "Falha ao marcar falta" };
    }
}

export async function getTaskAssignees(taskId: string) {
    try {
        const assignees = await db.query.taskAssignees.findMany({
            where: eq(taskAssignees.taskId, taskId),
            with: {
                member: true,
                assignedBy: true
            }
        });

        return { success: true, data: assignees };
    } catch (error) {
        console.error("Error fetching task assignees:", error);
        return { success: false, error: "Falha ao buscar escalados" };
    }
}

export async function getMemberTasks(memberId: string) {
    try {
        const assignments = await db.query.taskAssignees.findMany({
            where: eq(taskAssignees.memberId, memberId),
            with: {
                task: {
                    with: {
                        project: true,
                        assignees: {
                            with: {
                                member: true
                            }
                        }
                    }
                }
            }
        });

        return { success: true, data: assignments };
    } catch (error) {
        console.error("Error fetching member tasks:", error);
        return { success: false, error: "Falha ao buscar tarefas do membro" };
    }
}
