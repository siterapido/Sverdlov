import { pgTable, text, timestamp, uuid, integer, boolean, index } from 'drizzle-orm/pg-core';
import { nuclei } from './nuclei';
import { users } from './users';
import { members } from './members';
import { relations } from 'drizzle-orm';

export const events = pgTable('events', {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    type: text('type', {
        enum: ['meeting', 'training', 'assembly', 'action', 'other']
    }).notNull(),
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date'),
    location: text('location'),
    maxParticipants: integer('max_participants'),
    nucleusId: uuid('nucleus_id').references(() => nuclei.id, { onDelete: 'set null' }),
    territoryScope: text('territory_scope'),
    createdById: uuid('created_by_id').references(() => users.id, { onDelete: 'set null' }),
    status: text('status', {
        enum: ['draft', 'published', 'cancelled', 'completed']
    }).default('draft'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    nucleusIdIdx: index('events_nucleus_id_idx').on(table.nucleusId),
    statusIdx: index('events_status_idx').on(table.status),
    startDateIdx: index('events_start_date_idx').on(table.startDate),
}));

export const eventRegistrations = pgTable('event_registrations', {
    id: uuid('id').defaultRandom().primaryKey(),
    eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
    memberId: uuid('member_id').references(() => members.id, { onDelete: 'cascade' }).notNull(),
    status: text('status', {
        enum: ['registered', 'confirmed', 'attended', 'absent']
    }).default('registered'),
    registeredAt: timestamp('registered_at').defaultNow().notNull(),
    confirmedAt: timestamp('confirmed_at'),
    attendedAt: timestamp('attended_at'),
}, (table) => ({
    eventIdIdx: index('event_registrations_event_id_idx').on(table.eventId),
    memberIdIdx: index('event_registrations_member_id_idx').on(table.memberId),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
    nucleus: one(nuclei, {
        fields: [events.nucleusId],
        references: [nuclei.id],
    }),
    createdBy: one(users, {
        fields: [events.createdById],
        references: [users.id],
    }),
    registrations: many(eventRegistrations),
}));

export const eventRegistrationsRelations = relations(eventRegistrations, ({ one }) => ({
    event: one(events, {
        fields: [eventRegistrations.eventId],
        references: [events.id],
    }),
    member: one(members, {
        fields: [eventRegistrations.memberId],
        references: [members.id],
    }),
}));

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type NewEventRegistration = typeof eventRegistrations.$inferInsert;
