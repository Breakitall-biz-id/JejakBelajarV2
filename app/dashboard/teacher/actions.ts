"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { and, asc, count, eq, inArray } from "drizzle-orm"

import { db } from "@/db"
import {
  academicTerms,
  classes,
  groupMembers,
  groups,
  instrumentTypeEnum,
  projectStageInstruments,
  projectStages,
  projects,
  projectStatusEnum,
  userClassAssignments,
} from "@/db/schema/jejak"
import { user } from "@/db/schema/auth"
import {
  ForbiddenError,
  UnauthorizedError,
  requireTeacherUser,
} from "@/lib/auth/session"

const DASHBOARD_TEACHER_PATH = "/dashboard/teacher"

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

const projectStatusSchema = z.enum(projectStatusEnum.enumValues)
const instrumentTypeSchema = z.enum(instrumentTypeEnum.enumValues)

const projectBaseSchema = z.object({
  classId: z.string().uuid(),
  title: z.string().trim().min(1, "Project title is required").max(255),
  description: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
  theme: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
})

const createProjectSchema = projectBaseSchema

const updateProjectSchema = projectBaseSchema.extend({
  projectId: z.string().uuid(),
})

const projectStatusUpdateSchema = z.object({
  projectId: z.string().uuid(),
  status: projectStatusSchema,
})

const deleteProjectSchema = z.object({ projectId: z.string().uuid() })

const projectStageSchema = z.object({
  projectId: z.string().uuid(),
  name: z
    .string()
    .trim()
    .min(1, "Stage name is required")
    .max(255),
  description: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
  unlocksAt: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
  dueAt: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
})

const updateStageSchema = projectStageSchema.extend({
  stageId: z.string().uuid(),
})

const deleteStageSchema = z.object({ stageId: z.string().uuid() })

const reorderStagesSchema = z.object({
  projectId: z.string().uuid(),
  stageOrder: z.array(z.string().uuid()).min(1, "At least one stage id is required"),
})

const stageInstrumentSchema = z.object({
  stageId: z.string().uuid(),
  instrumentTypes: z
    .array(instrumentTypeSchema)
    .max(instrumentTypeEnum.enumValues.length),
})

const groupBaseSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().trim().min(1, "Group name is required").max(255),
})

const updateGroupSchema = groupBaseSchema.extend({
  groupId: z.string().uuid(),
})

const deleteGroupSchema = z.object({ groupId: z.string().uuid() })

const updateGroupMembersSchema = z.object({
  groupId: z.string().uuid(),
  projectId: z.string().uuid(),
  studentIds: z.array(z.string().uuid()).optional().default([]),
})

const handleError = (error: unknown, fallback: string): ActionResult => {
  if (error instanceof UnauthorizedError) {
    return { success: false, error: "You must be signed in to continue." }
  }

  if (error instanceof ForbiddenError) {
    return { success: false, error: "You are not allowed to perform this action." }
  }

  console.error(fallback, error)
  return { success: false, error: fallback }
}

const toDate = (value?: string | null) => {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  const date = new Date(trimmed)
  if (Number.isNaN(date.valueOf())) return null
  return date
}

const ensureTeacherAccessToClass = async (
  teacherId: string,
  classId: string,
) => {
  const assignment = await db.query.userClassAssignments.findFirst({
    columns: {
      userId: true,
      classId: true,
    },
    where: and(
      eq(userClassAssignments.userId, teacherId),
      eq(userClassAssignments.classId, classId),
    ),
  })

  if (!assignment) {
    throw new ForbiddenError("You are not assigned to this class.")
  }
}

const ensureTeacherOwnsProject = async (
  teacherId: string,
  projectId: string,
) => {
  const project = await db.query.projects.findFirst({
    columns: {
      id: true,
      teacherId: true,
    },
    where: and(eq(projects.id, projectId), eq(projects.teacherId, teacherId)),
  })

  if (!project) {
    throw new ForbiddenError("You do not manage this project.")
  }
}

export async function createProject(
  values: z.input<typeof createProjectSchema>,
): Promise<ActionResult<{ projectId: string }>> {
  const parsed = createProjectSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Please review the project details.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    const { user: teacher } = await requireTeacherUser()

    await ensureTeacherAccessToClass(teacher.id, parsed.data.classId)

    const [created] = await db
      .insert(projects)
      .values({
        classId: parsed.data.classId,
        teacherId: teacher.id,
        title: parsed.data.title,
        description: parsed.data.description,
        theme: parsed.data.theme,
        status: "DRAFT",
      })
      .returning({ id: projects.id })

    revalidatePath(DASHBOARD_TEACHER_PATH)

    return { success: true, data: { projectId: created.id } }
  } catch (error) {
    return handleError(error, "Unable to create project.")
  }
}

export async function updateProject(
  values: z.input<typeof updateProjectSchema>,
): Promise<ActionResult> {
  const parsed = updateProjectSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Please resolve the highlighted issues.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    const { user: teacher } = await requireTeacherUser()

    await ensureTeacherOwnsProject(teacher.id, parsed.data.projectId)
    await ensureTeacherAccessToClass(teacher.id, parsed.data.classId)

    await db
      .update(projects)
      .set({
        title: parsed.data.title,
        description: parsed.data.description,
        theme: parsed.data.theme,
        classId: parsed.data.classId,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, parsed.data.projectId))

    revalidatePath(DASHBOARD_TEACHER_PATH)

    return { success: true }
  } catch (error) {
    return handleError(error, "Unable to update project.")
  }
}

export async function updateProjectStatus(
  values: z.input<typeof projectStatusUpdateSchema>,
): Promise<ActionResult> {
  const parsed = projectStatusUpdateSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid project status.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    const { user: teacher } = await requireTeacherUser()

    await ensureTeacherOwnsProject(teacher.id, parsed.data.projectId)

    await db
      .update(projects)
      .set({
        status: parsed.data.status,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, parsed.data.projectId))

    revalidatePath(DASHBOARD_TEACHER_PATH)

    return { success: true }
  } catch (error) {
    return handleError(error, "Unable to update project status.")
  }
}

export async function deleteProject(
  values: z.input<typeof deleteProjectSchema>,
): Promise<ActionResult> {
  const parsed = deleteProjectSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid project identifier.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    const { user: teacher } = await requireTeacherUser()

    await ensureTeacherOwnsProject(teacher.id, parsed.data.projectId)

    await db.delete(projects).where(eq(projects.id, parsed.data.projectId))

    revalidatePath(DASHBOARD_TEACHER_PATH)

    return { success: true }
  } catch (error) {
    return handleError(error, "Unable to delete project.")
  }
}

export async function createProjectStage(
  values: z.input<typeof projectStageSchema>,
): Promise<ActionResult<{ stageId: string }>> {
  const parsed = projectStageSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Please review the stage details.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    const { user: teacher } = await requireTeacherUser()

    await ensureTeacherOwnsProject(teacher.id, parsed.data.projectId)

    const [nextOrder] = await db
      .select({
        count: count(projectStages.id),
      })
      .from(projectStages)
      .where(eq(projectStages.projectId, parsed.data.projectId))

    const currentCount = nextOrder?.count ? Number(nextOrder.count) : 0
    const orderValue = currentCount + 1

    const [created] = await db
      .insert(projectStages)
      .values({
        projectId: parsed.data.projectId,
        name: parsed.data.name,
        description: parsed.data.description,
        unlocksAt: toDate(parsed.data.unlocksAt),
        dueAt: toDate(parsed.data.dueAt),
        order: orderValue,
      })
      .returning({ id: projectStages.id })

    revalidatePath(DASHBOARD_TEACHER_PATH)

    return { success: true, data: { stageId: created.id } }
  } catch (error) {
    return handleError(error, "Unable to create project stage.")
  }
}

export async function updateProjectStage(
  values: z.input<typeof updateStageSchema>,
): Promise<ActionResult> {
  const parsed = updateStageSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Please resolve the highlighted issues.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    const { user: teacher } = await requireTeacherUser()

    const stage = await db.query.projectStages.findFirst({
      columns: {
        id: true,
        projectId: true,
      },
      where: eq(projectStages.id, parsed.data.stageId),
    })

    if (!stage) {
      throw new ForbiddenError("Stage not found.")
    }

    await ensureTeacherOwnsProject(teacher.id, stage.projectId)

    await db
      .update(projectStages)
      .set({
        name: parsed.data.name,
        description: parsed.data.description,
        unlocksAt: toDate(parsed.data.unlocksAt),
        dueAt: toDate(parsed.data.dueAt),
        updatedAt: new Date(),
      })
      .where(eq(projectStages.id, parsed.data.stageId))

    revalidatePath(DASHBOARD_TEACHER_PATH)

    return { success: true }
  } catch (error) {
    return handleError(error, "Unable to update project stage.")
  }
}

export async function deleteProjectStage(
  values: z.input<typeof deleteStageSchema>,
): Promise<ActionResult> {
  const parsed = deleteStageSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid stage identifier.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    const { user: teacher } = await requireTeacherUser()

    const stage = await db.query.projectStages.findFirst({
      columns: {
        id: true,
        projectId: true,
        order: true,
      },
      where: eq(projectStages.id, parsed.data.stageId),
    })

    if (!stage) {
      throw new ForbiddenError("Stage not found.")
    }

    await ensureTeacherOwnsProject(teacher.id, stage.projectId)

    await db.transaction(async (tx) => {
      await tx.delete(projectStages).where(eq(projectStages.id, parsed.data.stageId))

      const remainingStages = await tx
        .select({ id: projectStages.id })
        .from(projectStages)
        .where(eq(projectStages.projectId, stage.projectId))
        .orderBy(asc(projectStages.order))

      for (const [index, stageRow] of remainingStages.entries()) {
        await tx
          .update(projectStages)
          .set({ order: index + 1 })
          .where(eq(projectStages.id, stageRow.id))
      }
    })

    revalidatePath(DASHBOARD_TEACHER_PATH)

    return { success: true }
  } catch (error) {
    return handleError(error, "Unable to delete project stage.")
  }
}

export async function reorderProjectStages(
  values: z.input<typeof reorderStagesSchema>,
): Promise<ActionResult> {
  const parsed = reorderStagesSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid stage order payload.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    const { user: teacher } = await requireTeacherUser()

    await ensureTeacherOwnsProject(teacher.id, parsed.data.projectId)

    await db.transaction(async (tx) => {
      for (const [index, stageId] of parsed.data.stageOrder.entries()) {
        await tx
          .update(projectStages)
          .set({ order: index + 1 })
          .where(
            and(
              eq(projectStages.id, stageId),
              eq(projectStages.projectId, parsed.data.projectId),
            ),
          )
      }
    })

    revalidatePath(DASHBOARD_TEACHER_PATH)

    return { success: true }
  } catch (error) {
    return handleError(error, "Unable to reorder project stages.")
  }
}

export async function setStageInstruments(
  values: z.input<typeof stageInstrumentSchema>,
): Promise<ActionResult> {
  const parsed = stageInstrumentSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid stage instrument payload.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    const { user: teacher } = await requireTeacherUser()

    const stage = await db.query.projectStages.findFirst({
      columns: {
        id: true,
        projectId: true,
      },
      where: eq(projectStages.id, parsed.data.stageId),
    })

    if (!stage) {
      throw new ForbiddenError("Stage not found.")
    }

    await ensureTeacherOwnsProject(teacher.id, stage.projectId)

    await db.transaction(async (tx) => {
      await tx.delete(projectStageInstruments).where(eq(projectStageInstruments.projectStageId, stage.id))

      const uniqueInstrumentTypes = Array.from(new Set(parsed.data.instrumentTypes))

      if (uniqueInstrumentTypes.length === 0) {
        return
      }

      await tx
        .insert(projectStageInstruments)
        .values(
          uniqueInstrumentTypes.map((instrumentType) => ({
            projectStageId: stage.id,
            instrumentType,
            isRequired: true,
          })),
        )
    })

    revalidatePath(DASHBOARD_TEACHER_PATH)

    return { success: true }
  } catch (error) {
    return handleError(error, "Unable to update stage instruments.")
  }
}

export async function createGroup(
  values: z.input<typeof groupBaseSchema>,
): Promise<ActionResult<{ groupId: string }>> {
  const parsed = groupBaseSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Please review the group details.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    const { user: teacher } = await requireTeacherUser()

    await ensureTeacherOwnsProject(teacher.id, parsed.data.projectId)

    const [created] = await db
      .insert(groups)
      .values({
        projectId: parsed.data.projectId,
        name: parsed.data.name,
      })
      .returning({ id: groups.id })

    revalidatePath(DASHBOARD_TEACHER_PATH)

    return { success: true, data: { groupId: created.id } }
  } catch (error) {
    return handleError(error, "Unable to create group.")
  }
}

export async function updateGroup(
  values: z.input<typeof updateGroupSchema>,
): Promise<ActionResult> {
  const parsed = updateGroupSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Please resolve the highlighted issues.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    const { user: teacher } = await requireTeacherUser()

    await ensureTeacherOwnsProject(teacher.id, parsed.data.projectId)

    await db
      .update(groups)
      .set({ name: parsed.data.name, updatedAt: new Date() })
      .where(
        and(
          eq(groups.id, parsed.data.groupId),
          eq(groups.projectId, parsed.data.projectId),
        ),
      )

    revalidatePath(DASHBOARD_TEACHER_PATH)

    return { success: true }
  } catch (error) {
    return handleError(error, "Unable to update group.")
  }
}

export async function deleteGroup(
  values: z.input<typeof deleteGroupSchema>,
): Promise<ActionResult> {
  const parsed = deleteGroupSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid group identifier.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    const { user: teacher } = await requireTeacherUser()

    const group = await db.query.groups.findFirst({
      columns: {
        id: true,
        projectId: true,
      },
      where: eq(groups.id, parsed.data.groupId),
    })

    if (!group) {
      throw new ForbiddenError("Group not found.")
    }

    await ensureTeacherOwnsProject(teacher.id, group.projectId)

    await db.delete(groups).where(eq(groups.id, parsed.data.groupId))

    revalidatePath(DASHBOARD_TEACHER_PATH)

    return { success: true }
  } catch (error) {
    return handleError(error, "Unable to delete group.")
  }
}

export async function updateGroupMembers(
  values: z.input<typeof updateGroupMembersSchema>,
): Promise<ActionResult> {
  const parsed = updateGroupMembersSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid group membership payload.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    const { user: teacher } = await requireTeacherUser()

    await ensureTeacherOwnsProject(teacher.id, parsed.data.projectId)

    const group = await db.query.groups.findFirst({
      columns: {
        id: true,
        projectId: true,
      },
      where: eq(groups.id, parsed.data.groupId),
    })

    if (!group) {
      throw new ForbiddenError("Group not found.")
    }

    if (group.projectId !== parsed.data.projectId) {
      throw new ForbiddenError("Group does not belong to this project.")
    }

    if (parsed.data.studentIds.length > 0) {
      const studentMemberships = await db
        .select({ userId: userClassAssignments.userId, role: user.role })
        .from(userClassAssignments)
        .innerJoin(user, eq(user.id, userClassAssignments.userId))
        .innerJoin(projects, eq(projects.classId, userClassAssignments.classId))
        .where(
          and(
            eq(projects.id, parsed.data.projectId),
            inArray(userClassAssignments.userId, parsed.data.studentIds),
          ),
        )

      const invalidStudent = studentMemberships.find((member) => member.role !== "STUDENT")

      if (invalidStudent) {
        throw new ForbiddenError("Only students assigned to the class can be grouped.")
      }

      if (studentMemberships.length !== parsed.data.studentIds.length) {
        throw new ForbiddenError("Some selected students are not assigned to this class.")
      }
    }

    await db.transaction(async (tx) => {
      await tx
        .delete(groupMembers)
        .where(eq(groupMembers.groupId, parsed.data.groupId))

      if (parsed.data.studentIds.length === 0) {
        return
      }

      await tx
        .insert(groupMembers)
        .values(
          parsed.data.studentIds.map((studentId) => ({
            groupId: parsed.data.groupId,
            studentId,
          })),
        )
    })

    revalidatePath(DASHBOARD_TEACHER_PATH)

    return { success: true }
  } catch (error) {
    return handleError(error, "Unable to update group members.")
  }
}

export async function deleteProjectStageInstruments(
  stageId: string,
): Promise<ActionResult> {
  try {
    const { user: teacher } = await requireTeacherUser()

    const stage = await db.query.projectStages.findFirst({
      columns: {
        id: true,
        projectId: true,
      },
      where: eq(projectStages.id, stageId),
    })

    if (!stage) {
      throw new ForbiddenError("Stage not found.")
    }

    await ensureTeacherOwnsProject(teacher.id, stage.projectId)

    await db.delete(projectStageInstruments).where(eq(projectStageInstruments.projectStageId, stageId))

    revalidatePath(DASHBOARD_TEACHER_PATH)

    return { success: true }
  } catch (error) {
    return handleError(error, "Unable to clear stage instruments.")
  }
}
