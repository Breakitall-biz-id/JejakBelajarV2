import { NextResponse } from "next/server"
import { requireTeacherUser } from "@/lib/auth/session"
import { calculateStudentDimensionScores } from "@/lib/scoring/dimension-scorer"
import { db } from "@/db"
import {
  projects,
  classes,
  academicTerms,
  userClassAssignments,
} from "@/db/schema/jejak"
import { user } from "@/db/schema/auth"
import { eq, and } from "drizzle-orm"
import { convertToQualitativeScore } from "@/lib/scoring/qualitative-converter"

export type StudentRaporData = {
  student: {
    id: string
    name: string | null
    email: string
  }
  project: {
    id: string
    title: string
    description: string | null
    theme: string | null
  }
  class: {
    id: string
    name: string
    academicYear: string | null
    semester: string | null
  }
  teacher: {
    id: string | null
    name: string | null
    email: string | null
  }
  dimensionScores: Array<{
    dimensionId: string
    dimensionName: string
    averageScore: number
    totalSubmissions: number
    maxScore: number
    qualitativeScore: string
    qualitativeCode: string
    qualitativeDescription: string
  }>
  overallAverageScore: number
  overallQualitativeScore: string
  overallQualitativeCode: string
  overallQualitativeDescription: string
  performanceInsights: {
    strengths: string[]
    areasForImprovement: string[]
    recommendations: string[]
  }
  generatedAt: string
}

export async function GET(
  _request: Request,
  { params }: { params: { classId: string; studentId: string } }
) {
  try {
    const session = await requireTeacherUser()
    const teacher = session.user
    const { classId, studentId } = params

    // Verify that the teacher has access to this class
    const classAccess = await db
      .select({ className: classes.name })
      .from(classes)
      .innerJoin(userClassAssignments, eq(classes.id, userClassAssignments.classId))
      .where(and(
        eq(classes.id, classId),
        eq(userClassAssignments.userId, teacher.id)
      ))
      .limit(1)

    if (classAccess.length === 0) {
      return NextResponse.json(
        { error: "Unauthorized access to this class" },
        { status: 403 }
      )
    }

    // Get project and class information
    const projectResult = await db
      .select({
        id: projects.id,
        title: projects.title,
        description: projects.description,
        theme: projects.theme,
        classId: projects.classId,
        teacherId: projects.teacherId,
      })
      .from(projects)
      .where(eq(projects.classId, classId))
      .limit(1)

    if (projectResult.length === 0) {
      return NextResponse.json(
        { error: "No project found for this class" },
        { status: 404 }
      )
    }

    const projectInfo = projectResult[0]

    // Get class information
    const classResult = await db
      .select({
        id: classes.id,
        name: classes.name,
        academicYear: academicTerms.academicYear,
        semester: academicTerms.semester,
      })
      .from(classes)
      .innerJoin(academicTerms, eq(classes.academicTermId, academicTerms.id))
      .where(eq(classes.id, classId))
      .limit(1)

    if (classResult.length === 0) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      )
    }

    const classInfo = classResult[0]

    // Get teacher information
    const teacherResult = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
      })
      .from(user)
      .where(eq(user.id, teacher.id))
      .limit(1)

    const teacherInfo = teacherResult[0] || null

    // Get student information
    const studentResult = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
      })
      .from(user)
      .where(eq(user.id, studentId))
      .limit(1)

    if (studentResult.length === 0) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      )
    }

    const studentInfo = studentResult[0]

  
    // Calculate dimension scores for this student in this project
    console.log(`[API Rapor] Processing: Student=${studentId}, Project=${projectInfo.id}, Class=${classId}`)
    const dimensionScoresData = await calculateStudentDimensionScores(studentId, projectInfo.id)

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

    const raporData: StudentRaporData = {
      student: {
        id: studentId,
        name: studentInfo?.name,
        email: studentInfo?.email || "",
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
    console.error("Error generating student rapor for teacher:", error)
    return NextResponse.json(
      { error: "Failed to generate student rapor" },
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

function generatePerformanceInsights(dimensionScores: StudentRaporData["dimensionScores"]) {
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