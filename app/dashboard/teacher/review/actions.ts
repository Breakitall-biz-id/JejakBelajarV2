"use server"

import { z } from "zod"
import { and, eq, gt, asc } from "drizzle-orm"

import { db } from "@/db"
import {
  projectStageInstruments,
  projectStageProgress,
  projectStages,
  projects,
  submissions,
  templateStageConfigs,
  userClassAssignments,
} from "@/db/schema/jejak"
import { user } from "@/db/schema/auth"
import {
  ForbiddenError,
  UnauthorizedError,
  requireTeacherUser,
} from "@/lib/auth/session"

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

const feedbackSchema = z.object({
  submissionId: z.string().uuid(),
  score: z.number().int().min(0).max(100).nullable().optional(),
  feedback: z.string().trim().min(1, "Feedback is required."),
})

const overrideStageStatusSchema = z.object({
  studentId: z.string().uuid(),
  stageId: z.string().uuid(),
  projectId: z.string().uuid(),
  status: z.enum(["LOCKED", "IN_PROGRESS", "COMPLETED"]),
})

export async function gradeSubmission(
  values: z.infer<typeof feedbackSchema>,
): Promise<ActionResult> {
  const parsed = feedbackSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Please review your feedback.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    const { user: teacher } = await requireTeacherUser()

    await db.transaction(async (tx) => {
      const submission = await tx
        .select({
          id: submissions.id,
          targetStudentId: submissions.targetStudentId,
          projectId: submissions.projectId,
          projectStageId: submissions.projectStageId,
        })
        .from(submissions)
        .where(eq(submissions.id, parsed.data.submissionId))
        .limit(1)
        .then((rows: any) => rows[0])

      if (!submission) {
        throw new ForbiddenError("Submission not found.")
      }

      await ensureTeacherOwnsProject(tx, teacher.id, submission.projectId)

      await tx
        .update(submissions)
        .set({
          score: parsed.data.score ?? null,
          feedback: parsed.data.feedback,
          updatedAt: new Date(),
        })
        .where(eq(submissions.id, submission.id))

      if (parsed.data.score !== null) {
        await evaluateStageCompletion(tx, submission.targetStudentId, submission.projectId, submission.projectStageId)
      }
    })

    return { success: true }
  } catch (error) {
    return handleError(error, "Unable to save feedback.")
  }
}

export async function overrideStageStatus(
  values: z.infer<typeof overrideStageStatusSchema>,
): Promise<ActionResult> {
  const parsed = overrideStageStatusSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid stage status payload.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    const { user: teacher } = await requireTeacherUser()

    await db.transaction(async (tx) => {
      await ensureTeacherOwnsProject(tx, teacher.id, parsed.data.projectId)

      const stageRecord = await tx
        .select({
          id: projectStages.id,
          projectId: projectStages.projectId,
          order: projectStages.order, // tambahkan order
        })
        .from(projectStages)
        .where(eq(projectStages.id, parsed.data.stageId))
        .limit(1)
        .then((rows: any) => rows[0])

      if (!stageRecord || stageRecord.projectId !== parsed.data.projectId) {
        throw new ForbiddenError("Stage not found for this project.")
      }

      const [progress] = await tx
        .insert(projectStageProgress)
        .values({
          projectStageId: parsed.data.stageId,
          studentId: parsed.data.studentId,
          status: parsed.data.status,
          unlockedAt: parsed.data.status !== "LOCKED" ? new Date() : null,
          completedAt: parsed.data.status === "COMPLETED" ? new Date() : null,
        })
    .onConflictDoUpdate({
      target: [projectStageProgress.projectStageId, projectStageProgress.studentId],
      set: {
        status: parsed.data.status,
        unlockedAt: parsed.data.status !== "LOCKED" ? new Date() : null,
        completedAt: parsed.data.status === "COMPLETED" ? new Date() : null,
        updatedAt: new Date(),
      },
    })
        .returning()

      if (parsed.data.status === "COMPLETED") {
        await unlockNextStage(tx, parsed.data.studentId, parsed.data.projectId, stageRecord.order)
      }
    })

    return { success: true }
  } catch (error) {
    return handleError(error, "Unable to update stage status.")
  }
}

function handleError(error: unknown, fallback: string): ActionResult {
  if (error instanceof UnauthorizedError) {
    return { success: false, error: "You must be signed in to continue." }
  }

  if (error instanceof ForbiddenError) {
    return { success: false, error: error.message }
  }

  // Error logging removed for production
  return { success: false, error: fallback }
}

async function ensureTeacherOwnsProject(
  tx: any,
  teacherId: string,
  projectId: string,
) {
  const project = await tx
    .select({ id: projects.id, classId: projects.classId })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1)
    .then((rows: any) => rows[0])

  if (!project) {
    throw new ForbiddenError("Project not found.")
  }

  const assignment = await tx
    .select({ classId: userClassAssignments.classId })
    .from(userClassAssignments)
    .where(
      and(
        eq(userClassAssignments.userId, teacherId),
        eq(userClassAssignments.classId, project.classId),
      ),
    )
    .limit(1)
    .then((rows: any) => rows[0])

  if (!assignment) {
    throw new ForbiddenError("You do not manage this project.")
  }
}

async function evaluateStageCompletion(
  tx: any,
  studentId: string,
  projectId: string,
  stageId: string,
) {
  const stage = await tx
    .select({ id: projectStages.id, order: projectStages.order })
    .from(projectStages)
    .where(eq(projectStages.id, stageId))
    .limit(1)
    .then((rows: any) => rows[0])

  if (!stage) {
    return
  }

  const requiredTeacherInstruments = await tx
    .select({
      instrumentType: projectStageInstruments.instrumentType,
      isRequired: projectStageInstruments.isRequired,
      description: projectStageInstruments.description,
    })
    .from(projectStageInstruments)
    .where(eq(projectStageInstruments.projectStageId, stageId))
    .then((rows: any) => rows.filter((row: any) => row.isRequired && row.instrumentType === "OBSERVATION"))

  if (requiredTeacherInstruments.length === 0) {
    return
  }

  const observationSubmission = await tx
    .select({
      id: submissions.id,
      score: submissions.score,
    })
    .from(submissions)
    .innerJoin(templateStageConfigs, eq(submissions.templateStageConfigId, templateStageConfigs.id))
    .where(
      and(
        eq(submissions.submittedById, studentId),
        eq(submissions.projectId, projectId),
        eq(submissions.projectStageId, stageId),
        eq(templateStageConfigs.instrumentType, "OBSERVATION"),
      ),
    )
    .limit(1)
    .then((rows: any) => rows[0])

  if (!observationSubmission || observationSubmission.score === null) {
    return
  }

  await tx
    .update(projectStageProgress)
    .set({
      status: "COMPLETED",
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(projectStageProgress.projectStageId, stageId),
        eq(projectStageProgress.studentId, studentId),
      ),
    )

  await unlockNextStage(tx, studentId, projectId, stage.order)
}

async function unlockNextStage(
  tx: any,
  studentId: string,
  projectId: string,
  currentOrder: number,
) {
  const nextStage = await tx
    .select({ id: projectStages.id, order: projectStages.order })
    .from(projectStages)
    .where(and(eq(projectStages.projectId, projectId), gt(projectStages.order, currentOrder)))
    .orderBy(asc(projectStages.order))
    .limit(1)
    .then((rows: any) => rows[0])

  if (!nextStage) {
    return
  }

  await tx
    .insert(projectStageProgress)
    .values({
      projectStageId: nextStage.id,
      studentId,
      status: "IN_PROGRESS",
      unlockedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [projectStageProgress.projectStageId, projectStageProgress.studentId],
      set: {
        status: "IN_PROGRESS",
        unlockedAt: new Date(),
        updatedAt: new Date(),
      },
    })
}
