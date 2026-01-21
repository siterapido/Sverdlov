import { pgTable, text, uuid, decimal, boolean, timestamp } from 'drizzle-orm/pg-core';

export const subscriptionPlans = pgTable('subscription_plans', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    frequency: text('frequency', { enum: ['monthly', 'biweekly', 'bimonthly', 'semiannual', 'annual'] }).notNull().default('monthly'),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    description: text('description'),
    active: boolean('active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
