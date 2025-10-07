import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { and, eq } from 'drizzle-orm'

import { db } from '@/db'
import { teacherFeedbacks } from '@/db/schema/jejak'
import { requireTeacherUser } from '@/lib/auth/session'

const listFeedbacksSchema = z.object({
  projectId: z.string().uuid(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await requireTeacherUser()
    const teacher = session.user

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    const validatedData = listFeedbacksSchema.parse({
      projectId,
    })

    const feedbacks = await db
      .select({
        studentId: teacherFeedbacks.studentId,
        feedback: teacherFeedbacks.feedback,
        createdAt: teacherFeedbacks.createdAt,
        updatedAt: teacherFeedbacks.updatedAt,
      })
      .from(teacherFeedbacks)
      .where(
        and(
          eq(teacherFeedbacks.teacherId, teacher.id),
          eq(teacherFeedbacks.projectId, validatedData.projectId)
        )
      )

    return NextResponse.json({
      success: true,
      data: feedbacks,
      message: 'Feedback list retrieved successfully'
    })

  } catch (error) {
    console.error('Error fetching feedback list:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid input data',
        details: error.issues
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Gagal mengambil daftar feedback'
    }, { status: 500 })
  }
}