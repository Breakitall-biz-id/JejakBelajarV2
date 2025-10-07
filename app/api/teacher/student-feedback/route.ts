import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { and, eq } from 'drizzle-orm'

import { db } from '@/db'
import { teacherFeedbacks } from '@/db/schema/jejak'
import { requireTeacherUser } from '@/lib/auth/session'

const feedbackSchema = z.object({
  studentId: z.string().uuid(),
  projectId: z.string().uuid(),
  feedback: z.string().trim().min(1, 'Feedback tidak boleh kosong').max(1000, 'Feedback maksimal 1000 karakter'),
})

const getFeedbackSchema = z.object({
  studentId: z.string().uuid(),
  projectId: z.string().uuid(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await requireTeacherUser()
    const teacher = session.user

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const projectId = searchParams.get('projectId')

    const validatedData = getFeedbackSchema.parse({
      studentId,
      projectId,
    })

    const existingFeedback = await db
      .select()
      .from(teacherFeedbacks)
      .where(
        and(
          eq(teacherFeedbacks.teacherId, teacher.id),
          eq(teacherFeedbacks.studentId, validatedData.studentId),
          eq(teacherFeedbacks.projectId, validatedData.projectId)
        )
      )
      .limit(1)

    if (existingFeedback.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'Belum ada feedback'
      })
    }

    return NextResponse.json({
      success: true,
      data: existingFeedback[0],
      message: 'Feedback ditemukan'
    })

  } catch (error) {
    console.error('Error fetching student feedback:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid input data',
        details: error.issues
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Gagal mengambil feedback'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireTeacherUser()
    const teacher = session.user

    const body = await request.json()
    const validatedData = feedbackSchema.parse(body)

    // Check if feedback already exists for this teacher-student-project combination
    const existingFeedback = await db
      .select()
      .from(teacherFeedbacks)
      .where(
        and(
          eq(teacherFeedbacks.teacherId, teacher.id),
          eq(teacherFeedbacks.studentId, validatedData.studentId),
          eq(teacherFeedbacks.projectId, validatedData.projectId)
        )
      )
      .limit(1)

    let result

    if (existingFeedback.length > 0) {
      // Update existing feedback
      result = await db
        .update(teacherFeedbacks)
        .set({
          feedback: validatedData.feedback,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(teacherFeedbacks.teacherId, teacher.id),
            eq(teacherFeedbacks.studentId, validatedData.studentId),
            eq(teacherFeedbacks.projectId, validatedData.projectId)
          )
        )
        .returning()
    } else {
      // Create new feedback
      result = await db
        .insert(teacherFeedbacks)
        .values({
          teacherId: teacher.id,
          studentId: validatedData.studentId,
          projectId: validatedData.projectId,
          feedback: validatedData.feedback,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning()
    }

    return NextResponse.json({
      success: true,
      data: result[0],
      message: existingFeedback.length > 0 ? 'Feedback berhasil diperbarui' : 'Feedback berhasil disimpan'
    })

  } catch (error) {
    console.error('Error saving student feedback:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid input data',
        details: error.issues
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Gagal menyimpan feedback'
    }, { status: 500 })
  }
}