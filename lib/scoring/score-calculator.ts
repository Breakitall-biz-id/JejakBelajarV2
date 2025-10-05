/**
 * Score Calculation Service
 *
 * Service ini bertanggung jawab untuk menghitung skor dari content answers
 * dan mengupdate submission.score di database
 */

import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { submissions } from '@/db/schema/jejak'
import { calculateDimensionScoresForSubmission } from './dimension-scorer'

export interface ScoreCalculationResult {
  submissionId: string
  overallScore: number
  dimensionScores: any[]
  calculationDetails: {
    totalAnswers: number
    validAnswers: number
    averageScore: number
    maxPossibleScore: number
  }
}

/**
 * Menghitung overall score dari answers array dalam content
 * dan update submission.score di database
 */
export async function calculateAndUpdateSubmissionScore(submissionId: string): Promise<ScoreCalculationResult> {
  // Get submission data
  const submissionData = await db
    .select({
      id: submissions.id,
      content: submissions.content,
      score: submissions.score,
      templateStageConfigId: submissions.templateStageConfigId,
    })
    .from(submissions)
    .where(eq(submissions.id, submissionId))
    .limit(1)

  if (submissionData.length === 0) {
    throw new Error(`Submission with ID ${submissionId} not found`)
  }

  const submission = submissionData[0]
  const content = submission.content as any
  const answers = content?.answers || []

  // Calculate overall score
  const validAnswers = answers.filter(answer =>
    answer !== undefined &&
    answer !== null &&
    typeof answer === 'number' &&
    answer >= 1 &&
    answer <= 4
  )

  if (validAnswers.length === 0) {
    throw new Error(`No valid answers found in submission ${submissionId}`)
  }

  const totalScore = validAnswers.reduce((sum, score) => sum + score, 0)
  const overallScore = Number((totalScore / validAnswers.length).toFixed(2))

  // Calculate dimension scores
  const dimensionScores = await calculateDimensionScoresForSubmission(submissionId)

  // Update the submission score in database
  await db
    .update(submissions)
    .set({
      score: overallScore,
      updatedAt: new Date()
    })
    .where(eq(submissions.id, submissionId))

  console.log(`Updated submission ${submissionId} score: ${overallScore}`)

  return {
    submissionId,
    overallScore,
    dimensionScores,
    calculationDetails: {
      totalAnswers: answers.length,
      validAnswers: validAnswers.length,
      averageScore: overallScore,
      maxPossibleScore: 4
    }
  }
}

/**
 * Batch process submissions yang belum memiliki score
 */
export async function processPendingSubmissions(projectId?: string): Promise<{
  processed: number
  errors: string[]
}> {
  let query = db
    .select({ id: submissions.id })
    .from(submissions)
    .where(eq(submissions.score, null))

  if (projectId) {
    query = query.where(eq(submissions.projectId, projectId))
  }

  const pendingSubmissions = await query
  const errors: string[] = []
  let processed = 0

  console.log(`Found ${pendingSubmissions.length} submissions to process`)

  for (const submission of pendingSubmissions) {
    try {
      await calculateAndUpdateSubmissionScore(submission.id)
      processed++
    } catch (error) {
      const errorMessage = `Failed to process submission ${submission.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
      console.error(errorMessage)
      errors.push(errorMessage)
    }
  }

  return { processed, errors }
}

/**
 * Aggregate multiple peer assessments untuk satu student
 */
export async function aggregatePeerScores(targetStudentId: string, projectId: string): Promise<any[]> {
  // Get all peer assessments for this student
  const peerAssessments = await db
    .select({
      id: submissions.id,
      content: submissions.content,
      submittedById: submissions.submittedById,
      templateStageConfigId: submissions.templateStageConfigId,
    })
    .from(submissions)
    .where(eq(submissions.targetStudentId, targetStudentId))

  if (peerAssessments.length === 0) {
    return []
  }

  console.log(`Found ${peerAssessments.length} peer assessments for student ${targetStudentId}`)

  // Aggregate scores by dimension
  const allDimensionScores: any[] = []

  for (const assessment of peerAssessments) {
    try {
      const dimensionScores = await calculateDimensionScoresForSubmission(assessment.id)
      allDimensionScores.push(...dimensionScores)
    } catch (error) {
      console.error(`Error calculating scores for peer assessment ${assessment.id}:`, error)
    }
  }

  // Group by dimension and calculate averages
  const dimensionAggregates = new Map<string, {
    totalScore: number
    count: number
    dimensionName: string
  }>()

  for (const score of allDimensionScores) {
    const key = score.dimensionId
    if (!dimensionAggregates.has(key)) {
      dimensionAggregates.set(key, {
        totalScore: 0,
        count: 0,
        dimensionName: score.dimensionName
      })
    }

    const aggregate = dimensionAggregates.get(key)!
    aggregate.totalScore += score.averageScore
    aggregate.count += 1
  }

  // Calculate final aggregated scores
  const aggregatedScores = []
  for (const [dimensionId, aggregate] of dimensionAggregates) {
    const averageScore = Number((aggregate.totalScore / aggregate.count).toFixed(2))
    aggregatedScores.push({
      dimensionId,
      dimensionName: aggregate.dimensionName,
      averageScore,
      peerCount: aggregate.count
    })
  }

  return aggregatedScores
}

/**
 * Calculate comprehensive score untuk student di sebuah project
 */
export async function calculateStudentProjectScore(studentId: string, projectId: string): Promise<{
  overallScore: number
  dimensionScores: any[]
  breakdown: {
    selfAssessment: any[]
    peerAssessmentsGiven: any[]
    peerAssessmentsReceived: any[]
    observations: any[]
  }
}> {
  // Get all submissions for this student in this project
  const studentSubmissions = await db
    .select({
      id: submissions.id,
      content: submissions.content,
      score: submissions.score,
      submittedById: submissions.submittedById,
      targetStudentId: submissions.targetStudentId,
      templateStageConfigId: submissions.templateStageConfigId,
    })
    .from(submissions)
    .where(eq(submissions.projectId, projectId))
    .where(eq(submissions.submittedById, studentId))

  const breakdown = {
    selfAssessment: [] as any[],
    peerAssessmentsGiven: [] as any[],
    peerAssessmentsReceived: [] as any[],
    observations: [] as any[]
  }

  const allDimensionScores: any[] = []

  // Process each submission
  for (const submission of studentSubmissions) {
    try {
      const dimensionScores = await calculateDimensionScoresForSubmission(submission.id)

      // Determine submission type based on content and target
      if (submission.targetStudentId) {
        breakdown.peerAssessmentsGiven.push({
          submissionId: submission.id,
          targetStudentId: submission.targetStudentId,
          dimensionScores
        })
      } else {
        // This could be self-assessment or observation
        // We need to check the instrument type from template config
        const configData = await db
          .select({
            instrumentType: { sql: 'instrument_type', as: 'instrument_type' }
          })
          .from({ sql: 'template_stage_configs', as: 'tsc' })
          .where({ sql: `id = '${submission.templateStageConfigId}'` })
          .limit(1)

        if (configData.length > 0) {
          const instrumentType = configData[0].instrument_type
          if (instrumentType === 'SELF_ASSESSMENT') {
            breakdown.selfAssessment.push({
              submissionId: submission.id,
              dimensionScores
            })
          } else if (instrumentType === 'OBSERVATION') {
            breakdown.observations.push({
              submissionId: submission.id,
              dimensionScores
            })
          }
        }
      }

      allDimensionScores.push(...dimensionScores)
    } catch (error) {
      console.error(`Error processing submission ${submission.id}:`, error)
    }
  }

  // Get peer assessments received by this student
  const peerAssessmentsReceived = await db
    .select({
      id: submissions.id,
      submittedById: submissions.submittedById,
    })
    .from(submissions)
    .where(eq(submissions.targetStudentId, studentId))
    .where(eq(submissions.projectId, projectId))

  for (const peerAssessment of peerAssessmentsReceived) {
    try {
      const dimensionScores = await calculateDimensionScoresForSubmission(peerAssessment.id)
      breakdown.peerAssessmentsReceived.push({
        submissionId: peerAssessment.id,
        assessorId: peerAssessment.submittedById,
        dimensionScores
      })
      allDimensionScores.push(...dimensionScores)
    } catch (error) {
      console.error(`Error processing peer assessment received ${peerAssessment.id}:`, error)
    }
  }

  // Calculate overall scores
  const overallScore = allDimensionScores.length > 0
    ? Number((allDimensionScores.reduce((sum, s) => sum + s.averageScore, 0) / allDimensionScores.length).toFixed(2))
    : 0

  return {
    overallScore,
    dimensionScores: aggregateDimensions(allDimensionScores),
    breakdown
  }
}

function aggregateDimensions(dimensionScores: any[]): any[] {
  const aggregates = new Map<string, {
    totalScore: number
    count: number
    dimensionName: string
  }>()

  for (const score of dimensionScores) {
    const key = score.dimensionId
    if (!aggregates.has(key)) {
      aggregates.set(key, {
        totalScore: 0,
        count: 0,
        dimensionName: score.dimensionName
      })
    }

    const aggregate = aggregates.get(key)!
    aggregate.totalScore += score.averageScore
    aggregate.count += 1
  }

  const result = []
  for (const [dimensionId, aggregate] of aggregates) {
    result.push({
      dimensionId,
      dimensionName: aggregate.dimensionName,
      averageScore: Number((aggregate.totalScore / aggregate.count).toFixed(2)),
      submissionCount: aggregate.count
    })
  }

  return result
}