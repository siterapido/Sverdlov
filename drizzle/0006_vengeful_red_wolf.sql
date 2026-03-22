ALTER TABLE "members" ALTER COLUMN "cpf" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "date_of_birth" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "phone" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "neighborhood" DROP NOT NULL;--> statement-breakpoint
UPDATE "members" SET "phone" = NULL WHERE "phone" = '';--> statement-breakpoint
UPDATE "members" SET "email" = NULL WHERE "email" = '';--> statement-breakpoint
UPDATE "members" SET "neighborhood" = NULL WHERE "neighborhood" = '';--> statement-breakpoint
UPDATE "members" SET "cpf" = NULL WHERE "cpf" = '';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "profile_photo" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "theme" text DEFAULT 'system' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "language" text DEFAULT 'pt' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "notifications_enabled" boolean DEFAULT true NOT NULL;