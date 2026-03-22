-- Phase 1: Expand project_tasks and create task_assignees
-- Unification of task system (projectTasks + et_tarefas + scheduleSlots)

-- 1. Add new columns to project_tasks
ALTER TABLE "project_tasks" ADD COLUMN "parent_task_id" uuid;
ALTER TABLE "project_tasks" ADD COLUMN "category" text DEFAULT 'outras';
ALTER TABLE "project_tasks" ADD COLUMN "turno" text;
ALTER TABLE "project_tasks" ADD COLUMN "day_of_week" integer;
ALTER TABLE "project_tasks" ADD COLUMN "frequency" text DEFAULT 'pontual';
ALTER TABLE "project_tasks" ADD COLUMN "location" text;
ALTER TABLE "project_tasks" ADD COLUMN "color" text DEFAULT '#3b82f6';
ALTER TABLE "project_tasks" ADD COLUMN "tags" jsonb DEFAULT '[]';
ALTER TABLE "project_tasks" ADD COLUMN "start_time" text;
ALTER TABLE "project_tasks" ADD COLUMN "end_time" text;
ALTER TABLE "project_tasks" ADD COLUMN "sort_order" integer DEFAULT 0;

-- 2. Remove old assignedToId column (replaced by task_assignees junction table)
ALTER TABLE "project_tasks" DROP COLUMN IF EXISTS "assigned_to_id";

-- 3. Create task_assignees junction table
CREATE TABLE IF NOT EXISTS "task_assignees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"role" text DEFAULT 'assignee',
	"status" text DEFAULT 'pending',
	"assigned_by_id" uuid,
	"check_in_time" timestamp,
	"check_out_time" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- 4. Add foreign keys for task_assignees
DO $$ BEGIN
 ALTER TABLE "task_assignees" ADD CONSTRAINT "task_assignees_task_id_project_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."project_tasks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "task_assignees" ADD CONSTRAINT "task_assignees_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "task_assignees" ADD CONSTRAINT "task_assignees_assigned_by_id_users_id_fk" FOREIGN KEY ("assigned_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- 5. Add unique index on task_assignees (task_id + member_id)
CREATE UNIQUE INDEX IF NOT EXISTS "unique_task_member" ON "task_assignees" USING btree ("task_id","member_id");

-- 6. Add shift column to member_availability
ALTER TABLE "member_availability" ADD COLUMN IF NOT EXISTS "shift" text;
