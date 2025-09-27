import { and, eq, inArray, isNotNull } from "drizzle-orm"

import { db } from "@/db"
import {
  classes,
  groups,
  groupMembers,
  projects,
  projectStages,
  projectStageProgress,
  submissions,
  templateStageConfigs,
  userClassAssignments,
} from "@/db/schema/jejak"
import { user } from "@/db/schema/auth"
import { user as targetStudent } from "@/db/schema/auth"
import type { CurrentUser } from "@/lib/auth/session"

export type TeacherReportData = {
  classes: Array<{
    id: string
    name: string
    totalStudents: number
    totalProjects: number
    totalStages: number
    completedAssignments: number
    completionRate: number
    averageScores: {
      observation: number | null
      journal: number | null
      dailyNote: number | null
    }
    lastSubmissionAt: string | null
  }>
  peerAssessments: Array<{
    id: string
    projectId: string
    stageId: string
    projectTitle: string
    stageName: string
    groupName: string
    className: string
    members: Array<{
      id: string
      name: string
    }>
    submissions: Array<{
      id: string
      assessorName: string
      targetStudentName: string
      answers: number[]
      submittedAt: string
    }>
  }>
  generatedAt: string
}

type MetricsAccumulator = {
  id: string
  name: string
  totalStudents: number
  totalProjects: number
  totalStages: number
  completedAssignments: number
  scoreSums: {
    observation: number
    journal: number
    dailyNote: number
  }
  scoreCounts: {
    observation: number
    journal: number
    dailyNote: number
  }
  lastSubmission: Date | null
}

const TEACHER_GRADED_INSTRUMENTS = ["OBSERVATION", "JOURNAL", "DAILY_NOTE"] as const

export async function getTeacherReportData(teacher: CurrentUser): Promise<TeacherReportData> {
  const classRows = await db
    .select({
      classId: classes.id,
      className: classes.name,
    })
    .from(classes)
    .innerJoin(userClassAssignments, eq(classes.id, userClassAssignments.classId))
    .where(eq(userClassAssignments.userId, teacher.id))
    .orderBy(classes.name)

  if (classRows.length === 0) {
    return { classes: [], peerAssessments: [], generatedAt: new Date().toISOString() }
  }

  const classIds = classRows.map((row) => row.classId)

  const projectsRows = await db
    .select({
      id: projects.id,
      classId: projects.classId,
    })
    .from(projects)
    .where(inArray(projects.classId, classIds))

  const projectIds = projectsRows.map((row) => row.id)

  const stageRows = projectIds.length
    ? await db
        .select({
          stageId: projectStages.id,
          projectId: projectStages.projectId,
          classId: projects.classId,
        })
        .from(projectStages)
        .innerJoin(projects, eq(projectStages.projectId, projects.id))
        .where(inArray(projectStages.projectId, projectIds))
    : []

  const studentRows = await db
    .select({
      classId: userClassAssignments.classId,
      userId: userClassAssignments.userId,
      role: user.role,
    })
    .from(userClassAssignments)
    .innerJoin(user, eq(user.id, userClassAssignments.userId))
    .where(and(inArray(userClassAssignments.classId, classIds), eq(user.role, "STUDENT")))

  const progressRows = projectIds.length
    ? await db
        .select({
          classId: projects.classId,
          status: projectStageProgress.status,
          projectStageId: projectStageProgress.projectStageId,
        })
        .from(projectStageProgress)
        .innerJoin(projectStages, eq(projectStageProgress.projectStageId, projectStages.id))
        .innerJoin(projects, eq(projectStages.projectId, projects.id))
        .where(inArray(projects.id, projectIds))
    : []

  const submissionRows = projectIds.length
    ? await db
        .select({
          classId: projects.classId,
          instrumentType: templateStageConfigs.instrumentType,
          score: submissions.score,
          submittedAt: submissions.submittedAt,
        })
        .from(submissions)
        .innerJoin(templateStageConfigs, eq(submissions.templateStageConfigId, templateStageConfigs.id))
        .innerJoin(projects, eq(submissions.projectId, projects.id))
        .where(and(inArray(projects.id, projectIds), inArray(templateStageConfigs.instrumentType, TEACHER_GRADED_INSTRUMENTS)))
    : []

  const metricsMap = new Map<string, MetricsAccumulator>()

  for (const row of classRows) {
    metricsMap.set(row.classId, {
      id: row.classId,
      name: row.className,
      totalStudents: 0,
      totalProjects: 0,
      totalStages: 0,
      completedAssignments: 0,
      scoreSums: { observation: 0, journal: 0, dailyNote: 0 },
      scoreCounts: { observation: 0, journal: 0, dailyNote: 0 },
      lastSubmission: null,
    })
  }

  for (const row of studentRows) {
    const metrics = metricsMap.get(row.classId)
    if (metrics) {
      metrics.totalStudents += 1
    }
  }

  for (const row of projectsRows) {
    const metrics = metricsMap.get(row.classId)
    if (metrics) {
      metrics.totalProjects += 1
    }
  }

  for (const row of stageRows) {
    const metrics = metricsMap.get(row.classId)
    if (metrics) {
      metrics.totalStages += 1
    }
  }

  for (const row of progressRows) {
    if (row.status !== "COMPLETED") {
      continue
    }

    const metrics = metricsMap.get(row.classId)
    if (metrics) {
      metrics.completedAssignments += 1
    }
  }

  for (const row of submissionRows) {
    const metrics = metricsMap.get(row.classId)
    if (!metrics || row.score === null) {
      continue
    }

    const instrument = row.instrumentType as (typeof TEACHER_GRADED_INSTRUMENTS)[number]

    switch (instrument) {
      case "OBSERVATION":
        metrics.scoreSums.observation += row.score
        metrics.scoreCounts.observation += 1
        break
      case "JOURNAL":
        metrics.scoreSums.journal += row.score
        metrics.scoreCounts.journal += 1
        break
      case "DAILY_NOTE":
        metrics.scoreSums.dailyNote += row.score
        metrics.scoreCounts.dailyNote += 1
        break
    }

    if (!metrics.lastSubmission || metrics.lastSubmission < row.submittedAt) {
      metrics.lastSubmission = row.submittedAt
    }
  }

  const reportClasses = Array.from(metricsMap.values()).map((metrics) => {
    const totalStageAssignments = metrics.totalStages * metrics.totalStudents
    const completionRate = totalStageAssignments > 0
      ? Math.round((metrics.completedAssignments / totalStageAssignments) * 100)
      : 0

    const averageScores = {
      observation: metrics.scoreCounts.observation > 0
        ? Number((metrics.scoreSums.observation / metrics.scoreCounts.observation).toFixed(2))
        : null,
      journal: metrics.scoreCounts.journal > 0
        ? Number((metrics.scoreSums.journal / metrics.scoreCounts.journal).toFixed(2))
        : null,
      dailyNote: metrics.scoreCounts.dailyNote > 0
        ? Number((metrics.scoreSums.dailyNote / metrics.scoreCounts.dailyNote).toFixed(2))
        : null,
    }

    return {
      id: metrics.id,
      name: metrics.name,
      totalStudents: metrics.totalStudents,
      totalProjects: metrics.totalProjects,
      totalStages: metrics.totalStages,
      completedAssignments: metrics.completedAssignments,
      completionRate,
      averageScores,
      lastSubmissionAt: metrics.lastSubmission ? metrics.lastSubmission.toISOString() : null,
    }
  })

  // Query peer assessment data - simplified approach
  const peerAssessmentSubmissions = classIds.length > 0
    ? await db
        .select({
          submissionId: submissions.id,
          submittedById: submissions.submittedById,
          targetStudentId: submissions.targetStudentId,
          projectId: submissions.projectId,
          projectStageId: submissions.projectStageId,
          answers: submissions.content,
          submittedAt: submissions.submittedAt,
        })
        .from(submissions)
        .innerJoin(templateStageConfigs, eq(submissions.templateStageConfigId, templateStageConfigs.id))
        .innerJoin(projectStages, eq(submissions.projectStageId, projectStages.id))
        .innerJoin(projects, eq(submissions.projectId, projects.id))
        .where(
          and(
            inArray(projects.classId, classIds),
            eq(templateStageConfigs.instrumentType, "PEER_ASSESSMENT"),
            isNotNull(submissions.targetStudentId)
          )
        )
        .orderBy(projects.title, projectStages.name, submissions.submittedAt)
    : []

  // Get additional data for peer assessments
  const peerAssessmentProjectIds = [...new Set(peerAssessmentSubmissions.map(s => s.projectId))]
  const projectData = peerAssessmentProjectIds.length > 0
    ? await db
        .select({
          id: projects.id,
          title: projects.title,
          classId: projects.classId,
        })
        .from(projects)
        .where(inArray(projects.id, peerAssessmentProjectIds))
    : []

  const stageIds = [...new Set(peerAssessmentSubmissions.map(s => s.projectStageId).filter(Boolean))]
  const stageData = stageIds.length > 0
    ? await db
        .select({
          id: projectStages.id,
          name: projectStages.name,
        })
        .from(projectStages)
        .where(inArray(projectStages.id, stageIds as string[]))
    : []

  const userIds = [...new Set([
    ...peerAssessmentSubmissions.map(s => s.submittedById),
    ...peerAssessmentSubmissions.map(s => s.targetStudentId).filter((id): id is string => Boolean(id))
  ])]
  const userData = userIds.length > 0
    ? await db
        .select({
          id: user.id,
          name: user.name,
        })
        .from(user)
        .where(inArray(user.id, userIds))
    : []

  // Create lookup maps
  const projectMap = new Map(projectData.map(p => [p.id, p]))
  const stageMap = new Map(stageData.map(s => [s.id, s]))
  const userMap = new Map(userData.map(u => [u.id, u]))

  // Get class data
  const classIdsSet = new Set(projectData.map(p => p.classId))
  const classData = classIdsSet.size > 0
    ? await db
        .select({
          id: classes.id,
          name: classes.name,
        })
        .from(classes)
        .where(inArray(classes.id, Array.from(classIdsSet)))
    : []
  const classMap = new Map(classData.map(c => [c.id, c]))

  // Process peer assessment data
  const peerAssessmentsMap = new Map<string, {
    id: string
    projectId: string
    stageId: string
    projectTitle: string
    stageName: string
    className: string
    groupName: string
    members: Array<{ id: string, name: string }>
    submissions: Array<{
      id: string
      assessorName: string
      targetStudentName: string
      answers: number[]
      submittedAt: string
    }>
  }>()

  for (const submission of peerAssessmentSubmissions) {
    const key = `${submission.projectId}-${submission.projectStageId}`

    if (!peerAssessmentsMap.has(key)) {
      const project = projectMap.get(submission.projectId)
      const stage = stageMap.get(submission.projectStageId || "")
      const projectClass = project ? classMap.get(project.classId) : undefined

      // Get group members (simplified - assume all users in this project/stage are group members)
      const members = userData
        .filter(u => peerAssessmentSubmissions.some(s =>
          s.projectId === submission.projectId &&
          (s.submittedById === u.id || s.targetStudentId === u.id)
        ))
        .map(u => ({ id: u.id, name: u.name || "" }))

      peerAssessmentsMap.set(key, {
        id: key,
        projectId: submission.projectId,
        stageId: submission.projectStageId || "",
        projectTitle: project?.title || "Unknown Project",
        stageName: stage?.name || "Unknown Stage",
        className: projectClass?.name || "Unknown Class",
        groupName: `Group ${key.slice(-4)}`,
        members,
        submissions: []
      })
    }

    const assessment = peerAssessmentsMap.get(key)!
    if (submission.answers && typeof submission.answers === 'object' && 'answers' in submission.answers && Array.isArray(submission.answers.answers)) {
      assessment.submissions.push({
        id: submission.submissionId,
        assessorName: userMap.get(submission.submittedById)?.name || "Unknown",
        targetStudentName: userMap.get(submission.targetStudentId || "")?.name || "Unknown",
        answers: submission.answers.answers,
        submittedAt: submission.submittedAt.toISOString()
      })
    }
  }

  const peerAssessments = Array.from(peerAssessmentsMap.values()).map(assessment => ({
    id: assessment.id,
    projectId: assessment.projectId,
    stageId: assessment.stageId,
    projectTitle: assessment.projectTitle,
    stageName: assessment.stageName,
    groupName: assessment.groupName,
    className: assessment.className,
    members: assessment.members,
    submissions: assessment.submissions
  }))

  return {
    classes: reportClasses,
    peerAssessments,
    generatedAt: new Date().toISOString(),
  }
}
