import { pgTable, text, timestamp, uuid, decimal, date } from 'drizzle-orm/pg-core';
import { members } from './members';
import { subscriptionPlans } from './plans';

export const finances = pgTable('finances', {
    id: uuid('id').defaultRandom().primaryKey(),
    memberId: uuid('member_id').references(() => members.id).notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    paymentDate: timestamp('payment_date').defaultNow().notNull(),
    paymentMethod: text('payment_method').notNull().default('pix'),
    transactionId: text('transaction_id'),
    status: text('status', { enum: ['pending', 'completed', 'failed', 'refunded'] }).notNull().default('completed'),
    type: text('type', { enum: ['subscription', 'extra', 'donation'] }).notNull().default('subscription'),
    referenceDate: date('reference_date'),
    planId: uuid('plan_id').references(() => subscriptionPlans.id),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
