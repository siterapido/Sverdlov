import { relations } from "drizzle-orm/relations";
import { members, finances, subscriptionPlans, users, nuclei, schedules, memberAvailability, scheduleSlots, slotAssignments, scheduleExceptions, etTarefas, etEscalas, etMilitantes, etProjetos } from "./schema";

export const financesRelations = relations(finances, ({one}) => ({
	member: one(members, {
		fields: [finances.memberId],
		references: [members.id]
	}),
	subscriptionPlan: one(subscriptionPlans, {
		fields: [finances.planId],
		references: [subscriptionPlans.id]
	}),
}));

export const membersRelations = relations(members, ({one, many}) => ({
	finances: many(finances),
	user: one(users, {
		fields: [members.politicalResponsibleId],
		references: [users.id]
	}),
	subscriptionPlan: one(subscriptionPlans, {
		fields: [members.planId],
		references: [subscriptionPlans.id]
	}),
	memberAvailabilities: many(memberAvailability),
	slotAssignments: many(slotAssignments),
	scheduleExceptions: many(scheduleExceptions),
}));

export const subscriptionPlansRelations = relations(subscriptionPlans, ({many}) => ({
	finances: many(finances),
	members: many(members),
}));

export const usersRelations = relations(users, ({many}) => ({
	members: many(members),
	schedules: many(schedules),
	slotAssignments: many(slotAssignments),
}));

export const schedulesRelations = relations(schedules, ({one, many}) => ({
	nucleus: one(nuclei, {
		fields: [schedules.nucleusId],
		references: [nuclei.id]
	}),
	user: one(users, {
		fields: [schedules.createdById],
		references: [users.id]
	}),
	scheduleSlots: many(scheduleSlots),
}));

export const nucleiRelations = relations(nuclei, ({many}) => ({
	schedules: many(schedules),
}));

export const memberAvailabilityRelations = relations(memberAvailability, ({one}) => ({
	member: one(members, {
		fields: [memberAvailability.memberId],
		references: [members.id]
	}),
}));

export const slotAssignmentsRelations = relations(slotAssignments, ({one}) => ({
	scheduleSlot: one(scheduleSlots, {
		fields: [slotAssignments.slotId],
		references: [scheduleSlots.id]
	}),
	member: one(members, {
		fields: [slotAssignments.memberId],
		references: [members.id]
	}),
	user: one(users, {
		fields: [slotAssignments.assignedById],
		references: [users.id]
	}),
}));

export const scheduleSlotsRelations = relations(scheduleSlots, ({one, many}) => ({
	slotAssignments: many(slotAssignments),
	schedule: one(schedules, {
		fields: [scheduleSlots.scheduleId],
		references: [schedules.id]
	}),
}));

export const scheduleExceptionsRelations = relations(scheduleExceptions, ({one}) => ({
	member: one(members, {
		fields: [scheduleExceptions.memberId],
		references: [members.id]
	}),
}));

export const etEscalasRelations = relations(etEscalas, ({one}) => ({
	etTarefa: one(etTarefas, {
		fields: [etEscalas.tarefaId],
		references: [etTarefas.id]
	}),
	etMilitante: one(etMilitantes, {
		fields: [etEscalas.militanteId],
		references: [etMilitantes.id]
	}),
}));

export const etTarefasRelations = relations(etTarefas, ({one, many}) => ({
	etEscalas: many(etEscalas),
	etProjeto: one(etProjetos, {
		fields: [etTarefas.projetoId],
		references: [etProjetos.id]
	}),
}));

export const etMilitantesRelations = relations(etMilitantes, ({many}) => ({
	etEscalas: many(etEscalas),
}));

export const etProjetosRelations = relations(etProjetos, ({many}) => ({
	etTarefas: many(etTarefas),
}));