import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { nuclei } from './nuclei';

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    fullName: text('full_name').notNull(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    role: text('role', {
        enum: ['ADMIN', 'STATE_COORD', 'CITY_COORD', 'ZONE_COORD', 'LOCAL_COORD']
    }).notNull().default('LOCAL_COORD'),

    // Jurisdiction Scopes
    scopeState: text('scope_state'), // UF
    scopeCity: text('scope_city'),
    scopeZone: text('scope_zone'),
    scopeNucleusId: uuid('scope_nucleus_id').references(() => nuclei.id),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
