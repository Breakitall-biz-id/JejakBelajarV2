import { asc, eq, inArray } from "drizzle-orm"

import { db } from "@/db"
import {
  academicTerms,
  classes,
  userClassAssignments,
  projectTemplates,
  templateStageConfigs,
} from "@/db/schema/jejak"
import { user } from "@/db/schema/auth"

type TermRow = typeof academicTerms.$inferSelect
type ClassRow = typeof classes.$inferSelect
type UserRow = typeof user.$inferSelect
type TemplateRow = typeof projectTemplates.$inferSelect
type StageConfigRow = typeof templateStageConfigs.$inferSelect

export type ClassMembership = {
  id: string
  name: string
  termId: string
  termLabel: string
  termStatus: string
}

export type ProjectTemplate = {
  id: string
  templateName: string
  description: string | null
  isActive: boolean
  createdAt: string
  stageConfigs: Array<{
    id: string
    stageName: string
    instrumentType: string
    description: string | null
    estimatedDuration: string | null
    displayOrder: number
  }>
}

export type AdminDashboardData = {
  terms: Array<{
    id: string
    academicYear: string
    semester: string
    status: string
    startsAt: string | null
    endsAt: string | null
    createdAt: string
  }>
  classes: Array<{
    id: string
    name: string
    termId: string
    termYear: string
    termSemester: string
    termStatus: string
    createdAt: string
  }>
  teachers: Array<{
    id: string
    name: string | null
    email: string
    createdAt: string
  }>
  students: Array<{
    id: string
    name: string | null
    email: string
    createdAt: string
  }>
  assignments: Record<
    string,
    {
      teacherIds: string[]
      studentIds: string[]
    }
  >
  teacherClasses: Record<string, ClassMembership[]>
  studentClasses: Record<string, ClassMembership[]>
  templates: ProjectTemplate[]
}

const serializeDate = (value: Date | null) => value?.toISOString() ?? null

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const termRows = await db
    .select()
    .from(academicTerms)
    .orderBy(asc(academicTerms.academicYear), asc(academicTerms.semester))

  const classRows = await db
    .select()
    .from(classes)
    .orderBy(asc(classes.createdAt))

  const classTermMap = new Map<string, TermRow>(termRows.map((term) => [term.id, term]))

  const teacherRows = await db
    .select()
    .from(user)
    .where(eq(user.role, "TEACHER"))
    .orderBy(asc(user.name))

  const studentRows = await db
    .select()
    .from(user)
    .where(eq(user.role, "STUDENT"))
    .orderBy(asc(user.name))

  const classIds = classRows.map((row) => row.id)

  const assignmentRows = classIds.length
    ? await db
        .select({
          classId: userClassAssignments.classId,
          userId: userClassAssignments.userId,
          role: user.role,
        })
        .from(userClassAssignments)
        .innerJoin(user, eq(user.id, userClassAssignments.userId))
        .where(inArray(userClassAssignments.classId, classIds))
    : []

  const assignments: AdminDashboardData["assignments"] = {}
  for (const classId of classIds) {
    assignments[classId] = { teacherIds: [], studentIds: [] }
  }

  for (const entry of assignmentRows) {
    const bucket = assignments[entry.classId] ?? (assignments[entry.classId] = { teacherIds: [], studentIds: [] })
    if (entry.role === "TEACHER") {
      bucket.teacherIds.push(entry.userId)
    } else if (entry.role === "STUDENT") {
      bucket.studentIds.push(entry.userId)
    }
  }

  const teacherClasses: Record<string, ClassMembership[]> = {}
  const studentClasses: Record<string, ClassMembership[]> = {}

  for (const classItem of classRows) {
    const assignment = assignments[classItem.id]
    if (!assignment) continue

    const term = classTermMap.get(classItem.academicTermId)
    const membership: ClassMembership = {
      id: classItem.id,
      name: classItem.name,
      termId: classItem.academicTermId,
      termLabel: term
        ? `${term.academicYear} • Semester ${term.semester === "ODD" ? "Ganjil" : "Genap"}`
        : "Tahun ajaran belum ditentukan",
      termStatus: term?.status ?? "INACTIVE",
    }

    for (const teacherId of assignment.teacherIds) {
      const list = teacherClasses[teacherId] ?? (teacherClasses[teacherId] = [])
      list.push(membership)
    }

    for (const studentId of assignment.studentIds) {
      const list = studentClasses[studentId] ?? (studentClasses[studentId] = [])
      list.push(membership)
    }
  }

  // Query templates data
  const templateRows = await db
    .select()
    .from(projectTemplates)
    .orderBy(asc(projectTemplates.createdAt))

  const stageConfigRows = await db
    .select()
    .from(templateStageConfigs)
    .orderBy(asc(templateStageConfigs.displayOrder))

  const stageConfigsByTemplate = new Map<string, typeof stageConfigRows>()
  for (const config of stageConfigRows) {
    if (!stageConfigsByTemplate.has(config.templateId)) {
      stageConfigsByTemplate.set(config.templateId, [])
    }
    stageConfigsByTemplate.get(config.templateId)!.push(config)
  }

  const templates = templateRows.map((template) => ({
    id: template.id,
    templateName: template.templateName,
    description: template.description,
    isActive: template.isActive,
    createdAt: template.createdAt.toISOString(),
    stageConfigs: (stageConfigsByTemplate.get(template.id) || []).map((config) => ({
      id: config.id,
      stageName: config.stageName,
      instrumentType: config.instrumentType,
      description: config.description,
      estimatedDuration: config.estimatedDuration,
      displayOrder: config.displayOrder,
    })),
  }))

  return {
    terms: termRows.map((term) => ({
      id: term.id,
      academicYear: term.academicYear,
      semester: term.semester,
      status: term.status,
      startsAt: serializeDate(term.startsAt),
      endsAt: serializeDate(term.endsAt),
      createdAt: term.createdAt.toISOString(),
    })),
    classes: classRows.map((classItem) => {
      const term = classTermMap.get(classItem.academicTermId)
      return {
        id: classItem.id,
        name: classItem.name,
        termId: classItem.academicTermId,
        termYear: term?.academicYear ?? "",
        termSemester: term?.semester ?? "",
        termStatus: term?.status ?? "INACTIVE",
        createdAt: classItem.createdAt.toISOString(),
      }
    }),
    teachers: teacherRows.map(mapUserRow),
    students: studentRows.map(mapUserRow),
    assignments,
    teacherClasses,
    studentClasses,
    templates,
  }
}

function mapUserRow(row: UserRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.createdAt?.toISOString?.() ?? new Date().toISOString(),
  }
}

export async function getAdminTemplates(): Promise<ProjectTemplate[]> {
  const templates = await db
    .select({
      id: projectTemplates.id,
      templateName: projectTemplates.templateName,
      description: projectTemplates.description,
      isActive: projectTemplates.isActive,
      createdAt: projectTemplates.createdAt,
    })
    .from(projectTemplates)
    .orderBy(asc(projectTemplates.createdAt))

  const templateIds = templates.map(t => t.id)

  const stageConfigs = templateIds.length > 0
    ? await db
        .select({
          id: templateStageConfigs.id,
          templateId: templateStageConfigs.templateId,
          stageName: templateStageConfigs.stageName,
          instrumentType: templateStageConfigs.instrumentType,
          description: templateStageConfigs.description,
          estimatedDuration: templateStageConfigs.estimatedDuration,
          displayOrder: templateStageConfigs.displayOrder,
        })
        .from(templateStageConfigs)
        .where(inArray(templateStageConfigs.templateId, templateIds))
        .orderBy(asc(templateStageConfigs.displayOrder))
    : []

  const stageConfigsByTemplate = new Map<string, typeof stageConfigs>()
  for (const config of stageConfigs) {
    const list = stageConfigsByTemplate.get(config.templateId) || []
    list.push(config)
    stageConfigsByTemplate.set(config.templateId, list)
  }

  return templates.map(template => ({
    id: template.id,
    templateName: template.templateName,
    description: template.description,
    isActive: template.isActive,
    createdAt: template.createdAt.toISOString(),
    stageConfigs: (stageConfigsByTemplate.get(template.id) || []).map(config => ({
      id: config.id,
      stageName: config.stageName,
      instrumentType: config.instrumentType,
      description: config.description,
      estimatedDuration: config.estimatedDuration,
      displayOrder: config.displayOrder,
    })),
  }))
}
