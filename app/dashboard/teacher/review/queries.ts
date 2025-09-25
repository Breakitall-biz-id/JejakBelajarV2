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
  templateStageConfigs,
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
        description: string | null
        unlocksAt: Date | null
        dueAt: Date | null
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
      description: projectStages.description,
      unlocksAt: projectStages.unlocksAt,
      dueAt: projectStages.dueAt,
    })
    .from(projectStages)
    .where(inArray(projectStages.projectId, projectIds))
    .orderBy(asc(projectStages.projectId), asc(projectStages.order))

  const instrumentRows = await db
    .select({
      projectStageId: projectStageInstruments.projectStageId,
      instrumentType: projectStageInstruments.instrumentType,
      description: projectStageInstruments.description,
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
      instrumentType: templateStageConfigs.instrumentType,
      score: submissions.score,
      feedback: submissions.feedback,
      content: submissions.content,
      submittedAt: submissions.submittedAt,
    })
    .from(submissions)
    .innerJoin(templateStageConfigs, eq(submissions.templateStageConfigId, templateStageConfigs.id))
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
    const stages = stageRows ? stageRows.filter((stage) => stage.projectId === project.id) : []
    const studentsInClass = classStudentRows
      ? classStudentRows
        .filter((row) => row.classId === project.classId)
        .map((row) => ({ id: row.studentId, name: row.studentName, email: row.studentEmail }))
      : []

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
            submittedAt: submission.submittedAt ? submission.submittedAt.toISOString() : new Date().toISOString(),
          })),
        }
      })

      return {
        id: stage.id,
        name: stage.name,
        order: stage.order,
        description: stage.description,
        unlocksAt: stage.unlocksAt,
        dueAt: stage.dueAt,
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

export type ProjectDetailData = {
  id: string
  title: string
  description?: string
  stages: Array<{
    id: string
    name: string
    description: string | null
    order: number
    unlocksAt: Date | null
    dueAt: Date | null
    status: string
    requiredInstruments: Array<{
      id: string
      instrumentType: string
      isRequired: boolean
      description?: string | null
    }>
    submissionsByInstrument: Record<string, unknown[]>
    students: Array<{
      id: string
      name: string | null
      groupName?: string | null
      groupId?: string | null
      progress: { status: string }
      submissions: Array<{
        id: string
        instrumentType: string
        content: unknown
        submittedAt: string
        score?: number | null
        feedback?: string | null
      }>
    }>
  }>
  group?: {
    members: Array<{
      studentId: string
      name: string | null
      email: string | null
    }>
  }
}

export async function getProjectDetail(classId: string, projectId: string, teacher: CurrentUser): Promise<ProjectDetailData | null> {
  // Verify teacher has access to this class
  const classAccess = await db
    .select({ id: classes.id })
    .from(classes)
    .innerJoin(userClassAssignments, eq(classes.id, userClassAssignments.classId))
    .where(
      and(
        eq(classes.id, classId),
        eq(userClassAssignments.userId, teacher.id)
      )
    )
    .limit(1)

  if (classAccess.length === 0) {
    return null
  }

  // Get project details
  const projectRow = await db
    .select({
      id: projects.id,
      title: projects.title,
      description: projects.description,
    })
    .from(projects)
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.classId, classId),
        eq(projects.teacherId, teacher.id)
      )
    )
    .limit(1)

  if (projectRow.length === 0) {
    return null
  }

  const project = projectRow[0]

  // Get stages for this project
  const stageRows = await db
    .select({
      id: projectStages.id,
      name: projectStages.name,
      order: projectStages.order,
      description: projectStages.description,
      unlocksAt: projectStages.unlocksAt,
      dueAt: projectStages.dueAt,
    })
    .from(projectStages)
    .where(eq(projectStages.projectId, projectId))
    .orderBy(asc(projectStages.order))

  const stageIds = stageRows.map(stage => stage.id)

  // Get instruments for each stage
  const instrumentRows = await db
    .select({
      projectStageId: projectStageInstruments.projectStageId,
      instrumentType: projectStageInstruments.instrumentType,
      description: projectStageInstruments.description,
      isRequired: projectStageInstruments.isRequired,
    })
    .from(projectStageInstruments)
    .where(inArray(projectStageInstruments.projectStageId, stageIds))

  // Get students in this class
  const studentRows = await db
    .select({
      studentId: user.id,
      studentName: user.name,
      studentEmail: user.email,
    })
    .from(user)
    .innerJoin(userClassAssignments, eq(user.id, userClassAssignments.userId))
    .where(
      and(
        eq(userClassAssignments.classId, classId),
        eq(user.role, "STUDENT")
      )
    )

  const studentIds = studentRows.map(row => row.studentId)

  // Get progress data
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
        inArray(projectStageProgress.studentId, studentIds)
      )
    )

  // Get submissions
  const submissionRows = await db
    .select({
      id: submissions.id,
      studentId: submissions.studentId,
      projectStageId: submissions.projectStageId,
      instrumentType: templateStageConfigs.instrumentType,
      score: submissions.score,
      feedback: submissions.feedback,
      content: submissions.content,
      submittedAt: submissions.submittedAt,
    })
    .from(submissions)
    .innerJoin(templateStageConfigs, eq(submissions.templateStageConfigId, templateStageConfigs.id))
    .where(
      and(
        inArray(submissions.projectStageId, stageIds),
        inArray(submissions.studentId, studentIds)
      )
    )

  // Get group data
  let groupRows: Array<{
    groupId: string
    groupName: string | null
    studentId: string
  }> = []

  try {
    const result = await db
      .select({
        groupId: groups.id,
        groupName: groups.name,
        studentId: groupMembers.studentId,
      })
      .from(groups)
      .innerJoin(groupMembers, eq(groups.id, groupMembers.groupId))
      .where(eq(groups.projectId, projectId))

    groupRows = result
  } catch {
    // Continue without group data if table doesn't exist
  }

  // Transform data
  const stages = stageRows.map(stage => {
    const instruments = instrumentRows
      .filter(instrument => instrument.projectStageId === stage.id)
      .map(instrument => ({
        id: `${instrument.instrumentType.toLowerCase()}-${stage.id}`,
        instrumentType: instrument.instrumentType,
        isRequired: instrument.isRequired,
        description: instrument.description,
      }))

    const students = studentRows.map(student => {
      const progress = progressRows.find(
        p => p.projectStageId === stage.id && p.studentId === student.studentId
      )

      const submissionsForStudent = submissionRows.filter(
        s => s.projectStageId === stage.id && s.studentId === student.studentId
      )

      const groupMembership = groupRows.find(
        g => g.studentId === student.studentId
      )

      return {
        id: student.studentId,
        name: student.studentName,
        groupId: groupMembership?.groupId,
        groupName: groupMembership?.groupName,
        progress: {
          status: progress?.status || "LOCKED"
        },
        submissions: submissionsForStudent.map(submission => ({
          id: submission.id,
          instrumentType: submission.instrumentType,
          content: submission.content,
          submittedAt: submission.submittedAt?.toISOString() || new Date().toISOString(),
          score: submission.score,
          feedback: submission.feedback,
        }))
      }
    })

    const submissionsByInstrument = students.reduce((acc, student) => {
      student.submissions.forEach(submission => {
        if (!acc[submission.instrumentType]) {
          acc[submission.instrumentType] = []
        }
        acc[submission.instrumentType].push(submission)
      })
      return acc
    }, {} as Record<string, unknown[]>)

    return {
      id: stage.id,
      name: stage.name,
      description: stage.description,
      order: stage.order,
      unlocksAt: stage.unlocksAt,
      dueAt: stage.dueAt,
      status: "IN_PROGRESS", // Default status
      requiredInstruments: instruments,
      submissionsByInstrument,
      students,
    }
  })

  // Get group members
  const groupMembersMap = new Map<string, Array<{ studentId: string; name: string | null; email: string | null }>>()
  groupRows.forEach(row => {
    if (!groupMembersMap.has(row.groupId)) {
      groupMembersMap.set(row.groupId, [])
    }
    groupMembersMap.get(row.groupId)!.push({
      studentId: row.studentId,
      name: studentRows.find(s => s.studentId === row.studentId)?.studentName,
      email: studentRows.find(s => s.studentId === row.studentId)?.studentEmail,
    })
  })

  const groups = Array.from(groupMembersMap.entries()).map(([groupId, members]) => ({
    id: groupId,
    name: groupRows.find(r => r.groupId === groupId)?.groupName || "Unknown Group",
    members,
  }))

  return {
    id: project.id,
    title: project.title,
    description: project.description || undefined,
    stages,
    group: groups.length > 0 ? {
      members: groups.flatMap(g => g.members)
    } : undefined,
  }
}
