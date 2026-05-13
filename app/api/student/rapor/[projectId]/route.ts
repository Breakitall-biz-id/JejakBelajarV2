import { NextResponse } from "next/server"
import { requireStudentUser } from "@/lib/auth/session"
import { calculateStudentDimensionScores } from "@/lib/scoring/dimension-scorer"
import { db } from "@/db"
import {
  projects,
  classes,
  academicTerms,
  userClassAssignments,
  teacherFeedbacks,
  groupComments,
  groups,
  groupMembers,
} from "@/db/schema/jejak"
import { user } from "@/db/schema/auth"
import { eq, and, desc } from "drizzle-orm"
import type { CurrentUser } from "@/lib/auth/session"
import { convertToQualitativeScore } from "@/lib/scoring/qualitative-converter"

export type RaporData = {
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
  }>
  overallAverageScore: number
  overallQualitativeScore: string
  overallQualitativeCode: string
  performanceInsights: {
    strengths: string[]
    areasForImprovement: string[]
    recommendations: string[]
  }
  teacherFeedback: {
    teacherName: string | null
    feedback: string
    createdAt: string
  } | null
  peerFeedback: Array<{
    authorName: string | null
    comment: string
    createdAt: string
  }>
  generatedAt: string
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await requireStudentUser()
    const student = session.user
    const { projectId } = await params

    // Get project details with class and teacher information
    const projectData = await db
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
      .leftJoin(user, eq(projects.teacherId, user.id))
      .where(eq(projects.id, projectId))
      .limit(1)

    if (projectData.length === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    const { project: projectInfo, class: classInfo, teacher: teacherInfo } = projectData[0]

    // Calculate dimension scores for this student in this project
    const dimensionScoresData = await calculateStudentDimensionScores(student.id, projectId)

    // Generate qualitative scores with full result
    const dimensionScores = dimensionScoresData.dimensionScores.map(dimension => {
      const qualitativeResult = convertToQualitativeScore(dimension.averageScore)
      return {
        ...dimension,
        qualitativeScore: qualitativeResult.qualitativeScore,
        qualitativeCode: qualitativeResult.qualitativeCode,
      }
    })

    const overallQualitativeResult = convertToQualitativeScore(dimensionScoresData.overallAverageScore)

    // Generate performance insights
    const performanceInsights = generatePerformanceInsights(dimensionScores)

    // Fetch teacher feedback for this student and project
    const teacherFeedbackResult = await db
      .select({
        feedback: teacherFeedbacks.feedback,
        createdAt: teacherFeedbacks.createdAt,
        teacherName: user.name,
      })
      .from(teacherFeedbacks)
      .leftJoin(user, eq(teacherFeedbacks.teacherId, user.id))
      .where(and(
        eq(teacherFeedbacks.studentId, student.id),
        eq(teacherFeedbacks.projectId, projectId)
      ))
      .limit(1)

    // Fetch peer feedback (group comments targeting this student)
    const peerFeedbackResult = await db
      .select({
        comment: groupComments.comment,
        createdAt: groupComments.createdAt,
        authorName: user.name,
      })
      .from(groupComments)
      .leftJoin(user, eq(groupComments.authorId, user.id))
      .where(eq(groupComments.targetMemberId, student.id))
      .orderBy(desc(groupComments.createdAt))

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
      performanceInsights,
      teacherFeedback: teacherFeedbackResult.length > 0 ? {
        teacherName: teacherFeedbackResult[0].teacherName,
        feedback: teacherFeedbackResult[0].feedback,
        createdAt: teacherFeedbackResult[0].createdAt.toISOString(),
      } : null,
      peerFeedback: peerFeedbackResult.map(pf => ({
        authorName: pf.authorName,
        comment: pf.comment,
        createdAt: pf.createdAt.toISOString(),
      })),
      generatedAt: new Date().toISOString(),
    }

    return NextResponse.json(raporData)
  } catch (error) {
    console.error("Error generating rapor:", error)
    return NextResponse.json(
      { error: "Failed to generate rapor" },
      { status: 500 }
    )
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