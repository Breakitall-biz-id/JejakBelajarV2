"use server"

import { z } from "zod"
import { and, asc, eq, gt } from "drizzle-orm"

import { db } from "@/db"
import {
  groupMembers,
  groups,
  projectStageInstruments,
  projectStageProgress,
  projectStages,
  projects,
  submissions,
  templateQuestions,
  templateStageConfigs,
  userClassAssignments,
} from "@/db/schema/jejak"
import {
  ForbiddenError,
  UnauthorizedError,
  requireStudentUser,
} from "@/lib/auth/session"

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

const studentInstrumentSchema = z.enum([
  "JOURNAL",
  "SELF_ASSESSMENT",
  "PEER_ASSESSMENT",
  "DAILY_NOTE",
  "OBSERVATION",
] as const)

const submissionSchema = z.object({
  projectId: z.string().uuid(),
  stageId: z.string().uuid(),
  instrumentType: studentInstrumentSchema,
  content: z.union([
    z.object({ text: z.string().trim().min(1, "Response is required") }),
    z.object({ answers: z.array(z.number().min(1).max(4)).min(1) })
  ]),
  targetStudentId: z.string().uuid().optional().nullable(),
})

const studentInstrumentTypes = new Set([
  "JOURNAL",
  "SELF_ASSESSMENT",
  "PEER_ASSESSMENT",
  "DAILY_NOTE",
])

export async function submitStageInstrument(
  values: z.input<typeof submissionSchema>,
): Promise<ActionResult> {
  const parsed = submissionSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      error: "Please review your submission.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const { projectId, stageId, instrumentType, content, targetStudentId } = parsed.data


  if (instrumentType === "PEER_ASSESSMENT" && !targetStudentId) {
    return {
      success: false,
      error: "Please select a peer to assess.",
    }
  }

  try {
    const student = await requireStudentUser()

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

      const classAssignment = await tx
        .select({ userId: userClassAssignments.userId })
        .from(userClassAssignments)
        .where(
          and(
            eq(userClassAssignments.userId, student.user.id),
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

      const stageInstruments = await tx
        .select({
          instrumentType: projectStageInstruments.instrumentType,
          isRequired: projectStageInstruments.isRequired,
          description: projectStageInstruments.description,
        })
        .from(projectStageInstruments)
        .where(eq(projectStageInstruments.projectStageId, stageId))

      const instrumentTypesForStage = new Set(stageInstruments.map((instrument) => instrument.instrumentType))

      if (!instrumentTypesForStage.has(instrumentType)) {
        throw new ForbiddenError("This instrument is not required for the selected stage.")
      }

      const progress = await ensureStageProgress(tx, student.user.id, stageRecord)

      if (progress.status === "LOCKED") {
        throw new ForbiddenError("This stage is locked. Complete previous stages first.")
      }

      if (instrumentType === "PEER_ASSESSMENT" && targetStudentId) {
        await validatePeerTarget(tx, student.user.id, projectId, targetStudentId)
      }

      const templateConfig = await tx
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

      if (!templateConfig) {
        throw new ForbiddenError("Instrument configuration not found for this stage.")
      }

      const existingSubmission = await tx
        .select({ id: submissions.id })
        .from(submissions)
        .where(
          and(
            eq(submissions.studentId, student.user.id),
            eq(submissions.projectId, projectId),
            eq(submissions.projectStageId, stageId),
            eq(submissions.templateStageConfigId, templateConfig.id),
            ...(instrumentType === "PEER_ASSESSMENT" && targetStudentId
              ? [eq(submissions.targetStudentId, targetStudentId)]
              : []),
          ),
        )
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
          studentId: student.user.id,
          projectId,
          projectStageId: stageId,
          templateStageConfigId: templateConfig.id,
          content,
          targetStudentId: targetStudentId ?? null,
        })
      }

      await evaluateStageCompletion(tx, student.user.id, projectId, stageRecord.id)
    })

    return { success: true }
  } catch (error) {
    return handleError(error, "Unable to save your response.")
  }
}

function handleError(error: unknown, fallback: string): ActionResult {
  if (error instanceof UnauthorizedError) {
    return { success: false, error: "You must be signed in to continue." }
  }

  if (error instanceof ForbiddenError) {
    return { success: false, error: error.message }
  }

  console.error(fallback, error)
  return { success: false, error: fallback }
}

async function ensureStageProgress(
  tx: any,
  studentId: string,
  stage: { id: string; order: number },
) {
  const existing = await tx
    .select()
    .from(projectStageProgress)
    .where(
      and(
        eq(projectStageProgress.projectStageId, stage.id),
        eq(projectStageProgress.studentId, studentId),
      ),
    )
    .limit(1)
    .then((rows) => rows[0])

  if (existing) {
    return existing
  }

  const [created] = await tx
    .insert(projectStageProgress)
    .values({
      projectStageId: stage.id,
      studentId,
      status: stage.order === 1 ? "IN_PROGRESS" : "LOCKED",
      unlockedAt: stage.order === 1 ? new Date() : null,
    })
    .returning()

  return created
}

async function validatePeerTarget(
  tx: any,
  studentId: string,
  projectId: string,
  targetStudentId: string,
) {
  if (studentId === targetStudentId) {
    throw new ForbiddenError("You cannot assess yourself.")
  }

  const studentGroup = await tx
    .select({ groupId: groups.id })
    .from(groups)
    .innerJoin(groupMembers, eq(groups.id, groupMembers.groupId))
    .where(
      and(
        eq(groups.projectId, projectId),
        eq(groupMembers.studentId, studentId),
      ),
    )
    .limit(1)
    .then((rows) => rows[0])

  if (!studentGroup) {
    throw new ForbiddenError("You are not assigned to a group for this project.")
  }

  const peer = await tx
    .select({ studentId: groupMembers.studentId })
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, studentGroup.groupId),
        eq(groupMembers.studentId, targetStudentId),
      ),
    )
    .limit(1)
    .then((rows) => rows[0])

  if (!peer) {
    throw new ForbiddenError("Peer not found in your group.")
  }
}

async function evaluateStageCompletion(
  tx: any,
  studentId: string,
  projectId: string,
  stageId: string,
) {
  const stage = await tx
    .select({
      id: projectStages.id,
      order: projectStages.order,
      projectId: projectStages.projectId,
    })
    .from(projectStages)
    .where(eq(projectStages.id, stageId))
    .limit(1)
    .then((rows) => rows[0])

  if (!stage) {
    return
  }

  const progress = await tx
    .select()
    .from(projectStageProgress)
    .where(
      and(
        eq(projectStageProgress.projectStageId, stageId),
        eq(projectStageProgress.studentId, studentId),
      ),
    )
    .limit(1)
    .then((rows) => rows[0])

  if (!progress) {
    return
  }

  const stageInstruments = await tx
    .select({
      instrumentType: projectStageInstruments.instrumentType,
      isRequired: projectStageInstruments.isRequired,
      description: projectStageInstruments.description,
    })
    .from(projectStageInstruments)
    .where(eq(projectStageInstruments.projectStageId, stageId))

  const requiredStudentInstruments = stageInstruments
    .filter((instrument) => instrument.isRequired && studentInstrumentTypes.has(instrument.instrumentType))
    .map((instrument) => instrument.instrumentType)

  if (requiredStudentInstruments.length === 0) {
    await markStageCompleted(tx, progress.id)
    await unlockNextStage(tx, studentId, projectId, stage.order)
    return
  }

  const studentSubmissions = await tx
    .select({
      instrumentType: templateStageConfigs.instrumentType,
      targetStudentId: submissions.targetStudentId,
    })
    .from(submissions)
    .leftJoin(templateStageConfigs, eq(submissions.templateStageConfigId, templateStageConfigs.id))
    .where(
      and(
        eq(submissions.studentId, studentId),
        eq(submissions.projectId, projectId),
        eq(submissions.projectStageId, stageId),
      ),
    )

  // Check if all required instruments have been submitted
  const submittedInstruments = new Set(studentSubmissions.map(s => s.instrumentType))

  // For peer assessment, verify there's at least one submission with a target
  const hasPeerAssessment = requiredStudentInstruments.includes("PEER_ASSESSMENT")
  const hasValidPeerSubmission = hasPeerAssessment
    ? studentSubmissions.some(s => s.instrumentType === "PEER_ASSESSMENT" && s.targetStudentId)
    : true

  const hasFulfilledAll = requiredStudentInstruments.every(instrument =>
    submittedInstruments.has(instrument)
  ) && hasValidPeerSubmission

  if (!hasFulfilledAll) {
    return
  }

  await markStageCompleted(tx, progress.id)
  await unlockNextStage(tx, studentId, projectId, stage.order)
}

async function markStageCompleted(
  tx: any,
  progressId: string,
) {
  await tx
    .update(projectStageProgress)
    .set({
      status: "COMPLETED",
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(projectStageProgress.id, progressId))
}

async function unlockNextStage(
  tx: any,
  studentId: string,
  projectId: string,
  currentOrder: number,
) {
  const nextStage = await tx
    .select({
      id: projectStages.id,
      order: projectStages.order,
    })
    .from(projectStages)
    .where(
      and(
        eq(projectStages.projectId, projectId),
        gt(projectStages.order, currentOrder),
      ),
    )
    .orderBy(asc(projectStages.order))
    .limit(1)
    .then((rows) => rows[0])

  if (!nextStage) {
    return
  }

  const nextProgress = await tx
    .select()
    .from(projectStageProgress)
    .where(
      and(
        eq(projectStageProgress.projectStageId, nextStage.id),
        eq(projectStageProgress.studentId, studentId),
      ),
    )
    .limit(1)
    .then((rows) => rows[0])

  if (!nextProgress) {
    await tx.insert(projectStageProgress).values({
      projectStageId: nextStage.id,
      studentId,
      status: "IN_PROGRESS",
      unlockedAt: new Date(),
    })
    return
  }

  if (nextProgress.status === "LOCKED") {
    await tx
      .update(projectStageProgress)
      .set({ status: "IN_PROGRESS", unlockedAt: new Date(), updatedAt: new Date() })
      .where(eq(projectStageProgress.id, nextProgress.id))
  }
}

const questionnaireInstrumentSchema = z.enum([
  "SELF_ASSESSMENT",
  "PEER_ASSESSMENT",
  "OBSERVATION",
] as const)



export async function getTemplateQuestions(
  stageId: string
): Promise<Array<{
  id: string
  questionText: string
  questionType: string
  scoringGuide?: string
}>> {
  try {
    if (!stageId) {
      return []
    }

    const questions = await db
      .select({
        id: templateQuestions.id,
        questionText: templateQuestions.questionText,
        questionType: templateQuestions.questionType,
        scoringGuide: templateQuestions.scoringGuide,
      })
      .from(templateQuestions)
      .innerJoin(templateStageConfigs, eq(templateQuestions.configId, templateStageConfigs.id))
      .innerJoin(projects, eq(templateStageConfigs.templateId, projects.templateId))
      .innerJoin(projectStages, eq(projects.id, projectStages.projectId))
      .where(eq(projectStages.id, stageId))
      .orderBy(asc(templateQuestions.id))

    return questions.map(q => ({
      ...q,
      scoringGuide: q.scoringGuide ?? undefined
    }))
  } catch (error) {
    console.error("Error fetching template questions:", error)
    return []
  }
}

export async function submitQuestionnaire(
  input: z.infer<typeof questionnaireSchema>
): Promise<ActionResult> {
  const student = await requireStudentUser()

  try {
    const result = await db.transaction(async (tx) => {
      // Validate class assignment
      const classAssignment = await tx
        .select({
          classId: userClassAssignments.classId,
        })
        .from(userClassAssignments)
        .innerJoin(projects, eq(userClassAssignments.classId, projects.classId))
        .where(
          and(
            eq(userClassAssignments.userId, student.user.id),
            eq(projects.id, input.projectId),
          ),
        )
        .limit(1)
        .then((rows) => rows[0])

      if (!classAssignment) {
        throw new ForbiddenError("You are not assigned to this project.")
      }

      // Validate that the stage exists
      const stageRecord = await tx
        .select({
          id: projectStages.id,
          name: projectStages.name,
        })
        .from(projectStages)
        .where(
          and(
            eq(projectStages.id, input.stageId),
            eq(projectStages.projectId, input.projectId),
          ),
        )
        .limit(1)
        .then((rows) => rows[0])

      if (!stageRecord) {
        throw new ForbiddenError("Stage not found.")
      }

      // Validate peer target for peer assessments
      if (input.instrumentType === "PEER_ASSESSMENT" && input.targetStudentId) {
        await validatePeerTarget(tx, student.user.id, input.projectId, input.targetStudentId)
      }

      // Find the template stage config for this instrument type
      const templateConfig = await tx
        .select({ id: templateStageConfigs.id })
        .from(templateStageConfigs)
        .innerJoin(projects, eq(templateStageConfigs.templateId, projects.templateId))
        .innerJoin(projectStages, eq(projects.id, projectStages.projectId))
        .where(
          and(
            eq(projectStages.id, input.stageId),
            eq(templateStageConfigs.instrumentType, input.instrumentType),
          ),
        )
        .limit(1)
        .then((rows) => rows[0])

      if (!templateConfig) {
        throw new ForbiddenError("Instrument configuration not found for this stage.")
      }

      // Calculate total score from questionnaire responses
      const totalScore = Object.values(input.content).reduce((sum, score) => sum + score, 0)
      const averageScore = totalScore / Object.keys(input.content).length

      // Check if submission already exists
      const existingSubmission = await tx
        .select({ id: submissions.id })
        .from(submissions)
        .where(
          and(
            eq(submissions.studentId, student.user.id),
            eq(submissions.projectId, input.projectId),
            eq(submissions.projectStageId, input.stageId),
            eq(submissions.templateStageConfigId, templateConfig.id),
            ...(input.targetStudentId ? [eq(submissions.targetStudentId, input.targetStudentId)] : []),
          ),
        )
        .limit(1)
        .then((rows) => rows[0])

      if (existingSubmission) {
        // Update existing submission
        await tx
          .update(submissions)
          .set({
            content: input.content,
            score: Math.round(averageScore),
            submittedAt: new Date(),
          })
          .where(eq(submissions.id, existingSubmission.id))
      } else {
        // Create new submission
        await tx.insert(submissions).values({
          studentId: student.user.id,
          projectId: input.projectId,
          projectStageId: input.stageId,
          templateStageConfigId: templateConfig.id,
          content: input.content,
          score: Math.round(averageScore),
          targetStudentId: input.targetStudentId,
        })
      }

      return { success: true, data: undefined }
    })

    return result
  } catch (error) {
    return handleError(error, "Failed to submit questionnaire")
  }
}
