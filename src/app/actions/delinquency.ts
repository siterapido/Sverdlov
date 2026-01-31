"use server";

import { db } from "@/lib/db";
import { members, finances } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auditUpdate } from "@/lib/audit";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { revalidatePath } from "next/cache";

async function getCurrentUserId(): Promise<string | undefined> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (token) {
            const user = await verifyToken(token);
            return user?.userId;
        }
    } catch {
        return undefined;
    }
    return undefined;
}

export async function markDelinquencyReminder(
    memberId: string,
    reminderType: 'email' | 'sms' | 'whatsapp'
) {
    try {
        const oldMember = await db.query.members.findFirst({
            where: eq(members.id, memberId)
        });

        const updateData: any = {
            delinquencyReminderSent: new Date(),
            delinquencyReminderType: reminderType,
            updatedAt: new Date(),
        };

        const [updatedMember] = await db.update(members)
            .set(updateData)
            .where(eq(members.id, memberId))
            .returning();

        const userId = await getCurrentUserId();
        await auditUpdate(
            userId,
            'members',
            memberId,
            oldMember as Record<string, unknown>,
            updatedMember as Record<string, unknown>,
            { action: 'delinquency_reminder', reminderType }
        );

        revalidatePath("/finances/delinquency");
        return { success: true };
    } catch (error) {
        console.error("Error marking reminder:", error);
        return { success: false, error: "Erro ao registrar aviso" };
    }
}

export async function registerPartialPayment(
    memberId: string,
    amount: number,
    paymentMethod: string = 'cash'
) {
    try {
        const [newPayment] = await db.insert(finances)
            .values({
                memberId,
                amount: amount.toString(),
                paymentDate: new Date(),
                paymentMethod,
                status: 'completed',
                type: 'subscription',
            })
            .returning();

        const userId = await getCurrentUserId();
        await auditUpdate(
            userId,
            'members',
            memberId,
            {},
            { paymentId: newPayment.id } as Record<string, unknown>,
            { action: 'partial_payment_registered', amount }
        );

        revalidatePath("/finances/delinquency");
        return { success: true, paymentId: newPayment.id };
    } catch (error) {
        console.error("Error registering payment:", error);
        return { success: false, error: "Erro ao registrar pagamento" };
    }
}

export async function updateFinancialStatus(
    memberId: string,
    status: 'up_to_date' | 'at_risk' | 'delinquent' | 'negotiating'
) {
    try {
        const oldMember = await db.query.members.findFirst({
            where: eq(members.id, memberId)
        });

        // Map business logic statuses to database schema values
        const dbStatus = status === 'up_to_date' ? 'up_to_date' : 'late';

        const [updatedMember] = await db.update(members)
            .set({
                financialStatus: dbStatus,
                updatedAt: new Date(),
            })
            .where(eq(members.id, memberId))
            .returning();

        const userId = await getCurrentUserId();
        await auditUpdate(
            userId,
            'members',
            memberId,
            oldMember as Record<string, unknown>,
            updatedMember as Record<string, unknown>,
            { action: 'financial_status_update', status }
        );

        revalidatePath("/finances/delinquency");
        return { success: true };
    } catch (error) {
        console.error("Error updating financial status:", error);
        return { success: false, error: "Erro ao atualizar status financeiro" };
    }
}
