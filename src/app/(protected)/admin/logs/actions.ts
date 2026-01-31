'use server';

import { db } from '@/lib/db';
import { auditLogs, users, type AuditAction } from '@/lib/db/schema';
import { eq, and, desc, gte, lte, like, or, sql } from 'drizzle-orm';

export interface AuditLogWithUser {
    id: string;
    userId: string | null;
    action: AuditAction;
    tableName: string;
    recordId: string | null;
    oldValues: Record<string, unknown> | null;
    newValues: Record<string, unknown> | null;
    changedFields: Record<string, { old: unknown; new: unknown }> | null;
    ipAddress: string | null;
    userAgent: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
    user: {
        id: string;
        fullName: string;
        email: string;
    } | null;
}

export interface GetAuditLogsOptions {
    page?: number;
    pageSize?: number;
    action?: AuditAction;
    tableName?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
}

export async function getAuditLogs(options: GetAuditLogsOptions = {}): Promise<{
    logs: AuditLogWithUser[];
    total: number;
}> {
    const {
        page = 1,
        pageSize = 25,
        action,
        tableName,
        userId,
        startDate,
        endDate,
        search,
    } = options;

    const offset = (page - 1) * pageSize;

    // Build conditions
    const conditions = [];

    if (action) {
        conditions.push(eq(auditLogs.action, action));
    }

    if (tableName) {
        conditions.push(eq(auditLogs.tableName, tableName));
    }

    if (userId) {
        conditions.push(eq(auditLogs.userId, userId));
    }

    if (startDate) {
        conditions.push(gte(auditLogs.createdAt, startDate));
    }

    if (endDate) {
        // Add one day to include the entire end date
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        conditions.push(lte(auditLogs.createdAt, endOfDay));
    }

    if (search) {
        const searchTerm = `%${search}%`;
        conditions.push(
            or(
                like(auditLogs.tableName, searchTerm),
                like(auditLogs.recordId, searchTerm),
                like(auditLogs.ipAddress, searchTerm)
            )!
        );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Fetch logs with user data
    const logsResult = await db
        .select({
            id: auditLogs.id,
            userId: auditLogs.userId,
            action: auditLogs.action,
            tableName: auditLogs.tableName,
            recordId: auditLogs.recordId,
            oldValues: auditLogs.oldValues,
            newValues: auditLogs.newValues,
            changedFields: auditLogs.changedFields,
            ipAddress: auditLogs.ipAddress,
            userAgent: auditLogs.userAgent,
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
        .where(whereClause)
        .orderBy(desc(auditLogs.createdAt))
        .limit(pageSize)
        .offset(offset);

    // Get total count
    const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(auditLogs)
        .where(whereClause);

    const total = Number(countResult[0]?.count || 0);

    // Transform results
    const logs: AuditLogWithUser[] = logsResult.map(row => ({
        id: row.id,
        userId: row.userId,
        action: row.action as AuditAction,
        tableName: row.tableName,
        recordId: row.recordId,
        oldValues: row.oldValues as Record<string, unknown> | null,
        newValues: row.newValues as Record<string, unknown> | null,
        changedFields: row.changedFields as Record<string, { old: unknown; new: unknown }> | null,
        ipAddress: row.ipAddress,
        userAgent: row.userAgent,
        metadata: row.metadata as Record<string, unknown> | null,
        createdAt: row.createdAt,
        user: row.user?.id ? row.user : null,
    }));

    return { logs, total };
}

export async function getAuditLogById(id: string): Promise<AuditLogWithUser | null> {
    const result = await db
        .select({
            id: auditLogs.id,
            userId: auditLogs.userId,
            action: auditLogs.action,
            tableName: auditLogs.tableName,
            recordId: auditLogs.recordId,
            oldValues: auditLogs.oldValues,
            newValues: auditLogs.newValues,
            changedFields: auditLogs.changedFields,
            ipAddress: auditLogs.ipAddress,
            userAgent: auditLogs.userAgent,
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
        .where(eq(auditLogs.id, id))
        .limit(1);

    if (result.length === 0) return null;

    const row = result[0];
    return {
        id: row.id,
        userId: row.userId,
        action: row.action as AuditAction,
        tableName: row.tableName,
        recordId: row.recordId,
        oldValues: row.oldValues as Record<string, unknown> | null,
        newValues: row.newValues as Record<string, unknown> | null,
        changedFields: row.changedFields as Record<string, { old: unknown; new: unknown }> | null,
        ipAddress: row.ipAddress,
        userAgent: row.userAgent,
        metadata: row.metadata as Record<string, unknown> | null,
        createdAt: row.createdAt,
        user: row.user?.id ? row.user : null,
    };
}

export async function getAuditStats(): Promise<{
    totalLogs: number;
    todayLogs: number;
    actionBreakdown: Record<string, number>;
    tableBreakdown: Record<string, number>;
}> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total logs
    const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(auditLogs);

    // Today's logs
    const todayResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(auditLogs)
        .where(gte(auditLogs.createdAt, today));

    // Action breakdown
    const actionResult = await db
        .select({
            action: auditLogs.action,
            count: sql<number>`count(*)`,
        })
        .from(auditLogs)
        .groupBy(auditLogs.action);

    // Table breakdown
    const tableResult = await db
        .select({
            tableName: auditLogs.tableName,
            count: sql<number>`count(*)`,
        })
        .from(auditLogs)
        .groupBy(auditLogs.tableName);

    const actionBreakdown: Record<string, number> = {};
    actionResult.forEach(row => {
        actionBreakdown[row.action] = Number(row.count);
    });

    const tableBreakdown: Record<string, number> = {};
    tableResult.forEach(row => {
        tableBreakdown[row.tableName] = Number(row.count);
    });

    return {
        totalLogs: Number(totalResult[0]?.count || 0),
        todayLogs: Number(todayResult[0]?.count || 0),
        actionBreakdown,
        tableBreakdown,
    };
}
