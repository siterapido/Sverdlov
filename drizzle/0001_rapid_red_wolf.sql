CREATE TABLE "member_availability" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"is_available" boolean DEFAULT true,
	"valid_from" date,
	"valid_until" date,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedule_exceptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"date" date NOT NULL,
	"type" text DEFAULT 'unavailable' NOT NULL,
	"start_time" time,
	"end_time" time,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedule_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schedule_id" uuid NOT NULL,
	"name" text NOT NULL,
	"date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"location" text,
	"location_details" text,
	"max_participants" integer DEFAULT 10,
	"min_participants" integer DEFAULT 1,
	"status" text DEFAULT 'open' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text DEFAULT 'weekly' NOT NULL,
	"category" text DEFAULT 'outras' NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"is_recurring" boolean DEFAULT false,
	"recurring_pattern" jsonb,
	"territory_scope" text,
	"nucleus_id" uuid,
	"created_by_id" uuid,
	"status" text DEFAULT 'draft' NOT NULL,
	"color" text DEFAULT '#3b82f6',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slot_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slot_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"assigned_by_id" uuid,
	"role" text DEFAULT 'participant' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"confirmation_date" timestamp,
	"decline_reason" text,
	"check_in_time" timestamp,
	"check_out_time" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "member_availability" ADD CONSTRAINT "member_availability_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_exceptions" ADD CONSTRAINT "schedule_exceptions_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_slots" ADD CONSTRAINT "schedule_slots_schedule_id_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_nucleus_id_nuclei_id_fk" FOREIGN KEY ("nucleus_id") REFERENCES "public"."nuclei"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slot_assignments" ADD CONSTRAINT "slot_assignments_slot_id_schedule_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."schedule_slots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slot_assignments" ADD CONSTRAINT "slot_assignments_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slot_assignments" ADD CONSTRAINT "slot_assignments_assigned_by_id_users_id_fk" FOREIGN KEY ("assigned_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;