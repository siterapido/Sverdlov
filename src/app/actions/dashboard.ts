"use server";

import { db } from "@/lib/db";
import { members, finances, nuclei } from "@/lib/db/schema";
import { count, eq, gte, sql, desc, and } from "drizzle-orm";
import { startOfMonth, subMonths } from "date-fns";

export async function getDashboardStats() {
    try {
        const now = new Date();
        const firstDayOfMonth = startOfMonth(now);
        const firstDayOfLastMonth = startOfMonth(subMonths(now, 1));

        // 1. Total Members (Active)
        const [totalMembersCount] = await db
            .select({ value: count() })
            .from(members)
            .where(eq(members.status, 'active'));

        // 2. New Members This Month (Interest Date)
        const [newMembersThisMonth] = await db
            .select({ value: count() })
            .from(members)
            .where(gte(members.createdAt, firstDayOfMonth));

        // 2b. New Members Last Month (for trend)
        const [newMembersLastMonth] = await db
            .select({ value: count() })
            .from(members)
            .where(
                and(
                    gte(members.createdAt, firstDayOfLastMonth),
                    sql`${members.createdAt} < ${firstDayOfMonth}`
                )
            );

        // 3. Monthly Revenue
        const [revenueResult] = await db
            .select({ value: sql<number>`SUM(${finances.amount})` })
            .from(finances)
            .where(
                and(
                    eq(finances.status, 'completed'),
                    gte(finances.paymentDate, firstDayOfMonth)
                )
            );

        // 3b. Revenue Last Month (for trend)
        const [revenueLastMonthResult] = await db
            .select({ value: sql<number>`SUM(${finances.amount})` })
            .from(finances)
            .where(
                and(
                    eq(finances.status, 'completed'),
                    gte(finances.paymentDate, firstDayOfLastMonth),
                    sql`${finances.paymentDate} < ${firstDayOfMonth}`
                )
            );

        // 4. Active Nuclei
        const [activeNucleiCount] = await db
            .select({ value: count() })
            .from(nuclei)
            .where(eq(nuclei.status, 'active'));

        // 5. Recent Members
        const recentMembersList = await db.query.members.findMany({
            orderBy: [desc(members.createdAt)],
            limit: 5,
        });

        // Calculate trends
        const memberTrend = newMembersLastMonth?.value
            ? Math.round(((newMembersThisMonth.value - newMembersLastMonth.value) / newMembersLastMonth.value) * 100)
            : 0;

        const revThis = Number(revenueResult?.value || 0);
        const revLast = Number(revenueLastMonthResult?.value || 0);
        const revenueTrend = revLast
            ? Math.round(((revThis - revLast) / revLast) * 100)
            : 0;

        return {
            stats: {
                totalMembers: totalMembersCount.value,
                newLeadsThisMonth: newMembersThisMonth.value,
                memberTrend: { value: Math.abs(memberTrend), isPositive: memberTrend >= 0 },
                monthlyRevenue: revThis,
                revenueTrend: { value: Math.abs(revenueTrend), isPositive: revenueTrend >= 0 },
                activeNuclei: activeNucleiCount.value,
                conversionRate: 0, // Placeholder
            },
            recentMembers: recentMembersList.map(m => ({
                id: m.id,
                name: m.socialName || m.fullName,
                status: m.status,
                socialName: m.socialName,
                fullName: m.fullName
            })),
        };
    } catch (error) {
        console.error("Dashboard stats fetch error:", error);
        throw new Error("Falha ao carregar estatísticas do dashboard");
    }
}
