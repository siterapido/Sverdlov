"use server";

import { db } from "@/lib/db";
import { finances } from "@/lib/db/schema/finances";
import { members } from "@/lib/db/schema/members";
import { subscriptionPlans } from "@/lib/db/schema/plans";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getMemberFinancialHistory(memberId: string) {
    try {
        // Simple select for now, can be improved with relations later
        const result = await db
            .select({
                id: finances.id,
                amount: finances.amount,
                paymentDate: finances.paymentDate,
                type: finances.type,
                status: finances.status,
                referenceDate: finances.referenceDate,
                planName: subscriptionPlans.name,
                notes: finances.notes
            })
            .from(finances)
            .leftJoin(subscriptionPlans, eq(finances.planId, subscriptionPlans.id))
            .where(eq(finances.memberId, memberId))
            .orderBy(desc(finances.paymentDate));

        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching financial history:", error);
        return { success: false, error: "Erro ao carregar histórico" };
    }
}

export async function getAllFinances() {
    try {
        const result = await db
            .select({
                id: finances.id,
                amount: finances.amount,
                paymentDate: finances.paymentDate,
                type: finances.type,
                status: finances.status,
                memberName: members.fullName,
                planName: subscriptionPlans.name,
            })
            .from(finances)
            .leftJoin(members, eq(finances.memberId, members.id))
            .leftJoin(subscriptionPlans, eq(finances.planId, subscriptionPlans.id))
            .orderBy(desc(finances.paymentDate));

        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching all finances:", error);
        return { success: false, error: "Erro ao carregar finanças" };
    }
}

export async function registerPayment(data: typeof finances.$inferInsert) {
    try {
        await db.insert(finances).values(data);
        revalidatePath(`/members/${data.memberId}`);
        return { success: true };
    } catch (error) {
        console.error("Error registering payment:", error);
        return { success: false, error: "Erro ao registrar pagamento" };
    }
}

export async function updateMemberPlan(memberId: string, planId: string, startDate: string) {
    try {
        await db.update(members)
            .set({ 
                planId, 
                subscriptionStartDate: startDate,
                financialStatus: 'up_to_date' 
            })
            .where(eq(members.id, memberId));
        
        revalidatePath(`/members/${memberId}`);
        return { success: true };
    } catch (error) {
         console.error("Error updating member plan:", error);
         return { success: false, error: "Erro ao vincular plano" };
    }
}
