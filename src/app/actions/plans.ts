"use server";

import { db } from "@/lib/db";
import { subscriptionPlans } from "@/lib/db/schema/plans";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getPlans() {
    try {
        const result = await db.select().from(subscriptionPlans).orderBy(desc(subscriptionPlans.createdAt));
        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching plans:", error);
        return { success: false, error: "Falha ao carregar planos" };
    }
}

export async function createPlan(data: typeof subscriptionPlans.$inferInsert) {
    try {
        await db.insert(subscriptionPlans).values(data);
        revalidatePath("/admin/finance/plans");
        return { success: true };
    } catch (error) {
        console.error("Error creating plan:", error);
        return { success: false, error: "Erro ao criar plano" };
    }
}

export async function updatePlan(id: string, data: Partial<typeof subscriptionPlans.$inferInsert>) {
    try {
        await db.update(subscriptionPlans).set(data).where(eq(subscriptionPlans.id, id));
        revalidatePath("/admin/finance/plans");
        return { success: true };
    } catch (error) {
        console.error("Error updating plan:", error);
        return { success: false, error: "Erro ao atualizar plano" };
    }
}

export async function togglePlanStatus(id: string, active: boolean) {
    try {
        await db.update(subscriptionPlans).set({ active }).where(eq(subscriptionPlans.id, id));
        revalidatePath("/admin/finance/plans");
        return { success: true };
    } catch (error) {
        console.error("Error toggling plan status:", error);
        return { success: false, error: "Erro ao alterar status do plano" };
    }
}
