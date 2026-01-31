'use server';

import { db } from '@/lib/db';
import { notifications, type NewNotification, type NotificationType } from '@/lib/db/schema';
import { eq, and, desc, isNull, or, gte } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface GetNotificationsOptions {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
    type?: NotificationType;
}

export interface NotificationWithMeta {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    actionUrl: string | null;
    actionLabel: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
    readAt: Date | null;
}

/**
 * Get notifications for a user
 */
export async function getNotifications(
    userId: string,
    options: GetNotificationsOptions = {}
): Promise<{ notifications: NotificationWithMeta[]; unreadCount: number }> {
    const { unreadOnly = false, limit = 20, offset = 0, type } = options;

    const conditions = [eq(notifications.userId, userId)];

    // Filter by read status
    if (unreadOnly) {
        conditions.push(eq(notifications.read, false));
    }

    // Filter by type
    if (type) {
        conditions.push(eq(notifications.type, type));
    }

    // Exclude expired notifications
    conditions.push(
        or(
            isNull(notifications.expiresAt),
            gte(notifications.expiresAt, new Date())
        )!
    );

    const results = await db
        .select()
        .from(notifications)
        .where(and(...conditions))
        .orderBy(desc(notifications.createdAt))
        .limit(limit)
        .offset(offset);

    // Get unread count
    const unreadResults = await db
        .select()
        .from(notifications)
        .where(
            and(
                eq(notifications.userId, userId),
                eq(notifications.read, false),
                or(
                    isNull(notifications.expiresAt),
                    gte(notifications.expiresAt, new Date())
                )!
            )
        );

    return {
        notifications: results as NotificationWithMeta[],
        unreadCount: unreadResults.length,
    };
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
    await db
        .update(notifications)
        .set({ read: true, readAt: new Date() })
        .where(eq(notifications.id, notificationId));

    revalidatePath('/notifications');
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string): Promise<void> {
    await db
        .update(notifications)
        .set({ read: true, readAt: new Date() })
        .where(
            and(
                eq(notifications.userId, userId),
                eq(notifications.read, false)
            )
        );

    revalidatePath('/notifications');
}

/**
 * Create a new notification
 */
export async function createNotification(data: {
    userId: string;
    type?: NotificationType;
    title: string;
    message: string;
    actionUrl?: string;
    actionLabel?: string;
    metadata?: Record<string, unknown>;
    expiresAt?: Date;
}): Promise<string> {
    const notification: NewNotification = {
        userId: data.userId,
        type: data.type || 'info',
        title: data.title,
        message: data.message,
        actionUrl: data.actionUrl,
        actionLabel: data.actionLabel,
        metadata: data.metadata,
        expiresAt: data.expiresAt,
    };

    const [result] = await db
        .insert(notifications)
        .values(notification)
        .returning({ id: notifications.id });

    revalidatePath('/notifications');

    return result.id;
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
    await db
        .delete(notifications)
        .where(eq(notifications.id, notificationId));

    revalidatePath('/notifications');
}

/**
 * Delete all read notifications for a user
 */
export async function deleteReadNotifications(userId: string): Promise<void> {
    await db
        .delete(notifications)
        .where(
            and(
                eq(notifications.userId, userId),
                eq(notifications.read, true)
            )
        );

    revalidatePath('/notifications');
}

/**
 * Get unread count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
    const results = await db
        .select()
        .from(notifications)
        .where(
            and(
                eq(notifications.userId, userId),
                eq(notifications.read, false),
                or(
                    isNull(notifications.expiresAt),
                    gte(notifications.expiresAt, new Date())
                )!
            )
        );

    return results.length;
}

// === NOTIFICATION HELPERS ===

/**
 * Send a success notification
 */
export async function notifySuccess(
    userId: string,
    title: string,
    message: string,
    options?: { actionUrl?: string; actionLabel?: string; metadata?: Record<string, unknown> }
): Promise<string> {
    return createNotification({
        userId,
        type: 'success',
        title,
        message,
        ...options,
    });
}

/**
 * Send an error notification
 */
export async function notifyError(
    userId: string,
    title: string,
    message: string,
    options?: { actionUrl?: string; actionLabel?: string; metadata?: Record<string, unknown> }
): Promise<string> {
    return createNotification({
        userId,
        type: 'error',
        title,
        message,
        ...options,
    });
}

/**
 * Send a warning notification
 */
export async function notifyWarning(
    userId: string,
    title: string,
    message: string,
    options?: { actionUrl?: string; actionLabel?: string; metadata?: Record<string, unknown> }
): Promise<string> {
    return createNotification({
        userId,
        type: 'warning',
        title,
        message,
        ...options,
    });
}

/**
 * Send a task notification
 */
export async function notifyTask(
    userId: string,
    title: string,
    message: string,
    options?: { actionUrl?: string; actionLabel?: string; metadata?: Record<string, unknown> }
): Promise<string> {
    return createNotification({
        userId,
        type: 'task',
        title,
        message,
        ...options,
    });
}

/**
 * Send a schedule notification
 */
export async function notifySchedule(
    userId: string,
    title: string,
    message: string,
    options?: { actionUrl?: string; actionLabel?: string; metadata?: Record<string, unknown> }
): Promise<string> {
    return createNotification({
        userId,
        type: 'schedule',
        title,
        message,
        ...options,
    });
}

/**
 * Send a finance notification
 */
export async function notifyFinance(
    userId: string,
    title: string,
    message: string,
    options?: { actionUrl?: string; actionLabel?: string; metadata?: Record<string, unknown> }
): Promise<string> {
    return createNotification({
        userId,
        type: 'finance',
        title,
        message,
        ...options,
    });
}

/**
 * Send notifications to multiple users
 */
export async function notifyMultiple(
    userIds: string[],
    data: {
        type?: NotificationType;
        title: string;
        message: string;
        actionUrl?: string;
        actionLabel?: string;
        metadata?: Record<string, unknown>;
    }
): Promise<void> {
    const notificationData = userIds.map(userId => ({
        userId,
        type: data.type || 'info' as NotificationType,
        title: data.title,
        message: data.message,
        actionUrl: data.actionUrl,
        actionLabel: data.actionLabel,
        metadata: data.metadata,
    }));

    await db.insert(notifications).values(notificationData);

    revalidatePath('/notifications');
}
