import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { finances, members, subscriptionPlans } from '@/lib/db/schema';
import { eq, sql, gte, lt, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const reportType = searchParams.get('type') || 'summary';
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const planId = searchParams.get('planId');

        let dateFilter = undefined;
        if (startDate && endDate) {
            dateFilter = and(
                gte(finances.paymentDate, new Date(startDate)),
                lt(finances.paymentDate, new Date(endDate))
            );
        }

        switch (reportType) {
            case 'by-plan': {
                const result = await db
                    .select({
                        planId: finances.planId,
                        planName: subscriptionPlans.name,
                        totalAmount: sql<string>`COALESCE(SUM(${finances.amount}), '0')`,
                        completedCount: sql<number>`COUNT(CASE WHEN ${finances.status} = 'completed' THEN 1 END)`,
                        pendingCount: sql<number>`COUNT(CASE WHEN ${finances.status} = 'pending' THEN 1 END)`,
                        failedCount: sql<number>`COUNT(CASE WHEN ${finances.status} = 'failed' THEN 1 END)`,
                    })
                    .from(finances)
                    .leftJoin(subscriptionPlans, eq(finances.planId, subscriptionPlans.id))
                    .where(dateFilter)
                    .groupBy(finances.planId, subscriptionPlans.id, subscriptionPlans.name);

                return NextResponse.json({
                    reportType: 'by-plan',
                    data: result.map(r => ({
                        ...r,
                        totalAmount: parseFloat(r.totalAmount),
                    })),
                });
            }

            case 'by-type': {
                const result = await db
                    .select({
                        type: finances.type,
                        totalAmount: sql<string>`COALESCE(SUM(${finances.amount}), '0')`,
                        count: sql<number>`COUNT(*)`,
                        avgAmount: sql<string>`COALESCE(AVG(${finances.amount}), '0')`,
                    })
                    .from(finances)
                    .where(and(dateFilter, eq(finances.status, 'completed')))
                    .groupBy(finances.type);

                return NextResponse.json({
                    reportType: 'by-type',
                    data: result.map(r => ({
                        ...r,
                        totalAmount: parseFloat(r.totalAmount),
                        avgAmount: parseFloat(r.avgAmount),
                    })),
                });
            }

            case 'top-members': {
                const result = await db
                    .select({
                        memberId: finances.memberId,
                        memberName: members.fullName,
                        memberEmail: members.email,
                        totalContributed: sql<string>`COALESCE(SUM(${finances.amount}), '0')`,
                        paymentCount: sql<number>`COUNT(*)`,
                        lastPayment: sql<Date>`MAX(${finances.paymentDate})`,
                    })
                    .from(finances)
                    .leftJoin(members, eq(finances.memberId, members.id))
                    .where(and(dateFilter, eq(finances.status, 'completed')))
                    .groupBy(finances.memberId, members.id, members.fullName, members.email)
                    .orderBy(desc(sql`SUM(${finances.amount})`))
                    .limit(20);

                return NextResponse.json({
                    reportType: 'top-members',
                    data: result.map(r => ({
                        ...r,
                        totalContributed: parseFloat(r.totalContributed),
                    })),
                });
            }

            case 'daily-summary': {
                const result = await db
                    .select({
                        date: sql<string>`DATE(${finances.paymentDate})`,
                        totalAmount: sql<string>`COALESCE(SUM(${finances.amount}), '0')`,
                        transactionCount: sql<number>`COUNT(*)`,
                        completedCount: sql<number>`COUNT(CASE WHEN ${finances.status} = 'completed' THEN 1 END)`,
                    })
                    .from(finances)
                    .where(dateFilter)
                    .groupBy(sql`DATE(${finances.paymentDate})`)
                    .orderBy(desc(sql`DATE(${finances.paymentDate})`))
                    .limit(31);

                return NextResponse.json({
                    reportType: 'daily-summary',
                    data: result.map(r => ({
                        ...r,
                        totalAmount: parseFloat(r.totalAmount),
                    })),
                });
            }

            default: {
                // Summary report
                const totalStats = await db
                    .select({
                        total: sql<string>`COALESCE(SUM(${finances.amount}), '0')`,
                        count: sql<number>`COUNT(*)`,
                    })
                    .from(finances)
                    .where(and(dateFilter, eq(finances.status, 'completed')));

                const methodStats = await db
                    .select({
                        method: finances.paymentMethod,
                        amount: sql<string>`COALESCE(SUM(${finances.amount}), '0')`,
                        count: sql<number>`COUNT(*)`,
                    })
                    .from(finances)
                    .where(and(dateFilter, eq(finances.status, 'completed')))
                    .groupBy(finances.paymentMethod);

                return NextResponse.json({
                    reportType: 'summary',
                    total: parseFloat(totalStats[0]?.total || '0'),
                    transactionCount: totalStats[0]?.count || 0,
                    byMethod: methodStats.map(m => ({
                        ...m,
                        amount: parseFloat(m.amount),
                    })),
                });
            }
        }
    } catch (error) {
        console.error('Error generating report:', error);
        return NextResponse.json(
            { error: 'Failed to generate report' },
            { status: 500 }
        );
    }
}
