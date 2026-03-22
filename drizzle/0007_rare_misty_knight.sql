CREATE TABLE "cities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"state" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
