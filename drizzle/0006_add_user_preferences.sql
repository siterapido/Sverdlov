-- Add user preferences and profile fields
ALTER TABLE "users" ADD COLUMN "profile_photo" text;
ALTER TABLE "users" ADD COLUMN "theme" text NOT NULL DEFAULT 'system';
ALTER TABLE "users" ADD COLUMN "language" text NOT NULL DEFAULT 'pt';
ALTER TABLE "users" ADD COLUMN "notifications_enabled" boolean NOT NULL DEFAULT true;
