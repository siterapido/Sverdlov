"use server";

import { db } from "@/lib/db";
import { projects, projectTasks } from "@/lib/db/schema/projects";
import { et_projetos } from "@/lib/db/schema/escola";
import { eq, desc } from "drizzle-orm";
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
                nucleus: true,
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
                nucleus: true,
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
