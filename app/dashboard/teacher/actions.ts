"use server"

import { revalidatePath } from "next/cache"

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
import { z } from "zod"
import { and, asc, count, eq, inArray, isNull } from "drizzle-orm"

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
  projectTemplates,
  submissions,
  templateStageConfigs,
  templateQuestions,
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

const createProjectSchema = projectBaseSchema.extend({
  templateId: z.string().uuid("Please select a project template"),
})

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

  // Error logging removed for production
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
  const assignment = await db
    .select({ userId: userClassAssignments.userId })
    .from(userClassAssignments)
    .where(
      and(
        eq(userClassAssignments.userId, teacherId),
        eq(userClassAssignments.classId, classId),
      ),
    )
    .limit(1)
    .then((rows) => rows[0])

  if (!assignment) {
    throw new ForbiddenError("You are not assigned to this class.")
  }
}

const ensureTeacherOwnsProject = async (
  teacherId: string,
  projectId: string,
) => {
  const project = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.teacherId, teacherId)))
    .limit(1)
    .then((rows) => rows[0])

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

    // Verify template exists and is active
    const template = await db
      .select({ id: projectTemplates.id })
      .from(projectTemplates)
      .where(
        and(
          eq(projectTemplates.id, parsed.data.templateId),
          eq(projectTemplates.isActive, true)
        )
      )
      .limit(1)
      .then((rows) => rows[0])

    if (!template) {
      return { success: false, error: "Selected template is not available." }
    }

    const result = await db.transaction(async (tx) => {
      // Create the project
      const [created] = await tx
        .insert(projects)
        .values({
          classId: parsed.data.classId,
          teacherId: teacher.id,
          title: parsed.data.title,
          description: parsed.data.description,
          theme: parsed.data.theme,
          templateId: parsed.data.templateId,
          status: "DRAFT",
        })
        .returning({ id: projects.id })

      // Get template stage configs
      const stageConfigs = await tx
        .select({
          id: templateStageConfigs.id,
          stageName: templateStageConfigs.stageName,
          instrumentType: templateStageConfigs.instrumentType,
          displayOrder: templateStageConfigs.displayOrder,
          description: templateStageConfigs.description,
          estimatedDuration: templateStageConfigs.estimatedDuration,
        })
        .from(templateStageConfigs)
        .where(eq(templateStageConfigs.templateId, parsed.data.templateId))
        .orderBy(asc(templateStageConfigs.displayOrder))


      // Group configs by stageName and instrumentType to preserve descriptions
      const stageMap = new Map()
      for (const config of stageConfigs) {
        const key = `${config.stageName}`
        if (!stageMap.has(key)) {
          stageMap.set(key, {
            stageName: config.stageName,
            description: config.description,
            displayOrder: config.displayOrder,
            estimatedDuration: config.estimatedDuration,
            instruments: new Map(),
          })
        }
        stageMap.get(key).instruments.set(config.instrumentType, config.description)
      }

      // Insert project stages (one per unique stageName)
      const stageNameToId = new Map()
      let orderCounter = 1
      for (const [stageName, stageObj] of stageMap.entries()) {
        const [stage] = await tx
          .insert(projectStages)
          .values({
            projectId: created.id,
            name: stageObj.stageName,
            description: stageObj.description,
            order: orderCounter++,
          })
          .returning({ id: projectStages.id })
        stageNameToId.set(stageName, stage.id)
      }

      // Insert instruments for each stage with their descriptions
      for (const [stageName, stageObj] of stageMap.entries()) {
        const stageId = stageNameToId.get(stageName)
        for (const [instrumentType, description] of stageObj.instruments.entries()) {
          await tx.insert(projectStageInstruments).values({
            projectStageId: stageId,
            instrumentType,
            isRequired: true,
            description,
          })
        }
      }

      return created
    })

    revalidatePath(DASHBOARD_TEACHER_PATH)

    return { success: true, data: { projectId: result.id } }
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

    const stage = await db
      .select({
        id: projectStages.id,
        projectId: projectStages.projectId,
      })
      .from(projectStages)
      .where(eq(projectStages.id, parsed.data.stageId))
      .limit(1)
      .then((rows) => rows[0])

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

    const stage = await db
      .select({
        id: projectStages.id,
        projectId: projectStages.projectId,
        order: projectStages.order,
      })
      .from(projectStages)
      .where(eq(projectStages.id, parsed.data.stageId))
      .limit(1)
      .then((rows) => rows[0])

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

    const stage = await db
      .select({
        id: projectStages.id,
        projectId: projectStages.projectId,
      })
      .from(projectStages)
      .where(eq(projectStages.id, parsed.data.stageId))
      .limit(1)
      .then((rows) => rows[0])

    if (!stage) {
      throw new ForbiddenError("Stage not found.")
    }

    await ensureTeacherOwnsProject(teacher.id, stage.projectId)

    await db.transaction(async (tx) => {
      // Get existing instruments to preserve descriptions
      const existingInstruments = await tx
        .select({
          instrumentType: projectStageInstruments.instrumentType,
          description: projectStageInstruments.description,
        })
        .from(projectStageInstruments)
        .where(eq(projectStageInstruments.projectStageId, stage.id))

      const existingMap = new Map(
        existingInstruments.map(inst => [inst.instrumentType, inst.description])
      )

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
            description: existingMap.get(instrumentType) || null,
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

    const group = await db
      .select({
        id: groups.id,
        projectId: groups.projectId,
      })
      .from(groups)
      .where(eq(groups.id, parsed.data.groupId))
      .limit(1)
      .then((rows) => rows[0])

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

    const group = await db
      .select({
        id: groups.id,
        projectId: groups.projectId,
      })
      .from(groups)
      .where(eq(groups.id, parsed.data.groupId))
      .limit(1)
      .then((rows) => rows[0])

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

    const stage = await db
      .select({
        id: projectStages.id,
        projectId: projectStages.projectId,
      })
      .from(projectStages)
      .where(eq(projectStages.id, stageId))
      .limit(1)
      .then((rows) => rows[0])

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

export async function getProjectTemplates(): Promise<ProjectTemplate[]> {
  try {
    await requireTeacherUser()

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
  } catch (error) {
    // Error logging removed for production
    throw error
  }
}

// Teacher Report submission - similar to peer assessment but for teachers
const teacherReportSchema = z.object({
  projectId: z.string().uuid(),
  stageId: z.string().uuid(),
  instrumentType: z.enum(["OBSERVATION"]),
  content: z.object({ answers: z.array(z.number().min(1).max(4)).min(1) }),
  targetStudentId: z.string().uuid().optional().nullable(),
})

export async function submitTeacherReport(
  values: z.input<typeof teacherReportSchema>,
): Promise<ActionResult> {
  const parsed = teacherReportSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Please review your submission.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const { projectId, stageId, instrumentType, content, targetStudentId } = parsed.data

  try {
    const teacher = await requireTeacherUser()

    await db.transaction(async (tx) => {
      const projectRecord = await tx
        .select({
          id: projects.id,
          classId: projects.classId,
          status: projects.status,
        })
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1)
        .then((rows) => rows[0])

      if (!projectRecord || projectRecord.status !== "PUBLISHED") {
        throw new ForbiddenError("Project not available.")
      }

      // Verify teacher teaches this class
      const classAssignment = await tx
        .select({ userId: userClassAssignments.userId })
        .from(userClassAssignments)
        .where(
          and(
            eq(userClassAssignments.userId, teacher.user.id),
            eq(userClassAssignments.classId, projectRecord.classId),
          ),
        )
        .limit(1)
        .then((rows) => rows[0])

      if (!classAssignment) {
        throw new ForbiddenError("You are not assigned to this project.")
      }

      const stageRecord = await tx
        .select({
          id: projectStages.id,
          projectId: projectStages.projectId,
          order: projectStages.order,
          name: projectStages.name,
        })
        .from(projectStages)
        .where(
          and(
            eq(projectStages.id, stageId),
            eq(projectStages.projectId, projectId),
          ),
        )
        .limit(1)
        .then((rows) => rows[0])

      if (!stageRecord) {
        throw new ForbiddenError("Stage not found.")
      }

      // Verify student is in this project's class
      if (targetStudentId) {
        const studentInClass = await tx
          .select({ userId: userClassAssignments.userId })
          .from(userClassAssignments)
          .where(
            and(
              eq(userClassAssignments.userId, targetStudentId),
              eq(userClassAssignments.classId, projectRecord.classId),
            ),
          )
          .limit(1)
          .then((rows) => rows[0])

        if (!studentInClass) {
          throw new ForbiddenError("Student not found in this class.")
        }
      }

      let templateConfig = await tx
        .select({ id: templateStageConfigs.id })
        .from(templateStageConfigs)
        .innerJoin(projects, eq(templateStageConfigs.templateId, projects.templateId))
        .innerJoin(projectStages, eq(projects.id, projectStages.projectId))
        .where(
          and(
            eq(projectStages.id, stageId),
            eq(templateStageConfigs.instrumentType, instrumentType),
          ),
        )
        .limit(1)
        .then((rows) => rows[0])

      // Special handling for OBSERVATION - create fallback if not in template
      if (!templateConfig && instrumentType === "OBSERVATION") {
        // For OBSERVATION, we don't need template config - allow submission without it
        templateConfig = { id: null }
      } else if (!templateConfig) {
        throw new ForbiddenError("Instrument configuration not found for this stage.")
      }

      const existingSubmissionQuery = and(
        eq(submissions.submittedById, teacher.user.id),
        eq(submissions.projectId, projectId),
        eq(submissions.projectStageId, stageId),
        templateConfig.id === null
          ? isNull(submissions.templateStageConfigId)
          : eq(submissions.templateStageConfigId, templateConfig.id),
        ...(targetStudentId ? [eq(submissions.targetStudentId, targetStudentId)] : []),
      )

      const existingSubmission = await tx
        .select({ id: submissions.id })
        .from(submissions)
        .where(existingSubmissionQuery)
        .limit(1)
        .then((rows) => rows[0])

      if (existingSubmission) {
        await tx
          .update(submissions)
          .set({
            content,
            submittedAt: new Date(),
            targetStudentId: targetStudentId ?? null,
            updatedAt: new Date(),
          })
          .where(eq(submissions.id, existingSubmission.id))
      } else {
        await tx.insert(submissions).values({
          studentId: null, // Teacher submissions don't have studentId
          submittedBy: 'TEACHER',
          submittedById: teacher.user.id,
          projectId,
          projectStageId: stageId,
          templateStageConfigId: templateConfig.id,
          content,
          targetStudentId: targetStudentId ?? null,
        })
      }
    })

    return { success: true }
  } catch (error) {
    return handleError(error, "Unable to save your teacher report.")
  }
}

export async function getStudentsByClass(classId: string) {
  try {
    const teacher = await requireTeacherUser()

    // Verify teacher has access to this class
    const classAssignment = await db.query.userClassAssignments.findFirst({
      where: and(
        eq(userClassAssignments.userId, teacher.user.id),
        eq(userClassAssignments.classId, classId)
      )
    })

    if (!classAssignment) {
      throw new ForbiddenError("You don't have access to this class")
    }

    // Fetch students for this class
    const students = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
      })
      .from(userClassAssignments)
      .innerJoin(user, eq(userClassAssignments.userId, user.id))
      .where(
        and(
          eq(userClassAssignments.classId, classId),
          eq(user.role, "STUDENT")
        )
      )
      .orderBy(asc(user.name))

    return { success: true, data: students }
  } catch (error) {
    return handleError(error, "Unable to fetch students.")
  }
}

export async function getGroupsWithMembers(classId: string) {
  try {
    const teacher = await requireTeacherUser()

    // Verify teacher has access to this class
    const classAssignment = await db.query.userClassAssignments.findFirst({
      where: and(
        eq(userClassAssignments.userId, teacher.user.id),
        eq(userClassAssignments.classId, classId)
      )
    })

    if (!classAssignment) {
      throw new ForbiddenError("You don't have access to this class")
    }

    // Fetch groups with their members for this class
    const groupData = await db
      .select({
        groupId: groups.id,
        groupName: groups.name,
        projectId: projects.id,
        projectTitle: projects.title,
        studentId: user.id,
        studentName: user.name,
        studentEmail: user.email,
      })
      .from(groups)
      .innerJoin(projects, eq(groups.projectId, projects.id))
      .innerJoin(groupMembers, eq(groups.id, groupMembers.groupId))
      .innerJoin(user, eq(groupMembers.studentId, user.id))
      .where(
        and(
          eq(projects.classId, classId),
          eq(user.role, "STUDENT")
        )
      )
      .orderBy(asc(groups.name), asc(user.name))

    // Transform the flat data into grouped structure
    const groupsMap = new Map()

    for (const row of groupData) {
      if (!groupsMap.has(row.groupId)) {
        groupsMap.set(row.groupId, {
          id: row.groupId,
          name: row.groupName,
          projectId: row.projectId,
          projectTitle: row.projectTitle,
          members: []
        })
      }

      groupsMap.get(row.groupId).members.push({
        id: row.studentId,
        name: row.studentName || row.studentEmail || 'Unknown Student',
        email: row.studentEmail
      })
    }

    return {
      success: true,
      data: Array.from(groupsMap.values())
    }
  } catch (error) {
    return handleError(error, "Unable to fetch groups.")
  }
}
