import { NextResponse } from "next/server"
import { requireTeacherUser } from "@/lib/auth/session"
import { calculateClassDimensionScores, calculateStudentDimensionScores } from "@/lib/scoring/dimension-scorer"
import { db } from "@/db"
import { classes, userClassAssignments } from "@/db/schema/jejak"
import { user } from "@/db/schema/auth"
import { eq, and } from "drizzle-orm"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ classId: string; projectId: string }> }
) {
  try {
    const session = await requireTeacherUser()
    const { classId, projectId } = await params

    if (!classId || !projectId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Verify teacher has access to this class
    const classAccess = await db
      .select()
      .from(classes)
      .innerJoin(userClassAssignments, eq(classes.id, userClassAssignments.classId))
      .where(
        and(
          eq(classes.id, classId),
          eq(userClassAssignments.userId, session.user.id)
        )
      )
      .limit(1)

    if (classAccess.length === 0) {
      return NextResponse.json({ error: "Unauthorized access to class" }, { status: 403 })
    }

    // Get class name
    const className = classAccess[0].classes.name

    // Calculate dimension scores for the entire class
    const classScores = await calculateClassDimensionScores(classId, projectId)
    classScores.className = className

    // Get all students in class for individual scores
    const students = await db
      .select({
        userId: user.id,
        userName: user.name,
      })
      .from(userClassAssignments)
      .innerJoin(user, eq(userClassAssignments.userId, user.id))
      .where(and(
        eq(userClassAssignments.classId, classId),
        eq(user.role, 'STUDENT')
      ))

    // Calculate individual dimension scores for each student
    const studentScores = []
    for (const student of students) {
      try {
        const scores = await calculateStudentDimensionScores(student.userId, projectId)
        scores.studentName = student.userName
        studentScores.push(scores)
      } catch (error) {
        console.error(`Error calculating scores for student ${student.userId}:`, error)
        // Continue with other students, but add placeholder
        studentScores.push({
          studentId: student.userId,
          studentName: student.userName,
          dimensionScores: [],
          overallAverageScore: 0,
          overallQualitativeScore: "Tidak Ada Data"
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        classScores,
        studentScores,
        generatedAt: new Date().toISOString(),
      }
    })
  } catch (error) {
    console.error("[API /api/teacher/dimension-scores GET]", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}