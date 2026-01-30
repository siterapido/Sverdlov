"use server";

import { db } from "@/lib/db";
import { availabilityRequests, memberAvailability, scheduleExceptions } from "@/lib/db/schema/schedules";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { randomBytes } from "crypto";

async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    return await verifyToken(token);
}

export async function createAvailabilityRequest(memberId: string, period: '7_days' | '15_days' | '30_days') {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        // Generate a secure random token
        const token = randomBytes(32).toString('hex');

        // Calculate expiration (e.g., 7 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const [request] = await db.insert(availabilityRequests).values({
            memberId,
            token,
            period,
            expiresAt,
            status: 'pending'
        }).returning();

        revalidatePath('/escalas');
        return { success: true, token: request.token, id: request.id };
    } catch (error) {
        console.error("Error creating availability request:", error);
        return { success: false, error: "Falha ao criar solicitação" };
    }
}

export async function getAvailabilityRequest(token: string) {
    try {
        const request = await db.query.availabilityRequests.findFirst({
            where: eq(availabilityRequests.token, token),
            with: {
                member: true
            }
        });

        if (!request) return { success: false, error: "Solicitação não encontrada" };
        if (request.status !== 'pending') return { success: false, error: "Solicitação já utilizada ou expirada" };
        if (new Date() > request.expiresAt) return { success: false, error: "Solicitação expirada" };

        return { success: true, data: request };
    } catch (error) {
        console.error("Error getting request:", error);
        return { success: false, error: "Erro ao buscar solicitação" };
    }
}

export async function submitAvailability(token: string, availabilityData: any[]) {
    try {
        const request = await db.query.availabilityRequests.findFirst({
            where: eq(availabilityRequests.token, token),
        });

        if (!request || request.status !== 'pending') {
            return { success: false, error: "Solicitação inválida" };
        }

        // 1. Save Availability (assuming scheduleExceptions or memberAvailability update)
        // Here we assume availabilityData is a list of specific dates/times available or unavailable
        // depending on how the frontend form works.
        // For simplicity, let's assume valid availabilities for the period.

        // Wait, typical availability is weekly pattern OR specific dates.
        // Prompt says "availability for next 7, 15 or 30 days". This implies specific date exceptions or confirmations.
        // We will store as 'scheduleExceptions' type 'available' for specific dates, or 'unavailable'.

        await db.transaction(async (tx) => {
            for (const item of availabilityData) {
                // Remove existing for same day
                await tx.delete(scheduleExceptions)
                    .where(and(
                        eq(scheduleExceptions.memberId, request.memberId),
                        eq(scheduleExceptions.date, item.date)
                    ));

                await tx.insert(scheduleExceptions).values({
                    memberId: request.memberId,
                    date: item.date, // string 'YYYY-MM-DD'
                    type: item.type, // 'available', 'unavailable'
                    startTime: item.startTime || null,
                    endTime: item.endTime || null,
                    reason: 'Preenchimento via link',
                });
            }

            // Update request status
            await tx.update(availabilityRequests)
                .set({ status: 'completed', completedAt: new Date() })
                .where(eq(availabilityRequests.id, request.id));
        });

        return { success: true };
    } catch (error) {
        console.error("Error submitting availability:", error);
        return { success: false, error: "Falha ao salvar disponibilidade" };
    }
}

export async function submitAvailabilityDirect(memberId: string, availabilityData: any[]) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Não autorizado" };

        await db.transaction(async (tx) => {
            for (const item of availabilityData) {
                // Remove existing for same day
                await tx.delete(scheduleExceptions)
                    .where(and(
                        eq(scheduleExceptions.memberId, memberId),
                        eq(scheduleExceptions.date, item.date)
                    ));

                await tx.insert(scheduleExceptions).values({
                    memberId: memberId,
                    date: item.date,
                    type: item.type,
                    startTime: item.startTime || null,
                    endTime: item.endTime || null,
                    reason: 'Cadastro direto pelo administrador',
                });
            }
        });

        revalidatePath('/escalas');
        return { success: true };
    } catch (error) {
        console.error("Error submitting availability direct:", error);
        return { success: false, error: "Falha ao salvar disponibilidade" };
    }
}
