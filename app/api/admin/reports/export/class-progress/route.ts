import { NextRequest, NextResponse } from 'next/server'
import { requireAdminUser } from '@/lib/auth/session'
import { db } from '@/db'
import {
  classes,
  users,
  projectStageInstruments,
  submissions,
  projects,
  projectStages,
  academicTerms,
  userClassAssignments
} from '@/drizzle/schema'
import { eq, and, isNotNull } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminUser()

    const { searchParams } = new URL(request.url)
    const termId = searchParams.get('termId')
    const classId = searchParams.get('classId')

    // Build base query
    let whereConditions = [isNotNull(classes.id)]

    if (termId) {
      whereConditions.push(eq(classes.academicTermId, termId))
    }

    if (classId) {
      whereConditions.push(eq(classes.id, classId))
    }

    // Get class data with teacher assignments
    const classData = await db
      .select({
        classId: classes.id,
        className: classes.name,
        classCreatedAt: classes.createdAt,
        termId: classes.academicTermId,
        termYear: academicTerms.academicYear,
        termSemester: academicTerms.semester,
        termStatus: academicTerms.status,
        teacherId: users.id,
        teacherName: users.name,
        teacherEmail: users.email,
      })
      .from(classes)
      .leftJoin(academicTerms, eq(classes.academicTermId, academicTerms.id))
      .leftJoin(userClassAssignments, eq(classes.id, userClassAssignments.classId))
      .leftJoin(users, eq(userClassAssignments.userId, users.id))
      .where(and(...whereConditions))

    // Get project and submission data for each class
    const reportData = []

    for (const cls of classData) {
      // Get projects for this class
      const classProjects = await db
        .select({
          projectId: projects.id,
          projectName: projects.title,
          projectTheme: projects.theme,
          projectStatus: projects.status,
          projectCreatedAt: projects.createdAt,
        })
        .from(projects)
        .where(eq(cls.classId, projects.classId))

      for (const project of classProjects) {
        // Get stages for this project
        const projectStagesData = await db
          .select({
            stageId: projectStages.id,
            stageName: projectStages.name,
            stageOrder: projectStages.order,
          })
          .from(projectStages)
          .where(eq(projectStages.projectId, project.projectId))
          .orderBy(projectStages.order)

        // Get instruments and submissions for each stage
        for (const stage of projectStagesData) {
          const instruments = await db
            .select({
              instrumentId: projectStageInstruments.id,
              instrumentType: projectStageInstruments.instrumentType,
              isRequired: projectStageInstruments.isRequired,
            })
            .from(projectStageInstruments)
            .where(eq(projectStageInstruments.stageId, stage.stageId))

          for (const instrument of instruments) {
            // Get submissions for this instrument (stage)
            const submissionCount = await db
              .select({ id: submissions.id })
              .from(submissions)
              .where(eq(submissions.projectStageId, stage.stageId))

            const completedCount = submissionCount.length // Assume all submissions are completed

            reportData.push({
              kelas_id: cls.classId,
              nama_kelas: cls.className,
              periode_akademik: `${cls.termYear} - Semester ${cls.termSemester === 'ODD' ? 'Ganjil' : 'Genap'}`,
              status_periode: cls.termStatus,
              guru_pengampu: cls.teacherName || 'Belum ditugaskan',
              email_guru: cls.teacherEmail || 'N/A',
              proyek_id: project.projectId,
              nama_proyek: project.projectName,
              tema_proyek: project.projectTheme,
              status_proyek: project.projectStatus,
              tahapan_id: stage.stageId,
              nama_tahapan: stage.stageName,
              urutan_tahapan: stage.stageOrder,
              instrumen_id: instrument.instrumentId,
              tipe_instrumen: instrument.instrumentType,
              wajib: instrument.isRequired ? 'Ya' : 'Tidak',
              total_pengumpulan: submissionCount.length,
              pengumpulan_selesai: completedCount,
              tanggal_dibuat_kelas: cls.classCreatedAt ? new Date(cls.classCreatedAt).toLocaleDateString('id-ID') : 'N/A',
              tanggal_dibuat_proyek: project.projectCreatedAt ? new Date(project.projectCreatedAt).toLocaleDateString('id-ID') : 'N/A',
            })
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: reportData,
      total: reportData.length,
    })

  } catch (error) {
    console.error('Error exporting class progress data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}