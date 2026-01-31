import { pgTable, text, timestamp, uuid, boolean, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { relations } from 'drizzle-orm';

export const notifications = pgTable('notifications', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    type: text('type', {
        enum: ['info', 'success', 'warning', 'error', 'task', 'schedule', 'finance', 'member', 'system']
    }).notNull().default('info'),
    title: text('title').notNull(),
    message: text('message').notNull(),
    read: boolean('read').default(false).notNull(),
    actionUrl: text('action_url'), // Link to related action/page
    actionLabel: text('action_label'), // Custom button text
    metadata: jsonb('metadata'), // Extra data (e.g., related entity IDs)
    expiresAt: timestamp('expires_at'), // Auto-delete expired notifications
    createdAt: timestamp('created_at').defaultNow().notNull(),
    readAt: timestamp('read_at'),
}, (table) => ({
    userIdIdx: index('notifications_user_id_idx').on(table.userId),
    readIdx: index('notifications_read_idx').on(table.read),
    typeIdx: index('notifications_type_idx').on(table.type),
    createdAtIdx: index('notifications_created_at_idx').on(table.createdAt),
}));

// Relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
    user: one(users, {
        fields: [notifications.userId],
        references: [users.id],
    }),
}));

// Types
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'task' | 'schedule' | 'finance' | 'member' | 'system';
