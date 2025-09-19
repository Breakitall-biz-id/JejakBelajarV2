import {
  boolean,
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

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  theme: varchar("theme", { length: 255 }),
  classId: uuid("class_id")
    .notNull()
    .references(() => classes.id, { onDelete: "cascade" }),
  teacherId: uuid("teacher_id").references(() => user.id, { onDelete: "set null" }),
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

export const submissions = pgTable("submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  projectStageId: uuid("project_stage_id")
    .references(() => projectStages.id, { onDelete: "set null" }),
  projectStageName: varchar("project_stage_name", { length: 255 }).notNull(),
  instrumentType: instrumentTypeEnum("instrument_type").notNull(),
  targetStudentId: uuid("target_student_id").references(() => user.id, {
    onDelete: "cascade",
  }),
  content: jsonb("content"),
  score: integer("score"),
  feedback: text("feedback"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
  assessedBy: uuid("assessed_by").references(() => user.id, { onDelete: "set null" }),
  assessedAt: timestamp("assessed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
