import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { finances, members } from '@/lib/db/schema';
import { eq, sql, gte, lt, and, desc } from 'drizzle-orm';

export async function GET() {
    try {
        const now = new Date();
        const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), 1);

        // Total collected this month
        const monthlyCollected = await db
            .select({
                total: sql<string>`COALESCE(SUM(${finances.amount}), '0')`,
                count: sql<number>`COUNT(*)`,
            })
            .from(finances)
            .where(
                and(
                    gte(finances.paymentDate, currentMonth),
                    eq(finances.status, 'completed')
                )
            );

        // Total pending (unpaid)
        const pendingPayments = await db
            .select({
                total: sql<string>`COALESCE(SUM(${finances.amount}), '0')`,
            })
            .from(finances)
            .where(eq(finances.status, 'pending'));

        // Active members count
        const activeMembers = await db
            .select({
                count: sql<number>`COUNT(*)`,
            })
            .from(members)
            .where(eq(members.status, 'active'));

        // Delinquent members (pending payments, last payment > 30 days ago)
        const delinquentMembers = await db
            .select({
                id: members.id,
                fullName: members.fullName,
                email: members.email,
                phone: members.phone,
                lastPaymentDate: sql<Date>`MAX(${finances.paymentDate})`,
                daysOverdue: sql<number>`CEIL(EXTRACT(DAY FROM (NOW() - MAX(${finances.paymentDate}))))`,
            })
            .from(members)
            .leftJoin(finances, eq(members.id, finances.memberId))
            .where(eq(members.status, 'active'))
            .groupBy(members.id)
            .having(
                sql<boolean>`MAX(${finances.paymentDate}) < NOW() - INTERVAL '30 days'`
            )
            .orderBy(desc(sql`CEIL(EXTRACT(DAY FROM (NOW() - MAX(${finances.paymentDate}))))`));

        // Monthly collection trend (last 12 months)
        const monthlyTrend = await db
            .select({
                month: sql<string>`TO_CHAR(${finances.paymentDate}, 'YYYY-MM')`,
                amount: sql<string>`COALESCE(SUM(${finances.amount}), '0')`,
                count: sql<number>`COUNT(*)`,
            })
            .from(finances)
            .where(
                and(
                    gte(finances.paymentDate, lastYear),
                    eq(finances.status, 'completed')
                )
            )
            .groupBy(sql`TO_CHAR(${finances.paymentDate}, 'YYYY-MM')`)
            .orderBy(sql`TO_CHAR(${finances.paymentDate}, 'YYYY-MM')`);

        // Average contribution (all completed payments)
        const avgContribution = await db
            .select({
                average: sql<string>`COALESCE(AVG(${finances.amount}), '0')`,
                median: sql<string>`PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ${finances.amount})`,
            })
            .from(finances)
            .where(eq(finances.status, 'completed'));

        return NextResponse.json({
            kpis: {
                monthlyCollected: parseFloat(monthlyCollected[0]?.total || '0'),
                monthlyCount: monthlyCollected[0]?.count || 0,
                pendingAmount: parseFloat(pendingPayments[0]?.total || '0'),
                activeMembers: activeMembers[0]?.count || 0,
                delinquentCount: delinquentMembers.length,
                delinquencyRate: activeMembers[0]?.count
                    ? ((delinquentMembers.length / (activeMembers[0]?.count || 1)) * 100).toFixed(1)
                    : '0',
                avgContribution: parseFloat(avgContribution[0]?.average || '0'),
                medianContribution: parseFloat(avgContribution[0]?.median || '0'),
            },
            trends: monthlyTrend.map(item => ({
                month: item.month,
                amount: parseFloat(item.amount),
                count: item.count,
            })),
            delinquent: delinquentMembers.slice(0, 10),
        });
    } catch (error) {
        console.error('Error fetching finance dashboard:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
}
