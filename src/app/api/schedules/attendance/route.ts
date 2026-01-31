import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { slotAssignments, members, scheduleSlots, schedules } from '@/lib/db/schema';
import { eq, sql, desc, and, gte, lt } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const reportType = searchParams.get('type') || 'summary';
        const memberId = searchParams.get('memberId');
        const scheduleId = searchParams.get('scheduleId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        let dateFilter = undefined;
        if (startDate && endDate) {
            dateFilter = and(
                gte(scheduleSlots.date, startDate),
                lt(scheduleSlots.date, endDate)
            );
        }

        switch (reportType) {
            case 'by-member': {
                const result = await db
                    .select({
                        memberId: members.id,
                        fullName: members.fullName,
                        email: members.email,
                        attended: sql<number>`COUNT(CASE WHEN ${slotAssignments.status} = 'attended' THEN 1 END)`,
                        absent: sql<number>`COUNT(CASE WHEN ${slotAssignments.status} = 'absent' THEN 1 END)`,
                        excused: sql<number>`COUNT(CASE WHEN ${slotAssignments.status} = 'excused' THEN 1 END)`,
                        pending: sql<number>`COUNT(CASE WHEN ${slotAssignments.status} = 'pending' THEN 1 END)`,
                        total: sql<number>`COUNT(*)`,
                    })
                    .from(slotAssignments)
                    .leftJoin(members, eq(slotAssignments.memberId, members.id))
                    .leftJoin(scheduleSlots, eq(slotAssignments.slotId, scheduleSlots.id))
                    .where(dateFilter)
                    .groupBy(members.id, members.fullName, members.email)
                    .orderBy(desc(sql`COUNT(CASE WHEN ${slotAssignments.status} = 'attended' THEN 1 END)`));

                return NextResponse.json({
                    reportType: 'by-member',
                    data: result.map(r => ({
                        ...r,
                        attendanceRate: r.total > 0 ? ((r.attended / r.total) * 100).toFixed(1) : '0',
                    })),
                });
            }

            case 'by-schedule': {
                const result = await db
                    .select({
                        scheduleId: schedules.id,
                        scheduleName: schedules.name,
                        attended: sql<number>`COUNT(CASE WHEN ${slotAssignments.status} = 'attended' THEN 1 END)`,
                        absent: sql<number>`COUNT(CASE WHEN ${slotAssignments.status} = 'absent' THEN 1 END)`,
                        excused: sql<number>`COUNT(CASE WHEN ${slotAssignments.status} = 'excused' THEN 1 END)`,
                        pending: sql<number>`COUNT(CASE WHEN ${slotAssignments.status} = 'pending' THEN 1 END)`,
                        total: sql<number>`COUNT(*)`,
                    })
                    .from(slotAssignments)
                    .leftJoin(scheduleSlots, eq(slotAssignments.slotId, scheduleSlots.id))
                    .leftJoin(schedules, eq(scheduleSlots.scheduleId, schedules.id))
                    .where(dateFilter)
                    .groupBy(schedules.id, schedules.name)
                    .orderBy(desc(sql`COUNT(*)`));

                return NextResponse.json({
                    reportType: 'by-schedule',
                    data: result.map(r => ({
                        ...r,
                        attendanceRate: r.total > 0 ? ((r.attended / r.total) * 100).toFixed(1) : '0',
                    })),
                });
            }

            case 'member-detail': {
                if (!memberId) {
                    return NextResponse.json(
                        { error: 'memberId required' },
                        { status: 400 }
                    );
                }

                const details = await db
                    .select({
                        id: slotAssignments.id,
                        slotId: slotAssignments.slotId,
                        slotName: scheduleSlots.name,
                        scheduleName: schedules.name,
                        date: scheduleSlots.date,
                        startTime: scheduleSlots.startTime,
                        endTime: scheduleSlots.endTime,
                        status: slotAssignments.status,
                        checkInTime: slotAssignments.checkInTime,
                        checkOutTime: slotAssignments.checkOutTime,
                        notes: slotAssignments.notes,
                    })
                    .from(slotAssignments)
                    .leftJoin(scheduleSlots, eq(slotAssignments.slotId, scheduleSlots.id))
                    .leftJoin(schedules, eq(scheduleSlots.scheduleId, schedules.id))
                    .where(
                        and(
                            eq(slotAssignments.memberId, memberId),
                            dateFilter
                        )
                    )
                    .orderBy(desc(scheduleSlots.date));

                return NextResponse.json({
                    reportType: 'member-detail',
                    data: details,
                });
            }

            default: {
                // Summary report
                const summary = await db
                    .select({
                        totalAssignments: sql<number>`COUNT(*)`,
                        totalAttended: sql<number>`COUNT(CASE WHEN ${slotAssignments.status} = 'attended' THEN 1 END)`,
                        totalAbsent: sql<number>`COUNT(CASE WHEN ${slotAssignments.status} = 'absent' THEN 1 END)`,
                        totalExcused: sql<number>`COUNT(CASE WHEN ${slotAssignments.status} = 'excused' THEN 1 END)`,
                        totalPending: sql<number>`COUNT(CASE WHEN ${slotAssignments.status} = 'pending' THEN 1 END)`,
                    })
                    .from(slotAssignments)
                    .leftJoin(scheduleSlots, eq(slotAssignments.slotId, scheduleSlots.id))
                    .where(dateFilter);

                const record = summary[0];

                return NextResponse.json({
                    reportType: 'summary',
                    summary: {
                        ...record,
                        attendanceRate: record?.totalAssignments > 0
                            ? ((record.totalAttended / record.totalAssignments) * 100).toFixed(1)
                            : '0',
                    },
                });
            }
        }
    } catch (error) {
        console.error('Error generating attendance report:', error);
        return NextResponse.json(
            { error: 'Failed to generate report' },
            { status: 500 }
        );
    }
}
