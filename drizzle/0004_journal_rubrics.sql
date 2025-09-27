CREATE TABLE "template_journal_rubrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"config_id" uuid NOT NULL,
	"indicator_text" text NOT NULL,
	"criteria" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "template_journal_rubrics" ADD CONSTRAINT "template_journal_rubrics_config_id_template_stage_configs_id_fk" FOREIGN KEY ("config_id") REFERENCES "public"."template_stage_configs"("id") ON DELETE cascade ON UPDATE no action;