import { NextRequest, NextResponse } from 'next/server'
import { requireAdminUser } from '@/lib/auth/session'
import { db } from '@/db'
import {
  users,
  classes,
  academicTerms,
  submissions,
  projects,
  projectStages,
  projectStageInstruments,
  userClassAssignments
} from '@/drizzle/schema'
import { eq, and, isNotNull, gte, lte, inArray } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminUser()

    const { searchParams } = new URL(request.url)
    const termId = searchParams.get('termId')
    const classId = searchParams.get('classId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Get all students with their class assignments
    const studentsQuery = db
      .select({
        studentId: users.id,
        studentName: users.name,
        studentEmail: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.role, 'STUDENT'))

    // If class filter is applied, get only students from that class
    let studentsData = await studentsQuery

    if (classId) {
      const classAssignments = await db
        .select({ userId: userClassAssignments.userId })
        .from(userClassAssignments)
        .where(eq(userClassAssignments.classId, classId))

      const studentIds = classAssignments.map(ca => ca.userId)
      if (studentIds.length > 0) {
        studentsData = studentsData.filter(student => studentIds.includes(student.studentId))
      } else {
        studentsData = [] // No students in this class
      }
    }

    const reportData = []

    for (const student of studentsData) {
      // Get student's class assignments
      let studentClasses = await db
        .select({
          classId: classes.id,
          className: classes.name,
          termId: classes.academicTermId,
          termYear: academicTerms.academicYear,
          termSemester: academicTerms.semester,
          termStatus: academicTerms.status,
        })
        .from(userClassAssignments)
        .leftJoin(classes, eq(userClassAssignments.classId, classes.id))
        .leftJoin(academicTerms, eq(classes.academicTermId, academicTerms.id))
        .where(eq(userClassAssignments.userId, student.studentId))

      if (termId) {
        studentClasses = studentClasses.filter(cls => cls.termId === termId)
      }

      // Get all projects for student's classes
      const projectIds: string[] = []
      for (const cls of studentClasses) {
        const classProjects = await db
          .select({ id: projects.id, title: projects.title })
          .from(projects)
          .where(eq(projects.classId, cls.classId))

        projectIds.push(...classProjects.map(p => ({ id: p.id, name: p.title })))
      }

      // Track student engagement metrics
      let totalSubmissions = 0
      let journalSubmissions = 0
      let assessmentSubmissions = 0
      let selfAssessments = 0
      let peerAssessments = 0
      let observations = 0
      let lastSubmissionDate: Date | null = null
      let submissionStreak = 0

      const submissionDates: Date[] = []

      // Get student's submissions across all projects
      for (const { id: projectId, name: projectName } of projectIds) {
        // Get stages for this project
        const projectStagesData = await db
          .select({
            stageId: projectStages.id,
            stageName: projectStages.name,
            stageOrder: projectStages.order,
          })
          .from(projectStages)
          .where(eq(projectStages.projectId, projectId))

        for (const stageData of projectStagesData) {
          // Get submissions for this stage and student
          const stageSubmissions = await db
            .select({
              submissionId: submissions.id,
              submittedAt: submissions.submittedAt,
              submittedBy: submissions.submittedBy,
              content: submissions.content,
              targetStudentId: submissions.targetStudentId,
              projectStageId: submissions.projectStageId,
            })
            .from(submissions)
            .where(and(
              eq(submissions.projectStageId, stageData.stageId),
              eq(submissions.submittedById, student.studentId)
            ))

          // Apply date filtering
          let filteredSubmissions = stageSubmissions
          if (startDate) {
            filteredSubmissions = filteredSubmissions.filter(
              sub => sub.submittedAt >= new Date(startDate)
            )
          }
          if (endDate) {
            filteredSubmissions = filteredSubmissions.filter(
              sub => sub.submittedAt <= new Date(endDate)
            )
          }

          totalSubmissions += filteredSubmissions.length

          // Get instrument type for this stage - fixed
          const instrumentType = await db
            .select({
              type: projectStageInstruments.instrumentType,
            })
            .from(projectStageInstruments)
            .where(eq(projectStageInstruments.projectStageId, stageData.stageId))
            .limit(1)

          const type = instrumentType[0]?.type || 'UNKNOWN'

          // Track submission types
          if (type === 'JOURNAL') {
            journalSubmissions += filteredSubmissions.length
          } else if (type === 'SELF_ASSESSMENT') {
            selfAssessments += filteredSubmissions.length
          } else if (type === 'PEER_ASSESSMENT') {
            peerAssessments += filteredSubmissions.length
          } else if (type === 'OBSERVATION') {
            observations += filteredSubmissions.length
          }

          for (const sub of filteredSubmissions) {
            submissionDates.push(sub.submittedAt)
            reportData.push({
              siswa_id: student.studentId,
              nama_siswa: student.studentName || 'N/A',
              email_siswa: student.studentEmail,
              tipe_pengumpulan: type,
              deskripsi: `${type} untuk tahapan ${stageData.stageName}`,
              tahapan: stageData.stageName,
              proyek: projectName,
              tanggal_pengumpulan: sub.submittedAt ? new Date(sub.submittedAt).toLocaleString('id-ID') : 'N/A',
              konten_length: sub.content ? (typeof sub.content === 'string' ? sub.content.length : JSON.stringify(sub.content).length) : 0,
              status: 'Selesai',
            })
          }
        }
      }

      // Calculate streak (consecutive days with submissions)
      if (submissionDates.length > 0) {
        const sortedDates = submissionDates.map(d => new Date(d)).sort((a, b) => a.getTime() - b.getTime())
        submissionStreak = calculateSubmissionStreak(sortedDates)
        lastSubmissionDate = sortedDates[sortedDates.length - 1]
      }

      // Add summary for student
      if (totalSubmissions > 0) {
        reportData.push({
          siswa_id: student.studentId,
          nama_siswa: student.studentName || 'N/A',
          email_siswa: student.studentEmail,
          tipe_pengumpulan: 'RINGKASAN',
          deskripsi: 'Ringkasan engagement siswa',
          tahapan: 'N/A',
          proyek: 'N/A',
          tanggal_pengumpulan: lastSubmissionDate ? new Date(lastSubmissionDate).toLocaleDateString('id-ID') : 'N/A',
          konten_length: `Total: ${totalSubmissions}, Journal: ${journalSubmissions}, Self: ${selfAssessments}, Peer: ${peerAssessments}, Obs: ${observations}`,
          status: `Streak: ${submissionStreak} hari`,
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: reportData,
      total: reportData.length,
    })

  } catch (error) {
    console.error('Error exporting student engagement data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Calculate submission streak in days
 */
function calculateSubmissionStreak(dates: Date[]): number {
  if (dates.length === 0) return 0

  let streak = 1
  const sortedDates = dates.map(d => new Date(d)).sort((a, b) => a.getTime() - b.getTime())

  for (let i = sortedDates.length - 2; i >= 0; i--) {
    const current = sortedDates[i]
    const next = sortedDates[i + 1]

    const diffDays = Math.floor((next.getTime() - current.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays <= 1) {
      streak++
    } else {
      break
    }
  }

  return streak
}