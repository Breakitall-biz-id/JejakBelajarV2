import { NextRequest, NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/auth/session"
import { db } from "@/db"
import { templateQuestions, dimensions } from "@/db/schema/jejak"
import { eq, sql } from "drizzle-orm"
import { z } from "zod"

const createQuestionSchema = z.object({
  configId: z.string(),
  questionText: z.string(),
  questionType: z.enum(["STATEMENT", "ESSAY_PROMPT"]),
  rubricCriteria: z.string().optional(),
  dimensionId: z.union([z.string().uuid().optional(), z.literal("no-dimension")]),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createQuestionSchema.parse(body)


    // Create the question
    const [newQuestion] = await db
      .insert(templateQuestions)
      .values({
        configId: validatedData.configId,
        questionText: validatedData.questionText,
        questionType: validatedData.questionType,
        rubricCriteria: validatedData.rubricCriteria || null,
        dimensionId: validatedData.dimensionId === "no-dimension" ? null : validatedData.dimensionId || null,
      })
      .returning()

    return NextResponse.json({
      success: true,
      data: newQuestion,
    })
  } catch (error) {
    console.error("Error creating question:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerAuthSession()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const configId = searchParams.get("configId")

    if (!configId) {
      return NextResponse.json(
        { error: "Config ID is required" },
        { status: 400 }
      )
    }

    const questions = await db
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
      .where(eq(templateQuestions.configId, configId))
      .orderBy(templateQuestions.createdAt)

    return NextResponse.json({
      success: true,
      data: questions,
    })
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    )
  }
}