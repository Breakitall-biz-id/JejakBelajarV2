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
import { eq, and, isNotNull, gte, lte } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminUser()

    const { searchParams } = new URL(request.url)
    const termId = searchParams.get('termId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Get all teachers with their assigned classes
    const teachersData = await db
      .select({
        teacherId: users.id,
        teacherName: users.name,
        teacherEmail: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.role, 'TEACHER'))

    const reportData = []

    for (const teacher of teachersData) {
      // Get classes assigned to this teacher
      let teacherClasses = await db
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
        .where(eq(userClassAssignments.userId, teacher.teacherId))

      if (termId) {
        teacherClasses = teacherClasses.filter(cls => cls.termId === termId)
      }

      // Get all projects for teacher's classes
      const projectIds: string[] = []
      for (const cls of teacherClasses) {
        const projects = await db
          .select({ id: projects.id })
          .from(projects)
          .where(eq(projects.classId, cls.classId))

        projectIds.push(...projects.map(p => p.id))
      }

      // Get teacher's activities (observations and feedback)
      for (const projectId of projectIds) {
        // Get stages and instruments
        const stageInstruments = await db
          .select({
            instrumentId: projectStageInstruments.id,
            instrumentType: projectStageInstruments.instrumentType,
            stageId: projectStages.id,
            stageName: projectStages.name,
            projectName: projects.title,
          })
          .from(projectStageInstruments)
          .leftJoin(projectStages, eq(projectStageInstruments.stageId, projectStages.id))
          .leftJoin(projects, eq(projectStages.projectId, projects.id))
          .where(eq(projectStages.projectId, projectId))

        for (const instrument of stageInstruments) {
          // Get submissions for this instrument
          const submissionData = await db
            .select({
              submissionId: submissions.id,
              submittedAt: submissions.submittedAt,
              targetStudentId: submissions.targetStudentId,
              submittedBy: submissions.submittedBy,
              assessedBy: submissions.assessedBy,
            })
            .from(submissions)
            .where(eq(submissions.projectStageId, instrument.stageId))

          // Apply date filtering if provided
          let filteredSubmissions = submissionData
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

          for (const sub of filteredSubmissions) {
            // Check if this is a teacher activity (assessment by teacher)
            if (sub.assessedBy === teacher.teacherId || sub.submittedBy === 'TEACHER') {
              const activityType = instrument.instrumentType === 'OBSERVATION' ? 'Observasi' : 'Review Assessment'

              reportData.push({
                guru_id: teacher.teacherId,
                nama_guru: teacher.teacherName || 'N/A',
                email_guru: teacher.teacherEmail,
                tipe_aktivitas: activityType,
                deskripsi_aktivitas: `${activityType} untuk tahapan ${instrument.stageName} dalam proyek ${instrument.projectName}`,
                instrumen_id: instrument.instrumentId,
                tahapan: instrument.stageName,
                proyek: instrument.projectName,
                tanggal_aktivitas: sub.submittedAt ? new Date(sub.submittedAt).toLocaleString('id-ID') : 'N/A',
                siswa_id: sub.targetStudentId || 'N/A',
                status: 'Selesai',
              })
            }
          }
        }
      }

      // Summary for teacher
      const totalActivities = reportData.filter(r => r.guru_id === teacher.teacherId).length
      if (totalActivities > 0) {
        reportData.push({
          guru_id: teacher.teacherId,
          nama_guru: teacher.teacherName || 'N/A',
          email_guru: teacher.teacherEmail,
          tipe_aktivitas: 'RINGKASAN',
          deskripsi_aktivitas: `Total aktivitas guru: ${totalActivities} kegiatan`,
          instrumen_id: 'N/A',
          tahapan: 'N/A',
          proyek: 'N/A',
          tanggal_aktivitas: new Date().toLocaleDateString('id-ID'),
          siswa_id: 'N/A',
          status: 'Summary',
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: reportData,
      total: reportData.length,
    })

  } catch (error) {
    console.error('Error exporting teacher activity data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}