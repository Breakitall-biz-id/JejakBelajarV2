import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { dimensions } from "@/db/schema/jejak"
import { eq } from "drizzle-orm"
import { getCurrentUser } from "@/lib/auth/session"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const allDimensions = await db
      .select({
        id: dimensions.id,
        name: dimensions.name,
        description: dimensions.description,
      })
      .from(dimensions)
      .orderBy(dimensions.name)

    return NextResponse.json({
      success: true,
      data: allDimensions,
    })
  } catch (error) {
    console.error("Error fetching dimensions:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}