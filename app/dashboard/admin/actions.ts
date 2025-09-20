"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { and, eq, ne, inArray } from "drizzle-orm"

import { db } from "@/db"
import {
  academicTerms,
  classes,
  semesterEnum,
  termStatusEnum,
  userClassAssignments,
  projectTemplates,
  templateStageConfigs,
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
  stageName: z.string().min(1, "Stage name is required"),
  instrumentType: instrumentTypeSchema,
  description: z.string().optional(),
  estimatedDuration: z.string().optional(),
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

    const createdUser = response?.data?.user ?? response?.user

    if (!createdUser?.id) {
      throw new Error(response?.error?.message ?? "Account creation failed")
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
        displayOrder: index + 1,
      }))

      await tx.insert(templateStageConfigs).values(stageConfigs)

      return { success: true, templateId: createdTemplate.id }
    })

    revalidatePath(DASHBOARD_ADMIN_PATH)
    return result

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
        // Delete existing stage configs
        await tx
          .delete(templateStageConfigs)
          .where(eq(templateStageConfigs.templateId, parsed.data.templateId))

        // Insert new stage configs
        const stageConfigs = parsed.data.stageConfigs.map((config, index) => ({
          templateId: parsed.data!.templateId,
          stageName: config.stageName,
          instrumentType: config.instrumentType,
          description: config.description,
          estimatedDuration: config.estimatedDuration,
          displayOrder: index + 1,
        }))

        await tx.insert(templateStageConfigs).values(stageConfigs)
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
