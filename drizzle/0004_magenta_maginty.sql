ALTER TABLE "users" RENAME COLUMN "territory_scope" TO "scope_state";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'LOCAL_COORD';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "scope_city" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "scope_zone" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "scope_nucleus_id" uuid;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "party" text;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "situation" text;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "disaffiliation_reason" text;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "communication_pending" text;--> statement-breakpoint
ALTER TABLE "nuclei" ADD COLUMN "zone" text;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_scope_nucleus_id_nuclei_id_fk" FOREIGN KEY ("scope_nucleus_id") REFERENCES "public"."nuclei"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_nucleus_id_nuclei_id_fk" FOREIGN KEY ("nucleus_id") REFERENCES "public"."nuclei"("id") ON DELETE no action ON UPDATE no action;