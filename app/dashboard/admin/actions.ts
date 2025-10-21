"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { and, eq, ne, inArray, sql } from "drizzle-orm"

import { db } from "@/db"
import {
  academicTerms,
  classes,
  semesterEnum,
  termStatusEnum,
  userClassAssignments,
  projectTemplates,
  templateStageConfigs,
  templateQuestions,
  templateJournalRubrics,
} from "@/db/schema/jejak"
import { user } from "@/db/schema/auth"
import {
  ForbiddenError,
  UnauthorizedError,
  requireAdminUser,
} from "@/lib/auth/session"
import { auth } from "@/lib/auth"
import {
  createClassroomSchema,
  updateClassroomSchema,
} from "./classroom-schemas"
import { parseStudentImportExcel, ParsedStudent } from "@/lib/utils/excel-parser"
import { generateUniqueEmail, generateDefaultPassword } from "@/lib/utils/email-generator"
import { generateStudentExportExcel, generateStudentCredentialsExcel } from "@/lib/utils/student-export"

const DASHBOARD_ADMIN_PATH = "/dashboard/admin"

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

const semesterSchema = z.enum(semesterEnum.enumValues)
const termStatusSchema = z.enum(termStatusEnum.enumValues)

const baseTermSchema = z.object({
  academicYear: z
    .string()
    .trim()
    .regex(/^[0-9]{4}\/[0-9]{4}$/, "Format must be YYYY/YYYY."),
  semester: semesterSchema,
  startsAt: z.string().trim().optional().nullable(),
  endsAt: z.string().trim().optional().nullable(),
})

const createTermSchema = baseTermSchema.extend({
  setActive: z.boolean().optional().default(false),
})

const updateTermSchema = baseTermSchema.extend({
  id: z.string().uuid(),
  status: termStatusSchema.optional(),
  setActive: z.boolean().optional(),
})

const deleteTermSchema = z.object({ termId: z.string().uuid() })
const deleteClassSchema = z.object({ classId: z.string().uuid() })
const setActiveSchema = z.object({ termId: z.string().uuid() })

const userRoleSchema = z.enum(["TEACHER", "STUDENT"])

const createAccountSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  email: z.string().trim().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: userRoleSchema,
})

const updateAccountSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().trim().min(1, "Name is required").max(255),
  role: userRoleSchema,
})

const deleteAccountSchema = z.object({ userId: z.string().uuid() })

const setTeacherAssignmentsSchema = z.object({
  classId: z.string().uuid(),
  teacherIds: z.array(z.string().uuid()).optional().default([]),
})

const setStudentAssignmentsSchema = z.object({
  classId: z.string().uuid(),
  studentIds: z.array(z.string().uuid()).optional().default([]),
})

const instrumentTypeSchema = z.enum([
  "JOURNAL",
  "SELF_ASSESSMENT",
  "PEER_ASSESSMENT",
  "OBSERVATION",
] as const)

const stageConfigSchema = z.object({
  id: z.string().uuid().optional(),
  stageName: z.string().min(1, "Stage name is required"),
  instrumentType: instrumentTypeSchema,
  description: z.string().optional(),
  estimatedDuration: z.string().optional(),
  displayOrder: z.number().min(1).optional(),
})

const createTemplateSchema = z.object({
  templateName: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
  stageConfigs: z.array(stageConfigSchema).min(1, "At least one stage configuration is required"),
})

const updateTemplateSchema = z.object({
  templateId: z.string().uuid(),
  templateName: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  stageConfigs: z.array(stageConfigSchema).min(1, "At least one stage configuration is required").optional(),
})

const deleteTemplateSchema = z.object({ templateId: z.string().uuid() })

const toggleTemplateStatusSchema = z.object({ templateId: z.string().uuid() })

const toDate = (value?: string | null) => {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  const date = new Date(trimmed)
  if (Number.isNaN(date.valueOf())) return null
  return date
}

const handleError = (error: unknown, fallback: string): ActionResult => {
  if (error instanceof UnauthorizedError) {
    return { success: false, error: "You must be signed in to continue." }
  }

  if (error instanceof ForbiddenError) {
    return { success: false, error: "Only school administrators can perform this action." }
  }

  // Handle Better Auth errors
  if (error && typeof error === 'object' && 'message' in error) {
    const errorMessage = (error as any).message

    // Better Auth specific error messages
    if (errorMessage.includes('Invalid password')) {
      return {
        success: false,
        error: "Password yang dimasukkan tidak valid. Pastikan password memenuhi syarat keamanan."
      }
    }

    if (errorMessage.includes('Email already exists')) {
      return {
        success: false,
        error: "Email ini sudah terdaftar di sistem. Silakan gunakan email yang berbeda."
      }
    }

    if (errorMessage.includes('Invalid email')) {
      return {
        success: false,
        error: "Format email tidak valid. Silakan periksa kembali alamat email Anda."
      }
    }

    if (errorMessage.includes('Password too short')) {
      return {
        success: false,
        error: "Password terlalu pendek. Gunakan minimal 8 karakter."
      }
    }
  }

  // Handle Postgres duplicate key error
  if (error && typeof error === 'object' && 'code' in error) {
    const postgresError = error as any
    if (postgresError.code === '23505') {
      // Extract constraint name and table name from error
      const constraintName = postgresError.constraint_name || 'unknown constraint'
      const tableName = postgresError.table_name || 'table'

      // Provide user-friendly messages based on constraint
      if (constraintName.includes('academic_terms_year_semester')) {
        return {
          success: false,
          error: "Tahun ajaran dengan periode ini sudah ada. Silakan gunakan tahun ajaran atau semester yang berbeda."
        }
      }

      if (constraintName.includes('classes_name_term')) {
        return {
          success: false,
          error: "Nama kelas ini sudah ada untuk tahun ajaran yang dipilih. Silakan gunakan nama yang berbeda."
        }
      }

      if (constraintName.includes('users_email_unique')) {
        return {
          success: false,
          error: "Email ini sudah terdaftar. Silakan gunakan email yang berbeda."
        }
      }

      // Generic duplicate key message
      return {
        success: false,
        error: `Data yang Anda masukkan sudah ada di sistem. Silakan periksa kembali data Anda.`
      }
    }

    // Handle foreign key constraint errors
    if (postgresError.code === '23503') {
      return {
        success: false,
        error: "Data terkait tidak ditemukan. Silakan periksa referensi data Anda."
      }
    }

    // Handle not null constraint errors
    if (postgresError.code === '23502') {
      return {
        success: false,
        error: "Ada data yang wajib diisi. Silakan periksa kembali formulir Anda."
      }
    }
  }

  console.error(fallback, error)
  return { success: false, error: fallback }
}

export async function createAcademicTerm(
  values: z.input<typeof createTermSchema>,
): Promise<ActionResult> {
  const parsed = createTermSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Please double-check the term details.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    await requireAdminUser()

    await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(academicTerms)
        .values({
          academicYear: parsed.data.academicYear,
          semester: parsed.data.semester,
          status: parsed.data.setActive ? "ACTIVE" : "INACTIVE",
          startsAt: toDate(parsed.data.startsAt),
          endsAt: toDate(parsed.data.endsAt),
        })
        .returning({ id: academicTerms.id })

      if (parsed.data.setActive && created) {
        await tx
          .update(academicTerms)
          .set({ status: "INACTIVE" })
          .where(
            and(
              eq(academicTerms.status, "ACTIVE"),
              ne(academicTerms.id, created.id),
            ),
          )

        await tx
          .update(academicTerms)
          .set({ status: "ACTIVE" })
          .where(eq(academicTerms.id, created.id))
      }
    })

    revalidatePath(DASHBOARD_ADMIN_PATH)

    return { success: true }
  } catch (error) {
    return handleError(error, "Failed to create academic term.")
  }
}

export async function updateAcademicTerm(
  values: z.input<typeof updateTermSchema>,
): Promise<ActionResult> {
  const parsed = updateTermSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Please resolve the highlighted issues before saving.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    await requireAdminUser()

    await db.transaction(async (tx) => {
      const updatePayload: Partial<typeof academicTerms.$inferInsert> = {
        academicYear: parsed.data.academicYear,
        semester: parsed.data.semester,
        startsAt: toDate(parsed.data.startsAt),
        endsAt: toDate(parsed.data.endsAt),
      }

      if (parsed.data.status) {
        updatePayload.status = parsed.data.status
      }

      await tx
        .update(academicTerms)
        .set(updatePayload)
        .where(eq(academicTerms.id, parsed.data.id))

      if (parsed.data.setActive) {
        await tx
          .update(academicTerms)
          .set({ status: "INACTIVE" })
          .where(
            and(
              eq(academicTerms.status, "ACTIVE"),
              ne(academicTerms.id, parsed.data.id),
            ),
          )

        await tx
          .update(academicTerms)
          .set({ status: "ACTIVE" })
          .where(eq(academicTerms.id, parsed.data.id))
      }
    })

    revalidatePath(DASHBOARD_ADMIN_PATH)

    return { success: true }
  } catch (error) {
    return handleError(error, "Failed to update academic term.")
  }
}

export async function deleteAcademicTerm(
  values: z.input<typeof deleteTermSchema>,
): Promise<ActionResult> {
  const parsed = deleteTermSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid academic term identifier.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    await requireAdminUser()

    await db.delete(academicTerms).where(eq(academicTerms.id, parsed.data.termId))

    revalidatePath(DASHBOARD_ADMIN_PATH)

    return { success: true }
  } catch (error) {
    return handleError(error, "Unable to delete the academic term.")
  }
}

export async function setActiveAcademicTerm(
  values: z.input<typeof setActiveSchema>,
): Promise<ActionResult> {
  const parsed = setActiveSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid academic term identifier.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    await requireAdminUser()

    await db.transaction(async (tx) => {
      await tx
        .update(academicTerms)
        .set({ status: "INACTIVE" })
        .where(eq(academicTerms.status, "ACTIVE"))

      await tx
        .update(academicTerms)
        .set({ status: "ACTIVE" })
        .where(eq(academicTerms.id, parsed.data.termId))
    })

    revalidatePath(DASHBOARD_ADMIN_PATH)

    return { success: true }
  } catch (error) {
    return handleError(error, "Unable to activate the selected term.")
  }
}

export async function createClassroom(
  values: z.input<typeof createClassroomSchema>,
): Promise<ActionResult> {
  const parsed = createClassroomSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Please review the class details.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    await requireAdminUser()

    await db.transaction(async (tx) => {
      const teacherIds = Array.from(new Set(parsed.data.teacherIds))
      const studentIds = Array.from(new Set(parsed.data.studentIds))

      const [created] = await tx
        .insert(classes)
        .values({
          name: parsed.data.name,
          academicTermId: parsed.data.termId,
        })
        .returning({ id: classes.id })

      if (!created) {
        throw new Error("Failed to persist class record")
      }

      const assignmentPayload = [
        ...teacherIds.map((userId) => ({ classId: created.id, userId })),
        ...studentIds.map((userId) => ({ classId: created.id, userId })),
      ]

      if (assignmentPayload.length > 0) {
        await tx
          .insert(userClassAssignments)
          .values(assignmentPayload)
          .onConflictDoNothing()
      }
    })

    revalidatePath(DASHBOARD_ADMIN_PATH)

    return { success: true }
  } catch (error) {
    return handleError(error, "Failed to create class.")
  }
}

export async function updateClassroom(
  values: z.input<typeof updateClassroomSchema>,
): Promise<ActionResult> {
  const parsed = updateClassroomSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Please review the class details.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    await requireAdminUser()

    await db.transaction(async (tx) => {
      await tx
        .update(classes)
        .set({
          name: parsed.data.name,
          academicTermId: parsed.data.termId,
        })
        .where(eq(classes.id, parsed.data.id))

      await tx
        .delete(userClassAssignments)
        .where(eq(userClassAssignments.classId, parsed.data.id))

      const teacherIds = Array.from(new Set(parsed.data.teacherIds))
      const studentIds = Array.from(new Set(parsed.data.studentIds))

      const assignmentPayload = [
        ...teacherIds.map((userId) => ({ classId: parsed.data.id, userId })),
        ...studentIds.map((userId) => ({ classId: parsed.data.id, userId })),
      ]

      if (assignmentPayload.length > 0) {
        await tx
          .insert(userClassAssignments)
          .values(assignmentPayload)
          .onConflictDoNothing()
      }
    })

    revalidatePath(DASHBOARD_ADMIN_PATH)

    return { success: true }
  } catch (error) {
    return handleError(error, "Failed to update class information.")
  }
}

export async function deleteClassroom(
  values: z.input<typeof deleteClassSchema>,
): Promise<ActionResult> {
  const parsed = deleteClassSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid class identifier.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    await requireAdminUser()

    await db.delete(classes).where(eq(classes.id, parsed.data.classId))

    revalidatePath(DASHBOARD_ADMIN_PATH)

    return { success: true }
  } catch (error) {
    return handleError(error, "Unable to delete the class.")
  }
}

export async function createAccount(
  values: z.input<typeof createAccountSchema>,
): Promise<ActionResult> {
  const parsed = createAccountSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Please review the account details.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    await requireAdminUser()
    const { email, password, name, role } = parsed.data

    const response = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    })

    const createdUser = response?.user

    if (!createdUser?.id) {
      // Handle Better Auth specific errors
      if (response && typeof response === 'object' && 'error' in response) {
        const authError = response as any
        if (authError.error?.message) {
          throw new Error(authError.error.message)
        }
      }
      throw new Error("Pembuatan akun gagal. Periksa kembali data yang dimasukkan.")
    }

    await db
      .update(user)
      .set({ role })
      .where(eq(user.id, createdUser.id))

    revalidatePath(DASHBOARD_ADMIN_PATH)
    return { success: true }
  } catch (error) {
    return handleError(error, "Unable to create account. Ensure the email is unique.")
  }
}

export async function updateAccount(
  values: z.input<typeof updateAccountSchema>,
): Promise<ActionResult> {
  const parsed = updateAccountSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid account payload.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    await requireAdminUser()

    await db
      .update(user)
      .set({ name: parsed.data.name, role: parsed.data.role })
      .where(eq(user.id, parsed.data.userId))

    revalidatePath(DASHBOARD_ADMIN_PATH)

    return { success: true }
  } catch (error) {
    return handleError(error, "Unable to update account.")
  }
}

export async function deleteAccount(
  values: z.input<typeof deleteAccountSchema>,
): Promise<ActionResult> {
  const parsed = deleteAccountSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid account identifier.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    await requireAdminUser()

    await db.delete(user).where(eq(user.id, parsed.data.userId))

    revalidatePath(DASHBOARD_ADMIN_PATH)

    return { success: true }
  } catch (error) {
    return handleError(error, "Unable to delete account.")
  }
}

export async function setTeacherAssignments(
  values: z.input<typeof setTeacherAssignmentsSchema>,
): Promise<ActionResult> {
  const parsed = setTeacherAssignmentsSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid teacher assignment payload.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    await requireAdminUser()

    const teacherIds = Array.from(new Set(parsed.data.teacherIds))

    await db.transaction(async (tx) => {
      const existing = await tx
        .select({ userId: userClassAssignments.userId })
        .from(userClassAssignments)
        .innerJoin(user, eq(user.id, userClassAssignments.userId))
        .where(
          and(
            eq(userClassAssignments.classId, parsed.data.classId),
            eq(user.role, "TEACHER"),
          ),
        )

      const existingIds = existing.map((row) => row.userId)

      if (existingIds.length > 0) {
        await tx
          .delete(userClassAssignments)
          .where(
            and(
              eq(userClassAssignments.classId, parsed.data.classId),
              inArray(userClassAssignments.userId, existingIds),
            ),
          )
      }

      if (teacherIds.length > 0) {
        await tx
          .insert(userClassAssignments)
          .values(
            teacherIds.map((teacherId) => ({
              classId: parsed.data.classId,
              userId: teacherId,
            })),
          )
          .onConflictDoNothing()
      }
    })

    revalidatePath(DASHBOARD_ADMIN_PATH)

    return { success: true }
  } catch (error) {
    return handleError(error, "Unable to update teacher assignments.")
  }
}

export async function setStudentAssignments(
  values: z.input<typeof setStudentAssignmentsSchema>,
): Promise<ActionResult> {
  const parsed = setStudentAssignmentsSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid student assignment payload.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    await requireAdminUser()

    const studentIds = Array.from(new Set(parsed.data.studentIds))

    await db.transaction(async (tx) => {
      const existing = await tx
        .select({ userId: userClassAssignments.userId })
        .from(userClassAssignments)
        .innerJoin(user, eq(user.id, userClassAssignments.userId))
        .where(
          and(
            eq(userClassAssignments.classId, parsed.data.classId),
            eq(user.role, "STUDENT"),
          ),
        )

      const existingIds = existing.map((row) => row.userId)

      if (existingIds.length > 0) {
        await tx
          .delete(userClassAssignments)
          .where(
            and(
              eq(userClassAssignments.classId, parsed.data.classId),
              inArray(userClassAssignments.userId, existingIds),
            ),
          )
      }

      if (studentIds.length > 0) {
        await tx
          .insert(userClassAssignments)
          .values(
            studentIds.map((studentId) => ({
              classId: parsed.data.classId,
              userId: studentId,
            })),
          )
          .onConflictDoNothing()
      }
    })

    revalidatePath(DASHBOARD_ADMIN_PATH)

    return { success: true }
  } catch (error) {
    return handleError(error, "Unable to update student assignments.")
  }
}

export async function createTemplate(
  values: z.input<typeof createTemplateSchema>,
): Promise<ActionResult> {
  const parsed = createTemplateSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Please review the template details.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    await requireAdminUser()

    const result = await db.transaction(async (tx) => {
      const [createdTemplate] = await tx
        .insert(projectTemplates)
        .values({
          templateName: parsed.data.templateName,
          description: parsed.data.description,
          isActive: true,
        })
        .returning({ id: projectTemplates.id })

      if (!createdTemplate) {
        throw new Error("Failed to create template")
      }

      const stageConfigs = parsed.data.stageConfigs.map((config, index) => ({
        templateId: createdTemplate.id,
        stageName: config.stageName,
        instrumentType: config.instrumentType,
        description: config.description,
        estimatedDuration: config.estimatedDuration,
        displayOrder: config.displayOrder ?? (index + 1),
      }))

      await tx.insert(templateStageConfigs).values(stageConfigs)

      return { success: true, templateId: createdTemplate.id }
    })

    revalidatePath(DASHBOARD_ADMIN_PATH)
    return result as ActionResult

  } catch (error) {
    return handleError(error, "Failed to create template.")
  }
}

export async function updateTemplate(
  values: z.input<typeof updateTemplateSchema>,
): Promise<ActionResult> {
  const parsed = updateTemplateSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Please review the template details.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    await requireAdminUser()

    await db.transaction(async (tx) => {
      const updatePayload: Partial<typeof projectTemplates.$inferInsert> = {
        templateName: parsed.data.templateName,
        description: parsed.data.description,
      }

      if (parsed.data.isActive !== undefined) {
        updatePayload.isActive = parsed.data.isActive
      }

      await tx
        .update(projectTemplates)
        .set(updatePayload)
        .where(eq(projectTemplates.id, parsed.data.templateId))

      // Update stage configurations if provided
      if (parsed.data.stageConfigs && parsed.data.stageConfigs.length > 0) {
        // Get existing configs with their questions and journal rubrics to preserve them
        const existingConfigs = await tx
          .select({
            id: templateStageConfigs.id,
            questions: {
              id: templateQuestions.id,
              questionText: templateQuestions.questionText,
              questionType: templateQuestions.questionType,
              scoringGuide: templateQuestions.scoringGuide,
            },
            journalRubrics: {
              id: templateJournalRubrics.id,
              indicatorText: templateJournalRubrics.indicatorText,
              criteria: templateJournalRubrics.criteria,
            },
          })
          .from(templateStageConfigs)
          .leftJoin(
            templateQuestions,
            eq(templateQuestions.configId, templateStageConfigs.id)
          )
          .leftJoin(
            templateJournalRubrics,
            eq(templateJournalRubrics.configId, templateStageConfigs.id)
          )
          .where(eq(templateStageConfigs.templateId, parsed.data.templateId))

        // Store existing questions and journal rubrics by config ID to preserve them
        const questionsToPreserve: Record<string, typeof templateQuestions.$inferInsert[]> = {}
        const journalRubricsToPreserve: Record<string, typeof templateJournalRubrics.$inferInsert[]> = {}

        existingConfigs.forEach(row => {
          // Preserve questions
          if (row.questions) {
            if (!questionsToPreserve[row.id]) {
              questionsToPreserve[row.id] = []
            }
            questionsToPreserve[row.id].push({
              configId: row.id, // Will be updated to new config ID later
              questionText: row.questions.questionText,
              questionType: row.questions.questionType,
              scoringGuide: row.questions.scoringGuide,
            })
          }

          // Preserve journal rubrics
          if (row.journalRubrics) {
            if (!journalRubricsToPreserve[row.id]) {
              journalRubricsToPreserve[row.id] = []
            }
            journalRubricsToPreserve[row.id].push({
              configId: row.id, // Will be updated to new config ID later
              indicatorText: row.journalRubrics.indicatorText,
              criteria: row.journalRubrics.criteria,
            })
          }
        })

        // Delete all existing stage configs (cascade will delete questions too)
        await tx
          .delete(templateStageConfigs)
          .where(eq(templateStageConfigs.templateId, parsed.data.templateId))

        // Create new stage configs with sequential display order
        const newConfigs = parsed.data.stageConfigs.map((config, index) => ({
          templateId: parsed.data!.templateId,
          stageName: config.stageName,
          instrumentType: config.instrumentType,
          description: config.description,
          estimatedDuration: config.estimatedDuration,
          displayOrder: index + 1,
        }))

        const insertedConfigs = await tx
          .insert(templateStageConfigs)
          .values(newConfigs)
          .returning({ id: templateStageConfigs.id, stageName: templateStageConfigs.stageName })

        // Recreate questions and journal rubrics for preserved configs
        for (let i = 0; i < parsed.data.stageConfigs.length; i++) {
          const oldConfigId = parsed.data.stageConfigs[i].id
          const newConfigId = insertedConfigs[i]?.id

          if (oldConfigId && newConfigId) {
            // Recreate questions for this config
            if (questionsToPreserve[oldConfigId]) {
              await tx.insert(templateQuestions).values(
                questionsToPreserve[oldConfigId].map(q => ({
                  ...q,
                  configId: newConfigId,
                }))
              )
            }

            // Recreate journal rubrics for this config
            if (journalRubricsToPreserve[oldConfigId]) {
              await tx.insert(templateJournalRubrics).values(
                journalRubricsToPreserve[oldConfigId].map(r => ({
                  ...r,
                  configId: newConfigId,
                }))
              )
            }
          }
        }
      }
    })

    revalidatePath(DASHBOARD_ADMIN_PATH)
    return { success: true }

  } catch (error) {
    return handleError(error, "Failed to update template.")
  }
}

export async function deleteTemplate(
  values: z.input<typeof deleteTemplateSchema>,
): Promise<ActionResult> {
  const parsed = deleteTemplateSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid template identifier.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    await requireAdminUser()

    await db.transaction(async (tx) => {
      await tx
        .delete(templateStageConfigs)
        .where(eq(templateStageConfigs.templateId, parsed.data.templateId))

      await tx
        .delete(projectTemplates)
        .where(eq(projectTemplates.id, parsed.data.templateId))
    })

    revalidatePath(DASHBOARD_ADMIN_PATH)
    return { success: true }

  } catch (error) {
    return handleError(error, "Unable to delete the template.")
  }
}

export async function toggleTemplateStatus(
  values: z.input<typeof toggleTemplateStatusSchema>,
): Promise<ActionResult> {
  const parsed = toggleTemplateStatusSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid template identifier.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    await requireAdminUser()

    const [template] = await db
      .select({ isActive: projectTemplates.isActive })
      .from(projectTemplates)
      .where(eq(projectTemplates.id, parsed.data.templateId))
      .limit(1)

    if (!template) {
      return { success: false, error: "Template not found." }
    }

    await db
      .update(projectTemplates)
      .set({ isActive: !template.isActive })
      .where(eq(projectTemplates.id, parsed.data.templateId))

    revalidatePath(DASHBOARD_ADMIN_PATH)
    return { success: true }

  } catch (error) {
    return handleError(error, "Unable to toggle template status.")
  }
}

// Schema for import validation
const importStudentsSchema = z.object({
  fileData: z.string(), // Base64 encoded file
  academicTermId: z.string().uuid().optional()
})

export async function importStudentsFromExcel(
  values: z.input<typeof importStudentsSchema>,
): Promise<ActionResult> {
  const parsed = importStudentsSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid import data.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    await requireAdminUser()

    // Get active academic term if not provided
    let academicTermId = parsed.data.academicTermId
    if (!academicTermId) {
      const [activeTerm] = await db
        .select({ id: academicTerms.id })
        .from(academicTerms)
        .where(eq(academicTerms.status, "ACTIVE"))
        .limit(1)

      if (!activeTerm) {
        return { success: false, error: "Tidak ada tahun ajaran aktif. Silakan buat tahun ajaran terlebih dahulu." }
      }
      academicTermId = activeTerm.id
    }

    // Decode base64 file
    const buffer = Buffer.from(parsed.data.fileData, 'base64')

    // Parse Excel file
    const parseResult = parseStudentImportExcel(buffer)

    if (parseResult.errors.length > 0) {
      return {
        success: false,
        error: parseResult.errors.join('; ')
      }
    }

    if (parseResult.validRows === 0) {
      return { success: false, error: "Tidak ada data siswa yang valid untuk diimport." }
    }

    // Process valid students
    const results = []
    const errors = []
    let successCount = 0
    const createdClasses = new Set<string>()

    for (const studentData of parseResult.students) {
      if (studentData.errors.length > 0) {
        errors.push(`Baris ${studentData.rowIndex}: ${studentData.errors.join(', ')}`)
        continue
      }

      try {
        // Generate unique email
        const email = await generateUniqueEmail(studentData.nama)
        const password = generateDefaultPassword()

        // Create user account via Better Auth
        const authResponse = await auth.api.signUpEmail({
          body: {
            email,
            password,
            name: studentData.nama,
          }
        })

        const createdUser = authResponse?.user
        if (!createdUser?.id) {
          errors.push(`Baris ${studentData.rowIndex}: Gagal membuat akun user`)
          continue
        }

        // Update user role to STUDENT
        await db
          .update(user)
          .set({ role: "STUDENT" })
          .where(eq(user.id, createdUser.id))

        // Find or create class
        let classRecord = await db
          .select({ id: classes.id })
          .from(classes)
          .where(
            and(
              eq(classes.name, studentData.kelas),
              eq(classes.academicTermId, academicTermId)
            )
          )
          .limit(1)

        if (classRecord.length === 0) {
          // Create new class
          const [newClass] = await db
            .insert(classes)
            .values({
              name: studentData.kelas,
              academicTermId
            })
            .returning()

          classRecord = [{ id: newClass.id }]
          createdClasses.add(studentData.kelas)
        }

        // Assign user to class
        await db
          .insert(userClassAssignments)
          .values({
            userId: createdUser.id,
            classId: classRecord[0].id
          })

        results.push({
          rowIndex: studentData.rowIndex,
          nama: studentData.nama,
          kelas: studentData.kelas,
          email,
          password,
          status: 'success'
        })

        successCount++
      } catch (error) {
        console.error(`Error processing student ${studentData.nama}:`, error)
        errors.push(`Baris ${studentData.rowIndex}: Gagal memproses siswa ${studentData.nama}`)
      }
    }

    revalidatePath(DASHBOARD_ADMIN_PATH)

    const response = {
      success: true,
      data: {
        totalProcessed: parseResult.students.length,
        successCount,
        errorCount: errors.length,
        createdClasses: Array.from(createdClasses),
        results,
        errors: errors.slice(0, 10) // Limit errors to first 10
      }
    }

    if (errors.length > 0) {
      return {
        success: true,
        data: response.data,
        error: `${successCount} siswa berhasil diimport, ${errors.length} gagal. Lihat detail error di hasil.`
      }
    }

    return response

  } catch (error) {
    return handleError(error, "Gagal mengimport data siswa.")
  }
}

// Schema for class filtering
const getClassesSchema = z.object({
  termId: z.string().uuid().optional()
})

export async function getAvailableClasses(
  values: z.input<typeof getClassesSchema>,
): Promise<ActionResult> {
  const parsed = getClassesSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid parameters.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    await requireAdminUser()

    // First get the base classes - simplified query for debugging
    let classList;
    try {
      const baseQuery = db
        .select({
          id: classes.id,
          name: classes.name,
          academicTermId: classes.academicTermId,
          termStatus: academicTerms.status,
          academicYear: academicTerms.academicYear,
          semester: academicTerms.semester,
        })
        .from(classes)
        .innerJoin(academicTerms, eq(classes.academicTermId, academicTerms.id))
        .where(
          parsed.data.termId
            ? eq(classes.academicTermId, parsed.data.termId)
            : eq(academicTerms.status, 'ACTIVE')
        )
        .orderBy(classes.name)

      classList = await baseQuery;
    } catch (error) {
      console.error('Error fetching classes with active terms:', error);
      // Fallback: get all classes without term filter
      const fallbackQuery = db
        .select({
          id: classes.id,
          name: classes.name,
          academicTermId: classes.academicTermId,
          termStatus: sql<string>`'INACTIVE'`.as('termStatus'),
          academicYear: sql<string>`'Unknown'`.as('academicYear'),
          semester: sql<string>`'Unknown'`.as('semester'),
        })
        .from(classes)
        .orderBy(classes.name);

      classList = await fallbackQuery;
    }

    // Get student counts for each class
    const classesWithCounts = await Promise.all(
      classList.map(async (cls) => {
        const studentCount = await db
          .select({ count: sql<number>`count(*)`.mapWith(Number) })
          .from(userClassAssignments)
          .innerJoin(user, eq(userClassAssignments.userId, user.id))
          .where(
            and(
              eq(userClassAssignments.classId, cls.id),
              eq(user.role, 'STUDENT')
            )
          )

        return {
          ...cls,
          studentCount: studentCount[0]?.count || 0,
          status: cls.termStatus === 'ACTIVE' ? 'aktif' : 'tidak aktif',
          termLabel: `${cls.academicYear} - ${cls.semester}`
        }
      })
    )

    return {
      success: true,
      data: classesWithCounts
    }

  } catch (error) {
    return handleError(error, "Unable to fetch classes.")
  }
}
