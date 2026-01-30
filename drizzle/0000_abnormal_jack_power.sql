CREATE TABLE "finances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"payment_date" timestamp DEFAULT now() NOT NULL,
	"payment_method" text DEFAULT 'pix' NOT NULL,
	"transaction_id" text,
	"status" text DEFAULT 'completed' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"territory_scope" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"social_name" text,
	"cpf" text NOT NULL,
	"voter_title" text,
	"date_of_birth" date NOT NULL,
	"gender" text,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"state" text NOT NULL,
	"city" text NOT NULL,
	"zone" text,
	"neighborhood" text NOT NULL,
	"nucleus_id" uuid,
	"request_date" timestamp DEFAULT now() NOT NULL,
	"approval_date" timestamp,
	"status" text DEFAULT 'interested' NOT NULL,
	"militancy_level" text DEFAULT 'supporter' NOT NULL,
	"political_responsible_id" uuid,
	"notes" text,
	"suggested_contribution" numeric(10, 2),
	"financial_status" text DEFAULT 'up_to_date' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "members_cpf_unique" UNIQUE("cpf"),
	CONSTRAINT "members_voter_title_unique" UNIQUE("voter_title")
);
--> statement-breakpoint
CREATE TABLE "nuclei" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'territorial' NOT NULL,
	"state" text NOT NULL,
	"city" text NOT NULL,
	"status" text DEFAULT 'in_formation' NOT NULL,
	"coordinator_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "finances" ADD CONSTRAINT "finances_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_political_responsible_id_users_id_fk" FOREIGN KEY ("political_responsible_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;