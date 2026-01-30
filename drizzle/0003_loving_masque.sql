CREATE TABLE "subscription_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"frequency" text DEFAULT 'monthly' NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "finances" ADD COLUMN "type" text DEFAULT 'subscription' NOT NULL;--> statement-breakpoint
ALTER TABLE "finances" ADD COLUMN "reference_date" date;--> statement-breakpoint
ALTER TABLE "finances" ADD COLUMN "plan_id" uuid;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "affiliation_date" date;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "plan_id" uuid;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "subscription_start_date" date;--> statement-breakpoint
ALTER TABLE "finances" ADD CONSTRAINT "finances_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;