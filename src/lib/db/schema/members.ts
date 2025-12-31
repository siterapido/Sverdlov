import { pgTable, text, timestamp, uuid, date, decimal } from 'drizzle-orm/pg-core';
import { users } from './users';

export const members = pgTable('members', {
    id: uuid('id').defaultRandom().primaryKey(),
    fullName: text('full_name').notNull(),
    socialName: text('social_name'),
    cpf: text('cpf').notNull().unique(),
    voterTitle: text('voter_title').unique(),
    dateOfBirth: date('date_of_birth').notNull(),
    gender: text('gender'),
    phone: text('phone').notNull(),
    email: text('email').notNull(),

    // Territorial
    state: text('state').notNull(),
    city: text('city').notNull(),
    zone: text('zone'),
    neighborhood: text('neighborhood').notNull(),
    nucleusId: uuid('nucleus_id'), // Will link to nuclei table

    // Political
    requestDate: timestamp('request_date').defaultNow().notNull(),
    approvalDate: timestamp('approval_date'),
    status: text('status', { enum: ['interested', 'in_formation', 'active', 'inactive'] }).notNull().default('interested'),
    militancyLevel: text('militancy_level', { enum: ['supporter', 'militant', 'leader'] }).notNull().default('supporter'),
    politicalResponsibleId: uuid('political_responsible_id').references(() => users.id),
    notes: text('notes'),

    // Financial
    suggestedContribution: decimal('suggested_contribution', { precision: 10, scale: 2 }),
    financialStatus: text('financial_status', { enum: ['up_to_date', 'late', 'exempt'] }).notNull().default('up_to_date'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
