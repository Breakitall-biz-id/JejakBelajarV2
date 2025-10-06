import { NextResponse } from "next/server"
import { requireTeacherUser } from "@/lib/auth/session"
import { and, eq, inArray, or } from "drizzle-orm"
import { db } from "@/db"
import {
  classes,
  projects,
  projectStages,
  submissions,
  templateStageConfigs,
  userClassAssignments,
  groupMembers,
  groups,
  projectStageProgress,
} from "@/db/schema/jejak"
import { user } from "@/db/schema/auth"

export async function GET(request: Request) {
  try {
    const session = await requireTeacherUser()

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId")

    if (!classId) {
      return NextResponse.json({ error: "Missing classId parameter" }, { status: 400 })
    }


    // Verify teacher has access to this class
    const classAccess = await db
      .select({ id: classes.id, name: classes.name })
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
      return NextResponse.json({ error: "Class not found or access denied" }, { status: 404 })
    }

    const classInfo = classAccess[0]

    // Get projects for this class
    const projectRows = await db
      .select({
        id: projects.id,
        title: projects.title,
      })
      .from(projects)
      .where(eq(projects.classId, classId))
      .orderBy(projects.title)

    const projectIds = projectRows.map(p => p.id)

    // Get stages for projects
    const stageRows = await db
      .select({
        id: projectStages.id,
        projectId: projectStages.projectId,
      })
      .from(projectStages)
      .where(inArray(projectStages.projectId, projectIds))

    const stageIds = stageRows.map(s => s.id)

    // Get students in this class
    const studentRows = await db
      .select({
        studentId: user.id,
        studentName: user.name,
        studentEmail: user.email,
      })
      .from(userClassAssignments)
      .innerJoin(user, eq(userClassAssignments.userId, user.id))
      .where(
        and(
          eq(userClassAssignments.classId, classId),
          eq(user.role, "STUDENT")
        )
      )

    const studentIds = studentRows.map(s => s.studentId)

    // Get group information
    let groupData: Array<{
      studentId: string
      groupName: string | null
      groupId: string | null
    }> = []

    try {
      const groupRows = await db
        .select({
          groupId: groups.id,
          groupName: groups.name,
          studentId: groupMembers.studentId,
        })
        .from(groups)
        .innerJoin(groupMembers, eq(groups.id, groupMembers.groupId))
        .where(inArray(groups.projectId, projectIds))

      groupData = groupRows
    } catch {
      // Continue without group data if tables don't exist
    }

    // Get submissions
    const submissionRows = await db
      .select({
        submittedById: submissions.submittedById,
        targetStudentId: submissions.targetStudentId,
        projectStageId: submissions.projectStageId,
        score: submissions.score,
        submittedAt: submissions.submittedAt,
        instrumentType: templateStageConfigs.instrumentType,
      })
      .from(submissions)
      .innerJoin(templateStageConfigs, eq(submissions.templateStageConfigId, templateStageConfigs.id))
      .where(
        and(
          inArray(submissions.projectStageId, stageIds),
          or(
            inArray(submissions.submittedById, studentIds),
            inArray(submissions.targetStudentId, studentIds)
          )
        )
      )

    // Get progress data for completion rates
    const progressRows = await db
      .select({
        studentId: projectStageProgress.studentId,
        projectStageId: projectStageProgress.projectStageId,
        status: projectStageProgress.status,
      })
      .from(projectStageProgress)
      .where(
        and(
          inArray(projectStageProgress.projectStageId, stageIds),
          inArray(projectStageProgress.studentId, studentIds)
        )
      )


    // Transform data
    const students = studentRows.map(student => {
      const groupMembership = groupData.find(g => g.studentId === student.studentId)
      const studentSubmissions = submissionRows.filter(s =>
        s.submittedById === student.studentId || s.targetStudentId === student.studentId
      )
      const studentProgress = progressRows.filter(p => p.studentId === student.studentId)

      const projectGrades = projectRows.map(project => {
        const projectStageIds = stageRows.filter(s => s.projectId === project.id).map(s => s.id)
        const projectSubmissions = studentSubmissions.filter(s =>
          s.projectStageId && projectStageIds.includes(s.projectStageId)
        )

        // Calculate average grade for this project using new formula
        const scores = projectSubmissions
          .map(s => s.score)
          .filter((score): score is number => score !== null)

        // IMPLEMENTASI FORMULA BARU: X = ((jumlah skor pada seluruh item) / (jumlah item x 4)) x 100
        const avgGrade = scores.length > 0
          ? ((scores.reduce((sum, score) => sum + score, 0)) / (scores.length * 4)) * 100
          : null

        // Get submission count vs total possible submissions
        const completedStages = studentProgress.filter(p =>
          p.projectStageId && projectStageIds.includes(p.projectStageId) &&
          p.status === "COMPLETED"
        ).length

        return {
          projectId: project.id,
          projectTitle: project.title,
          grade: avgGrade,
          submissions: completedStages,
          maxSubmissions: projectStageIds.length,
        }
      })

      // Calculate overall average grade using new formula
      // Collect all individual scores from all projects for this student
      const allIndividualScores = projectGrades.flatMap(pg =>
        studentSubmissions
          .filter(s => s.projectStageId && stageRows.some(sr => sr.projectId === pg.projectId && sr.id === s.projectStageId))
          .map(s => s.score)
          .filter((score): score is number => score !== null)
      )

      // IMPLEMENTASI FORMULA BARU: X = ((jumlah skor pada seluruh item) / (jumlah item x 4)) x 100
      const averageGrade = allIndividualScores.length > 0
        ? ((allIndividualScores.reduce((sum, score) => sum + score, 0)) / (allIndividualScores.length * 4)) * 100
        : 0

      // Calculate completion rate
      const totalPossibleStages = stageIds.length
      const completedStages = studentProgress.filter(p => p.status === "COMPLETED").length
      const completionRate = totalPossibleStages > 0
        ? Math.round((completedStages / totalPossibleStages) * 100)
        : 0

      return {
        id: student.studentId,
        name: student.studentName || "Siswa Tidak Dikenal",
        email: student.studentEmail,
        className: classInfo.name,
        groupName: groupMembership?.groupName,
        projectGrades,
        averageGrade,
        totalSubmissions: studentSubmissions.length,
        completionRate,
      }
    })

    return NextResponse.json({
      className: classInfo.name,
      students,
      projects: projectRows,
    })
  } catch (error) {
    console.error("Error fetching class detail:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}