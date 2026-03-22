import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function run() {
    // All statements via tagged template literals
    try {
        console.log('1. Adding parent_task_id...');
        await sql`ALTER TABLE "project_tasks" ADD COLUMN IF NOT EXISTS "parent_task_id" uuid`;
        console.log('  OK');
    } catch (e) { console.log('  ', e.message?.substring(0, 80)); }

    try {
        console.log('2. Adding category...');
        await sql`ALTER TABLE "project_tasks" ADD COLUMN IF NOT EXISTS "category" text DEFAULT 'outras'`;
        console.log('  OK');
    } catch (e) { console.log('  ', e.message?.substring(0, 80)); }

    try {
        console.log('3. Adding turno...');
        await sql`ALTER TABLE "project_tasks" ADD COLUMN IF NOT EXISTS "turno" text`;
        console.log('  OK');
    } catch (e) { console.log('  ', e.message?.substring(0, 80)); }

    try {
        console.log('4. Adding day_of_week...');
        await sql`ALTER TABLE "project_tasks" ADD COLUMN IF NOT EXISTS "day_of_week" integer`;
        console.log('  OK');
    } catch (e) { console.log('  ', e.message?.substring(0, 80)); }

    try {
        console.log('5. Adding frequency...');
        await sql`ALTER TABLE "project_tasks" ADD COLUMN IF NOT EXISTS "frequency" text DEFAULT 'pontual'`;
        console.log('  OK');
    } catch (e) { console.log('  ', e.message?.substring(0, 80)); }

    try {
        console.log('6. Adding location...');
        await sql`ALTER TABLE "project_tasks" ADD COLUMN IF NOT EXISTS "location" text`;
        console.log('  OK');
    } catch (e) { console.log('  ', e.message?.substring(0, 80)); }

    try {
        console.log('7. Adding color...');
        await sql`ALTER TABLE "project_tasks" ADD COLUMN IF NOT EXISTS "color" text DEFAULT '#3b82f6'`;
        console.log('  OK');
    } catch (e) { console.log('  ', e.message?.substring(0, 80)); }

    try {
        console.log('8. Adding tags...');
        await sql`ALTER TABLE "project_tasks" ADD COLUMN IF NOT EXISTS "tags" jsonb DEFAULT '[]'`;
        console.log('  OK');
    } catch (e) { console.log('  ', e.message?.substring(0, 80)); }

    try {
        console.log('9. Adding start_time...');
        await sql`ALTER TABLE "project_tasks" ADD COLUMN IF NOT EXISTS "start_time" text`;
        console.log('  OK');
    } catch (e) { console.log('  ', e.message?.substring(0, 80)); }

    try {
        console.log('10. Adding end_time...');
        await sql`ALTER TABLE "project_tasks" ADD COLUMN IF NOT EXISTS "end_time" text`;
        console.log('  OK');
    } catch (e) { console.log('  ', e.message?.substring(0, 80)); }

    try {
        console.log('11. Adding sort_order...');
        await sql`ALTER TABLE "project_tasks" ADD COLUMN IF NOT EXISTS "sort_order" integer DEFAULT 0`;
        console.log('  OK');
    } catch (e) { console.log('  ', e.message?.substring(0, 80)); }

    try {
        console.log('12. Dropping assigned_to_id...');
        await sql`ALTER TABLE "project_tasks" DROP COLUMN IF EXISTS "assigned_to_id"`;
        console.log('  OK');
    } catch (e) { console.log('  ', e.message?.substring(0, 80)); }

    try {
        console.log('13. Creating task_assignees table...');
        await sql`CREATE TABLE IF NOT EXISTS "task_assignees" (
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
        )`;
        console.log('  OK');
    } catch (e) { console.log('  ', e.message?.substring(0, 80)); }

    try {
        console.log('14. Adding FK task_id...');
        await sql`ALTER TABLE "task_assignees" ADD CONSTRAINT "task_assignees_task_id_project_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "project_tasks"("id") ON DELETE cascade`;
        console.log('  OK');
    } catch (e) { console.log('  ', e.message?.substring(0, 80)); }

    try {
        console.log('15. Adding FK member_id...');
        await sql`ALTER TABLE "task_assignees" ADD CONSTRAINT "task_assignees_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE cascade`;
        console.log('  OK');
    } catch (e) { console.log('  ', e.message?.substring(0, 80)); }

    try {
        console.log('16. Adding FK assigned_by_id...');
        await sql`ALTER TABLE "task_assignees" ADD CONSTRAINT "task_assignees_assigned_by_id_users_id_fk" FOREIGN KEY ("assigned_by_id") REFERENCES "users"("id")`;
        console.log('  OK');
    } catch (e) { console.log('  ', e.message?.substring(0, 80)); }

    try {
        console.log('17. Creating unique index...');
        await sql`CREATE UNIQUE INDEX IF NOT EXISTS "unique_task_member" ON "task_assignees" ("task_id","member_id")`;
        console.log('  OK');
    } catch (e) { console.log('  ', e.message?.substring(0, 80)); }

    try {
        console.log('18. Adding shift to member_availability...');
        await sql`ALTER TABLE "member_availability" ADD COLUMN IF NOT EXISTS "shift" text`;
        console.log('  OK');
    } catch (e) { console.log('  ', e.message?.substring(0, 80)); }

    console.log('\nMigration complete!');
}

run();
