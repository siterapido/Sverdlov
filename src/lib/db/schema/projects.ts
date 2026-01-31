import { pgTable, text, timestamp, uuid, jsonb, boolean, integer, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { nuclei } from './nuclei';
import { et_projetos } from './escola';
import { members } from './members';
import { users } from './users';

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

// ==========================================
// JUNCTION TABLES - Many-to-Many Relationships
// ==========================================

export const projectMembers = pgTable('project_members', {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
    memberId: uuid('member_id').references(() => members.id, { onDelete: 'cascade' }).notNull(),

    role: text('role', {
        enum: ['coordinator', 'member', 'contributor', 'observer']
    }).notNull().default('member'),

    assignedById: uuid('assigned_by_id').references(() => users.id),
    assignedAt: timestamp('assigned_at').defaultNow().notNull(),
    status: text('status', { enum: ['active', 'inactive'] }).notNull().default('active'),
    notes: text('notes'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    uniqueMemberProject: uniqueIndex('unique_member_project').on(table.projectId, table.memberId),
}));

export const projectNuclei = pgTable('project_nuclei', {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
    nucleusId: uuid('nucleus_id').references(() => nuclei.id, { onDelete: 'cascade' }).notNull(),

    isPrimary: boolean('is_primary').default(false), // Marks the primary nucleus

    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    uniqueProjectNucleus: uniqueIndex('unique_project_nucleus').on(table.projectId, table.nucleusId),
}));

// Relations
export const projectsRelations = relations(projects, ({ one, many }) => ({
    // Primary nucleus (for backward compatibility)
    primaryNucleus: one(nuclei, {
        fields: [projects.nucleusId],
        references: [nuclei.id],
    }),

    // NEW: Multiple nuclei via junction table
    nucleiLinks: many(projectNuclei),

    // NEW: Members of the project
    members: many(projectMembers),

    // Existing relations
    tasks: many(projectTasks),
    workSchools: many(et_projetos),
}));

export const projectTasksRelations = relations(projectTasks, ({ one }) => ({
    project: one(projects, {
        fields: [projectTasks.projectId],
        references: [projects.id],
    }),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
    project: one(projects, {
        fields: [projectMembers.projectId],
        references: [projects.id],
    }),
    member: one(members, {
        fields: [projectMembers.memberId],
        references: [members.id],
    }),
    assignedBy: one(users, {
        fields: [projectMembers.assignedById],
        references: [users.id],
    }),
}));

export const projectNucleiRelations = relations(projectNuclei, ({ one }) => ({
    project: one(projects, {
        fields: [projectNuclei.projectId],
        references: [projects.id],
    }),
    nucleus: one(nuclei, {
        fields: [projectNuclei.nucleusId],
        references: [nuclei.id],
    }),
}));
