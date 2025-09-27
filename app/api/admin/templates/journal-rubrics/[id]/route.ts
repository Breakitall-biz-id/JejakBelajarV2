import { NextResponse } from "next/server"
import { requireAdminUser } from "@/lib/auth/session"
import { db } from "@/db"
import { templateJournalRubrics } from "@/db/schema/jejak"
import { eq } from "drizzle-orm"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdminUser()

    const body = await request.json()
    const { indicatorText, criteria } = body

    if (!indicatorText || !criteria) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate criteria structure
    if (typeof criteria !== 'object' || !criteria['4'] || !criteria['3'] || !criteria['2'] || !criteria['1']) {
      return NextResponse.json({ error: "Criteria must include scores 1, 2, 3, and 4" }, { status: 400 })
    }

    const [updatedRubric] = await db
      .update(templateJournalRubrics)
      .set({
        indicatorText,
        criteria,
        updatedAt: new Date(),
      })
      .where(eq(templateJournalRubrics.id, params.id))
      .returning()

    if (!updatedRubric) {
      return NextResponse.json({ error: "Rubric not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: updatedRubric
    })
  } catch (error) {
    console.error(`[API /api/admin/templates/journal-rubrics/${params.id} PUT]`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdminUser()

    const [deletedRubric] = await db
      .delete(templateJournalRubrics)
      .where(eq(templateJournalRubrics.id, params.id))
      .returning()

    if (!deletedRubric) {
      return NextResponse.json({ error: "Rubric not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: deletedRubric
    })
  } catch (error) {
    console.error(`[API /api/admin/templates/journal-rubrics/${params.id} DELETE]`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}