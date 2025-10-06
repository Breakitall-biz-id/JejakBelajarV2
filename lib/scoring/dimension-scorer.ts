/**
 * Dimension-Based Scoring Logic
 *
 * Module ini mengimplementasikan logic scoring per dimensi sesuai PRD V6,
 * menggantikan sistem scoring per-instrument dengan scoring per-dimensi Kokurikuler.
 */

import { sql } from "drizzle-orm"
import { db } from "@/db"
import {
  submissions,
  templateQuestions,
  templateJournalRubrics,
  templateStageConfigs,
  dimensions,
  userClassAssignments,
  projects,
} from "@/db/schema/jejak"
import { user } from "@/db/schema/auth"
import { eq, and, inArray, isNotNull } from "drizzle-orm"

export interface DimensionScore {
  dimensionId: string
  dimensionName: string
  averageScore: number
  totalSubmissions: number
  maxScore: number
  qualitativeScore: string
}

export interface StudentDimensionScores {
  studentId: string
  studentName: string | null
  dimensionScores: DimensionScore[]
  overallAverageScore: number
  overallQualitativeScore: string
}

export interface ClassDimensionScores {
  classId: string
  className: string
  dimensions: DimensionScore[]
  overallClassAverage: number
  totalStudents: number
}

import { convertToQualitativeScore, QualitativeScoreResult } from "./qualitative-converter"

/**
 * Menghitung skor per dimensi untuk submission tertentu
 *
 * @param submissionId - ID submission yang akan dihitung
 * @returns Promise<DimensionScore[]> - Array skor per dimensi
 */
export async function calculateDimensionScoresForSubmission(submissionId: string): Promise<DimensionScore[]> {
  // Get submission with related data
  const submissionData = await db
    .select({
      submissionId: submissions.id,
      score: submissions.score,
      content: submissions.content,
      submittedById: submissions.submittedById,
      templateStageConfigId: submissions.templateStageConfigId,
    })
    .from(submissions)
    .where(eq(submissions.id, submissionId))
    .limit(1)

  if (submissionData.length === 0) {
    throw new Error(`Submission with ID ${submissionId} not found`)
  }

  const submission = submissionData[0]
  const dimensionScores: DimensionScore[] = []

  // Get template config to determine instrument type
  const templateConfig = submission.templateStageConfigId
    ? await db
        .select({
          id: templateStageConfigs.id,
          instrumentType: templateStageConfigs.instrumentType,
        })
        .from(templateStageConfigs)
        .where(eq(templateStageConfigs.id, submission.templateStageConfigId!))
        .limit(1)
    : null

  if (!templateConfig) {
    throw new Error(`Template config not found for submission ${submissionId}`)
  }

  // Handle different instrument types
  switch (templateConfig[0].instrumentType) {
    case 'JOURNAL':
      const journalScores = await calculateJournalDimensionScores(submission)
      dimensionScores.push(...journalScores)
      break

    case 'SELF_ASSESSMENT':
    case 'PEER_ASSESSMENT':
      const assessmentScores = await calculateAssessmentDimensionScores(submission)
      dimensionScores.push(...assessmentScores)
      break

    case 'OBSERVATION':
      const observationScores = await calculateObservationDimensionScores(submission)
      dimensionScores.push(...observationScores)
      break

    default:
      // For other types, use existing score logic with dimension mapping
      const defaultScores = await calculateDefaultDimensionScores(submission)
      dimensionScores.push(...defaultScores)
  }

  return dimensionScores
}

/**
 * Menghitung skor per dimensi untuk JOURNAL submissions
 */
async function calculateJournalDimensionScores(submission: any): Promise<DimensionScore[]> {
  // Get questions with dimensions (untuk dapatkan dimension yang digunakan)
  const questions = await db
    .select({
      id: templateQuestions.id,
      questionText: templateQuestions.questionText,
      dimensionId: templateQuestions.dimensionId,
      dimensionName: dimensions.name,
    })
    .from(templateQuestions)
    .leftJoin(dimensions, eq(templateQuestions.dimensionId, dimensions.id))
    .where(eq(templateQuestions.configId, submission.templateStageConfigId))
    .orderBy(templateQuestions.createdAt)

  const content = submission.content as any
  const grades = content?.grades || []

  // Ambil semua score dari grades untuk formula baru
  const allScores = grades.map((g: any) => g.score).filter((s: any) => typeof s === 'number')

  // Debug
  console.log("\n[DEBUG] Journal Scores (New Formula):")
  console.log(`  All Scores: ${JSON.stringify(allScores)}`)

  if (allScores.length === 0) {
    return []
  }

  // IMPLEMENTASI FORMULA BARU: X = ((jumlah skor pada seluruh item) / (jumlah item x 4)) x 100
  const totalScore = allScores.reduce((a: number, b: number) => a + b, 0)
  const totalItems = allScores.length
  const percentageScore = (totalScore / (totalItems * 4)) * 100

  // Gunakan dimension dari question pertama (asumsi journal punya satu dimension utama)
  const dimensionId = questions[0]?.dimensionId || 'default'
  const dimensionName = questions[0]?.dimensionName || 'Umum'

  console.log(`  Formula: (${totalScore} / (${totalItems} x 4)) x 100 = ${percentageScore}`)

  const dimensionScores: DimensionScore[] = [{
    dimensionId,
    dimensionName,
    averageScore: Number(percentageScore.toFixed(2)), // Now 0-100 scale
    totalSubmissions: totalItems,
    maxScore: 100, // Updated to 100 scale
    qualitativeScore: convertToQualitativeScore(percentageScore).qualitativeScore
  }]

  return dimensionScores
}

/**
 * Menghitung skor per dimensi untuk SELF_ASSESSMENT dan PEER_ASSESSMENT submissions
 */
async function calculateAssessmentDimensionScores(submission: any): Promise<DimensionScore[]> {
  // Get questions with dimensions - ORDER BY untuk konsistensi
  const questions = await db
    .select({
      id: templateQuestions.id,
      questionText: templateQuestions.questionText,
      dimensionId: templateQuestions.dimensionId,
      dimensionName: dimensions.name,
    })
    .from(templateQuestions)
    .leftJoin(dimensions, eq(templateQuestions.dimensionId, dimensions.id))
    .where(eq(templateQuestions.configId, submission.templateStageConfigId))
    .orderBy(templateQuestions.createdAt) // Ensure consistent ordering

  console.log("\n==================== [DEBUG] Assessment Dimension Calculation ====================")
  console.log(`Submission ID: ${submission.id} | Config ID: ${submission.templateStageConfigId}`)
  console.log(`Total Questions: ${questions.length}`)

  const content = submission.content as any
  const answers = content?.answers || []

  // Debug: print mapping answer <-> question <-> dimension
  const debugMapping = questions.map((q, idx) => ({
    answerIndex: idx,
    answer: answers[idx],
    questionId: q.id,
    questionText: q.questionText,
    dimensionId: q.dimensionId,
    dimensionName: q.dimensionName
  }))
  console.log("\n[DEBUG] Assessment Mapping for Submission:")
  debugMapping.forEach((m, i) => {
    console.log(`  [${i+1}] QID: ${m.questionId} | Dim: ${m.dimensionName} | Q: ${m.questionText}`)
    console.log(`      Answer: ${JSON.stringify(m.answer)}`)
  })

  // Validate answers length
  if (answers.length !== questions.length) {
    console.warn(`Answer length (${answers.length}) doesn't match question count (${questions.length}) for submission ${submission.id}`)
    // Continue with available answers but log the mismatch
  }

  const dimensionScores: DimensionScore[] = []

  // Group questions by dimension dengan mempertahankan index
  const dimensionGroups = new Map<string, Array<{ question: typeof questions[0], answerIndex: number }>>()

  questions.forEach((question, index) => {
    const dimensionKey = question.dimensionId || 'default'
    if (!dimensionGroups.has(dimensionKey)) {
      dimensionGroups.set(dimensionKey, [])
    }
    dimensionGroups.get(dimensionKey)!.push({
      question,
      answerIndex: index // Simpan index asli untuk mapping ke answers
    })
  })

  // Calculate scores per dimension dengan formula baru
  for (const [dimensionId, dimensionItems] of dimensionGroups) {
    let totalScore = 0
    let totalItems = 0

    for (const item of dimensionItems) {
      const answer = answers[item.answerIndex]

      if (answer !== undefined && answer !== null) {
        // Map answer values (typically 1-4 scale)
        const score = typeof answer === 'number' ? answer : 0
        totalScore += score
        totalItems++
      } else {
        console.warn(`No answer found for question ${item.question.id} at index ${item.answerIndex}`)
      }
    }

    if (totalItems > 0) {
      // IMPLEMENTASI FORMULA BARU: X = ((jumlah skor pada seluruh item) / (jumlah item x 4)) x 100
      const percentageScore = (totalScore / (totalItems * 4)) * 100

      console.log(`  [DEBUG] Dimension ${dimensionId}: (${totalScore} / (${totalItems} x 4)) x 100 = ${percentageScore}`)

      dimensionScores.push({
        dimensionId,
        dimensionName: dimensionItems[0].question.dimensionName || 'Umum',
        averageScore: Number(percentageScore.toFixed(2)), // Now 0-100 scale
        totalSubmissions: totalItems,
        maxScore: 100, // Updated to 100 scale
        qualitativeScore: convertToQualitativeScore(percentageScore).qualitativeScore
      })
    } else {
      console.warn(`No valid submissions found for dimension ${dimensionId}`)
    }
  }

  return dimensionScores
}

/**
 * Menghitung skor per dimensi untuk OBSERVATION submissions
 */
async function calculateObservationDimensionScores(submission: any): Promise<DimensionScore[]> {
  // Observations menggunakan questions yang sama seperti assessment types
  // Get questions with dimensions - ORDER BY untuk konsistensi
  const questions = await db
    .select({
      id: templateQuestions.id,
      questionText: templateQuestions.questionText,
      dimensionId: templateQuestions.dimensionId,
      dimensionName: dimensions.name,
    })
    .from(templateQuestions)
    .leftJoin(dimensions, eq(templateQuestions.dimensionId, dimensions.id))
    .where(eq(templateQuestions.configId, submission.templateStageConfigId))
    .orderBy(templateQuestions.createdAt) // Ensure consistent ordering

  const content = submission.content as any
  const answers = content?.answers || []

  // Validate answers length
  if (answers.length !== questions.length) {
    console.warn(`Answer length (${answers.length}) doesn't match question count (${questions.length}) for observation submission ${submission.id}`)
    // Continue with available answers but log the mismatch
  }

  const dimensionScores: DimensionScore[] = []

  // Group questions by dimension dengan mempertahankan index
  const dimensionGroups = new Map<string, Array<{ question: typeof questions[0], answerIndex: number }>>()

  questions.forEach((question, index) => {
    const dimensionKey = question.dimensionId || 'default'
    if (!dimensionGroups.has(dimensionKey)) {
      dimensionGroups.set(dimensionKey, [])
    }
    dimensionGroups.get(dimensionKey)!.push({
      question,
      answerIndex: index // Simpan index asli untuk mapping ke answers
    })
  })

  // Calculate scores per dimension dengan formula baru
  for (const [dimensionId, dimensionItems] of dimensionGroups) {
    let totalScore = 0
    let totalItems = 0

    for (const item of dimensionItems) {
      const answer = answers[item.answerIndex]

      if (answer !== undefined && answer !== null) {
        // Map answer values (typically 1-4 scale)
        const score = typeof answer === 'number' ? answer : 0
        totalScore += score
        totalItems++
      } else {
        console.warn(`No answer found for observation question ${item.question.id} at index ${item.answerIndex}`)
      }
    }

    if (totalItems > 0) {
      // IMPLEMENTASI FORMULA BARU: X = ((jumlah skor pada seluruh item) / (jumlah item x 4)) x 100
      const percentageScore = (totalScore / (totalItems * 4)) * 100

      console.log(`  [DEBUG] Observation Dimension ${dimensionId}: (${totalScore} / (${totalItems} x 4)) x 100 = ${percentageScore}`)

      dimensionScores.push({
        dimensionId,
        dimensionName: dimensionItems[0].question.dimensionName || 'Observasi Umum',
        averageScore: Number(percentageScore.toFixed(2)), // Now 0-100 scale
        totalSubmissions: totalItems,
        maxScore: 100, // Updated to 100 scale
        qualitativeScore: convertToQualitativeScore(percentageScore).qualitativeScore
      })
    } else {
      console.warn(`No valid observation submissions found for dimension ${dimensionId}`)
    }
  }

  return dimensionScores
}

/**
 * Default scoring untuk instrument types lainnya
 */
async function calculateDefaultDimensionScores(submission: any): Promise<DimensionScore[]> {
  const allDimensions = await db
    .select({
      id: dimensions.id,
      name: dimensions.name,
    })
    .from(dimensions)

  if (submission.score === null || submission.score === undefined) {
    return []
  }

  // Convert existing score (0-4 scale) to new 0-100 scale
  const percentageScore = (submission.score / 4) * 100

  const dimensionScores: DimensionScore[] = [{
    dimensionId: allDimensions[0]?.id || 'default',
    dimensionName: allDimensions[0]?.name || 'Umum',
    averageScore: percentageScore, // Now 0-100 scale
    totalSubmissions: 1,
    maxScore: 100, // Updated to 100 scale
    qualitativeScore: convertToQualitativeScore(percentageScore).qualitativeScore
  }]

  return dimensionScores
}

/**
 * Menghitung skor per dimensi untuk student dalam project tertentu
 */
export async function calculateStudentDimensionScores(
  studentId: string,
  projectId: string
): Promise<StudentDimensionScores> {

  // Ambil templateId dari project
  const projectRow = await db
    .select({ templateId: projects.templateId })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1)

  const templateId = projectRow[0]?.templateId
  if (!templateId) {
    throw new Error(`Project ${projectId} does not have a templateId`)
  }

  // Ambil semua configId instrument di template project ini
  const configRows = await db
    .select({ id: templateStageConfigs.id, instrumentType: templateStageConfigs.instrumentType })
    .from(templateStageConfigs)
    .where(eq(templateStageConfigs.templateId, templateId))

  const selfConfigIds = configRows.filter(r => r.instrumentType === 'SELF_ASSESSMENT').map(r => r.id)
  const peerConfigIds = configRows.filter(r => r.instrumentType === 'PEER_ASSESSMENT').map(r => r.id)
  const obsConfigIds = configRows.filter(r => r.instrumentType === 'OBSERVATION').map(r => r.id)

  // SELF_ASSESSMENT: yang submittedById = studentId
  const selfSubmissions = selfConfigIds.length ? await db
    .select({
      id: submissions.id,
      score: submissions.score,
      content: submissions.content,
      templateStageConfigId: submissions.templateStageConfigId,
    })
    .from(submissions)
    .where(and(
      eq(submissions.submittedById, studentId),
      eq(submissions.projectId, projectId),
      inArray(submissions.templateStageConfigId, selfConfigIds)
    )) : []

  // PEER_ASSESSMENT: yang targetStudentId = studentId
  const peerSubmissions = peerConfigIds.length ? await db
    .select({
      id: submissions.id,
      score: submissions.score,
      content: submissions.content,
      templateStageConfigId: submissions.templateStageConfigId,
    })
    .from(submissions)
    .where(and(
      eq(submissions.targetStudentId, studentId),
      eq(submissions.projectId, projectId),
      inArray(submissions.templateStageConfigId, peerConfigIds)
    )) : []

  // OBSERVATION: yang targetStudentId = studentId
  const obsSubmissions = obsConfigIds.length ? await db
    .select({
      id: submissions.id,
      score: submissions.score,
      content: submissions.content,
      templateStageConfigId: submissions.templateStageConfigId,
    })
    .from(submissions)
    .where(and(
      eq(submissions.targetStudentId, studentId),
      eq(submissions.projectId, projectId),
      inArray(submissions.templateStageConfigId, obsConfigIds)
    )) : []

  // Instrument lain (JOURNAL, dsb): tetap pakai submittedById = studentId
  const otherConfigIds = configRows.filter(r => !['SELF_ASSESSMENT','PEER_ASSESSMENT','OBSERVATION'].includes(r.instrumentType)).map(r => r.id)
  const otherSubmissions = otherConfigIds.length ? await db
    .select({
      id: submissions.id,
      score: submissions.score,
      content: submissions.content,
      templateStageConfigId: submissions.templateStageConfigId,
    })
    .from(submissions)
    .where(and(
      eq(submissions.submittedById, studentId),
      eq(submissions.projectId, projectId),
      inArray(submissions.templateStageConfigId, otherConfigIds)
    )) : []

  const studentSubmissions = [
    ...selfSubmissions,
    ...peerSubmissions,
    ...obsSubmissions,
    ...otherSubmissions
  ]

  console.log("\n==================== [DEBUG] Student Dimension Calculation ====================")
  console.log(`Student ID: ${studentId} | Project ID: ${projectId}`)
  console.log(`SELF_ASSESSMENT submissions: ${selfSubmissions.length}`)
  console.log(`PEER_ASSESSMENT submissions (target): ${peerSubmissions.length}`)
  console.log(`OBSERVATION submissions (target): ${obsSubmissions.length}`)
  console.log(`Other submissions: ${otherSubmissions.length}`)
  console.log("All Submissions IDs:", studentSubmissions.map(s => s.id))
  studentSubmissions.forEach((s, i) => {
    console.log(`  [${i+1}] SubmissionID: ${s.id}, config: ${s.templateStageConfigId}`)
  })
  console.log("=============================================================================\n")

  const allDimensionScores: DimensionScore[] = []

  // Calculate dimension scores for each submission
  for (const submission of studentSubmissions) {
    console.log(`Processing submission ${submission.id}...`)
    const dimensionScores = await calculateDimensionScoresForSubmission(submission.id)
    console.log(dimensionScores)
    allDimensionScores.push(...dimensionScores)
  }

  // Aggregate scores by dimension dengan formula baru
  const dimensionAggregates = new Map<string, {
    totalScore: number
    totalItems: number
    dimensionName: string
    maxScore: number
  }>()

  for (const score of allDimensionScores) {
    const key = score.dimensionId
    if (!dimensionAggregates.has(key)) {
      dimensionAggregates.set(key, {
        totalScore: 0,
        totalItems: 0,
        dimensionName: score.dimensionName,
        maxScore: score.maxScore
      })
    }

    const aggregate = dimensionAggregates.get(key)!
    // Since individual scores are already in 0-100 scale, we can average them directly
    aggregate.totalScore += score.averageScore * score.totalSubmissions
    aggregate.totalItems += score.totalSubmissions
  }

  // Calculate final dimension scores dengan formula agregasi
  const finalDimensionScores: DimensionScore[] = []
  let overallTotalScore = 0
  let overallTotalDimensions = 0

  for (const [dimensionId, aggregate] of dimensionAggregates) {
    const averageScore = aggregate.totalItems > 0 ? aggregate.totalScore / aggregate.totalItems : 0
    const dimensionScore: DimensionScore = {
      dimensionId,
      dimensionName: aggregate.dimensionName,
      averageScore: Number(averageScore.toFixed(2)),
      totalSubmissions: aggregate.totalItems,
      maxScore: 100, // Updated to 100 scale
      qualitativeScore: convertToQualitativeScore(averageScore).qualitativeScore
    }

    finalDimensionScores.push(dimensionScore)
    overallTotalScore += averageScore
    overallTotalDimensions += 1
  }

  const overallAverageScore = overallTotalDimensions > 0
    ? overallTotalScore / overallTotalDimensions
    : 0

  return {
    studentId,
    studentName: null, // Will be filled by caller
    dimensionScores: finalDimensionScores,
    overallAverageScore: Number(overallAverageScore.toFixed(2)),
    overallQualitativeScore: convertToQualitativeScore(overallAverageScore).qualitativeScore
  }
}

/**
 * Menghitung skor per dimensi untuk seluruh kelas dalam project
 */
export async function calculateClassDimensionScores(
  classId: string,
  projectId: string
): Promise<ClassDimensionScores> {
  // Get all students in class
  const studentsQuery = await db
    .select({
      userId: userClassAssignments.userId,
      userName: user.name,
    })
    .from(userClassAssignments)
    .innerJoin(user, eq(userClassAssignments.userId, user.id))
    .where(and(
      eq(userClassAssignments.classId, classId),
      eq(user.role, 'STUDENT')
    ))

  const students = studentsQuery as { userId: string; userName: string | null }[]

  if (students.length === 0) {
    throw new Error(`No students found in class ${classId}`)
  }

  const allDimensionScores: DimensionScore[] = []
  let totalStudents = students.length

  // Calculate dimension scores for each student
  for (const student of students) {
    try {
      const studentScores = await calculateStudentDimensionScores(student.userId, projectId)
      allDimensionScores.push(...studentScores.dimensionScores)
    } catch (error) {
      console.error(`Error calculating scores for student ${student.userId}:`, error)
      // Continue with other students
    }
  }

  // Aggregate scores by dimension for the entire class dengan formula baru
  const dimensionAggregates = new Map<string, {
    totalScore: number
    totalItems: number
    dimensionName: string
    maxScore: number
  }>()

  for (const score of allDimensionScores) {
    const key = score.dimensionId
    if (!dimensionAggregates.has(key)) {
      dimensionAggregates.set(key, {
        totalScore: 0,
        totalItems: 0,
        dimensionName: score.dimensionName,
        maxScore: score.maxScore
      })
    }

    const aggregate = dimensionAggregates.get(key)!
    // Since individual scores are already in 0-100 scale, we can average them directly
    aggregate.totalScore += score.averageScore * score.totalSubmissions
    aggregate.totalItems += score.totalSubmissions
  }

  // Calculate final dimension scores for class dengan formula agregasi
  const finalDimensionScores: DimensionScore[] = []
  let classTotalScore = 0

  for (const [dimensionId, aggregate] of dimensionAggregates) {
    const averageScore = aggregate.totalItems > 0 ? aggregate.totalScore / aggregate.totalItems : 0
    const dimensionScore: DimensionScore = {
      dimensionId,
      dimensionName: aggregate.dimensionName,
      averageScore: Number(averageScore.toFixed(2)),
      totalSubmissions: aggregate.totalItems,
      maxScore: 100, // Updated to 100 scale
      qualitativeScore: convertToQualitativeScore(averageScore).qualitativeScore
    }

    finalDimensionScores.push(dimensionScore)
    classTotalScore += averageScore
  }

  const overallClassAverage = finalDimensionScores.length > 0
    ? classTotalScore / finalDimensionScores.length
    : 0

  return {
    classId,
    className: '', // Will be filled by caller
    dimensions: finalDimensionScores,
    overallClassAverage: Number(overallClassAverage.toFixed(2)),
    totalStudents
  }
}