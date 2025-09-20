import { and, eq, inArray } from "drizzle-orm"

import { db } from "@/db"
import {
  classes,
  projects,
  projectStages,
  projectStageProgress,
  submissions,
  userClassAssignments,
} from "@/db/schema/jejak"
import { user } from "@/db/schema/auth"
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
    return { classes: [], generatedAt: new Date().toISOString() }
  }

  const classIds = classRows.map((row) => row.classId)

  const projectsRows = await db
    .select({
      id: projects.id,
      classId: projects.classId,
    })
    .from(projects)
    .where(and(eq(projects.teacherId, teacher.id), inArray(projects.classId, classIds)))

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
          instrumentType: submissions.instrumentType,
          score: submissions.score,
          submittedAt: submissions.submittedAt,
        })
        .from(submissions)
        .innerJoin(projects, eq(submissions.projectId, projects.id))
        .where(and(inArray(projects.id, projectIds), inArray(submissions.instrumentType, TEACHER_GRADED_INSTRUMENTS)))
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

  return {
    classes: reportClasses,
    generatedAt: new Date().toISOString(),
  }
}
