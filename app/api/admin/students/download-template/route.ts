import { NextResponse } from 'next/server'
import { requireAdminUser } from '@/lib/auth/session'
import { generateStudentImportTemplate } from '@/lib/utils/excel-generator'

export async function GET() {
  try {
    // Validate admin access
    await requireAdminUser()

    // Generate Excel template
    const templateBuffer = generateStudentImportTemplate()

    // Return file response
    return new NextResponse(templateBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="template-import-siswa-jejakbelajar.xlsx"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('[API /api/admin/students/download-template GET]', error)

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}