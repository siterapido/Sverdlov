import { pgTable, text, timestamp, uuid, decimal } from 'drizzle-orm/pg-core';

export const nuclei = pgTable('nuclei', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    type: text('type', { enum: ['territorial', 'thematic'] }).notNull().default('territorial'),
    state: text('state').notNull(),
    city: text('city').notNull(),
    zone: text('zone'), // Optional, for zonal coordinators
    status: text('status', { enum: ['dispersed', 'pre_nucleus', 'in_formation', 'active', 'consolidated'] }).notNull().default('in_formation'),
    coordinatorId: uuid('coordinator_id'), // Links to users or members
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
