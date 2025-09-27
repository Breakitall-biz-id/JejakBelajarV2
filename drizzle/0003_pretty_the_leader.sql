CREATE TABLE "project_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_name" varchar(255) NOT NULL,
	"description" text,
	"created_by_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_templates_template_name_unique" UNIQUE("template_name")
);
--> statement-breakpoint
CREATE TABLE "template_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"config_id" uuid NOT NULL,
	"question_text" text NOT NULL,
	"question_type" varchar(50) DEFAULT 'STATEMENT' NOT NULL,
	"scoring_guide" text,
	"rubric_criteria" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_stage_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"stage_name" varchar(255) NOT NULL,
	"instrument_type" "instrument_type" NOT NULL,
	"display_order" integer NOT NULL,
	"description" text,
	"estimated_duration" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "submissions" DROP CONSTRAINT "submissions_student_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "submissions" ALTER COLUMN "content" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "project_stage_instruments" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "template_id" uuid;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "submitted_by" varchar(50) DEFAULT 'STUDENT' NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "submitted_by_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "template_stage_config_id" uuid;--> statement-breakpoint
ALTER TABLE "project_templates" ADD CONSTRAINT "project_templates_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_questions" ADD CONSTRAINT "template_questions_config_id_template_stage_configs_id_fk" FOREIGN KEY ("config_id") REFERENCES "public"."template_stage_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_stage_configs" ADD CONSTRAINT "template_stage_configs_template_id_project_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."project_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "template_stage_configs_template_order_idx" ON "template_stage_configs" USING btree ("template_id","display_order");--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_template_id_project_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."project_templates"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_template_stage_config_id_template_stage_configs_id_fk" FOREIGN KEY ("template_stage_config_id") REFERENCES "public"."template_stage_configs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" DROP COLUMN "student_id";--> statement-breakpoint
ALTER TABLE "submissions" DROP COLUMN "project_stage_name";--> statement-breakpoint
ALTER TABLE "submissions" DROP COLUMN "instrument_type";