import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const cities = pgTable('cities', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    state: text('state').notNull(), // UF code (e.g., 'SP', 'RJ')
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
