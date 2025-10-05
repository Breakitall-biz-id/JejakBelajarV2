import { NextRequest, NextResponse } from 'next/server'
import { calculateAndUpdateSubmissionScore } from '@/lib/scoring/score-calculator'

export async function POST(
  request: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    const { submissionId } = params

    if (!submissionId) {
      return NextResponse.json(
        { error: 'ID submission wajib diisi' },
        { status: 400 }
      )
    }

    console.log(`Calculating score for submission: ${submissionId}`)

    const result = await calculateAndUpdateSubmissionScore(submissionId)

    return NextResponse.json({
      success: true,
      data: result,
      message: `Berhasil menghitung skor untuk submission ${submissionId}`
    })

  } catch (error) {
    console.error('Error calculating submission score:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Terjadi kesalahan',
        message: 'Gagal menghitung skor submission'
      },
      { status: 500 }
    )
  }
}