import { NextResponse } from "next/server"
import { requireTeacherUser } from "@/lib/auth/session"
import { and, eq, inArray } from "drizzle-orm"
import { db } from "@/db"
import {
  classes,
  projects as projectsTable,
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
    const studentId = searchParams.get("studentId")

    if (!classId || !studentId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
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

    // Get student info
    const studentInfo = await db
      .select({
        studentId: user.id,
        studentName: user.name,
        studentEmail: user.email,
      })
      .from(user)
      .innerJoin(userClassAssignments, eq(user.id, userClassAssignments.userId))
      .where(
        and(
          eq(userClassAssignments.classId, classId),
          eq(user.id, studentId),
          eq(user.role, "STUDENT")
        )
      )
      .limit(1)

    if (studentInfo.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const student = studentInfo[0]

    // Get projects for this class
    const projectRows = await db
      .select({
        id: projectsTable.id,
        title: projectsTable.title,
      })
      .from(projectsTable)
      .where(eq(projectsTable.classId, classId))
      .orderBy(projectsTable.title)

    const projectIds = projectRows.map(p => p.id)

    // Get stages for projects
    const stageRows = projectIds.length
      ? await db
        .select({
          id: projectStages.id,
          projectId: projectStages.projectId,
        })
        .from(projectStages)
        .where(inArray(projectStages.projectId, projectIds))
      : []

    const stageIds = stageRows.map(s => s.id)

    // Get submissions for this student
    const submissionRows = await db
      .select({
        projectStageId: submissions.projectStageId,
        projectId: submissions.projectId,
        instrumentType: templateStageConfigs.instrumentType,
        score: submissions.score,
        feedback: submissions.feedback,
        submittedAt: submissions.submittedAt,
      })
      .from(submissions)
      .innerJoin(templateStageConfigs, eq(submissions.templateStageConfigId, templateStageConfigs.id))
      .where(
        and(
          eq(submissions.submittedById, studentId),
          inArray(submissions.projectStageId, stageIds)
        )
      )

    // Get progress data
    const progressRows = await db
      .select({
        projectStageId: projectStageProgress.projectStageId,
        status: projectStageProgress.status,
      })
      .from(projectStageProgress)
      .where(
        and(
          eq(projectStageProgress.studentId, studentId),
          inArray(projectStageProgress.projectStageId, stageIds)
        )
      )

    // Get group information
    let groupMembership: { groupName: string | null } | null = null
    try {
      const groupResult = await db
        .select({
          groupName: groups.name,
        })
        .from(groups)
        .innerJoin(groupMembers, eq(groups.id, groupMembers.groupId))
        .where(
          and(
            inArray(groups.projectId, projectIds),
            eq(groupMembers.studentId, studentId)
          )
        )
        .limit(1)

      if (groupResult.length > 0) {
        groupMembership = groupResult[0]
      }
    } catch {
      // Continue without group data
    }

    // Transform data
    const projects = projectRows.map(project => {
      const projectStageIds = stageRows.filter(s => s.projectId === project.id).map(s => s.id)
      const projectSubmissions = submissionRows.filter(s =>
        s.projectStageId && projectStageIds.includes(s.projectStageId)
      )
      const projectProgress = progressRows.filter(p =>
        p.projectStageId && projectStageIds.includes(p.projectStageId)
      )

      // Calculate average grade for this project
      const scores = projectSubmissions
        .map(s => s.score)
        .filter((score): score is number => score !== null)

      const averageGrade = scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : null

      // Calculate completion rate
      const completedStages = projectProgress.filter(p => p.status === "COMPLETED").length
      const completionRate = projectStageIds.length > 0
        ? Math.round((completedStages / projectStageIds.length) * 100)
        : 0

      // Get last submission
      const lastSubmission = projectSubmissions
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0]

      return {
        id: project.id,
        title: project.title,
        grade: averageGrade,
        submissions: projectSubmissions.map(submission => ({
          id: `${project.id}-${submission.projectStageId}`,
          instrumentType: submission.instrumentType,
          score: submission.score,
          feedback: submission.feedback,
          submittedAt: submission.submittedAt.toISOString(),
        })),
        completionRate,
        lastSubmissionAt: lastSubmission?.submittedAt?.toISOString(),
      }
    })

    // Calculate overall stats
    const allScores = projects
      .map(p => p.grade)
      .filter((grade): grade is number => grade !== null)

    const overallAverageGrade = allScores.length > 0
      ? allScores.reduce((sum, grade) => sum + grade, 0) / allScores.length
      : 0

    const totalStages = stageIds.length
    const completedStagesOverall = progressRows.filter(p => p.status === "COMPLETED").length
    const overallCompletionRate = totalStages > 0
      ? Math.round((completedStagesOverall / totalStages) * 100)
      : 0

    return NextResponse.json({
      id: student.studentId,
      name: student.studentName || "Unknown Student",
      email: student.studentEmail,
      className: classInfo.name,
      groupName: groupMembership?.groupName,
      projects,
      averageGrade: overallAverageGrade,
      totalSubmissions: submissionRows.length,
      overallCompletionRate,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}