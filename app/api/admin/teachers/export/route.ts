import { NextRequest, NextResponse } from 'next/server'
import { requireAdminUser } from '@/lib/auth/session'
import { db } from '@/db'
import { user } from '@/db/schema/auth'
import { classes, academicTerms } from '@/db/schema/jejak'
import { userClassAssignments } from '@/db/schema/jejak'
import { eq, inArray, and, sql } from 'drizzle-orm'
import { generateTeacherExportExcel, generateTeacherCredentialsExcel } from '@/lib/utils/teacher-export'

export async function POST(request: NextRequest) {
  try {
    // Validate admin access
    await requireAdminUser()

    const body = await request.json()
    const { includeCredentials } = body

    // Get all teachers with their class assignments
    const teachers = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        className: classes.name,
        termStatus: academicTerms.status,
      })
      .from(user)
      .leftJoin(userClassAssignments, eq(user.id, userClassAssignments.userId))
      .leftJoin(classes, eq(userClassAssignments.classId, classes.id))
      .leftJoin(academicTerms, eq(classes.academicTermId, academicTerms.id))
      .where(eq(user.role, 'TEACHER'))
      .orderBy(user.name)

    // Format data for export
    const exportData = teachers.map((teacher) => ({
      id: teacher.id,
      nama: teacher.name || 'Tanpa Nama',
      email: teacher.email || 'email@kosong.com',
      kelas: teacher.className || 'Belum ada kelas',
      status: teacher.termStatus || 'Tidak aktif',
      createdAt: teacher.createdAt
    }))

    // Generate Excel file based on format
    let buffer: Buffer
    let filename: string

    if (includeCredentials) {
      // Generate credentials Excel (with passwords)
      const credentialsData = teachers.map((teacher) => ({
        nama: teacher.nama,
        email: teacher.email,
        kelas: teacher.kelas,
        password: 'jejakbelajar123' // Default password
      }))
      buffer = generateTeacherCredentialsExcel(credentialsData)
      filename = 'credentials-guru-jejakbelajar.xlsx'
    } else {
      // Generate regular data Excel
      buffer = generateTeacherExportExcel(exportData)
      filename = 'data-guru-jejakbelajar.xlsx'
    }

    // Return file response
    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('[API /api/admin/teachers/export POST]', error)

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}