"use server"

import { z } from "zod"
import { and, asc, eq, gt, sql } from "drizzle-orm"

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

async function validateStudentProjectAccess(tx: any, studentId: string, classId: string, projectId: string) {
  // Check if student is assigned to the class
  const classAssignment = await tx
    .select({ userId: userClassAssignments.userId })
    .from(userClassAssignments)
    .where(
      and(
        eq(userClassAssignments.userId, studentId),
        eq(userClassAssignments.classId, classId)
      )
    )
    .limit(1)

  if (classAssignment.length === 0) {
    throw new ForbiddenError("Student is not assigned to this class.")
  }

  // Check if project exists and belongs to the class
  const project = await tx
    .select({ id: projects.id })
    .from(projects)
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.classId, classId)
      )
    )
    .limit(1)

  if (project.length === 0) {
    throw new ForbiddenError("Project not found or does not belong to this class.")
  }
}

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

export const studentInstrumentSchema = z.enum([
  "JOURNAL",
  "SELF_ASSESSMENT",
  "PEER_ASSESSMENT",
  "DAILY_NOTE",
  "OBSERVATION",
] as const)

export const questionnaireSchema = z.object({
  projectId: z.string().uuid(),
  stageId: z.string().uuid(),
  instrumentType: studentInstrumentSchema,
  targetStudentId: z.string().uuid().optional().nullable(),
  answers: z.record(z.string(), z.number().min(1).max(4)),
})

const submissionSchema = z.object({
  projectId: z.string().uuid(),
  stageId: z.string().uuid(),
  instrumentType: studentInstrumentSchema,
  content: z.union([
    z.object({ text: z.string().trim().min(1, "Response is required") }),
    z.object({ answers: z.array(z.number().min(1).max(4)).min(1) }),
    z.object({ texts: z.array(z.string().trim().min(1, "Response is required")).min(1) })
  ]),
  targetStudentId: z.string().uuid().optional().nullable(),
})

// Schema for individual journal question submission
const journalQuestionSchema = z.object({
  projectId: z.string().uuid(),
  stageId: z.string().uuid(),
  questionIndex: z.number().min(0),
  questionText: z.string().trim().min(1, "Question text is required"),
  answer: z.string().trim().min(1, "Response is required"),
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
        .then((rows: any[]) => rows[0])

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
        .then((rows: any[]) => rows[0])

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
        .then((rows: any[]) => rows[0])

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
        .then((rows: any[]) => rows[0])

      if (!templateConfig) {
        throw new ForbiddenError("Instrument configuration not found for this stage.")
      }

      const existingSubmission = await tx
        .select({ id: submissions.id })
        .from(submissions)
        .where(
          and(
            eq(submissions.submittedById, student.user.id),
            eq(submissions.projectId, projectId),
            eq(submissions.projectStageId, stageId),
            eq(submissions.templateStageConfigId, templateConfig.id),
            ...(instrumentType === "PEER_ASSESSMENT" && targetStudentId
              ? [eq(submissions.targetStudentId, targetStudentId)]
              : []),
          ),
        )
        .limit(1)
        .then((rows: any[]) => rows[0])

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
          submittedBy: 'STUDENT',
          submittedById: student.user.id,
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

// New function for individual journal question submission
// Get journal submission status for a student
export async function getJournalSubmissionStatus(
  projectId: string,
  stageId: string,
): Promise<ActionResult<{
  questions: Array<{
    id: string
    questionText: string
    questionIndex: number
    isSubmitted: boolean
    submittedAt?: string
    answer?: string
  }>
  allSubmitted: boolean
}>> {
  try {
    const student = await requireStudentUser()

    const result = await db.transaction(async (tx) => {
      // Validate project access
      const projectRecord = await tx
        .select({
          id: projects.id,
          classId: projects.classId,
        })
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1)
        .then((rows: any[]) => rows[0])

      if (!projectRecord) {
        throw new ForbiddenError("Project not found.")
      }

      await validateStudentProjectAccess(tx, student.user.id, projectRecord.classId, projectId)

      // Get journal template configuration
      const templateConfig = await tx
        .select({ id: templateStageConfigs.id })
        .from(templateStageConfigs)
        .innerJoin(projects, eq(templateStageConfigs.templateId, projects.templateId))
        .innerJoin(projectStages, eq(projects.id, projectStages.projectId))
        .where(
          and(
            eq(projectStages.id, stageId),
            eq(templateStageConfigs.instrumentType, "JOURNAL"),
          ),
        )
        .limit(1)
        .then((rows: any[]) => rows[0])

      if (!templateConfig) {
        throw new ForbiddenError("Journal configuration not found for this stage.")
      }

      // Get all questions for this journal
      const journalQuestions = await tx
        .select({
          id: templateQuestions.id,
          questionText: templateQuestions.questionText,
        })
        .from(templateQuestions)
        .where(eq(templateQuestions.configId, templateConfig.id))
        .orderBy(asc(templateQuestions.id))

      // Get existing submissions for this student
      const existingSubmissions = await tx
        .select({
          content: submissions.content,
          submittedAt: submissions.submittedAt,
        })
        .from(submissions)
        .where(
          and(
            eq(submissions.submittedById, student.user.id),
            eq(submissions.projectId, projectId),
            eq(submissions.projectStageId, stageId),
            eq(submissions.templateStageConfigId, templateConfig.id),
          ),
        )

      // Create a map of submitted questions by index
      const submittedMap = new Map()
      existingSubmissions.forEach(sub => {
        const content = sub.content as any
        if (content?.questionIndex !== undefined) {
          submittedMap.set(content.questionIndex, {
            answer: content.text,
            submittedAt: sub.submittedAt,
          })
        }
      })

      // Combine questions with their submission status
      const questionsWithStatus = journalQuestions.map((question, index) => ({
        id: question.id,
        questionText: question.questionText,
        questionIndex: index,
        isSubmitted: submittedMap.has(index),
        submittedAt: submittedMap.get(index)?.submittedAt,
        answer: submittedMap.get(index)?.answer,
      }))

      const allSubmitted = questionsWithStatus.every(q => q.isSubmitted)

      return {
        questions: questionsWithStatus,
        allSubmitted,
      }
    })

    return { success: true, data: result }
  } catch (error) {
    return handleError(error, "Unable to fetch journal submission status.") as ActionResult<{
      questions: Array<{
        id: string
        questionText: string
        questionIndex: number
        isSubmitted: boolean
        submittedAt?: string
        answer?: string
      }>
      allSubmitted: boolean
    }>
  }
}

export async function submitJournalQuestion(
  values: z.input<typeof journalQuestionSchema>,
): Promise<ActionResult> {
  const parsed = journalQuestionSchema.safeParse(values)
  if (!parsed.success) {
    return {
      success: false,
      error: "Please review your response.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const { projectId, stageId, questionIndex, questionText, answer } = parsed.data

  try {
    const student = await requireStudentUser()

    await db.transaction(async (tx) => {
      // Get project and stage records for validation
      const projectRecord = await tx
        .select({
          id: projects.id,
          classId: projects.classId,
          templateId: projects.templateId,
        })
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1)
        .then((rows: any[]) => rows[0])

      if (!projectRecord) {
        throw new ForbiddenError("Project not found.")
      }

      const stageRecord = await tx
        .select({
          id: projectStages.id,
          projectTemplateId: projects.templateId,
        })
        .from(projectStages)
        .innerJoin(projects, eq(projectStages.projectId, projects.id))
        .where(eq(projectStages.id, stageId))
        .limit(1)
        .then((rows: any[]) => rows[0])

      if (!stageRecord) {
        throw new ForbiddenError("Stage not found.")
      }

      // Validate student has access to this project
      await validateStudentProjectAccess(tx, student.user.id, projectRecord.classId, projectId)

      // Check if journal instrument is required for this stage
      const stageInstruments = await tx
        .select({
          instrumentType: projectStageInstruments.instrumentType,
        })
        .from(projectStageInstruments)
        .where(eq(projectStageInstruments.projectStageId, stageId))

      const instrumentTypesForStage = new Set(stageInstruments.map((instrument) => instrument.instrumentType))

      if (!instrumentTypesForStage.has("JOURNAL")) {
        throw new ForbiddenError("Journal instrument is not required for the selected stage.")
      }

      const progress = await ensureStageProgress(tx, student.user.id, stageRecord)

      if (progress.status === "LOCKED") {
        throw new ForbiddenError("This stage is locked. Complete previous stages first.")
      }

      // Get the journal template configuration
      const templateConfig = await tx
        .select({
          id: templateStageConfigs.id,
          stageName: templateStageConfigs.stageName,
        })
        .from(templateStageConfigs)
        .innerJoin(projects, eq(templateStageConfigs.templateId, projects.templateId))
        .innerJoin(projectStages, eq(projects.id, projectStages.projectId))
        .where(
          and(
            eq(projectStages.id, stageId),
            eq(templateStageConfigs.instrumentType, "JOURNAL"),
          ),
        )
        .limit(1)
        .then((rows: any[]) => rows[0])

      if (!templateConfig) {
        throw new ForbiddenError("Journal configuration not found for this stage.")
      }

      // Get all questions for this journal to determine total count
      const journalQuestions = await tx
        .select({
          id: templateQuestions.id,
          questionText: templateQuestions.questionText,
        })
        .from(templateQuestions)
        .where(eq(templateQuestions.configId, templateConfig.id))
        .orderBy(asc(templateQuestions.id))

      if (questionIndex >= journalQuestions.length) {
        throw new ForbiddenError("Invalid question index.")
      }

      // Check if submission already exists for this specific question
      const existingSubmission = await tx
        .select({ id: submissions.id })
        .from(submissions)
        .where(
          and(
            eq(submissions.submittedById, student.user.id),
            eq(submissions.projectId, projectId),
            eq(submissions.projectStageId, stageId),
            eq(submissions.templateStageConfigId, templateConfig.id),
            // Use question metadata to identify individual question submissions
            eq(submissions.content, sql`${JSON.stringify({
              questionIndex,
              questionText,
              text: answer
            })}::jsonb`)
          ),
        )
        .limit(1)
        .then((rows: any[]) => rows[0])

      if (existingSubmission) {
        // Update existing submission
        await tx
          .update(submissions)
          .set({
            content: {
              questionIndex,
              questionText,
              text: answer,
              submittedAt: new Date(),
            },
            submittedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(submissions.id, existingSubmission.id))
      } else {
        // Create new submission for this specific question
        await tx.insert(submissions).values({
          submittedBy: 'STUDENT',
          submittedById: student.user.id,
          projectId,
          projectStageId: stageId,
          templateStageConfigId: templateConfig.id,
          content: {
            questionIndex,
            questionText,
            text: answer,
          },
        })
      }

      // Check if all questions are now submitted to evaluate stage completion
      const allSubmissions = await tx
        .select({ content: submissions.content })
        .from(submissions)
        .where(
          and(
            eq(submissions.submittedById, student.user.id),
            eq(submissions.projectId, projectId),
            eq(submissions.projectStageId, stageId),
            eq(submissions.templateStageConfigId, templateConfig.id),
          ),
        )

      const submittedQuestions = new Set(
        allSubmissions.map(sub => {
          const content = sub.content as any
          return content?.questionIndex
        }).filter(Boolean)
      )

      // If all questions are submitted, mark journal instrument as complete
      if (submittedQuestions.size === journalQuestions.length) {
        await evaluateStageCompletion(tx, student.user.id, projectId, stageRecord.id)
      }
    })

    return { success: true }
  } catch (error) {
    return handleError(error, "Unable to save your journal response.")
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
    .then((rows: any[]) => rows[0])

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
    .then((rows: any[]) => rows[0])

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
    .then((rows: any[]) => rows[0])

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
    .then((rows: any[]) => rows[0])

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
    .then((rows: any[]) => rows[0])

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
    .filter((instrument: any) => instrument.isRequired && studentInstrumentTypes.has(instrument.instrumentType))
    .map((instrument: any) => instrument.instrumentType)

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
        eq(submissions.submittedById, studentId),
        eq(submissions.projectId, projectId),
        eq(submissions.projectStageId, stageId),
      ),
    )

  // Check if all required instruments have been submitted
  const submittedInstruments = new Set(studentSubmissions.map((s: any) => s.instrumentType))

  // For peer assessment, verify there's at least one submission with a target
  const hasPeerAssessment = requiredStudentInstruments.includes("PEER_ASSESSMENT")
  const hasValidPeerSubmission = hasPeerAssessment
    ? studentSubmissions.some((s: any) => s.instrumentType === "PEER_ASSESSMENT" && s.targetStudentId)
    : true

  // For journal assessment, verify all questions have been submitted (individual submissions)
  const hasJournalAssessment = requiredStudentInstruments.includes("JOURNAL")
  const hasCompleteJournalSubmission = hasJournalAssessment
    ? await checkCompleteJournalSubmission(tx, studentId, projectId, stageId)
    : true

  const hasFulfilledAll = requiredStudentInstruments.every((instrument: any) =>
    submittedInstruments.has(instrument)
  ) && hasValidPeerSubmission && hasCompleteJournalSubmission

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

async function checkCompleteJournalSubmission(
  tx: any,
  studentId: string,
  projectId: string,
  stageId: string,
): Promise<boolean> {
  // Get all journal submissions for this student and stage
  const journalSubmissions = await tx
    .select({
      content: submissions.content,
    })
    .from(submissions)
    .where(
      and(
        eq(submissions.submittedById, studentId),
        eq(submissions.projectId, projectId),
        eq(submissions.projectStageId, stageId),
        eq(submissions.instrumentType, "JOURNAL"),
      ),
    )

  // Get the total number of journal questions for this stage
  const journalQuestions = await tx
    .select({
      questionText: templateQuestions.questionText,
    })
    .from(templateQuestions)
    .innerJoin(
      templateStageConfigs,
      eq(templateQuestions.configId, templateStageConfigs.id)
    )
    .where(
      and(
        eq(templateStageConfigs.projectStageId, stageId),
        eq(templateStageConfigs.instrumentType, "JOURNAL"),
      ),
    )

  // Extract submitted question indices from individual submissions
  const submittedQuestionIndices = new Set<number>()
  journalSubmissions.forEach((submission: any) => {
    const content = submission.content as any || {}
    if (content.question_index !== undefined) {
      submittedQuestionIndices.add(content.question_index)
    }
  })

  // Check if all questions have been submitted
  return submittedQuestionIndices.size === journalQuestions.length
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
    .then((rows: any[]) => rows[0])

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
    .then((rows: any[]) => rows[0])

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
        .then((rows: any[]) => rows[0])

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
        .then((rows: any[]) => rows[0])

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
        .then((rows: any[]) => rows[0])

      if (!templateConfig) {
        throw new ForbiddenError("Instrument configuration not found for this stage.")
      }

      // Calculate total score from questionnaire responses
      const totalScore = Object.values(input.answers).reduce((sum: number, score: number) => sum + score, 0)
      const averageScore = totalScore / Object.keys(input.answers).length

      // Check if submission already exists
      const existingSubmission = await tx
        .select({ id: submissions.id })
        .from(submissions)
        .where(
          and(
            eq(submissions.submittedById, student.user.id),
            eq(submissions.projectId, input.projectId),
            eq(submissions.projectStageId, input.stageId),
            eq(submissions.templateStageConfigId, templateConfig.id),
            ...(input.targetStudentId ? [eq(submissions.targetStudentId, input.targetStudentId)] : []),
          ),
        )
        .limit(1)
        .then((rows: any[]) => rows[0])

      if (existingSubmission) {
        // Update existing submission
        await tx
          .update(submissions)
          .set({
            content: input.answers,
            score: Math.round(averageScore),
            submittedAt: new Date(),
          })
          .where(eq(submissions.id, existingSubmission.id))
      } else {
        // Create new submission
        await tx.insert(submissions).values({
          submittedBy: 'STUDENT',
          submittedById: student.user.id,
          projectId: input.projectId,
          projectStageId: input.stageId,
          templateStageConfigId: templateConfig.id,
          content: input.answers,
          score: Math.round(averageScore),
          targetStudentId: input.targetStudentId,
        })
      }

      return { success: true, data: undefined }
    })

    return result as ActionResult
  } catch (error) {
    return handleError(error, "Failed to submit questionnaire")
  }
}
