import { pgTable, text, timestamp, uuid, date, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { subscriptionPlans } from './plans';
import { nuclei } from './nuclei';

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
    nucleusId: uuid('nucleus_id').references(() => nuclei.id),

    // Political
    affiliationDate: date('affiliation_date'),
    requestDate: timestamp('request_date').defaultNow().notNull(),
    approvalDate: timestamp('approval_date'),
    status: text('status', { enum: ['interested', 'in_formation', 'active', 'inactive'] }).notNull().default('interested'),
    militancyLevel: text('militancy_level', { enum: ['supporter', 'militant', 'leader'] }).notNull().default('supporter'),
    politicalResponsibleId: uuid('political_responsible_id').references(() => users.id),
    notes: text('notes'),

    // Financial
    suggestedContribution: decimal('suggested_contribution', { precision: 10, scale: 2 }),
    financialStatus: text('financial_status', { enum: ['up_to_date', 'late', 'exempt'] }).notNull().default('up_to_date'),
    planId: uuid('plan_id').references(() => subscriptionPlans.id),
    subscriptionStartDate: date('subscription_start_date'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const membersRelations = relations(members, ({ one }) => ({
    nucleus: one(nuclei, {
        fields: [members.nucleusId],
        references: [nuclei.id],
    }),
    politicalResponsible: one(users, {
        fields: [members.politicalResponsibleId],
        references: [users.id],
    }),
    plan: one(subscriptionPlans, {
        fields: [members.planId],
        references: [subscriptionPlans.id],
    }),
}));
