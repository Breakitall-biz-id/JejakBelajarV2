import { NextRequest, NextResponse } from 'next/server'
import { requireAdminUser } from '@/lib/auth/session'
import { db } from '@/db'
import { user } from '@/db/schema/auth'
import { classes, academicTerms } from '@/db/schema/jejak'
import { userClassAssignments } from '@/db/schema/jejak'
import { eq, inArray, and, sql } from 'drizzle-orm'
import { generateStudentExportExcel, generateStudentCredentialsExcel } from '@/lib/utils/student-export'

export async function GET(request: NextRequest) {
  try {
    // Validate admin access
    await requireAdminUser()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const termId = searchParams.get('termId')
    const includeCredentials = searchParams.get('includeCredentials') === 'true'
    const format = searchParams.get('format') || 'data' // 'data' or 'credentials'

    // Build query directly - simpler approach like POST method
    let students
    if (!classId && !termId) {
      // Get all students without class filter
      students = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        })
        .from(user)
        .where(eq(user.role, 'STUDENT'))
        .orderBy(user.name)
    } else {
      // Get students with class filter
      students = await db
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
        .innerJoin(userClassAssignments, eq(user.id, userClassAssignments.userId))
        .innerJoin(classes, eq(userClassAssignments.classId, classes.id))
        .innerJoin(academicTerms, eq(classes.academicTermId, academicTerms.id))
        .where(
          and(
            eq(user.role, 'STUDENT'),
            classId ? eq(userClassAssignments.classId, classId) : undefined,
            termId ? eq(classes.academicTermId, termId) : undefined
          )
        )
        .orderBy(user.name)
    }

    // Format data for export
    const exportData = students.map((student) => {
      const className = 'className' in student ? String(student.className || 'Belum ada kelas') : 'Belum ada kelas'
      const termStatus = 'termStatus' in student ? String(student.termStatus || 'Tidak aktif') : 'Tidak aktif'
      
      return {
        id: student.id,
        nama: student.name || '',
        email: student.email,
        kelas: className,
        status: termStatus,
        createdAt: student.createdAt.toISOString()
      }
    })

    // Generate Excel file based on format
    let buffer: Buffer
    let filename: string

    if (format === 'credentials') {
      // Generate credentials Excel (with passwords)
      const credentialsData = exportData.map((student) => ({
        nama: student.nama,
        email: student.email,
        kelas: student.kelas,
        password: 'jejakbelajar123' // Default password
      }))
      buffer = generateStudentCredentialsExcel(credentialsData)
      filename = 'credentials-siswa-jejakbelajar.xlsx'
    } else {
      // Generate regular data Excel
      const className = exportData.length > 0 ? exportData[0].kelas : undefined
      buffer = generateStudentExportExcel(exportData, className)

      // Generate filename safely
      if (classId && exportData.length > 0 && exportData[0].kelas !== 'Belum ada kelas') {
        const cleanClassName = exportData[0].kelas.replace(/\s+/g, '-')
        filename = `data-siswa-${cleanClassName}-jejakbelajar.xlsx`
      } else {
        filename = 'data-semua-siswa-jejakbelajar.xlsx'
      }
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
    console.error('[API /api/admin/students/export GET]', error)

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate admin access
    await requireAdminUser()

    const body = await request.json()
    const { classIds, termId, includeCredentials } = body

    // Validate input
    if (!Array.isArray(classIds) && classIds !== 'all') {
      return NextResponse.json(
        { error: 'classIds must be an array or "all"' },
        { status: 400 }
      )
    }

    // Build query with joins directly - simpler approach
    let students
    if (classIds === 'all' && !termId) {
      // Get all students without class filter
      students = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        })
        .from(user)
        .where(eq(user.role, 'STUDENT'))
        .orderBy(user.name)
    } else {
      // Get students with class filter
      if (classIds !== 'all') {
        // First get students with the selected classes
        const studentsWithClasses = await db
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
          .innerJoin(userClassAssignments, eq(user.id, userClassAssignments.userId))
          .innerJoin(classes, eq(userClassAssignments.classId, classes.id))
          .innerJoin(academicTerms, eq(classes.academicTermId, academicTerms.id))
          .where(
            and(
              eq(user.role, 'STUDENT'),
              inArray(classes.id, classIds)
            )
          )
          .orderBy(user.name);

        // Then get students without any class assignment
        const studentsWithoutClasses = await db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            className: sql<string>`NULL`.as('className'),
            termStatus: sql<string>`NULL`.as('termStatus'),
          })
          .from(user)
          .leftJoin(userClassAssignments, eq(user.id, userClassAssignments.userId))
          .where(
            and(
              eq(user.role, 'STUDENT'),
              sql`${userClassAssignments.classId} IS NULL`
            )
          )
          .orderBy(user.name);

        // Combine both results
        students = [...studentsWithClasses, ...studentsWithoutClasses];
      } else {
        // Get all students when 'all' is selected
        students = await db
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
          .where(eq(user.role, 'STUDENT'))
          .orderBy(user.name);
      }
    }

    // Format data for export
    const exportData = students.map((student) => {
      const className = 'className' in student ? String(student.className || 'Belum ada kelas') : 'Belum ada kelas'
      const termStatus = 'termStatus' in student ? String(student.termStatus || 'Tidak aktif') : 'Tidak aktif'
      
      const formatted = {
        id: student.id,
        nama: student.name || 'Tanpa Nama',
        email: student.email || 'email@kosong.com',
        kelas: className,
        status: termStatus,
        createdAt: student.createdAt.toISOString()
      };
      return formatted;
    });

    // Generate Excel file based on format
    let buffer: Buffer
    let filename: string

    if (includeCredentials) {
      // Generate credentials Excel (with passwords)
      const credentialsData = exportData.map((student) => ({
        nama: student.nama,
        email: student.email,
        kelas: student.kelas,
        password: 'jejakbelajar123' // Default password
      }))
      buffer = generateStudentCredentialsExcel(credentialsData)
      filename = 'credentials-siswa-jejakbelajar.xlsx'
    } else {
      // Generate regular data Excel
      const className = exportData.length > 0 ? exportData[0].kelas : undefined
      buffer = generateStudentExportExcel(exportData, className)

      // Generate filename safely
      if (classIds !== 'all' && exportData.length > 0 && exportData[0].kelas !== 'Belum ada kelas') {
        const cleanClassName = exportData[0].kelas.replace(/\s+/g, '-')
        filename = `data-siswa-${cleanClassName}-jejakbelajar.xlsx`
      } else {
        filename = 'data-semua-siswa-jejakbelajar.xlsx'
      }
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
    console.error('[API /api/admin/students/export POST]', error)

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}