import { and, asc, eq, inArray } from "drizzle-orm"

import { db } from "@/db"
import {
  academicTerms,
  classes,
  groupMembers,
  groups,
  projectStageInstruments,
  projectStageProgress,
  projectStages,
  projects,
  projectStatusEnum,
  submissions,
  userClassAssignments,
} from "@/db/schema/jejak"
import { user } from "@/db/schema/auth"
import { templateStageConfigs, templateQuestions } from "@/db/schema/jejak"
import type { CurrentUser } from "@/lib/auth/session"

type StageProgressRow = typeof projectStageProgress.$inferSelect

type StageRow = {
  id: string
  projectId: string
  name: string
  description: string | null
  order: number
  unlocksAt: Date | null
  dueAt: Date | null
}

type StudentSubmissionRow = {
  id: string
  stageId: string | null
  projectId: string
  instrumentType: string
  content: unknown
  submittedAt: Date
  targetStudentId: string | null
  targetStudentName: string | null
}

export type StudentDashboardData = {
  projects: Array<{
    id: string
    title: string
    description: string | null
    theme: string | null
    status: string
    class: {
      id: string
      name: string
      academicYear: string
      semester: string
    }
    teacher: {
      id: string | null
      name: string | null
      email: string | null
    }
    group: {
      id: string
      name: string
      members: Array<{
        studentId: string
        name: string | null
        email: string
      }>
    } | null
    stages: Array<{
      id: string
      name: string
      description: string | null
      order: number
      unlocksAt: string | null
      dueAt: string | null
      status: StageProgressRow["status"]
      requiredInstruments: Array<{
        id: string
        instrumentType: string
        isRequired: boolean
      }>
      submissions: Array<{
        id: string
        instrumentType: string
        content: unknown
        submittedAt: string
        targetStudentId: string | null
        targetStudentName: string | null
      }>
    }>
  }>
}

const studentInstrumentTypes = new Set([
  "JOURNAL",
  "SELF_ASSESSMENT",
  "PEER_ASSESSMENT",
  "DAILY_NOTE",
])

const serializeDate = (value: Date | null) => value?.toISOString() ?? null

export async function getStudentDashboardData(
  student: CurrentUser,
): Promise<StudentDashboardData> {
  const classRows = await db
    .select({
      classId: classes.id,
      className: classes.name,
      academicYear: academicTerms.academicYear,
      semester: academicTerms.semester,
      termStatus: academicTerms.status,
    })
    .from(classes)
    .innerJoin(userClassAssignments, eq(classes.id, userClassAssignments.classId))
    .innerJoin(academicTerms, eq(classes.academicTermId, academicTerms.id))
    .where(
      and(
        eq(userClassAssignments.userId, student.id),
        eq(academicTerms.status, "ACTIVE"),
      ),
    )

  if (classRows.length === 0) {
    return { projects: [] }
  }

  const classIds = classRows.map((row) => row.classId)
  const classMap = new Map(
    classRows.map((row) => [row.classId, {
      id: row.classId,
      name: row.className,
      academicYear: row.academicYear,
      semester: row.semester,
    }]),
  )

  const projectRows = await db
    .select({
      id: projects.id,
      title: projects.title,
      description: projects.description,
      theme: projects.theme,
      status: projects.status,
      classId: projects.classId,
      teacherId: projects.teacherId,
      teacherName: user.name,
      teacherEmail: user.email,
    })
    .from(projects)
    .leftJoin(user, eq(projects.teacherId, user.id))
    .where(
      and(
        eq(projects.status, "PUBLISHED" as (typeof projectStatusEnum.enumValues)[number]),
        inArray(projects.classId, classIds),
      ),
    )
    .orderBy(asc(projects.createdAt))

  if (projectRows.length === 0) {
    return { projects: [] }
  }

  const projectIds = projectRows.map((row) => row.id)

  const stageRows = await db
    .select({
      id: projectStages.id,
      projectId: projectStages.projectId,
      name: projectStages.name,
      description: projectStages.description,
      order: projectStages.order,
      unlocksAt: projectStages.unlocksAt,
      dueAt: projectStages.dueAt,
    })
    .from(projectStages)
    .where(inArray(projectStages.projectId, projectIds))
    .orderBy(asc(projectStages.projectId), asc(projectStages.order))

  const stageRowsByProject = stageRows.reduce<Record<string, StageRow[]>>((acc, row) => {
    if (!acc[row.projectId]) {
      acc[row.projectId] = []
    }
    acc[row.projectId].push(row)
    return acc
  }, {})

  const stageIds = stageRows.map((row) => row.id)

  const instrumentRows = stageIds.length
    ? await db
        .select({
          id: projectStageInstruments.id,
          projectStageId: projectStageInstruments.projectStageId,
          instrumentType: projectStageInstruments.instrumentType,
          isRequired: projectStageInstruments.isRequired,
        })
        .from(projectStageInstruments)
        .where(inArray(projectStageInstruments.projectStageId, stageIds))
    : []

  const instrumentsByStage = instrumentRows.reduce<Record<string, typeof instrumentRows>>((acc, instrument) => {
    if (!acc[instrument.projectStageId]) {
      acc[instrument.projectStageId] = []
    }
    acc[instrument.projectStageId].push(instrument)
    return acc
  }, {})

  const submissionRows: StudentSubmissionRow[] = await db
    .select({
      id: submissions.id,
      stageId: submissions.projectStageId,
      projectId: submissions.projectId,
      instrumentType: submissions.instrumentType,
      content: submissions.content,
      submittedAt: submissions.submittedAt,
      targetStudentId: submissions.targetStudentId,
      targetStudentName: user.name,
    })
    .from(submissions)
    .leftJoin(user, eq(user.id, submissions.targetStudentId))
    .where(
      and(
        eq(submissions.studentId, student.id),
        inArray(submissions.projectId, projectIds),
      ),
    )

  const submissionsByStage = submissionRows.reduce<Record<string, StudentSubmissionRow[]>>((acc, submission) => {
    if (!submission.stageId) {
      return acc
    }
    if (!acc[submission.stageId]) {
      acc[submission.stageId] = []
    }
    acc[submission.stageId].push(submission)
    return acc
  }, {})

  const studentGroupRows = await db
    .select({
      groupId: groups.id,
      projectId: groups.projectId,
      groupName: groups.name,
    })
    .from(groupMembers)
    .innerJoin(groups, eq(groups.id, groupMembers.groupId))
    .where(
      and(
        eq(groupMembers.studentId, student.id),
        inArray(groups.projectId, projectIds),
      ),
    )

  const groupIds = studentGroupRows.map((row) => row.groupId)

  const groupMemberRows = groupIds.length
    ? await db
        .select({
          groupId: groupMembers.groupId,
          studentId: groupMembers.studentId,
          studentName: user.name,
          studentEmail: user.email,
        })
        .from(groupMembers)
        .innerJoin(user, eq(user.id, groupMembers.studentId))
        .where(inArray(groupMembers.groupId, groupIds))
    : []

  const membersByGroup = groupMemberRows.reduce<Record<string, typeof groupMemberRows>>((acc, member) => {
    if (!acc[member.groupId]) {
      acc[member.groupId] = []
    }
    acc[member.groupId].push(member)
    return acc
  }, {})

  const studentsByClass = await fetchClassStudents(classIds)

  const studentProjects = [] as StudentDashboardData["projects"]

  for (const project of projectRows) {
    const stagesForProject = stageRowsByProject[project.id] ?? []
    const progressMap = await ensureStageProgressEntries(student.id, project.id, stagesForProject)

    const stageData = stagesForProject.map((stage) => {
      const progress = progressMap.get(stage.id)!
      const instruments = (instrumentsByStage[stage.id] ?? []).map((instrument) => ({
        id: instrument.id,
        instrumentType: instrument.instrumentType,
        isRequired: instrument.isRequired,
      }))

      const stageSubmissions = (submissionsByStage[stage.id] ?? []).map((submission) => ({
        id: submission.id,
        instrumentType: submission.instrumentType,
        content: submission.content,
        submittedAt: submission.submittedAt.toISOString(),
        targetStudentId: submission.targetStudentId,
        targetStudentName: submission.targetStudentName,
      }))

      return {
        id: stage.id,
        name: stage.name,
        description: stage.description,
        order: stage.order,
        unlocksAt: serializeDate(stage.unlocksAt),
        dueAt: serializeDate(stage.dueAt),
        status: progress.status,
        requiredInstruments: instruments,
        submissions: stageSubmissions,
      }
    })

    const studentGroup = studentGroupRows.find((row) => row.projectId === project.id)
    const groupMembersList = studentGroup ? (membersByGroup[studentGroup.groupId] ?? []) : []

    studentProjects.push({
      id: project.id,
      title: project.title,
      description: project.description,
      theme: project.theme,
      status: project.status,
      class: classMap.get(project.classId)!,
      teacher: {
        id: project.teacherId,
        name: project.teacherName,
        email: project.teacherEmail,
      },
      group: studentGroup
        ? {
            id: studentGroup.groupId,
            name: studentGroup.groupName,
            members: groupMembersList.map((member) => ({
              studentId: member.studentId,
              name: member.studentName,
              email: member.studentEmail,
            })),
          }
        : null,
      stages: stageData,
    })
  }

  return { projects: studentProjects }
}

async function ensureStageProgressEntries(
  studentId: string,
  projectId: string,
  stages: StageRow[],
): Promise<Map<string, StageProgressRow>> {
  if (stages.length === 0) {
    return new Map()
  }

  const sortedStages = [...stages].sort((a, b) => a.order - b.order)

  return db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(projectStageProgress)
      .where(
        and(
          eq(projectStageProgress.studentId, studentId),
          inArray(projectStageProgress.projectStageId, sortedStages.map((stage) => stage.id)),
        ),
      )

    const progressMap = new Map(existing.map((row) => [row.projectStageId, row]))

    let encounteredIncomplete = false

    for (const stage of sortedStages) {
      const current = progressMap.get(stage.id)

      if (!current) {
        const status = encounteredIncomplete ? "LOCKED" : "IN_PROGRESS"
        const unlockedAt = status === "IN_PROGRESS" ? new Date() : null
        const [created] = await tx
          .insert(projectStageProgress)
          .values({
            projectStageId: stage.id,
            studentId,
            status,
            unlockedAt,
          })
          .returning()

        progressMap.set(stage.id, created)
        if (status === "IN_PROGRESS") {
          encounteredIncomplete = true
        }
        continue
      }

      if (current.status === "COMPLETED") {
        continue
      }

      if (!encounteredIncomplete) {
        if (current.status !== "IN_PROGRESS") {
          const [updated] = await tx
            .update(projectStageProgress)
            .set({
              status: "IN_PROGRESS",
              unlockedAt: current.unlockedAt ?? new Date(),
              updatedAt: new Date(),
            })
            .where(eq(projectStageProgress.id, current.id))
            .returning()

          progressMap.set(stage.id, updated)
        } else if (!current.unlockedAt) {
          const [updated] = await tx
            .update(projectStageProgress)
            .set({ unlockedAt: new Date(), updatedAt: new Date() })
            .where(eq(projectStageProgress.id, current.id))
            .returning()

          progressMap.set(stage.id, updated)
        }

        encounteredIncomplete = true
      } else if (current.status !== "LOCKED") {
        const [updated] = await tx
          .update(projectStageProgress)
          .set({ status: "LOCKED", unlockedAt: null, updatedAt: new Date() })
          .where(eq(projectStageProgress.id, current.id))
          .returning()

        progressMap.set(stage.id, updated)
      }
    }

    const finalRows = await tx
      .select()
      .from(projectStageProgress)
      .where(
        and(
          eq(projectStageProgress.studentId, studentId),
          inArray(projectStageProgress.projectStageId, sortedStages.map((stage) => stage.id)),
        ),
      )

    return new Map(finalRows.map((row) => [row.projectStageId, row]))
  })
}

async function fetchClassStudents(classIds: string[]) {
  if (classIds.length === 0) {
    return {} as Record<
      string,
      Array<{
        studentId: string
        name: string | null
        email: string
      }>
    >
  }

  const rows = await db
    .select({
      classId: userClassAssignments.classId,
      studentId: userClassAssignments.userId,
      studentName: user.name,
      studentEmail: user.email,
      role: user.role,
    })
    .from(userClassAssignments)
    .innerJoin(user, eq(user.id, userClassAssignments.userId))
    .where(
      and(
        inArray(userClassAssignments.classId, classIds),
        eq(user.role, "STUDENT"),
      ),
    )

  return rows.reduce<Record<
    string,
    Array<{
      studentId: string
      name: string | null
      email: string
    }>
  >>((acc, row) => {
    if (!acc[row.classId]) {
      acc[row.classId] = []
    }
    acc[row.classId].push({
      studentId: row.studentId,
      name: row.studentName,
      email: row.studentEmail,
    })
    return acc
  }, {})
}

export async function getTemplateQuestions(stageId: string): Promise<Array<{
  id: string
  questionText: string
  questionType: string
  scoringGuide?: string
}>> {
  const questions = await db
    .select({
      id: templateQuestions.id,
      questionText: templateQuestions.questionText,
      questionType: templateQuestions.questionType,
      scoringGuide: templateQuestions.scoringGuide,
    })
    .from(templateQuestions)
    .innerJoin(templateStageConfigs, eq(templateQuestions.configId, templateStageConfigs.id))
    .innerJoin(projectStages, eq(templateStageConfigs.id, projectStages.templateStageConfigId))
    .where(eq(projectStages.id, stageId))
    .orderBy(asc(templateQuestions.id))

  return questions
}
