import { NextRequest, NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/auth/session"
import { db } from "@/db"
import { templateQuestions, dimensions } from "@/db/schema/jejak"
import { eq } from "drizzle-orm"
import { z } from "zod"

const updateQuestionSchema = z.object({
  questionText: z.string(),
  questionType: z.enum(["STATEMENT", "ESSAY_PROMPT"]),
  rubricCriteria: z.string().optional(),
  dimensionId: z.union([z.string().uuid().optional(), z.literal("no-dimension")]),
})

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const session = await getServerAuthSession()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateQuestionSchema.parse(body)


    // Update the question
    const [updatedQuestion] = await db
      .update(templateQuestions)
      .set({
        questionText: validatedData.questionText,
        questionType: validatedData.questionType,
        rubricCriteria: validatedData.rubricCriteria || null,
        dimensionId: validatedData.dimensionId === "no-dimension" ? null : validatedData.dimensionId || null,
        updatedAt: new Date(),
      })
      .where(eq(templateQuestions.id, params.id))
      .returning()

    if (!updatedQuestion) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedQuestion,
    })
  } catch (error) {
    console.error("Error updating question:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const session = await getServerAuthSession()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete the question
    const deletedQuestion = await db
      .delete(templateQuestions)
      .where(eq(templateQuestions.id, params.id))
      .returning()

    if (!deletedQuestion.length) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Question deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting question:", error)
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const session = await getServerAuthSession()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const question = await db
      .select({
        id: templateQuestions.id,
        configId: templateQuestions.configId,
        questionText: templateQuestions.questionText,
        questionType: templateQuestions.questionType,
        scoringGuide: templateQuestions.scoringGuide,
        rubricCriteria: templateQuestions.rubricCriteria,
        dimensionId: templateQuestions.dimensionId,
        createdAt: templateQuestions.createdAt,
        updatedAt: templateQuestions.updatedAt,
        dimension: {
          id: dimensions.id,
          name: dimensions.name,
          description: dimensions.description,
        },
      })
      .from(templateQuestions)
      .leftJoin(dimensions, eq(templateQuestions.dimensionId, dimensions.id))
      .where(eq(templateQuestions.id, params.id))
      .limit(1)

    if (!question.length) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: question[0],
    })
  } catch (error) {
    console.error("Error fetching question:", error)
    return NextResponse.json(
      { error: "Failed to fetch question" },
      { status: 500 }
    )
  }
}