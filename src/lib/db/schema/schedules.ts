import { pgTable, text, timestamp, uuid, boolean, jsonb, date, time, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { nuclei } from './nuclei';
import { members } from './members';

// ==========================================
// ESCALAS PRINCIPAIS
// ==========================================

export const schedules = pgTable('schedules', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    
    // Tipo e Categoria
    type: text('type', { 
        enum: ['weekly', 'monthly', 'event', 'permanent'] 
    }).notNull().default('weekly'),
    category: text('category', {
        enum: ['vigilancia', 'formacao', 'agitacao', 'administrativa', 'financeira', 'outras']
    }).notNull().default('outras'),
    
    // Período
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date'),
    
    // Recorrência
    isRecurring: boolean('is_recurring').default(false),
    // Pattern: { frequency: 'weekly' | 'daily' | 'monthly', daysOfWeek?: number[], interval?: number }
    recurringPattern: jsonb('recurring_pattern'),
    
    // Escopo Territorial
    territoryScope: text('territory_scope'), // e.g., "SP" ou "SP:São Paulo"
    nucleusId: uuid('nucleus_id').references(() => nuclei.id),
    
    // Criação e Status
    createdById: uuid('created_by_id').references(() => users.id),
    status: text('status', { 
        enum: ['draft', 'active', 'completed', 'cancelled'] 
    }).notNull().default('draft'),
    
    // Metadados
    color: text('color').default('#3b82f6'), // Cor personalizada
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==========================================
// TURNOS / SLOTS
// ==========================================

export const scheduleSlots = pgTable('schedule_slots', {
    id: uuid('id').defaultRandom().primaryKey(),
    scheduleId: uuid('schedule_id').references(() => schedules.id, { onDelete: 'cascade' }).notNull(),
    
    // Identificação
    name: text('name').notNull(), // "Turno Manhã", "Vigília Noturna", etc
    
    // Data e Horário
    date: date('date').notNull(),
    startTime: time('start_time').notNull(),
    endTime: time('end_time').notNull(),
    
    // Local
    location: text('location'),
    locationDetails: text('location_details'), // Instruções adicionais
    
    // Capacidade
    maxParticipants: integer('max_participants').default(10),
    minParticipants: integer('min_participants').default(1),
    
    // Status
    status: text('status', { 
        enum: ['open', 'full', 'in_progress', 'completed', 'cancelled'] 
    }).notNull().default('open'),
    
    // Observações
    notes: text('notes'),
    
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==========================================
// ATRIBUIÇÕES DE MEMBROS
// ==========================================

export const slotAssignments = pgTable('slot_assignments', {
    id: uuid('id').defaultRandom().primaryKey(),
    slotId: uuid('slot_id').references(() => scheduleSlots.id, { onDelete: 'cascade' }).notNull(),
    memberId: uuid('member_id').references(() => members.id, { onDelete: 'cascade' }).notNull(),
    
    // Quem atribuiu
    assignedById: uuid('assigned_by_id').references(() => users.id),
    
    // Papel no turno
    role: text('role', { 
        enum: ['participant', 'leader', 'backup'] 
    }).notNull().default('participant'),
    
    // Status da participação
    status: text('status', { 
        enum: ['pending', 'confirmed', 'declined', 'attended', 'absent', 'excused'] 
    }).notNull().default('pending'),
    
    // Datas importantes
    confirmationDate: timestamp('confirmation_date'),
    declineReason: text('decline_reason'),
    
    // Check-in/Check-out
    checkInTime: timestamp('check_in_time'),
    checkOutTime: timestamp('check_out_time'),
    
    // Observações
    notes: text('notes'),
    
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==========================================
// DISPONIBILIDADE DOS MEMBROS
// ==========================================

export const memberAvailability = pgTable('member_availability', {
    id: uuid('id').defaultRandom().primaryKey(),
    memberId: uuid('member_id').references(() => members.id, { onDelete: 'cascade' }).notNull(),
    
    // Dia da semana (0 = Domingo, 6 = Sábado)
    dayOfWeek: integer('day_of_week').notNull(),
    
    // Horário
    startTime: time('start_time').notNull(),
    endTime: time('end_time').notNull(),
    
    // Disponível ou bloqueado
    isAvailable: boolean('is_available').default(true),
    
    // Período de validade (opcional)
    validFrom: date('valid_from'),
    validUntil: date('valid_until'),
    
    // Observações
    notes: text('notes'),
    
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==========================================
// EXCEÇÕES DE DISPONIBILIDADE
// ==========================================

export const scheduleExceptions = pgTable('schedule_exceptions', {
    id: uuid('id').defaultRandom().primaryKey(),
    memberId: uuid('member_id').references(() => members.id, { onDelete: 'cascade' }).notNull(),
    
    // Data específica
    date: date('date').notNull(),
    
    // Tipo de exceção
    type: text('type', {
        enum: ['unavailable', 'available', 'partial']
    }).notNull().default('unavailable'),
    
    // Horário (para exceções parciais)
    startTime: time('start_time'),
    endTime: time('end_time'),
    
    // Motivo
    reason: text('reason'),
    
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// RELAÇÕES
// ==========================================

export const schedulesRelations = relations(schedules, ({ one, many }) => ({
    createdBy: one(users, {
        fields: [schedules.createdById],
        references: [users.id],
    }),
    nucleus: one(nuclei, {
        fields: [schedules.nucleusId],
        references: [nuclei.id],
    }),
    slots: many(scheduleSlots),
}));

export const scheduleSlotsRelations = relations(scheduleSlots, ({ one, many }) => ({
    schedule: one(schedules, {
        fields: [scheduleSlots.scheduleId],
        references: [schedules.id],
    }),
    assignments: many(slotAssignments),
}));

export const slotAssignmentsRelations = relations(slotAssignments, ({ one }) => ({
    slot: one(scheduleSlots, {
        fields: [slotAssignments.slotId],
        references: [scheduleSlots.id],
    }),
    member: one(members, {
        fields: [slotAssignments.memberId],
        references: [members.id],
    }),
    assignedBy: one(users, {
        fields: [slotAssignments.assignedById],
        references: [users.id],
    }),
}));

export const memberAvailabilityRelations = relations(memberAvailability, ({ one }) => ({
    member: one(members, {
        fields: [memberAvailability.memberId],
        references: [members.id],
    }),
}));

export const scheduleExceptionsRelations = relations(scheduleExceptions, ({ one }) => ({
    member: one(members, {
        fields: [scheduleExceptions.memberId],
        references: [members.id],
    }),
}));

// ==========================================
// TIPOS INFERIDOS
// ==========================================

export type Schedule = typeof schedules.$inferSelect;
export type NewSchedule = typeof schedules.$inferInsert;

export type ScheduleSlot = typeof scheduleSlots.$inferSelect;
export type NewScheduleSlot = typeof scheduleSlots.$inferInsert;

export type SlotAssignment = typeof slotAssignments.$inferSelect;
export type NewSlotAssignment = typeof slotAssignments.$inferInsert;

export type MemberAvailability = typeof memberAvailability.$inferSelect;
export type NewMemberAvailability = typeof memberAvailability.$inferInsert;

export type ScheduleException = typeof scheduleExceptions.$inferSelect;
export type NewScheduleException = typeof scheduleExceptions.$inferInsert;

// Tipos auxiliares
export type ScheduleType = 'weekly' | 'monthly' | 'event' | 'permanent';
export type ScheduleCategory = 'vigilancia' | 'formacao' | 'agitacao' | 'administrativa' | 'financeira' | 'outras';
export type ScheduleStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type SlotStatus = 'open' | 'full' | 'in_progress' | 'completed' | 'cancelled';
export type AssignmentRole = 'participant' | 'leader' | 'backup';
export type AssignmentStatus = 'pending' | 'confirmed' | 'declined' | 'attended' | 'absent' | 'excused';
export type ExceptionType = 'unavailable' | 'available' | 'partial';

// Interface para padrão de recorrência
export interface RecurringPattern {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval?: number; // A cada X dias/semanas/meses
    daysOfWeek?: number[]; // 0-6 para semanal
    dayOfMonth?: number; // 1-31 para mensal
    endAfterOccurrences?: number;
}
