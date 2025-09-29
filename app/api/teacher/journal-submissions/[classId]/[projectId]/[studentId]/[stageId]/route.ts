import { NextResponse } from "next/server"
import { requireTeacherUser } from "@/lib/auth/session"
import { and, eq } from "drizzle-orm"
import { db } from "@/db"
import {
  submissions,
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

    // Transform the data to match the expected format
    const transformedSubmissions = journalSubmissions
      .map(submission => {
        const content = submission.content as any || {}

        // Only include submissions that have journal question structure
        if (content.question_index === undefined || !content.question_text) {
          return null
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