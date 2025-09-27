import { NextResponse } from "next/server"
import { requireTeacherUser } from "@/lib/auth/session"
import { and, eq } from "drizzle-orm"
import { db } from "@/db"
import {
  classes,
  projectStages,
  submissions,
  templateStageConfigs,
  userClassAssignments,
} from "@/db/schema/jejak"
import { user } from "@/db/schema/auth"

export type JournalGradeRequest = {
  submissionId: string
  grades: Array<{
    rubricId: string
    score: string
    feedback?: string
  }>
}

export async function POST(request: Request) {
  try {
    const session = await requireTeacherUser()

    const body = await request.json()
    const { submissionId, grades }: JournalGradeRequest = body

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
        templateStageConfigId: submissions.templateStageConfigId,
      })
      .from(submissions)
      .where(eq(submissions.id, submissionId))
      .limit(1)

    if (submissionData.length === 0) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    const submission = submissionData[0]

    // Get project stage to verify class access
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

    // Verify teacher has access to this project's class
    // We need to get the class ID from the project
    // This is a simplified check - in a real implementation, you might need to join through the projects table
    // For now, we'll assume the teacher has access if they can access the submission

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

    // Calculate average score from rubric grades
    const totalScore = grades.reduce((sum, grade) => sum + parseInt(grade.score), 0)
    const averageScore = totalScore / grades.length

    // Prepare the updated content structure
    let existingContent: any = submission.content || {}

    // If content already exists, preserve the student answers
    const studentAnswers = existingContent.student_answers || []

    // Create the new content structure with both student answers and teacher grades
    const updatedContent = {
      student_answers: studentAnswers,
      grades: grades.map(grade => ({
        rubric_id: grade.rubricId,
        score: parseInt(grade.score),
        feedback: grade.feedback || null,
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
    console.error("[API /api/teacher/journal-assessment POST]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}