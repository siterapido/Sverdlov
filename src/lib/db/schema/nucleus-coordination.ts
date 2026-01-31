import { pgTable, text, date, boolean, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { nuclei } from './nuclei';
import { members } from './members';
import { relations } from 'drizzle-orm';

export const nucleusCoordination = pgTable('nucleus_coordination', {
    id: uuid('id').defaultRandom().primaryKey(),
    nucleusId: uuid('nucleus_id').references(() => nuclei.id, { onDelete: 'cascade' }).notNull(),
    memberId: uuid('member_id').references(() => members.id, { onDelete: 'cascade' }).notNull(),
    role: text('role', {
        enum: ['coordinator', 'vice_coordinator', 'secretary']
    }).notNull(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date'),
    active: boolean('active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    nucleusIdIdx: index('nucleus_coordination_nucleus_id_idx').on(table.nucleusId),
    memberIdIdx: index('nucleus_coordination_member_id_idx').on(table.memberId),
    activeIdx: index('nucleus_coordination_active_idx').on(table.active),
}));

// Relations
export const nucleusCoordinationRelations = relations(nucleusCoordination, ({ one }) => ({
    nucleus: one(nuclei, {
        fields: [nucleusCoordination.nucleusId],
        references: [nuclei.id],
    }),
    member: one(members, {
        fields: [nucleusCoordination.memberId],
        references: [members.id],
    }),
}));

// Types
export type NucleusCoordination = typeof nucleusCoordination.$inferSelect;
export type NewNucleusCoordination = typeof nucleusCoordination.$inferInsert;
export type CoordinationRole = 'coordinator' | 'vice_coordinator' | 'secretary';
