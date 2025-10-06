import { NextResponse } from "next/server"
import { requireTeacherUser } from "@/lib/auth/session"
import { calculateStudentDimensionScores } from "@/lib/scoring/dimension-scorer"
import { db } from "@/db"
import {
  projects,
  classes,
  academicTerms,
  userClassAssignments
} from "@/db/schema/jejak"
import { user } from "@/db/schema/auth"
import { eq, and } from "drizzle-orm"
import type { CurrentUser } from "@/lib/auth/session"
import { convertToQualitativeScore } from "@/lib/scoring/qualitative-converter"
import type { RaporData } from "@/app/api/student/rapor/[projectId]/route"

export async function GET(
  request: Request,
  { params }: { params: { projectId: string; studentId: string } }
) {
  try {
    const session = await requireTeacherUser()
    const teacher = session.user
    const { projectId, studentId } = params

    // Verify teacher has access to this project/student
    const accessCheck = await db
      .select({
        project: {
          id: projects.id,
          title: projects.title,
          description: projects.description,
          theme: projects.theme,
          classId: projects.classId,
          teacherId: projects.teacherId,
        },
        class: {
          id: classes.id,
          name: classes.name,
          academicYear: academicTerms.academicYear,
          semester: academicTerms.semester,
        },
        teacher: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      })
      .from(projects)
      .innerJoin(classes, eq(projects.classId, classes.id))
      .innerJoin(academicTerms, eq(classes.academicTermId, academicTerms.id))
      .innerJoin(userClassAssignments, eq(classes.id, userClassAssignments.classId))
      .leftJoin(user, eq(projects.teacherId, user.id))
      .where(
        and(
          eq(projects.id, projectId),
          eq(userClassAssignments.userId, teacher.id)
        )
      )
      .limit(1)

    if (accessCheck.length === 0) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    // Get student information
    const studentInfo = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
      })
      .from(user)
      .where(eq(user.id, studentId))
      .limit(1)

    if (studentInfo.length === 0) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      )
    }

    const { project: projectInfo, class: classInfo, teacher: teacherInfo } = accessCheck[0]
    const student = studentInfo[0]

    // Calculate dimension scores for this student in this project
    const dimensionScoresData = await calculateStudentDimensionScores(student.id, projectId)

    // Generate qualitative scores with full result
    const dimensionScores = dimensionScoresData.dimensionScores.map(dimension => {
      const qualitativeResult = convertToQualitativeScore(dimension.averageScore)
      return {
        ...dimension,
        qualitativeScore: qualitativeResult.qualitativeScore,
        qualitativeCode: qualitativeResult.qualitativeCode,
        qualitativeDescription: getPerformanceDescription(qualitativeResult.qualitativeCode),
      }
    })

    const overallQualitativeResult = convertToQualitativeScore(dimensionScoresData.overallAverageScore)

    // Generate performance insights
    const performanceInsights = generatePerformanceInsights(dimensionScores)

    const raporData: RaporData = {
      student: {
        id: student.id,
        name: student.name,
        email: student.email || "",
      },
      project: projectInfo,
      class: classInfo,
      teacher: {
        id: teacherInfo?.id || null,
        name: teacherInfo?.name || null,
        email: teacherInfo?.email || null,
      },
      dimensionScores,
      overallAverageScore: dimensionScoresData.overallAverageScore,
      overallQualitativeScore: overallQualitativeResult.qualitativeScore,
      overallQualitativeCode: overallQualitativeResult.qualitativeCode,
      overallQualitativeDescription: getPerformanceDescription(overallQualitativeResult.qualitativeCode),
      performanceInsights,
      generatedAt: new Date().toISOString(),
    }

    return NextResponse.json(raporData)
  } catch (error) {
    console.error("Error generating student rapor:", error)
    return NextResponse.json(
      { error: "Failed to generate rapor" },
      { status: 500 }
    )
  }
}

function getPerformanceDescription(qualitativeCode: string): string {
  switch (qualitativeCode) {
    case "SB":
      return "Pencapaian sangat baik, melebihi harapan dengan konsistensi tinggi"
    case "B":
      return "Pencapaian baik, memenuhi harapan dengan performa stabil"
    case "C":
      return "Pencapaian cukup, memerlukan perhatian untuk peningkatan"
    case "R":
      return "Pencapaian kurang, perlu bimbingan dan dukungan tambahan"
    case "SR":
      return "Pencapaian sangat rendah, memerlukan intervensi intensif"
    default:
      return "Tidak dapat dievaluasi"
  }
}

function generatePerformanceInsights(dimensionScores: RaporData["dimensionScores"]) {
  // Update thresholds untuk skala 0-100
  // 3.5/4.0 = 87.5%, 3.0/4.0 = 75%, 6.25 (threshold untuk R)
  const strengths = dimensionScores
    .filter(d => d.averageScore >= 87.5) // SB threshold (81.25+)
    .map(d => d.dimensionName)

  const areasForImprovement = dimensionScores
    .filter(d => d.averageScore < 75 && d.averageScore > 6.25) // Below B threshold but above SR
    .map(d => d.dimensionName)

  // Generate recommendations based on performance patterns
  const recommendations: string[] = []

  if (strengths.length > 0) {
    recommendations.push("Terus kembangkan keunggulan dalam " + strengths.join(" dan "))
  }

  if (areasForImprovement.length > 0) {
    recommendations.push("Berikan perhatian khusus pada pengembangan " + areasForImprovement.join(" dan "))
  }

  const creativityScore = dimensionScores.find(d => d.dimensionName.toLowerCase().includes("kreativitas"))
  if (creativityScore && creativityScore.averageScore < 75) { // B threshold
    recommendations.push("Libatkan dalam aktivitas yang merangsang pemikiran kreatif dan inovatif")
  }

  const collaborationScore = dimensionScores.find(d => d.dimensionName.toLowerCase().includes("kolaborasi"))
  if (collaborationScore && collaborationScore.averageScore < 75) { // B threshold
    recommendations.push("Berikan kesempatan lebih banyak untuk bekerja dalam tim")
  }

  if (recommendations.length === 0) {
    recommendations.push("Pertahankan performa yang baik dan terus tingkatkan diri")
  }

  return {
    strengths,
    areasForImprovement,
    recommendations,
  }
}