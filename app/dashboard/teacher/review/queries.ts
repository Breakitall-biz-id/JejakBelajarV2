import { and, asc, eq, inArray } from "drizzle-orm"

import { db } from "@/db"
import {
  classes,
  groupMembers,
  groups,
  instrumentTypeEnum,
  projectStageInstruments,
  projectStageProgress,
  projectStages,
  projects,
  submissions,
  userClassAssignments,
} from "@/db/schema/jejak"
import { user } from "@/db/schema/auth"

import type { CurrentUser } from "@/lib/auth/session"

export type TeacherReviewData = {
  classes: Array<{
    id: string
    name: string
  }>
  classProjects: Record<
    string,
    Array<{
      id: string
      title: string
      stages: Array<{
        id: string
        name: string
        order: number
        instruments: Array<string>
        students: Array<{
          id: string
          name: string | null
          groupId: string | null
          groupName: string | null
          progress: {
            status: string
            unlockedAt: string | null
            completedAt: string | null
          }
          submissions: Array<{
            id: string
            instrumentType: string
            content: unknown
            score: number | null
            feedback: string | null
            submittedAt: string
          }>
        }>
      }>
    }>
  >
}

export async function getTeacherReviewData(teacher: CurrentUser): Promise<TeacherReviewData> {
  const assignedClasses = await db
    .select({
      classId: classes.id,
      className: classes.name,
    })
    .from(classes)
    .innerJoin(userClassAssignments, eq(classes.id, userClassAssignments.classId))
    .where(eq(userClassAssignments.userId, teacher.id))
    .orderBy(asc(classes.name))

  const classIds = assignedClasses.map((row) => row.classId)

  if (classIds.length === 0) {
    return { classes: [], classProjects: {} }
  }

  const projectsRows = await db
    .select({
      id: projects.id,
      classId: projects.classId,
      title: projects.title,
    })
    .from(projects)
    .where(
      and(
        eq(projects.teacherId, teacher.id),
        inArray(projects.classId, classIds),
      ),
    )
    .orderBy(asc(projects.classId), asc(projects.title))

  const projectIds = projectsRows.map((row) => row.id)

  if (projectIds.length === 0) {
    return {
      classes: assignedClasses.map((row) => ({ id: row.classId, name: row.className })),
      classProjects: {},
    }
  }

  const stageRows = await db
    .select({
      id: projectStages.id,
      projectId: projectStages.projectId,
      name: projectStages.name,
      order: projectStages.order,
    })
    .from(projectStages)
    .where(inArray(projectStages.projectId, projectIds))
    .orderBy(asc(projectStages.projectId), asc(projectStages.order))

  const instrumentRows = await db
    .select({
      projectStageId: projectStageInstruments.projectStageId,
      instrumentType: projectStageInstruments.instrumentType,
    })
    .from(projectStageInstruments)
    .where(inArray(projectStageInstruments.projectStageId, stageRows.map((stage) => stage.id)))

  const classStudentRows = await db
    .select({
      classId: userClassAssignments.classId,
      studentId: userClassAssignments.userId,
      studentName: user.name,
      studentEmail: user.email,
    })
    .from(userClassAssignments)
    .innerJoin(user, eq(user.id, userClassAssignments.userId))
    .where(
      and(
        inArray(userClassAssignments.classId, classIds),
        eq(user.role, "STUDENT"),
      ),
    )

  const studentIds = classStudentRows.map((row) => row.studentId)
  const stageIds = stageRows.map((row) => row.id)

  const progressRows = await db
    .select({
      id: projectStageProgress.id,
      projectStageId: projectStageProgress.projectStageId,
      studentId: projectStageProgress.studentId,
      status: projectStageProgress.status,
      unlockedAt: projectStageProgress.unlockedAt,
      completedAt: projectStageProgress.completedAt,
    })
    .from(projectStageProgress)
    .where(
      and(
        inArray(projectStageProgress.projectStageId, stageIds),
        inArray(projectStageProgress.studentId, studentIds),
      ),
    )

  const submissionRows = await db
    .select({
      id: submissions.id,
      studentId: submissions.studentId,
      projectStageId: submissions.projectStageId,
      instrumentType: submissions.instrumentType,
      score: submissions.score,
      feedback: submissions.feedback,
      content: submissions.content,
      submittedAt: submissions.submittedAt,
    })
    .from(submissions)
    .where(
      and(
        inArray(submissions.projectStageId, stageIds),
        inArray(submissions.studentId, studentIds),
      ),
    )

  const groupRows = await db
    .select({
      groupId: groups.id,
      groupName: groups.name,
      projectId: groups.projectId,
      studentId: groupMembers.studentId,
    })
    .from(groups)
    .innerJoin(groupMembers, eq(groups.id, groupMembers.groupId))
    .where(inArray(groups.projectId, projectIds))

  const classProjects: TeacherReviewData["classProjects"] = {}

  for (const project of projectsRows) {
    const stages = stageRows.filter((stage) => stage.projectId === project.id)
    const studentsInClass = classStudentRows
      .filter((row) => row.classId === project.classId)
      .map((row) => ({ id: row.studentId, name: row.studentName, email: row.studentEmail }))

    const stageData = stages.map((stage) => {
      const instruments = instrumentRows
        .filter((instrument) => instrument.projectStageId === stage.id)
        .map((instrument) => instrument.instrumentType)

      const students = studentsInClass.map((student) => {
        const progress = progressRows.find(
          (row) => row.projectStageId === stage.id && row.studentId === student.id,
        )

        const submissionsForStage = submissionRows.filter(
          (submission) => submission.projectStageId === stage.id && submission.studentId === student.id,
        )

        const groupMembership = groupRows.find(
          (group) => group.projectId === project.id && group.studentId === student.id,
        )

        return {
          id: student.id,
          name: student.name,
          groupId: groupMembership?.groupId ?? null,
          groupName: groupMembership?.groupName ?? null,
          progress: {
            status: progress?.status ?? "LOCKED",
            unlockedAt: progress?.unlockedAt?.toISOString() ?? null,
            completedAt: progress?.completedAt?.toISOString() ?? null,
          },
          submissions: submissionsForStage.map((submission) => ({
            id: submission.id,
            instrumentType: submission.instrumentType,
            content: submission.content,
            score: submission.score,
            feedback: submission.feedback,
            submittedAt: submission.submittedAt.toISOString(),
          })),
        }
      })

      return {
        id: stage.id,
        name: stage.name,
        order: stage.order,
        instruments,
        students,
      }
    })

    if (!classProjects[project.classId]) {
      classProjects[project.classId] = []
    }

    classProjects[project.classId].push({
      id: project.id,
      title: project.title,
      stages: stageData,
    })
  }

  return {
    classes: assignedClasses.map((row) => ({ id: row.classId, name: row.className })),
    classProjects,
  }
}
