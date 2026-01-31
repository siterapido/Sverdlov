"use server";

import { db } from "@/lib/db";
import { finances } from "@/lib/db/schema/finances";
import { members } from "@/lib/db/schema/members";
import { subscriptionPlans } from "@/lib/db/schema/plans";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auditCreate, auditUpdate } from "@/lib/audit";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";

async function getCurrentUserId(): Promise<string | undefined> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (token) {
            const user = await verifyToken(token);
            return user?.id;
        }
    } catch {
        return undefined;
    }
    return undefined;
}

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
        const [newPayment] = await db.insert(finances).values(data).returning();

        // Audit log
        const userId = await getCurrentUserId();
        await auditCreate(userId, 'finances', newPayment.id, newPayment as Record<string, unknown>);

        revalidatePath(`/members/${data.memberId}`);
        return { success: true };
    } catch (error) {
        console.error("Error registering payment:", error);
        return { success: false, error: "Erro ao registrar pagamento" };
    }
}

export async function updateMemberPlan(memberId: string, planId: string, startDate: string) {
    try {
        // Get old values for audit
        const oldMember = await db.query.members.findFirst({ where: eq(members.id, memberId) });

        const [updatedMember] = await db.update(members)
            .set({
                planId,
                subscriptionStartDate: startDate,
                financialStatus: 'up_to_date'
            })
            .where(eq(members.id, memberId))
            .returning();

        // Audit log
        const userId = await getCurrentUserId();
        await auditUpdate(
            userId,
            'members',
            memberId,
            oldMember as Record<string, unknown>,
            updatedMember as Record<string, unknown>,
            { action: 'plan_update', planId }
        );

        revalidatePath(`/members/${memberId}`);
        return { success: true };
    } catch (error) {
         console.error("Error updating member plan:", error);
         return { success: false, error: "Erro ao vincular plano" };
    }
}
