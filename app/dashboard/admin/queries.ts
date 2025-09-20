import { asc, eq, inArray } from "drizzle-orm"

import { db } from "@/db"
import {
  academicTerms,
  classes,
  userClassAssignments,
} from "@/db/schema/jejak"
import { user } from "@/db/schema/auth"

type TermRow = typeof academicTerms.$inferSelect
type ClassRow = typeof classes.$inferSelect
type UserRow = typeof user.$inferSelect

export type ClassMembership = {
  id: string
  name: string
  termId: string
  termLabel: string
  termStatus: string
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
