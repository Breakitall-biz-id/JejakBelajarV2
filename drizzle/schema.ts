import { pgTable, foreignKey, unique, uuid, text, timestamp, uniqueIndex, varchar, integer, boolean, jsonb, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const instrumentType = pgEnum("instrument_type", ['JOURNAL', 'SELF_ASSESSMENT', 'PEER_ASSESSMENT', 'OBSERVATION', 'DAILY_NOTE'])
export const projectStatus = pgEnum("project_status", ['DRAFT', 'PUBLISHED', 'ARCHIVED'])
export const semester = pgEnum("semester", ['ODD', 'EVEN'])
export const stageProgressStatus = pgEnum("stage_progress_status", ['LOCKED', 'IN_PROGRESS', 'COMPLETED'])
export const termStatus = pgEnum("term_status", ['ACTIVE', 'INACTIVE'])
export const userRole = pgEnum("user_role", ['ADMIN', 'TEACHER', 'STUDENT'])


export const sessions = pgTable("sessions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	token: text().notNull(),
	userId: uuid("user_id").notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "sessions_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("sessions_token_unique").on(table.token),
]);

export const academicTerms = pgTable("academic_terms", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	academicYear: varchar("academic_year", { length: 10 }).notNull(),
	semester: semester().notNull(),
	status: termStatus().default('INACTIVE').notNull(),
	startsAt: timestamp("starts_at", { withTimezone: true, mode: 'string' }),
	endsAt: timestamp("ends_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("academic_terms_year_semester_idx").using("btree", table.academicYear.asc().nullsLast().op("text_ops"), table.semester.asc().nullsLast().op("text_ops")),
]);

export const classes = pgTable("classes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	academicTermId: uuid("academic_term_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("classes_name_term_idx").using("btree", table.name.asc().nullsLast().op("text_ops"), table.academicTermId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.academicTermId],
			foreignColumns: [academicTerms.id],
			name: "classes_academic_term_id_academic_terms_id_fk"
		}).onDelete("restrict"),
]);

export const verifications = pgTable("verifications", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const projectStageProgress = pgTable("project_stage_progress", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	projectStageId: uuid("project_stage_id").notNull(),
	studentId: uuid("student_id").notNull(),
	status: stageProgressStatus().default('LOCKED').notNull(),
	unlockedAt: timestamp("unlocked_at", { withTimezone: true, mode: 'string' }),
	completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("project_stage_progress_student_stage_idx").using("btree", table.projectStageId.asc().nullsLast().op("uuid_ops"), table.studentId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.projectStageId],
			foreignColumns: [projectStages.id],
			name: "project_stage_progress_project_stage_id_project_stages_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [users.id],
			name: "project_stage_progress_student_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const projectStages = pgTable("project_stages", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	projectId: uuid("project_id").notNull(),
	order: integer().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	unlocksAt: timestamp("unlocks_at", { withTimezone: true, mode: 'string' }),
	dueAt: timestamp("due_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("project_stages_project_order_idx").using("btree", table.projectId.asc().nullsLast().op("int4_ops"), table.order.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "project_stages_project_id_projects_id_fk"
		}).onDelete("cascade"),
]);

export const projects = pgTable("projects", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	theme: varchar({ length: 255 }),
	classId: uuid("class_id").notNull(),
	teacherId: uuid("teacher_id"),
	status: projectStatus().default('DRAFT').notNull(),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
	archivedAt: timestamp("archived_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	templateId: uuid("template_id"),
}, (table) => [
	foreignKey({
			columns: [table.classId],
			foreignColumns: [classes.id],
			name: "projects_class_id_classes_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.teacherId],
			foreignColumns: [users.id],
			name: "projects_teacher_id_users_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.templateId],
			foreignColumns: [projectTemplates.id],
			name: "projects_template_id_project_templates_id_fk"
		}).onDelete("restrict"),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	role: userRole().default('STUDENT').notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const groups = pgTable("groups", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	projectId: uuid("project_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "groups_project_id_projects_id_fk"
		}).onDelete("cascade"),
]);

export const submissions = pgTable("submissions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	studentId: uuid("student_id"),
	projectId: uuid("project_id").notNull(),
	projectStageId: uuid("project_stage_id"),
	targetStudentId: uuid("target_student_id"),
	content: jsonb().notNull(),
	score: integer(),
	feedback: text(),
	submittedAt: timestamp("submitted_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	assessedBy: uuid("assessed_by"),
	assessedAt: timestamp("assessed_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	templateStageConfigId: uuid("template_stage_config_id"),
	submittedBy: varchar("submitted_by", { length: 50 }).default('STUDENT').notNull(),
	submittedById: uuid("submitted_by_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [users.id],
			name: "submissions_student_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "submissions_project_id_projects_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.projectStageId],
			foreignColumns: [projectStages.id],
			name: "submissions_project_stage_id_project_stages_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.targetStudentId],
			foreignColumns: [users.id],
			name: "submissions_target_student_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.assessedBy],
			foreignColumns: [users.id],
			name: "submissions_assessed_by_users_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.submittedById],
			foreignColumns: [users.id],
			name: "submissions_submitted_by_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.templateStageConfigId],
			foreignColumns: [templateStageConfigs.id],
			name: "submissions_template_stage_config_id_template_stage_configs_id_"
		}).onDelete("set null"),
]);

export const projectStageInstruments = pgTable("project_stage_instruments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	projectStageId: uuid("project_stage_id").notNull(),
	instrumentType: instrumentType("instrument_type").notNull(),
	isRequired: boolean("is_required").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	description: text(),
}, (table) => [
	uniqueIndex("project_stage_instruments_type_idx").using("btree", table.projectStageId.asc().nullsLast().op("uuid_ops"), table.instrumentType.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.projectStageId],
			foreignColumns: [projectStages.id],
			name: "project_stage_instruments_project_stage_id_project_stages_id_fk"
		}).onDelete("cascade"),
]);

export const accounts = pgTable("accounts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: uuid("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true, mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true, mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "accounts_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const projectTemplates = pgTable("project_templates", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	templateName: varchar("template_name", { length: 255 }).notNull(),
	description: text(),
	createdById: uuid("created_by_id"),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdById],
			foreignColumns: [users.id],
			name: "project_templates_created_by_id_users_id_fk"
		}).onDelete("set null"),
	unique("project_templates_template_name_unique").on(table.templateName),
]);

export const templateStageConfigs = pgTable("template_stage_configs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	templateId: uuid("template_id").notNull(),
	stageName: varchar("stage_name", { length: 255 }).notNull(),
	instrumentType: instrumentType("instrument_type").notNull(),
	displayOrder: integer("display_order").notNull(),
	description: text(),
	estimatedDuration: varchar("estimated_duration", { length: 50 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("template_stage_configs_template_order_idx").using("btree", table.templateId.asc().nullsLast().op("int4_ops"), table.displayOrder.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.templateId],
			foreignColumns: [projectTemplates.id],
			name: "template_stage_configs_template_id_project_templates_id_fk"
		}).onDelete("cascade"),
]);

export const templateQuestions = pgTable("template_questions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	configId: uuid("config_id").notNull(),
	questionText: text("question_text").notNull(),
	questionType: varchar("question_type", { length: 50 }).default('STATEMENT').notNull(),
	scoringGuide: text("scoring_guide"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	rubricCriteria: text("rubric_criteria"),
}, (table) => [
	foreignKey({
			columns: [table.configId],
			foreignColumns: [templateStageConfigs.id],
			name: "template_questions_config_id_template_stage_configs_id_fk"
		}).onDelete("cascade"),
]);

export const groupMembers = pgTable("group_members", {
	groupId: uuid("group_id").notNull(),
	studentId: uuid("student_id").notNull(),
	joinedAt: timestamp("joined_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.groupId],
			foreignColumns: [groups.id],
			name: "group_members_group_id_groups_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [users.id],
			name: "group_members_student_id_users_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.groupId, table.studentId], name: "group_members_pkey"}),
]);

export const userClassAssignments = pgTable("user_class_assignments", {
	userId: uuid("user_id").notNull(),
	classId: uuid("class_id").notNull(),
	assignedAt: timestamp("assigned_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_class_assignments_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.classId],
			foreignColumns: [classes.id],
			name: "user_class_assignments_class_id_classes_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.userId, table.classId], name: "user_class_assignments_pkey"}),
]);
