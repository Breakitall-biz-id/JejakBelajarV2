import { NextResponse } from "next/server"
import { requireTeacherUser } from "@/lib/auth/session"
import { and, eq } from "drizzle-orm"
import { db } from "@/db"
import {
  submissions,
  projectStages,
  templateStageConfigs,
} from "@/db/schema/jejak"

export type JournalQuestionGradeRequest = {
  submissionId: string
  grades: Array<{
    rubricId: string
    score: string
  }>
}

export async function POST(request: Request) {
  try {
    const session = await requireTeacherUser()

    const body = await request.json()
    const { submissionId, grades }: JournalQuestionGradeRequest = body

    if (!submissionId || !grades || !Array.isArray(grades)) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    // Get the submission to verify teacher has access
    const submissionData = await db
      .select({
        id: submissions.id,
        projectStageId: submissions.projectStageId,
        submittedById: submissions.submittedById,
        content: submissions.content,
      })
      .from(submissions)
      .where(eq(submissions.id, submissionId))
      .limit(1)

    if (submissionData.length === 0) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    const submission = submissionData[0]

    // Get project stage to verify class access
    if (!submission.projectStageId) {
      return NextResponse.json({ error: "Project stage ID is required" }, { status: 400 })
    }

    const projectStageData = await db
      .select({
        id: projectStages.id,
        projectId: projectStages.projectId,
      })
      .from(projectStages)
      .where(eq(projectStages.id, submission.projectStageId))
      .limit(1)

    if (projectStageData.length === 0) {
      return NextResponse.json({ error: "Project stage not found" }, { status: 404 })
    }

    const projectStage = projectStageData[0]

    // Validate grades structure
    for (const grade of grades) {
      if (!grade.rubricId || !grade.score) {
        return NextResponse.json({ error: "All grades must have rubricId and score" }, { status: 400 })
      }

      // Score should be between 1 and 4
      const scoreNum = parseInt(grade.score)
      if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 4) {
        return NextResponse.json({ error: "Scores must be between 1 and 4" }, { status: 400 })
      }
    }

    // Calculate average score from rubric grades and round to integer
    const totalScore = grades.reduce((sum, grade) => sum + parseInt(grade.score), 0)
    const averageScore = Math.round(totalScore / grades.length)

    // Prepare the updated content structure
    let existingContent: any = submission.content || {}

    // Create the new content structure - preserve original format and add grades
    const updatedContent = {
      ...existingContent,
      grades: grades.map(grade => ({
        rubric_id: grade.rubricId,
        score: parseInt(grade.score),
      }))
    }

    // Update the submission with grades and average score
    const [updatedSubmission] = await db
      .update(submissions)
      .set({
        content: updatedContent,
        score: averageScore,
        updatedAt: new Date(),
      })
      .where(eq(submissions.id, submissionId))
      .returning()

    if (!updatedSubmission) {
      return NextResponse.json({ error: "Failed to update submission" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedSubmission.id,
        score: updatedSubmission.score,
        content: updatedSubmission.content,
        updatedAt: updatedSubmission.updatedAt,
      }
    })
  } catch (error) {
    console.error("[API /api/teacher/journal-question-assessment POST]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}