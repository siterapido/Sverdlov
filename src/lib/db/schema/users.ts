import { pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';
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

    // User Profile & Preferences
    profilePhoto: text('profile_photo'),
    theme: text('theme', {
        enum: ['light', 'dark', 'system']
    }).notNull().default('system'),
    language: text('language', {
        enum: ['pt', 'es', 'en']
    }).notNull().default('pt'),
    notificationsEnabled: boolean('notifications_enabled').notNull().default(true),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
