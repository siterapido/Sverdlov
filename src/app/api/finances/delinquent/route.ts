import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { members, finances } from '@/lib/db/schema';
import { eq, sql, desc, and, gte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const daysOverdue = parseInt(searchParams.get('daysOverdue') || '30');
        const limit = parseInt(searchParams.get('limit') || '100');

        const delinquent = await db
            .select({
                memberId: members.id,
                fullName: members.fullName,
                email: members.email,
                phone: members.phone,
                state: members.state,
                city: members.city,
                lastPaymentDate: sql<Date>`COALESCE(MAX(${finances.paymentDate}), NULL)`,
                daysOverdue: sql<number>`CEIL(EXTRACT(DAY FROM (NOW() - COALESCE(MAX(${finances.paymentDate}), NOW()))))`,
                totalOwed: sql<string>`COALESCE(SUM(CASE WHEN ${finances.status} = 'pending' THEN ${finances.amount} ELSE 0 END), '0')`,
                totalContributed: sql<string>`COALESCE(SUM(CASE WHEN ${finances.status} = 'completed' THEN ${finances.amount} ELSE 0 END), '0')`,
                financialStatus: members.financialStatus,
                status: members.status,
            })
            .from(members)
            .leftJoin(finances, eq(members.id, finances.memberId))
            .where(eq(members.status, 'active'))
            .groupBy(members.id)
            .having(
                sql<boolean>`COALESCE(MAX(${finances.paymentDate}), NOW()) < NOW() - INTERVAL '${daysOverdue} days'`
            )
            .orderBy(desc(sql`CEIL(EXTRACT(DAY FROM (NOW() - COALESCE(MAX(${finances.paymentDate}), NOW()))))`))
            .limit(limit);

        const summary = await db
            .select({
                totalDelinquent: sql<number>`COUNT(DISTINCT ${members.id})`,
                totalOwed: sql<string>`COALESCE(SUM(CASE WHEN ${finances.status} = 'pending' THEN ${finances.amount} ELSE 0 END), '0')`,
            })
            .from(members)
            .leftJoin(finances, eq(members.id, finances.memberId))
            .where(
                and(
                    eq(members.status, 'active'),
                    sql<boolean>`COALESCE(MAX(${finances.paymentDate}), NOW()) < NOW() - INTERVAL '${daysOverdue} days'`
                )
            );

        return NextResponse.json({
            summary: {
                totalDelinquent: summary[0]?.totalDelinquent || 0,
                totalOwed: parseFloat(summary[0]?.totalOwed || '0'),
            },
            delinquent: delinquent.map(d => ({
                ...d,
                daysOverdue: Math.max(0, d.daysOverdue || 0),
                totalOwed: parseFloat(d.totalOwed),
                totalContributed: parseFloat(d.totalContributed),
            })),
        });
    } catch (error) {
        console.error('Error fetching delinquent members:', error);
        return NextResponse.json(
            { error: 'Failed to fetch delinquent members' },
            { status: 500 }
        );
    }
}
