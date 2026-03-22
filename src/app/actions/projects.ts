"use server";

import { db } from "@/lib/db";
import { projects, projectTasks, projectMembers, projectNuclei, taskAssignees } from "@/lib/db/schema/projects";
import { eq, desc, and, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";

async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    return await verifyToken(token);
}

export async function getProjects() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        const allProjects = await db.query.projects.findMany({
            with: {
                primaryNucleus: true,
                nucleiLinks: {
                    with: {
                        nucleus: true
                    }
                },
                members: {
                    with: {
                        member: true
                    }
                },
                tasks: {
                    with: {
                        assignees: {
                            with: {
                                member: true
                            }
                        }
                    }
                },
            },
            orderBy: [desc(projects.createdAt)]
        });

        return { success: true, data: allProjects };
    } catch (error) {
        console.error("Error fetching projects:", error);
        return { success: false, error: "Falha ao buscar projetos" };
    }
}

export async function getProjectById(id: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        const project = await db.query.projects.findFirst({
            where: eq(projects.id, id),
            with: {
                primaryNucleus: true,
                nucleiLinks: {
                    with: {
                        nucleus: true
                    }
                },
                members: {
                    with: {
                        member: true,
                        assignedBy: true
                    }
                },
                tasks: {
                    with: {
                        assignees: {
                            with: {
                                member: true
                            }
                        }
                    },
                    orderBy: [asc(projectTasks.sortOrder)]
                },
            }
        });

        if (!project) return { success: false, error: "Projeto não encontrado" };

        return { success: true, data: project };
    } catch (error) {
        console.error("Error fetching project:", error);
        return { success: false, error: "Falha ao buscar projeto" };
    }
}

export async function createProject(data: any) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        const [newProject] = await db.insert(projects).values({
            name: data.name,
            description: data.description,
            nucleusId: data.nucleusId,
            type: data.type,
            objectives: data.objectives,
            startDate: data.startDate ? new Date(data.startDate) : null,
            endDate: data.endDate ? new Date(data.endDate) : null,
            goals: data.goals
        }).returning();

        revalidatePath('/projects');
        return { success: true, data: newProject };
    } catch (error) {
        console.error("Error creating project:", error);
        return { success: false, error: "Falha ao criar projeto" };
    }
}

export async function updateProject(id: string, data: any) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        await db.update(projects).set({
            ...data,
            startDate: data.startDate ? new Date(data.startDate) : undefined,
            endDate: data.endDate ? new Date(data.endDate) : undefined,
            updatedAt: new Date()
        }).where(eq(projects.id, id));

        revalidatePath('/projects');
        revalidatePath(`/projects/${id}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating project:", error);
        return { success: false, error: "Falha ao atualizar projeto" };
    }
}

// ==========================================
// PROJECT TASK ACTIONS
// ==========================================

export async function createProjectTask(data: {
    projectId: string;
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    category?: string;
    turno?: string;
    dayOfWeek?: number;
    frequency?: string;
    location?: string;
    color?: string;
    tags?: string[];
    startTime?: string;
    endTime?: string;
    dueDate?: string;
    assigneeIds?: string[];
}) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        const [task] = await db.insert(projectTasks).values({
            projectId: data.projectId,
            title: data.title,
            description: data.description,
            status: data.status as any,
            priority: data.priority as any,
            category: data.category as any,
            turno: data.turno as any,
            dayOfWeek: data.dayOfWeek,
            frequency: data.frequency as any,
            location: data.location,
            color: data.color,
            tags: data.tags || [],
            startTime: data.startTime,
            endTime: data.endTime,
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
        }).returning();

        // Create assignees if provided
        if (data.assigneeIds && data.assigneeIds.length > 0) {
            const assigneeValues = data.assigneeIds.map(memberId => ({
                taskId: task.id,
                memberId,
                assignedById: user.userId,
            }));
            await db.insert(taskAssignees).values(assigneeValues);
        }

        revalidatePath(`/projects/${data.projectId}`);
        revalidatePath('/tarefas');
        return { success: true, data: task };
    } catch (error) {
        console.error("Error creating project task:", error);
        return { success: false, error: "Falha ao criar tarefa" };
    }
}

export async function updateProjectTask(id: string, data: any) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        const updateData: any = {
            updatedAt: new Date()
        };

        // Only set fields that are provided
        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.priority !== undefined) updateData.priority = data.priority;
        if (data.category !== undefined) updateData.category = data.category;
        if (data.turno !== undefined) updateData.turno = data.turno;
        if (data.dayOfWeek !== undefined) updateData.dayOfWeek = data.dayOfWeek;
        if (data.frequency !== undefined) updateData.frequency = data.frequency;
        if (data.location !== undefined) updateData.location = data.location;
        if (data.color !== undefined) updateData.color = data.color;
        if (data.tags !== undefined) updateData.tags = data.tags;
        if (data.startTime !== undefined) updateData.startTime = data.startTime;
        if (data.endTime !== undefined) updateData.endTime = data.endTime;
        if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
        if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;

        const [task] = await db.update(projectTasks)
            .set(updateData)
            .where(eq(projectTasks.id, id))
            .returning();

        // Sync assignees if provided
        if (data.assigneeIds !== undefined) {
            // Get current assignees
            const currentAssignees = await db.query.taskAssignees.findMany({
                where: eq(taskAssignees.taskId, id)
            });
            const currentIds = new Set(currentAssignees.map(a => a.memberId));
            const newIds = new Set(data.assigneeIds as string[]);

            // Remove those no longer assigned
            const toRemove = currentAssignees.filter(a => !newIds.has(a.memberId));
            for (const a of toRemove) {
                await db.delete(taskAssignees).where(eq(taskAssignees.id, a.id));
            }

            // Add new ones
            const toAdd = (data.assigneeIds as string[]).filter(id => !currentIds.has(id));
            if (toAdd.length > 0) {
                await db.insert(taskAssignees).values(
                    toAdd.map(memberId => ({
                        taskId: id,
                        memberId,
                        assignedById: user.userId,
                    }))
                );
            }
        }

        if (task) {
            revalidatePath(`/projects/${task.projectId}`);
            revalidatePath('/tarefas');
        }
        return { success: true, data: task };
    } catch (error) {
        console.error("Error updating project task:", error);
        return { success: false, error: "Falha ao atualizar tarefa" };
    }
}

export async function updateTaskStatus(taskId: string, status: string, sortOrder?: number) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        const updateData: any = { status, updatedAt: new Date() };
        if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

        const [task] = await db.update(projectTasks)
            .set(updateData)
            .where(eq(projectTasks.id, taskId))
            .returning();

        if (task) {
            revalidatePath(`/projects/${task.projectId}`);
            revalidatePath('/tarefas');
        }
        return { success: true };
    } catch (error) {
        console.error("Error updating task status:", error);
        return { success: false, error: "Falha ao atualizar status" };
    }
}

export async function deleteProjectTask(id: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        const [task] = await db.delete(projectTasks)
            .where(eq(projectTasks.id, id))
            .returning();

        if (task) {
            revalidatePath(`/projects/${task.projectId}`);
            revalidatePath('/tarefas');
        }
        return { success: true };
    } catch (error) {
        console.error("Error deleting project task:", error);
        return { success: false, error: "Falha ao excluir tarefa" };
    }
}

export async function getProjectTasks(projectId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        const tasks = await db.query.projectTasks.findMany({
            where: eq(projectTasks.projectId, projectId),
            with: {
                assignees: {
                    with: {
                        member: true
                    }
                }
            },
            orderBy: [asc(projectTasks.sortOrder)]
        });

        return { success: true, data: tasks };
    } catch (error) {
        console.error("Error fetching project tasks:", error);
        return { success: false, error: "Falha ao buscar tarefas" };
    }
}

export async function getAllTasks() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        const tasks = await db.query.projectTasks.findMany({
            with: {
                project: true,
                assignees: {
                    with: {
                        member: true
                    }
                }
            },
            orderBy: [asc(projectTasks.sortOrder)]
        });

        return { success: true, data: tasks };
    } catch (error) {
        console.error("Error fetching all tasks:", error);
        return { success: false, error: "Falha ao buscar tarefas" };
    }
}

// ==========================================
// PROJECT MEMBERS ACTIONS
// ==========================================

export async function assignMemberToProject(
    projectId: string,
    memberId: string,
    role: 'coordinator' | 'member' | 'contributor' | 'observer' = 'member',
    notes?: string
) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        const existing = await db.query.projectMembers.findFirst({
            where: and(
                eq(projectMembers.projectId, projectId),
                eq(projectMembers.memberId, memberId)
            )
        });

        if (existing) {
            return { success: false, error: "Membro já está vinculado a este projeto" };
        }

        const [assignment] = await db.insert(projectMembers).values({
            projectId,
            memberId,
            role,
            assignedById: user.userId,
            notes
        }).returning();

        revalidatePath(`/projects/${projectId}`);
        revalidatePath(`/members/${memberId}`);
        return { success: true, data: assignment };
    } catch (error) {
        console.error("Error assigning member to project:", error);
        return { success: false, error: "Falha ao atribuir membro ao projeto" };
    }
}

export async function removeMemberFromProject(assignmentId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        const [assignment] = await db.delete(projectMembers)
            .where(eq(projectMembers.id, assignmentId))
            .returning();

        if (assignment) {
            revalidatePath(`/projects/${assignment.projectId}`);
            revalidatePath(`/members/${assignment.memberId}`);
        }
        return { success: true };
    } catch (error) {
        console.error("Error removing member from project:", error);
        return { success: false, error: "Falha ao remover membro do projeto" };
    }
}

export async function updateProjectMemberRole(
    assignmentId: string,
    role: 'coordinator' | 'member' | 'contributor' | 'observer'
) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        const [assignment] = await db.update(projectMembers)
            .set({ role, updatedAt: new Date() })
            .where(eq(projectMembers.id, assignmentId))
            .returning();

        if (assignment) {
            revalidatePath(`/projects/${assignment.projectId}`);
            revalidatePath(`/members/${assignment.memberId}`);
        }
        return { success: true };
    } catch (error) {
        console.error("Error updating project member role:", error);
        return { success: false, error: "Falha ao atualizar papel do membro" };
    }
}

export async function getProjectMembers(projectId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        const members = await db.query.projectMembers.findMany({
            where: eq(projectMembers.projectId, projectId),
            with: {
                member: true,
                assignedBy: true
            },
            orderBy: [desc(projectMembers.assignedAt)]
        });

        return { success: true, data: members };
    } catch (error) {
        console.error("Error fetching project members:", error);
        return { success: false, error: "Falha ao buscar membros do projeto" };
    }
}

export async function bulkAssignMembersToProject(
    projectId: string,
    memberIds: string[],
    role: 'coordinator' | 'member' | 'contributor' | 'observer' = 'member'
) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        const existing = await db.query.projectMembers.findMany({
            where: eq(projectMembers.projectId, projectId)
        });
        const existingMemberIds = new Set(existing.map(a => a.memberId));
        const newMemberIds = memberIds.filter(id => !existingMemberIds.has(id));

        if (newMemberIds.length === 0) {
            return { success: false, error: "Todos os membros já estão vinculados" };
        }

        const values = newMemberIds.map(memberId => ({
            projectId,
            memberId,
            role,
            assignedById: user.userId
        }));

        await db.insert(projectMembers).values(values);

        revalidatePath(`/projects/${projectId}`);
        memberIds.forEach(memberId => {
            revalidatePath(`/members/${memberId}`);
        });

        return { success: true, message: `${newMemberIds.length} membros atribuídos com sucesso` };
    } catch (error) {
        console.error("Error bulk assigning members:", error);
        return { success: false, error: "Falha ao atribuir membros em lote" };
    }
}

// ==========================================
// PROJECT NUCLEI ACTIONS
// ==========================================

export async function linkProjectToNucleus(
    projectId: string,
    nucleusId: string,
    isPrimary: boolean = false
) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        const existing = await db.query.projectNuclei.findFirst({
            where: and(
                eq(projectNuclei.projectId, projectId),
                eq(projectNuclei.nucleusId, nucleusId)
            )
        });

        if (existing) {
            return { success: false, error: "Núcleo já está vinculado a este projeto" };
        }

        if (isPrimary) {
            await db.update(projectNuclei)
                .set({ isPrimary: false })
                .where(eq(projectNuclei.projectId, projectId));
        }

        const [link] = await db.insert(projectNuclei).values({
            projectId,
            nucleusId,
            isPrimary
        }).returning();

        await db.update(projects)
            .set({ nucleusId: nucleusId, updatedAt: new Date() })
            .where(eq(projects.id, projectId));

        revalidatePath(`/projects/${projectId}`);
        return { success: true, data: link };
    } catch (error) {
        console.error("Error linking project to nucleus:", error);
        return { success: false, error: "Falha ao vincular projeto ao núcleo" };
    }
}

export async function unlinkProjectFromNucleus(linkId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        const [link] = await db.delete(projectNuclei)
            .where(eq(projectNuclei.id, linkId))
            .returning();

        if (link) revalidatePath(`/projects/${link.projectId}`);
        return { success: true };
    } catch (error) {
        console.error("Error unlinking project from nucleus:", error);
        return { success: false, error: "Falha ao desvincular projeto do núcleo" };
    }
}

export async function setPrimaryNucleus(projectId: string, nucleusId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        await db.update(projectNuclei)
            .set({ isPrimary: false })
            .where(eq(projectNuclei.projectId, projectId));

        await db.update(projectNuclei)
            .set({ isPrimary: true })
            .where(and(
                eq(projectNuclei.projectId, projectId),
                eq(projectNuclei.nucleusId, nucleusId)
            ));

        await db.update(projects)
            .set({ nucleusId: nucleusId, updatedAt: new Date() })
            .where(eq(projects.id, projectId));

        revalidatePath(`/projects/${projectId}`);
        return { success: true };
    } catch (error) {
        console.error("Error setting primary nucleus:", error);
        return { success: false, error: "Falha ao definir núcleo primário" };
    }
}

export async function getProjectNuclei(projectId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        const nucleiLinks = await db.query.projectNuclei.findMany({
            where: eq(projectNuclei.projectId, projectId),
            with: {
                nucleus: true
            },
            orderBy: [desc(projectNuclei.isPrimary)]
        });

        return { success: true, data: nucleiLinks };
    } catch (error) {
        console.error("Error fetching project nuclei:", error);
        return { success: false, error: "Falha ao buscar núcleos do projeto" };
    }
}

export async function bulkLinkNucleiToProject(
    projectId: string,
    nucleusIds: string[],
    primaryNucleusId?: string
) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        const existing = await db.query.projectNuclei.findMany({
            where: eq(projectNuclei.projectId, projectId)
        });
        const existingNucleusIds = new Set(existing.map(l => l.nucleusId));
        const newNucleusIds = nucleusIds.filter(id => !existingNucleusIds.has(id));

        if (newNucleusIds.length === 0) {
            return { success: false, error: "Todos os núcleos já estão vinculados" };
        }

        if (primaryNucleusId) {
            await db.update(projectNuclei)
                .set({ isPrimary: false })
                .where(eq(projectNuclei.projectId, projectId));
        }

        const values = newNucleusIds.map((nucleusId) => ({
            projectId,
            nucleusId,
            isPrimary: primaryNucleusId ? nucleusId === primaryNucleusId : false
        }));

        await db.insert(projectNuclei).values(values);

        if (primaryNucleusId) {
            await db.update(projects)
                .set({ nucleusId: primaryNucleusId, updatedAt: new Date() })
                .where(eq(projects.id, projectId));
        }

        revalidatePath(`/projects/${projectId}`);
        return { success: true, message: `${newNucleusIds.length} núcleos vinculados com sucesso` };
    } catch (error) {
        console.error("Error bulk linking nuclei to project:", error);
        return { success: false, error: "Falha ao vincular núcleos em lote" };
    }
}
