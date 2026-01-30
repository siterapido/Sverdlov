CREATE TABLE "et_escalas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tarefa_id" uuid NOT NULL,
	"militante_id" uuid,
	"dia" text NOT NULL,
	"turno" text NOT NULL,
	"observacao" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "et_militantes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"tipo" text DEFAULT 'voluntario' NOT NULL,
	"habilidades" text,
	"disponibilidade" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "et_projetos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"cor" text DEFAULT '#3b82f6' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "et_tarefas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projeto_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"frequencia" text NOT NULL,
	"dia" text,
	"turno" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "full_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "et_escalas" ADD CONSTRAINT "et_escalas_tarefa_id_et_tarefas_id_fk" FOREIGN KEY ("tarefa_id") REFERENCES "public"."et_tarefas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "et_escalas" ADD CONSTRAINT "et_escalas_militante_id_et_militantes_id_fk" FOREIGN KEY ("militante_id") REFERENCES "public"."et_militantes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "et_tarefas" ADD CONSTRAINT "et_tarefas_projeto_id_et_projetos_id_fk" FOREIGN KEY ("projeto_id") REFERENCES "public"."et_projetos"("id") ON DELETE cascade ON UPDATE no action;