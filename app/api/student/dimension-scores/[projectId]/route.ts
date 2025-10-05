import { NextResponse } from "next/server"

import { requireStudentUser } from "@/lib/auth/session"
import { calculateStudentDimensionScores } from "@/lib/scoring/dimension-scorer"
import type { CurrentUser } from "@/lib/auth/session"

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await requireStudentUser()
    const student = session.user
    const projectId = params.projectId

    // Calculate dimension scores for this student in this project
    const dimensionScores = await calculateStudentDimensionScores(student.id, projectId)

    return NextResponse.json(dimensionScores)
  } catch (error) {
    console.error("Error fetching student dimension scores:", error)
    return NextResponse.json(
      { error: "Failed to fetch dimension scores" },
      { status: 500 }
    )
  }
}