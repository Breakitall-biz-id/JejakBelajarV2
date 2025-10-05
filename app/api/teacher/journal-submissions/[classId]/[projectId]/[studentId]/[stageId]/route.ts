import { NextResponse } from "next/server"
import { requireTeacherUser } from "@/lib/auth/session"
import { and, eq, inArray } from "drizzle-orm"
import { db } from "@/db"
import {
  submissions,
  templateStageConfigs,
  templateQuestions,
  templateJournalRubrics,
  dimensions,
} from "@/db/schema/jejak"
import { sql } from "drizzle-orm"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ classId: string; projectId: string; studentId: string; stageId: string }> }
) {
  try {
    const session = await requireTeacherUser()
    const { classId, projectId, studentId, stageId } = await params

    if (!projectId || !studentId || !stageId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Get all individual journal submissions for this student and stage
    const journalSubmissions = await db
      .select({
        id: submissions.id,
        content: submissions.content,
        submittedAt: submissions.submittedAt,
        score: submissions.score,
        feedback: submissions.feedback,
        templateStageConfigId: submissions.templateStageConfigId,
      })
      .from(submissions)
      .where(
        and(
          eq(submissions.projectId, projectId),
          eq(submissions.submittedById, studentId),
          eq(submissions.projectStageId, stageId)
        )
      )
      .orderBy(submissions.submittedAt)

    // Get template config for dimension information
    const configIds = [...new Set(journalSubmissions.map(s => s.templateStageConfigId).filter(Boolean))]
    const questionDimensions = configIds.length > 0
      ? await db
          .select({
            configId: templateQuestions.configId,
            questionIndex: sql<number>`ROW_NUMBER() OVER (PARTITION BY ${templateQuestions.configId} ORDER BY ${templateQuestions.createdAt})`.as('question_index'),
            dimensionId: templateQuestions.dimensionId,
            dimensionName: dimensions.name,
          })
          .from(templateQuestions)
          .leftJoin(dimensions, eq(templateQuestions.dimensionId, dimensions.id))
          .where(sql`${templateQuestions.configId} IN (${sql.raw(configIds.map(id => `'${id}'`).join(', '))})`)
      : []

    // Create dimension lookup map
    const dimensionMap = new Map<string, { dimensionId: string; dimensionName: string }>()
    questionDimensions.forEach(qd => {
      dimensionMap.set(`${qd.configId}_${qd.questionIndex}`, {
        dimensionId: qd.dimensionId || 'default',
        dimensionName: qd.dimensionName || 'Umum'
      })
    })

    // Transform the data to match the expected format
    const transformedSubmissions = journalSubmissions
      .map(submission => {
        const content = submission.content as any || {}

        // Only include submissions that have journal question structure
        if (content.question_index === undefined || !content.question_text) {
          return null
        }

        // Get dimension information
        const dimensionKey = `${submission.templateStageConfigId}_${content.question_index}`
        const dimensionInfo = dimensionMap.get(dimensionKey) || {
          dimensionId: 'default',
          dimensionName: 'Umum'
        }

        return {
          id: submission.id,
          questionIndex: content.question_index || 0,
          questionText: content.question_text || "",
          answer: content.answer || "",
          submittedAt: submission.submittedAt,
          score: submission.score,
          feedback: submission.feedback,
          grades: content.grades || [],
          dimension: dimensionInfo,
        }
      })
      .filter((submission): submission is NonNullable<typeof submission> => submission !== null)

    return NextResponse.json({
      success: true,
      data: transformedSubmissions,
    })
  } catch (error) {
    console.error("[API /api/teacher/journal-submissions GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}