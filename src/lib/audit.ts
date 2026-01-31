import { db } from './db';
import { auditLogs, type AuditAction, type NewAuditLog } from './db/schema';
import { headers } from 'next/headers';

export interface AuditOptions {
    userId?: string;
    action: AuditAction;
    tableName: string;
    recordId?: string;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}

/**
 * Creates an audit log entry
 */
export async function createAuditLog(options: AuditOptions): Promise<void> {
    try {
        const headersList = await headers();
        const ipAddress = headersList.get('x-forwarded-for') ||
            headersList.get('x-real-ip') ||
            'unknown';
        const userAgent = headersList.get('user-agent') || 'unknown';

        // Calculate changed fields if both old and new values exist
        const changedFields = options.oldValues && options.newValues
            ? getChangedFields(options.oldValues, options.newValues)
            : null;

        const logEntry: NewAuditLog = {
            userId: options.userId,
            action: options.action,
            tableName: options.tableName,
            recordId: options.recordId,
            oldValues: options.oldValues,
            newValues: options.newValues,
            changedFields,
            ipAddress,
            userAgent,
            metadata: options.metadata,
        };

        await db.insert(auditLogs).values(logEntry);
    } catch (error) {
        // Don't throw - audit logging should not break main operations
        console.error('Failed to create audit log:', error);
    }
}

/**
 * Compares two objects and returns the changed fields
 */
export function getChangedFields(
    oldObj: Record<string, unknown>,
    newObj: Record<string, unknown>
): Record<string, { old: unknown; new: unknown }> | null {
    const changes: Record<string, { old: unknown; new: unknown }> = {};

    const allKeys = new Set([
        ...Object.keys(oldObj || {}),
        ...Object.keys(newObj || {}),
    ]);

    for (const key of allKeys) {
        // Skip internal fields
        if (key === 'updatedAt' || key === 'createdAt') continue;

        const oldValue = oldObj?.[key];
        const newValue = newObj?.[key];

        // Deep comparison using JSON stringify
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            changes[key] = { old: oldValue, new: newValue };
        }
    }

    return Object.keys(changes).length > 0 ? changes : null;
}

/**
 * Audit helper for CREATE operations
 */
export async function auditCreate(
    userId: string | undefined,
    tableName: string,
    recordId: string,
    newValues: Record<string, unknown>,
    metadata?: Record<string, unknown>
): Promise<void> {
    await createAuditLog({
        userId,
        action: 'CREATE',
        tableName,
        recordId,
        newValues,
        metadata,
    });
}

/**
 * Audit helper for UPDATE operations
 */
export async function auditUpdate(
    userId: string | undefined,
    tableName: string,
    recordId: string,
    oldValues: Record<string, unknown>,
    newValues: Record<string, unknown>,
    metadata?: Record<string, unknown>
): Promise<void> {
    await createAuditLog({
        userId,
        action: 'UPDATE',
        tableName,
        recordId,
        oldValues,
        newValues,
        metadata,
    });
}

/**
 * Audit helper for DELETE operations
 */
export async function auditDelete(
    userId: string | undefined,
    tableName: string,
    recordId: string,
    oldValues: Record<string, unknown>,
    metadata?: Record<string, unknown>
): Promise<void> {
    await createAuditLog({
        userId,
        action: 'DELETE',
        tableName,
        recordId,
        oldValues,
        metadata,
    });
}

/**
 * Audit helper for LOGIN operations
 */
export async function auditLogin(
    userId: string,
    metadata?: Record<string, unknown>
): Promise<void> {
    await createAuditLog({
        userId,
        action: 'LOGIN',
        tableName: 'users',
        recordId: userId,
        metadata,
    });
}

/**
 * Audit helper for LOGOUT operations
 */
export async function auditLogout(
    userId: string,
    metadata?: Record<string, unknown>
): Promise<void> {
    await createAuditLog({
        userId,
        action: 'LOGOUT',
        tableName: 'users',
        recordId: userId,
        metadata,
    });
}

/**
 * Audit helper for EXPORT operations
 */
export async function auditExport(
    userId: string | undefined,
    tableName: string,
    metadata?: Record<string, unknown>
): Promise<void> {
    await createAuditLog({
        userId,
        action: 'EXPORT',
        tableName,
        metadata,
    });
}

/**
 * Audit helper for IMPORT operations
 */
export async function auditImport(
    userId: string | undefined,
    tableName: string,
    metadata?: Record<string, unknown>
): Promise<void> {
    await createAuditLog({
        userId,
        action: 'IMPORT',
        tableName,
        metadata,
    });
}
