import { pgTable, uuid, text, timestamp, unique, foreignKey, numeric, date, boolean, jsonb, integer, time } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const nuclei = pgTable("nuclei", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	type: text().default('territorial').notNull(),
	state: text().notNull(),
	city: text().notNull(),
	status: text().default('in_formation').notNull(),
	coordinatorId: uuid("coordinator_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: text().notNull(),
	passwordHash: text("password_hash").notNull(),
	role: text().default('member').notNull(),
	territoryScope: text("territory_scope"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	fullName: text("full_name").notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const finances = pgTable("finances", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	memberId: uuid("member_id").notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	paymentDate: timestamp("payment_date", { mode: 'string' }).defaultNow().notNull(),
	paymentMethod: text("payment_method").default('pix').notNull(),
	transactionId: text("transaction_id"),
	status: text().default('completed').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	type: text().default('subscription').notNull(),
	referenceDate: date("reference_date"),
	planId: uuid("plan_id"),
}, (table) => [
	foreignKey({
			columns: [table.memberId],
			foreignColumns: [members.id],
			name: "finances_member_id_members_id_fk"
		}),
	foreignKey({
			columns: [table.planId],
			foreignColumns: [subscriptionPlans.id],
			name: "finances_plan_id_subscription_plans_id_fk"
		}),
]);

export const members = pgTable("members", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	fullName: text("full_name").notNull(),
	socialName: text("social_name"),
	cpf: text().notNull(),
	voterTitle: text("voter_title"),
	dateOfBirth: date("date_of_birth").notNull(),
	gender: text(),
	phone: text().notNull(),
	email: text().notNull(),
	state: text().notNull(),
	city: text().notNull(),
	zone: text(),
	neighborhood: text().notNull(),
	nucleusId: uuid("nucleus_id"),
	requestDate: timestamp("request_date", { mode: 'string' }).defaultNow().notNull(),
	approvalDate: timestamp("approval_date", { mode: 'string' }),
	status: text().default('interested').notNull(),
	militancyLevel: text("militancy_level").default('supporter').notNull(),
	politicalResponsibleId: uuid("political_responsible_id"),
	notes: text(),
	suggestedContribution: numeric("suggested_contribution", { precision: 10, scale:  2 }),
	financialStatus: text("financial_status").default('up_to_date').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	affiliationDate: date("affiliation_date"),
	planId: uuid("plan_id"),
	subscriptionStartDate: date("subscription_start_date"),
}, (table) => [
	foreignKey({
			columns: [table.politicalResponsibleId],
			foreignColumns: [users.id],
			name: "members_political_responsible_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.planId],
			foreignColumns: [subscriptionPlans.id],
			name: "members_plan_id_subscription_plans_id_fk"
		}),
	unique("members_cpf_unique").on(table.cpf),
	unique("members_voter_title_unique").on(table.voterTitle),
]);

export const schedules = pgTable("schedules", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	type: text().default('weekly').notNull(),
	category: text().default('outras').notNull(),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }),
	isRecurring: boolean("is_recurring").default(false),
	recurringPattern: jsonb("recurring_pattern"),
	territoryScope: text("territory_scope"),
	nucleusId: uuid("nucleus_id"),
	createdById: uuid("created_by_id"),
	status: text().default('draft').notNull(),
	color: text().default('#3b82f6'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.nucleusId],
			foreignColumns: [nuclei.id],
			name: "schedules_nucleus_id_nuclei_id_fk"
		}),
	foreignKey({
			columns: [table.createdById],
			foreignColumns: [users.id],
			name: "schedules_created_by_id_users_id_fk"
		}),
]);

export const memberAvailability = pgTable("member_availability", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	memberId: uuid("member_id").notNull(),
	dayOfWeek: integer("day_of_week").notNull(),
	startTime: time("start_time").notNull(),
	endTime: time("end_time").notNull(),
	isAvailable: boolean("is_available").default(true),
	validFrom: date("valid_from"),
	validUntil: date("valid_until"),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.memberId],
			foreignColumns: [members.id],
			name: "member_availability_member_id_members_id_fk"
		}).onDelete("cascade"),
]);

export const slotAssignments = pgTable("slot_assignments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	slotId: uuid("slot_id").notNull(),
	memberId: uuid("member_id").notNull(),
	assignedById: uuid("assigned_by_id"),
	role: text().default('participant').notNull(),
	status: text().default('pending').notNull(),
	confirmationDate: timestamp("confirmation_date", { mode: 'string' }),
	declineReason: text("decline_reason"),
	checkInTime: timestamp("check_in_time", { mode: 'string' }),
	checkOutTime: timestamp("check_out_time", { mode: 'string' }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.slotId],
			foreignColumns: [scheduleSlots.id],
			name: "slot_assignments_slot_id_schedule_slots_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.memberId],
			foreignColumns: [members.id],
			name: "slot_assignments_member_id_members_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.assignedById],
			foreignColumns: [users.id],
			name: "slot_assignments_assigned_by_id_users_id_fk"
		}),
]);

export const scheduleSlots = pgTable("schedule_slots", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	scheduleId: uuid("schedule_id").notNull(),
	name: text().notNull(),
	date: date().notNull(),
	startTime: time("start_time").notNull(),
	endTime: time("end_time").notNull(),
	location: text(),
	locationDetails: text("location_details"),
	maxParticipants: integer("max_participants").default(10),
	minParticipants: integer("min_participants").default(1),
	status: text().default('open').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.scheduleId],
			foreignColumns: [schedules.id],
			name: "schedule_slots_schedule_id_schedules_id_fk"
		}).onDelete("cascade"),
]);

export const scheduleExceptions = pgTable("schedule_exceptions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	memberId: uuid("member_id").notNull(),
	date: date().notNull(),
	type: text().default('unavailable').notNull(),
	startTime: time("start_time"),
	endTime: time("end_time"),
	reason: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.memberId],
			foreignColumns: [members.id],
			name: "schedule_exceptions_member_id_members_id_fk"
		}).onDelete("cascade"),
]);

export const etMilitantes = pgTable("et_militantes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	nome: text().notNull(),
	tipo: text().default('voluntario').notNull(),
	habilidades: text(),
	disponibilidade: jsonb().default({}),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const etEscalas = pgTable("et_escalas", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tarefaId: uuid("tarefa_id").notNull(),
	militanteId: uuid("militante_id"),
	dia: text().notNull(),
	turno: text().notNull(),
	observacao: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.tarefaId],
			foreignColumns: [etTarefas.id],
			name: "et_escalas_tarefa_id_et_tarefas_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.militanteId],
			foreignColumns: [etMilitantes.id],
			name: "et_escalas_militante_id_et_militantes_id_fk"
		}).onDelete("set null"),
]);

export const etProjetos = pgTable("et_projetos", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	nome: text().notNull(),
	cor: text().default('#3b82f6').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const etTarefas = pgTable("et_tarefas", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	projetoId: uuid("projeto_id").notNull(),
	nome: text().notNull(),
	frequencia: text().notNull(),
	dia: text(),
	turno: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projetoId],
			foreignColumns: [etProjetos.id],
			name: "et_tarefas_projeto_id_et_projetos_id_fk"
		}).onDelete("cascade"),
]);

export const subscriptionPlans = pgTable("subscription_plans", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	frequency: text().default('monthly').notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	description: text(),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});
