"use server";

import { db } from "@/lib/db";
import { projects, projectTasks, projectMembers, projectNuclei } from "@/lib/db/schema/projects";
import { et_projetos } from "@/lib/db/schema/escola";
import { eq, desc, and, not } from "drizzle-orm";
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
                tasks: true,
                workSchools: true
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
                tasks: true,
                workSchools: {
                    with: {
                        tarefas: true
                    }
                }
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

export async function createWorkSchool(projectId: string, name: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        await db.insert(et_projetos).values({
            nome: name,
            projectId: projectId,
            cor: '#3b82f6'
        });

        revalidatePath(`/projects/${projectId}`);
        return { success: true };
    } catch (error) {
        console.error("Error creating work school:", error);
        return { success: false, error: "Falha ao criar escola de trabalho" };
    }
}

export async function updateWorkSchool(id: string, name: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        const [school] = await db.update(et_projetos)
            .set({ nome: name, updatedAt: new Date() })
            .where(eq(et_projetos.id, id))
            .returning();

        revalidatePath(`/projects/${school.projectId}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating work school:", error);
        return { success: false, error: "Falha ao atualizar escola" };
    }
}

export async function deleteWorkSchool(id: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        const [school] = await db.delete(et_projetos)
            .where(eq(et_projetos.id, id))
            .returning();

        if (school) revalidatePath(`/projects/${school.projectId}`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting work school:", error);
        return { success: false, error: "Falha ao excluir escola" };
    }
}

export async function createProjectTask(data: any) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        await db.insert(projectTasks).values({
            projectId: data.projectId,
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
        });

        revalidatePath(`/projects/${data.projectId}`);
        return { success: true };
    } catch (error) {
        console.error("Error creating project task:", error);
        return { success: false, error: "Falha ao criar tarefa" };
    }
}

export async function updateProjectTask(id: string, data: any) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        const [task] = await db.update(projectTasks)
            .set({
                ...data,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
                updatedAt: new Date()
            })
            .where(eq(projectTasks.id, id))
            .returning();

        if (task) revalidatePath(`/projects/${task.projectId}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating project task:", error);
        return { success: false, error: "Falha ao atualizar tarefa" };
    }
}

export async function deleteProjectTask(id: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        const [task] = await db.delete(projectTasks)
            .where(eq(projectTasks.id, id))
            .returning();

        if (task) revalidatePath(`/projects/${task.projectId}`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting project task:", error);
        return { success: false, error: "Falha ao excluir tarefa" };
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

        // Check for duplicate assignment
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

        // Get existing assignments to avoid duplicates
        const existing = await db.query.projectMembers.findMany({
            where: eq(projectMembers.projectId, projectId)
        });
        const existingMemberIds = new Set(existing.map(a => a.memberId));

        // Filter out already assigned members
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

        // Check for duplicate link
        const existing = await db.query.projectNuclei.findFirst({
            where: and(
                eq(projectNuclei.projectId, projectId),
                eq(projectNuclei.nucleusId, nucleusId)
            )
        });

        if (existing) {
            return { success: false, error: "Núcleo já está vinculado a este projeto" };
        }

        // If setting as primary, unset other primary links first
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

        // Also update projects.nucleusId for backward compatibility
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

        // Unset all previous primary links
        await db.update(projectNuclei)
            .set({ isPrimary: false })
            .where(eq(projectNuclei.projectId, projectId));

        // Set the new primary
        const [link] = await db.update(projectNuclei)
            .set({ isPrimary: true })
            .where(and(
                eq(projectNuclei.projectId, projectId),
                eq(projectNuclei.nucleusId, nucleusId)
            ))
            .returning();

        // Update projects.nucleusId for backward compatibility
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

        // Get existing links
        const existing = await db.query.projectNuclei.findMany({
            where: eq(projectNuclei.projectId, projectId)
        });
        const existingNucleusIds = new Set(existing.map(l => l.nucleusId));

        // Filter new nucleus IDs
        const newNucleusIds = nucleusIds.filter(id => !existingNucleusIds.has(id));

        if (newNucleusIds.length === 0) {
            return { success: false, error: "Todos os núcleos já estão vinculados" };
        }

        // Unset existing primary if needed
        if (primaryNucleusId) {
            await db.update(projectNuclei)
                .set({ isPrimary: false })
                .where(eq(projectNuclei.projectId, projectId));
        }

        // Insert new links
        const values = newNucleusIds.map((nucleusId, index) => ({
            projectId,
            nucleusId,
            isPrimary: primaryNucleusId ? nucleusId === primaryNucleusId : index === 0
        }));

        await db.insert(projectNuclei).values(values);

        // Update primary nucleus in projects table
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
