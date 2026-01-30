import { pgTable, text, uuid, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { projects } from './projects';

// ==========================================
// ESCOLA DE TRABALHO
// ==========================================

export const et_militantes = pgTable('et_militantes', {
    id: uuid('id').defaultRandom().primaryKey(),
    nome: text('nome').notNull(),
    tipo: text('tipo', { enum: ['voluntario', 'profissional'] }).notNull().default('voluntario'),
    habilidades: text('habilidades'),
    // Armazena a disponibilidade: { segunda: ['manha'], terca: ['tarde', 'noite'], ... }
    disponibilidade: jsonb('disponibilidade').$type<Record<string, string[]>>().default({}),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const et_projetos = pgTable('et_projetos', {
    id: uuid('id').defaultRandom().primaryKey(),
    nome: text('nome').notNull(),
    cor: text('cor').notNull().default('#3b82f6'),
    projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const et_tarefas = pgTable('et_tarefas', {
    id: uuid('id').defaultRandom().primaryKey(),
    projetoId: uuid('projeto_id').references(() => et_projetos.id, { onDelete: 'cascade' }).notNull(),
    nome: text('nome').notNull(),
    frequencia: text('frequencia').notNull(), // 'semanal', 'quinzenal', 'mensal', 'continua', 'pontual'
    dia: text('dia'), // 'segunda', 'terca', etc. (opcional, se fixo)
    turno: text('turno'), // 'manha', 'tarde', 'noite' (opcional, se fixo)
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const et_escalas = pgTable('et_escalas', {
    id: uuid('id').defaultRandom().primaryKey(),
    tarefaId: uuid('tarefa_id').references(() => et_tarefas.id, { onDelete: 'cascade' }).notNull(),
    militanteId: uuid('militante_id').references(() => et_militantes.id, { onDelete: 'set null' }),
    dia: text('dia').notNull(), // Dia da escala específica
    turno: text('turno').notNull(),
    observacao: text('observacao'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==========================================
// RELAÇÕES
// ==========================================

export const et_projetosRelations = relations(et_projetos, ({ one, many }) => ({
    tarefas: many(et_tarefas),
    parentProject: one(projects, {
        fields: [et_projetos.projectId],
        references: [projects.id],
    }),
}));

export const et_tarefasRelations = relations(et_tarefas, ({ one, many }) => ({
    projeto: one(et_projetos, {
        fields: [et_tarefas.projetoId],
        references: [et_projetos.id],
    }),
    escalas: many(et_escalas),
}));

export const et_escalasRelations = relations(et_escalas, ({ one }) => ({
    tarefa: one(et_tarefas, {
        fields: [et_escalas.tarefaId],
        references: [et_tarefas.id],
    }),
    militante: one(et_militantes, {
        fields: [et_escalas.militanteId],
        references: [et_militantes.id],
    }),
}));

export const et_militantesRelations = relations(et_militantes, ({ many }) => ({
    escalas: many(et_escalas),
}));
