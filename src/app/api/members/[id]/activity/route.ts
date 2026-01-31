import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auditLogs, users } from '@/lib/db/schema';
import { eq, desc, or, and } from 'drizzle-orm';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: memberId } = await params;

        // Get audit logs related to this member
        const logs = await db
            .select({
                id: auditLogs.id,
                action: auditLogs.action,
                tableName: auditLogs.tableName,
                recordId: auditLogs.recordId,
                changedFields: auditLogs.changedFields,
                metadata: auditLogs.metadata,
                createdAt: auditLogs.createdAt,
                user: {
                    id: users.id,
                    fullName: users.fullName,
                    email: users.email,
                },
            })
            .from(auditLogs)
            .leftJoin(users, eq(auditLogs.userId, users.id))
            .where(
                and(
                    eq(auditLogs.tableName, 'members'),
                    eq(auditLogs.recordId, memberId)
                )
            )
            .orderBy(desc(auditLogs.createdAt))
            .limit(50);

        const activities = logs.map(log => ({
            id: log.id,
            action: log.action,
            tableName: log.tableName,
            changedFields: log.changedFields as Record<string, { old: unknown; new: unknown }> | null,
            metadata: log.metadata as Record<string, unknown> | null,
            createdAt: log.createdAt,
            user: log.user?.id ? log.user : null,
        }));

        return NextResponse.json({ activities });
    } catch (error) {
        console.error('Error fetching member activity:', error);
        return NextResponse.json(
            { error: 'Failed to fetch activity' },
            { status: 500 }
        );
    }
}
