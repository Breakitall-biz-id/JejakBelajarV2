import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  text,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const semesterEnum = pgEnum("semester", ["ODD", "EVEN"]);
export const termStatusEnum = pgEnum("term_status", ["ACTIVE", "INACTIVE"]);
export const projectStatusEnum = pgEnum("project_status", ["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const instrumentTypeEnum = pgEnum("instrument_type", [
  "JOURNAL",
  "SELF_ASSESSMENT",
  "PEER_ASSESSMENT",
  "OBSERVATION",
  "DAILY_NOTE",
]);
export const stageProgressStatusEnum = pgEnum("stage_progress_status", [
  "LOCKED",
  "IN_PROGRESS",
  "COMPLETED",
]);

export type Semester = (typeof semesterEnum.enumValues)[number];
export type TermStatus = (typeof termStatusEnum.enumValues)[number];
export type ProjectStatus = (typeof projectStatusEnum.enumValues)[number];
export type InstrumentType = (typeof instrumentTypeEnum.enumValues)[number];
export type StageProgressStatus = (typeof stageProgressStatusEnum.enumValues)[number];

// Additional types for the new template system
export type QuestionType = "STATEMENT" | "ESSAY_PROMPT";

export const academicTerms = pgTable(
  "academic_terms",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    academicYear: varchar("academic_year", { length: 10 }).notNull(),
    semester: semesterEnum("semester").notNull(),
    status: termStatusEnum("status").default("INACTIVE").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    uniqueness: uniqueIndex("academic_terms_year_semester_idx").on(
      table.academicYear,
      table.semester,
    ),
  }),
);

export const classes = pgTable(
  "classes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    academicTermId: uuid("academic_term_id")
      .references(() => academicTerms.id, { onDelete: "restrict" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    uniqueness: uniqueIndex("classes_name_term_idx").on(
      table.name,
      table.academicTermId,
    ),
  }),
);

export const userClassAssignments = pgTable(
  "user_class_assignments",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.userId, table.classId],
      name: "user_class_assignments_pkey",
    }),
  }),
);

// Assessment Dimensions (P5 Dimensions)
export const dimensions = pgTable(
  "dimensions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    createdByAdminId: uuid("created_by_admin_id").references(() => user.id, {
      onDelete: "set null"
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    uniqueness: uniqueIndex("dimensions_name_unique_idx").on(table.name),
  }),
);

// Project Templates (created by Admin)
export const projectTemplates = pgTable(
  "project_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    templateName: varchar("template_name", { length: 255 }).notNull().unique(),
    description: text("description"),
    createdById: uuid("created_by_id").references(() => user.id, { onDelete: "set null" }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
);

// Template Stage Configurations
export const templateStageConfigs = pgTable(
  "template_stage_configs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    templateId: uuid("template_id")
      .notNull()
      .references(() => projectTemplates.id, { onDelete: "cascade" }),
    stageName: varchar("stage_name", { length: 255 }).notNull(),
    instrumentType: instrumentTypeEnum("instrument_type").notNull(),
    displayOrder: integer("display_order").notNull(),
    description: text("description"),
    estimatedDuration: varchar("estimated_duration", { length: 50 }), // e.g., "2 weeks", "1 month"
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    uniqueness: uniqueIndex("template_stage_configs_template_order_idx").on(
      table.templateId,
      table.displayOrder,
    ),
  }),
);

// Template Questions (predefined questions for each instrument)
export const templateQuestions = pgTable(
  "template_questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    configId: uuid("config_id")
      .notNull()
      .references(() => templateStageConfigs.id, { onDelete: "cascade" }),
    questionText: text("question_text").notNull(),
    questionType: varchar("question_type", { length: 50 }).default("STATEMENT").notNull(), // STATEMENT, ESSAY_PROMPT
    scoringGuide: text("scoring_guide"), // For questionnaires: Always=4, Often=3, Sometimes=2, Never=1
    rubricCriteria: text("rubric_criteria"), // JSONB field for detailed rubric criteria per score level
    dimensionId: uuid("dimension_id").references(() => dimensions.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
);

// Dedicated table for journal rubrics with multi-indicator assessment
export const templateJournalRubrics = pgTable(
  "template_journal_rubrics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    configId: uuid("config_id")
      .notNull()
      .references(() => templateStageConfigs.id, { onDelete: "cascade" }),
    indicatorText: text("indicator_text").notNull(), // e.g., "Mengajukan pertanyaan terbuka..."
    criteria: jsonb("criteria").notNull(), // e.g., {"4": "Description for score 4", "3": "...", "2": "...", "1": "..."}
    dimensionId: uuid("dimension_id").references(() => dimensions.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
);

// Updated Projects table - now links to template
export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  theme: varchar("theme", { length: 255 }),
  classId: uuid("class_id")
    .notNull()
    .references(() => classes.id, { onDelete: "cascade" }),
  teacherId: uuid("teacher_id").references(() => user.id, { onDelete: "set null" }),
  templateId: uuid("template_id").references(() => projectTemplates.id, { onDelete: "restrict" }),
  status: projectStatusEnum("status").default("DRAFT").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const projectStages = pgTable(
  "project_stages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    order: integer("order").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    unlocksAt: timestamp("unlocks_at", { withTimezone: true }),
    dueAt: timestamp("due_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    uniqueness: uniqueIndex("project_stages_project_order_idx").on(
      table.projectId,
      table.order,
    ),
  }),
);

export const projectStageInstruments = pgTable(
  "project_stage_instruments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectStageId: uuid("project_stage_id")
      .notNull()
      .references(() => projectStages.id, { onDelete: "cascade" }),
    instrumentType: instrumentTypeEnum("instrument_type").notNull(),
    isRequired: boolean("is_required").default(true).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    uniqueness: uniqueIndex("project_stage_instruments_type_idx").on(
      table.projectStageId,
      table.instrumentType,
    ),
  }),
);

export const groups = pgTable("groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const groupMembers = pgTable(
  "group_members",
  {
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.groupId, table.studentId],
      name: "group_members_pkey",
    }),
  }),
);

export const groupComments = pgTable(
  "group_comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    targetMemberId: uuid("target_member_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    comment: text("comment").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    groupMemberIdx: index("group_comments_idx").on(table.groupId, table.targetMemberId),
  }),
);

export const projectStageProgress = pgTable(
  "project_stage_progress",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectStageId: uuid("project_stage_id")
      .notNull()
      .references(() => projectStages.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: stageProgressStatusEnum("status").default("LOCKED").notNull(),
    unlockedAt: timestamp("unlocked_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    uniqueness: uniqueIndex("project_stage_progress_student_stage_idx").on(
      table.projectStageId,
      table.studentId,
    ),
  }),
);

// Updated Submissions table - now works with template questions
export const submissions = pgTable("submissions", {
  id: uuid("id").defaultRandom().primaryKey(),

  submittedBy: varchar("submitted_by", { length: 50 }).notNull().default('STUDENT'), // STUDENT, TEACHER, ADMIN
  submittedById: uuid("submitted_by_id").notNull().references(() => user.id, { onDelete: "cascade" }),


  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),

  templateStageConfigId: uuid("template_stage_config_id")
    .references(() => templateStageConfigs.id, { onDelete: "set null" }),

  // For backward compatibility and flexibility
  projectStageId: uuid("project_stage_id")
    .references(() => projectStages.id, { onDelete: "set null" }),

  // Context information
  targetStudentId: uuid("target_student_id").references(() => user.id, {
    onDelete: "cascade",
  }),

  content: jsonb("content").notNull(),

  score: integer("score"), 
  feedback: text("feedback"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
  assessedBy: uuid("assessed_by").references(() => user.id, { onDelete: "set null" }),
  assessedAt: timestamp("assessed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
