import { and, asc, eq, inArray } from "drizzle-orm"

import { db } from "@/db"
import {
  academicTerms,
  classes,
  groupMembers,
  groups,
  projectStageInstruments,
  projectStages,
  projects,
  projectTemplates,
  templateStageConfigs,
  templateQuestions,
  userClassAssignments,
} from "@/db/schema/jejak"
import { user } from "@/db/schema/auth"

import type { CurrentUser } from "@/lib/auth/session"

export type ProjectTemplate = {
  id: string
  templateName: string
  description: string | null
  isActive: boolean
  stageConfigs: Array<{
    id: string
    stageName: string
    instrumentType: string
    displayOrder: number
    description: string | null
    estimatedDuration: string | null
  }>
}

export type TeacherDashboardData = {
  classes: Array<{
    id: string
    name: string
    academicYear: string
    semester: string
    termStatus: string
    termId: string
  }>
  projects: Array<{
    id: string
    title: string
    description: string | null
    theme: string | null
    status: string
    classId: string
    createdAt: string
    updatedAt: string
    stages: Array<{
      id: string
      name: string
      description: string | null
      order: number
      unlocksAt: string | null
      dueAt: string | null
      instruments: Array<{
        id: string
        instrumentType: string
        isRequired: boolean
      }>
    }>
    groups: Array<{
      id: string
      name: string
      members: Array<{
        studentId: string
        studentName: string | null
      }>
    }>
  }>
  studentsByClass: Record<
    string,
    Array<{
      studentId: string
      name: string | null
      email: string
    }>
  >
}

const serializeDate = (value: Date | null) => value?.toISOString() ?? null

export async function getTeacherDashboardData(
  teacher: CurrentUser,
): Promise<TeacherDashboardData> {
  const classRows = await db
    .select({
      classId: classes.id,
      className: classes.name,
      academicTermId: academicTerms.id,
      academicYear: academicTerms.academicYear,
      semester: academicTerms.semester,
      termStatus: academicTerms.status,
    })
    .from(classes)
    .innerJoin(userClassAssignments, eq(classes.id, userClassAssignments.classId))
    .innerJoin(academicTerms, eq(classes.academicTermId, academicTerms.id))
    .where(eq(userClassAssignments.userId, teacher.id))
    .orderBy(asc(academicTerms.academicYear), asc(classes.name))

  const classIds = classRows.map((row) => row.classId)

  const classMap = new Map(
    classRows.map((row) => [row.classId, {
      id: row.classId,
      name: row.className,
      academicYear: row.academicYear,
      semester: row.semester,
      termStatus: row.termStatus,
      termId: row.academicTermId,
    }]),
  )

  type ProjectRow = {
    id: string
    title: string
    description: string | null
    theme: string | null
    status: string
    classId: string
    createdAt: Date
    updatedAt: Date
  }

  let projectRows: ProjectRow[] = []

  if (classIds.length > 0) {
    projectRows = await db
      .select({
        id: projects.id,
        title: projects.title,
        description: projects.description,
        theme: projects.theme,
        status: projects.status,
        classId: projects.classId,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .where(
        and(
          eq(projects.teacherId, teacher.id),
          inArray(projects.classId, classIds),
        ),
      )
      .orderBy(asc(projects.createdAt))
  }

  const projectIds = projectRows.map((row) => row.id)

  type StudentRow = {
    classId: string
    studentId: string
    studentName: string | null
    studentEmail: string
  }

  const studentRows: StudentRow[] = classIds.length
    ? await db
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
            eq(user.role, "STUDENT" as const),
          ),
        )
    : []

  type StageRow = {
    id: string
    projectId: string
    name: string
    description: string | null
    order: number
    unlocksAt: Date | null
    dueAt: Date | null
  }

  const stageRows: StageRow[] = projectIds.length
    ? await db
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
    : []

  const stageIds = stageRows.map((row) => row.id)

  type InstrumentRow = {
    id: string
    projectStageId: string
    instrumentType: string
    isRequired: boolean
    description: string | null
  }

  const instrumentRows: InstrumentRow[] = stageIds.length
    ? await db
        .select({
          id: projectStageInstruments.id,
          projectStageId: projectStageInstruments.projectStageId,
          instrumentType: projectStageInstruments.instrumentType,
          isRequired: projectStageInstruments.isRequired,
          description: projectStageInstruments.description,
        })
        .from(projectStageInstruments)
        .where(inArray(projectStageInstruments.projectStageId, stageIds))
    : []

  type GroupRow = {
    id: string
    projectId: string
    name: string
  }

  const groupRows: GroupRow[] = projectIds.length
    ? await db
        .select({
          id: groups.id,
          projectId: groups.projectId,
          name: groups.name,
        })
        .from(groups)
        .where(inArray(groups.projectId, projectIds))
    : []

  const groupIds = groupRows.map((row) => row.id)

  type MemberRow = {
    groupId: string
    studentId: string
    studentName: string | null
  }

  const memberRows: MemberRow[] = groupIds.length
    ? await db
        .select({
          groupId: groupMembers.groupId,
          studentId: groupMembers.studentId,
          studentName: user.name,
        })
        .from(groupMembers)
        .innerJoin(user, eq(user.id, groupMembers.studentId))
        .where(inArray(groupMembers.groupId, groupIds))
    : []

  const instrumentsByStage = instrumentRows.reduce<Record<string, TeacherDashboardData["projects"][number]["stages"][number]["instruments"]>>(
    (acc, instrument) => {
      if (!acc[instrument.projectStageId]) {
        acc[instrument.projectStageId] = []
      }

      acc[instrument.projectStageId].push({
        id: instrument.id,
        instrumentType: instrument.instrumentType,
        isRequired: instrument.isRequired,
      })

      return acc
    },
    {},
  )

  const stagesByProject = stageRows.reduce<Record<string, TeacherDashboardData["projects"][number]["stages"]>>(
    (acc, stage) => {
      if (!acc[stage.projectId]) {
        acc[stage.projectId] = []
      }

        const existingStageIndex = acc[stage.projectId].findIndex(s => s.name === stage.name)

      if (existingStageIndex >= 0) {
        const existingStage = acc[stage.projectId][existingStageIndex]
        const newInstruments = instrumentsByStage[stage.id] ?? []

        const existingInstrumentTypes = new Set(existingStage.instruments.map(i => i.instrumentType))
        const uniqueNewInstruments = newInstruments.filter(i => !existingInstrumentTypes.has(i.instrumentType))

        existingStage.instruments = [...existingStage.instruments, ...uniqueNewInstruments]
      } else {
        acc[stage.projectId].push({
          id: stage.id,
          name: stage.name,
          description: stage.description,
          order: stage.order,
          unlocksAt: serializeDate(stage.unlocksAt),
          dueAt: serializeDate(stage.dueAt),
          instruments: instrumentsByStage[stage.id] ?? [],
        })
      }

      return acc
    },
    {},
  )

  const membersByGroup = memberRows.reduce<Record<string, TeacherDashboardData["projects"][number]["groups"][number]["members"]>>(
    (acc, member) => {
      if (!acc[member.groupId]) {
        acc[member.groupId] = []
      }

      acc[member.groupId].push({
        studentId: member.studentId,
        studentName: member.studentName,
      })

      return acc
    },
    {},
  )

  const groupsByProject = groupRows.reduce<Record<string, TeacherDashboardData["projects"][number]["groups"]>>(
    (acc, group) => {
      if (!acc[group.projectId]) {
        acc[group.projectId] = []
      }

      acc[group.projectId].push({
        id: group.id,
        name: group.name,
        members: membersByGroup[group.id] ?? [],
      })

      return acc
    },
    {},
  )

  const projectsPayload = projectRows.map((project) => ({
    id: project.id,
    title: project.title,
    description: project.description,
    theme: project.theme,
    status: project.status,
    classId: project.classId,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    stages: stagesByProject[project.id] ?? [],
    groups: groupsByProject[project.id] ?? [],
  }))

  const studentsByClass = studentRows.reduce<
    TeacherDashboardData["studentsByClass"]
  >((acc, row) => {
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

  return {
    classes: Array.from(classMap.values()),
    projects: projectsPayload,
    studentsByClass,
  }
}

export async function getProjectTemplates(): Promise<ProjectTemplate[]> {
  const templates = await db
    .select({
      id: projectTemplates.id,
      templateName: projectTemplates.templateName,
      description: projectTemplates.description,
      isActive: projectTemplates.isActive,
    })
    .from(projectTemplates)
    .where(eq(projectTemplates.isActive, true))
    .orderBy(asc(projectTemplates.templateName))

  const templateIds = templates.map((t) => t.id)

  const stageConfigs = await db
    .select({
      id: templateStageConfigs.id,
      templateId: templateStageConfigs.templateId,
      stageName: templateStageConfigs.stageName,
      instrumentType: templateStageConfigs.instrumentType,
      displayOrder: templateStageConfigs.displayOrder,
      description: templateStageConfigs.description,
      estimatedDuration: templateStageConfigs.estimatedDuration,
    })
    .from(templateStageConfigs)
    .where(inArray(templateStageConfigs.templateId, templateIds))
    .orderBy(asc(templateStageConfigs.templateId), asc(templateStageConfigs.displayOrder))

  const configsByTemplate = stageConfigs.reduce<
    Record<string, ProjectTemplate["stageConfigs"]>
  >((acc, config) => {
    if (!acc[config.templateId]) {
      acc[config.templateId] = []
    }
    acc[config.templateId].push({
      id: config.id,
      stageName: config.stageName,
      instrumentType: config.instrumentType,
      displayOrder: config.displayOrder,
      description: config.description,
      estimatedDuration: config.estimatedDuration,
    })
    return acc
  }, {})

  return templates.map((template) => ({
    id: template.id,
    templateName: template.templateName,
    description: template.description,
    isActive: template.isActive,
    stageConfigs: configsByTemplate[template.id] || [],
  }))
}
