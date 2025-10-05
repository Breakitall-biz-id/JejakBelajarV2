import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId } = body

    console.log(`Processing pending submissions for project: ${projectId || 'all projects'}`)

    // Import the function dynamically to avoid top-level await issues
    const { processPendingSubmissions } = await import('@/lib/scoring/score-calculator')

    const result = await processPendingSubmissions(projectId)

    return NextResponse.json({
      success: true,
      data: result,
      message: `Berhasil memproses ${result.processed} submission${result.errors.length > 0 ? ` dengan ${result.errors.length} kesalahan` : ''}`
    })

  } catch (error) {
    console.error('Error processing batch submissions:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Terjadi kesalahan',
        message: 'Gagal memproses batch submissions'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    console.log(`Getting batch processing status for project: ${projectId || 'all projects'}`)

    // Import the function dynamically
    const { processPendingSubmissions } = await import('@/lib/scoring/score-calculator')

    const result = await processPendingSubmissions(projectId || undefined)

    return NextResponse.json({
      success: true,
      data: result,
      message: `Ditemukan ${result.processed} submission yang telah diproses${result.errors.length > 0 ? ` dengan ${result.errors.length} kesalahan` : ''}`
    })

  } catch (error) {
    console.error('Error getting batch processing status:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Terjadi kesalahan',
        message: 'Gagal mendapatkan status batch processing'
      },
      { status: 500 }
    )
  }
}