import { pgTable, text, timestamp, uuid, jsonb, boolean, integer, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { nuclei } from './nuclei';
import { members } from './members';
import { users } from './users';

export const projects = pgTable('projects', {
    id: uuid('id').defaultRandom().primaryKey(),
    nucleusId: uuid('nucleus_id').references(() => nuclei.id),
    name: text('name').notNull(),
    description: text('description'),
    status: text('status', { enum: ['planned', 'active', 'completed', 'paused'] }).default('planned'),
    type: text('type', { enum: ['state', 'municipal', 'zonal', 'local', 'other'] }).default('other'),
    startDate: timestamp('start_date'),
    endDate: timestamp('end_date'),
    objectives: text('objectives'),
    goals: jsonb('goals'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const projectTasks = pgTable('project_tasks', {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
    parentTaskId: uuid('parent_task_id'),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status', { enum: ['todo', 'in_progress', 'review', 'done'] }).default('todo'),
    priority: text('priority', { enum: ['low', 'medium', 'high'] }).default('medium'),
    category: text('category', {
        enum: ['vigilancia', 'formacao', 'agitacao', 'administrativa', 'financeira', 'outras']
    }).default('outras'),
    turno: text('turno', { enum: ['manha', 'tarde', 'noite'] }),
    dayOfWeek: integer('day_of_week'), // 0-6, for recurring tasks
    frequency: text('frequency', {
        enum: ['pontual', 'semanal', 'quinzenal', 'mensal', 'continua']
    }).default('pontual'),
    location: text('location'),
    color: text('color').default('#3b82f6'),
    tags: jsonb('tags').default([]),
    startTime: text('start_time'), // e.g. '14:00'
    endTime: text('end_time'),
    sortOrder: integer('sort_order').default(0),
    dueDate: timestamp('due_date'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==========================================
// TASK ASSIGNEES - Multiple people per task
// ==========================================

export const taskAssignees = pgTable('task_assignees', {
    id: uuid('id').defaultRandom().primaryKey(),
    taskId: uuid('task_id').references(() => projectTasks.id, { onDelete: 'cascade' }).notNull(),
    memberId: uuid('member_id').references(() => members.id, { onDelete: 'cascade' }).notNull(),
    role: text('role', {
        enum: ['assignee', 'leader', 'reviewer', 'backup']
    }).default('assignee'),
    status: text('status', {
        enum: ['pending', 'confirmed', 'declined', 'attended', 'absent', 'excused']
    }).default('pending'),
    assignedById: uuid('assigned_by_id').references(() => users.id),
    checkInTime: timestamp('check_in_time'),
    checkOutTime: timestamp('check_out_time'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    uniqueTaskMember: uniqueIndex('unique_task_member').on(table.taskId, table.memberId),
}));

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

    isPrimary: boolean('is_primary').default(false),

    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    uniqueProjectNucleus: uniqueIndex('unique_project_nucleus').on(table.projectId, table.nucleusId),
}));

// ==========================================
// RELATIONS
// ==========================================

export const projectsRelations = relations(projects, ({ one, many }) => ({
    primaryNucleus: one(nuclei, {
        fields: [projects.nucleusId],
        references: [nuclei.id],
    }),
    nucleiLinks: many(projectNuclei),
    members: many(projectMembers),
    tasks: many(projectTasks),
}));

export const projectTasksRelations = relations(projectTasks, ({ one, many }) => ({
    project: one(projects, {
        fields: [projectTasks.projectId],
        references: [projects.id],
    }),
    parentTask: one(projectTasks, {
        fields: [projectTasks.parentTaskId],
        references: [projectTasks.id],
    }),
    assignees: many(taskAssignees),
}));

export const taskAssigneesRelations = relations(taskAssignees, ({ one }) => ({
    task: one(projectTasks, {
        fields: [taskAssignees.taskId],
        references: [projectTasks.id],
    }),
    member: one(members, {
        fields: [taskAssignees.memberId],
        references: [members.id],
    }),
    assignedBy: one(users, {
        fields: [taskAssignees.assignedById],
        references: [users.id],
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
