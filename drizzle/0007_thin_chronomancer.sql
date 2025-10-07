CREATE TABLE "dimensions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"created_by_admin_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teacher_feedbacks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"feedback" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "template_journal_rubrics" ADD COLUMN "dimension_id" uuid;--> statement-breakpoint
ALTER TABLE "template_questions" ADD COLUMN "dimension_id" uuid;--> statement-breakpoint
ALTER TABLE "dimensions" ADD CONSTRAINT "dimensions_created_by_admin_id_users_id_fk" FOREIGN KEY ("created_by_admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_feedbacks" ADD CONSTRAINT "teacher_feedbacks_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_feedbacks" ADD CONSTRAINT "teacher_feedbacks_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_feedbacks" ADD CONSTRAINT "teacher_feedbacks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "dimensions_name_unique_idx" ON "dimensions" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "teacher_feedbacks_teacher_student_project_idx" ON "teacher_feedbacks" USING btree ("teacher_id","student_id","project_id");--> statement-breakpoint
CREATE INDEX "teacher_feedbacks_teacher_idx" ON "teacher_feedbacks" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "teacher_feedbacks_student_idx" ON "teacher_feedbacks" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "teacher_feedbacks_project_idx" ON "teacher_feedbacks" USING btree ("project_id");--> statement-breakpoint
ALTER TABLE "template_journal_rubrics" ADD CONSTRAINT "template_journal_rubrics_dimension_id_dimensions_id_fk" FOREIGN KEY ("dimension_id") REFERENCES "public"."dimensions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_questions" ADD CONSTRAINT "template_questions_dimension_id_dimensions_id_fk" FOREIGN KEY ("dimension_id") REFERENCES "public"."dimensions"("id") ON DELETE set null ON UPDATE no action;