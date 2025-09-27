import { relations } from "drizzle-orm/relations";
import { users, sessions, academicTerms, classes, projectStages, projectStageProgress, projects, projectTemplates, groups, submissions, templateStageConfigs, projectStageInstruments, accounts, templateQuestions, templateJournalRubrics, groupMembers, userClassAssignments } from "./schema";

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	sessions: many(sessions),
	projectStageProgresses: many(projectStageProgress),
	projects: many(projects),
	submissions_studentId: many(submissions, {
		relationName: "submissions_studentId_users_id"
	}),
	submissions_targetStudentId: many(submissions, {
		relationName: "submissions_targetStudentId_users_id"
	}),
	submissions_assessedBy: many(submissions, {
		relationName: "submissions_assessedBy_users_id"
	}),
	submissions_submittedById: many(submissions, {
		relationName: "submissions_submittedById_users_id"
	}),
	accounts: many(accounts),
	projectTemplates: many(projectTemplates),
	groupMembers: many(groupMembers),
	userClassAssignments: many(userClassAssignments),
}));

export const classesRelations = relations(classes, ({one, many}) => ({
	academicTerm: one(academicTerms, {
		fields: [classes.academicTermId],
		references: [academicTerms.id]
	}),
	projects: many(projects),
	userClassAssignments: many(userClassAssignments),
}));

export const academicTermsRelations = relations(academicTerms, ({many}) => ({
	classes: many(classes),
}));

export const projectStageProgressRelations = relations(projectStageProgress, ({one}) => ({
	projectStage: one(projectStages, {
		fields: [projectStageProgress.projectStageId],
		references: [projectStages.id]
	}),
	user: one(users, {
		fields: [projectStageProgress.studentId],
		references: [users.id]
	}),
}));

export const projectStagesRelations = relations(projectStages, ({one, many}) => ({
	projectStageProgresses: many(projectStageProgress),
	project: one(projects, {
		fields: [projectStages.projectId],
		references: [projects.id]
	}),
	submissions: many(submissions),
	projectStageInstruments: many(projectStageInstruments),
}));

export const projectsRelations = relations(projects, ({one, many}) => ({
	projectStages: many(projectStages),
	class: one(classes, {
		fields: [projects.classId],
		references: [classes.id]
	}),
	user: one(users, {
		fields: [projects.teacherId],
		references: [users.id]
	}),
	projectTemplate: one(projectTemplates, {
		fields: [projects.templateId],
		references: [projectTemplates.id]
	}),
	groups: many(groups),
	submissions: many(submissions),
}));

export const projectTemplatesRelations = relations(projectTemplates, ({one, many}) => ({
	projects: many(projects),
	user: one(users, {
		fields: [projectTemplates.createdById],
		references: [users.id]
	}),
	templateStageConfigs: many(templateStageConfigs),
}));

export const groupsRelations = relations(groups, ({one, many}) => ({
	project: one(projects, {
		fields: [groups.projectId],
		references: [projects.id]
	}),
	groupMembers: many(groupMembers),
}));

export const submissionsRelations = relations(submissions, ({one}) => ({
	user_studentId: one(users, {
		fields: [submissions.studentId],
		references: [users.id],
		relationName: "submissions_studentId_users_id"
	}),
	project: one(projects, {
		fields: [submissions.projectId],
		references: [projects.id]
	}),
	projectStage: one(projectStages, {
		fields: [submissions.projectStageId],
		references: [projectStages.id]
	}),
	user_targetStudentId: one(users, {
		fields: [submissions.targetStudentId],
		references: [users.id],
		relationName: "submissions_targetStudentId_users_id"
	}),
	user_assessedBy: one(users, {
		fields: [submissions.assessedBy],
		references: [users.id],
		relationName: "submissions_assessedBy_users_id"
	}),
	user_submittedById: one(users, {
		fields: [submissions.submittedById],
		references: [users.id],
		relationName: "submissions_submittedById_users_id"
	}),
	templateStageConfig: one(templateStageConfigs, {
		fields: [submissions.templateStageConfigId],
		references: [templateStageConfigs.id]
	}),
}));

export const templateStageConfigsRelations = relations(templateStageConfigs, ({one, many}) => ({
	submissions: many(submissions),
	projectTemplate: one(projectTemplates, {
		fields: [templateStageConfigs.templateId],
		references: [projectTemplates.id]
	}),
	templateQuestions: many(templateQuestions),
	templateJournalRubrics: many(templateJournalRubrics),
}));

export const projectStageInstrumentsRelations = relations(projectStageInstruments, ({one}) => ({
	projectStage: one(projectStages, {
		fields: [projectStageInstruments.projectStageId],
		references: [projectStages.id]
	}),
}));

export const accountsRelations = relations(accounts, ({one}) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	}),
}));

export const templateQuestionsRelations = relations(templateQuestions, ({one}) => ({
	templateStageConfig: one(templateStageConfigs, {
		fields: [templateQuestions.configId],
		references: [templateStageConfigs.id]
	}),
}));

export const templateJournalRubricsRelations = relations(templateJournalRubrics, ({one}) => ({
	templateStageConfig: one(templateStageConfigs, {
		fields: [templateJournalRubrics.configId],
		references: [templateStageConfigs.id]
	}),
}));

export const groupMembersRelations = relations(groupMembers, ({one}) => ({
	group: one(groups, {
		fields: [groupMembers.groupId],
		references: [groups.id]
	}),
	user: one(users, {
		fields: [groupMembers.studentId],
		references: [users.id]
	}),
}));

export const userClassAssignmentsRelations = relations(userClassAssignments, ({one}) => ({
	user: one(users, {
		fields: [userClassAssignments.userId],
		references: [users.id]
	}),
	class: one(classes, {
		fields: [userClassAssignments.classId],
		references: [classes.id]
	}),
}));