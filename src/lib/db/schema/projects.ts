import { pgTable, text, timestamp, uuid, jsonb, boolean, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { nuclei } from './nuclei';
import { et_projetos } from './escola';

export const projects = pgTable('projects', {
    id: uuid('id').defaultRandom().primaryKey(),
    nucleusId: uuid('nucleus_id').references(() => nuclei.id),
    name: text('name').notNull(),
    description: text('description'),
    status: text('status', { enum: ['planned', 'active', 'completed', 'paused'] }).default('planned'),
    type: text('type', { enum: ['state', 'municipal', 'zonal', 'local', 'other'] }).default('other'), // Inferred from nucleus, but good to have
    startDate: timestamp('start_date'),
    endDate: timestamp('end_date'),
    objectives: text('objectives'), // Markdown/Text description of objectives
    goals: jsonb('goals'), // Structured goals: [{ id, text, target, current, status }]
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const projectTasks = pgTable('project_tasks', {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status', { enum: ['todo', 'in_progress', 'review', 'done'] }).default('todo'),
    priority: text('priority', { enum: ['low', 'medium', 'high'] }).default('medium'),
    dueDate: timestamp('due_date'),
    assignedToId: uuid('assigned_to_id'), // Can reference members or users
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const projectsRelations = relations(projects, ({ one, many }) => ({
    nucleus: one(nuclei, {
        fields: [projects.nucleusId],
        references: [nuclei.id],
    }),
    tasks: many(projectTasks),
    workSchools: many(et_projetos), // Link to existing "Espaço de Trabalho - Projetos" if they are child entities
}));

export const projectTasksRelations = relations(projectTasks, ({ one }) => ({
    project: one(projects, {
        fields: [projectTasks.projectId],
        references: [projects.id],
    }),
}));
