import { NextResponse } from "next/server"
import { requireAdminUser } from "@/lib/auth/session"
import { db } from "@/db"
import { templateJournalRubrics } from "@/db/schema/jejak"
import { eq } from "drizzle-orm"

export async function GET(request: Request) {
  try {
    const session = await requireAdminUser()

    const { searchParams } = new URL(request.url)
    const configId = searchParams.get("configId")

    if (!configId) {
      return NextResponse.json({ error: "Missing configId parameter" }, { status: 400 })
    }

    const rubrics = await db
      .select({
        id: templateJournalRubrics.id,
        indicatorText: templateJournalRubrics.indicatorText,
        criteria: templateJournalRubrics.criteria,
        dimensionId: templateJournalRubrics.dimensionId,
        createdAt: templateJournalRubrics.createdAt,
      })
      .from(templateJournalRubrics)
      .where(eq(templateJournalRubrics.configId, configId))
      .orderBy(templateJournalRubrics.createdAt)

    return NextResponse.json({
      success: true,
      data: rubrics
    })
  } catch (error) {
    console.error("[API /api/admin/templates/journal-rubrics GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdminUser()

    const body = await request.json()
    const { configId, indicatorText, criteria, dimensionId } = body

    if (!configId || !indicatorText || !criteria) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate criteria structure
    if (typeof criteria !== 'object' || !criteria['4'] || !criteria['3'] || !criteria['2'] || !criteria['1']) {
      return NextResponse.json({ error: "Criteria must include scores 1, 2, 3, and 4" }, { status: 400 })
    }

    const [newRubric] = await db
      .insert(templateJournalRubrics)
      .values({
        configId,
        indicatorText,
        criteria,
        dimensionId: dimensionId || null,
      })
      .returning()

    return NextResponse.json({
      success: true,
      data: newRubric
    })
  } catch (error) {
    console.error("[API /api/admin/templates/journal-rubrics POST]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}