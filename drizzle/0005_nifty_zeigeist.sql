CREATE TABLE "availability_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"token" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"period" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	CONSTRAINT "availability_requests_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "project_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'todo',
	"priority" text DEFAULT 'medium',
	"due_date" timestamp,
	"assigned_to_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nucleus_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'planned',
	"type" text DEFAULT 'other',
	"start_date" timestamp,
	"end_date" timestamp,
	"objectives" text,
	"goals" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "et_projetos" ADD COLUMN "project_id" uuid;--> statement-breakpoint
ALTER TABLE "availability_requests" ADD CONSTRAINT "availability_requests_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_nucleus_id_nuclei_id_fk" FOREIGN KEY ("nucleus_id") REFERENCES "public"."nuclei"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "et_projetos" ADD CONSTRAINT "et_projetos_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "member_date_unique" ON "schedule_exceptions" USING btree ("member_id","date");