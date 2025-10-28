import { NextRequest, NextResponse } from "next/server"
import { requireTeacherUser } from "@/lib/auth/session"
import { and, eq, inArray, or, sql } from "drizzle-orm"
import { db } from "@/db"
import {
  classes,
  groups,
  groupMembers,
  projectStageInstruments,
  projectStageProgress,
  projectStages,
  projects,
  submissions,
  templateJournalRubrics,
  templateQuestions,
  templateStageConfigs,
  userClassAssignments,
} from "@/db/schema/jejak"
import { user } from "@/db/schema/auth"
import * as XLSX from 'xlsx'

// Helper function to convert rubric criteria from array format to object format
function convertRubricCriteria(rubricCriteria?: unknown): { [score: string]: string } {
  let rubricCriteriaObject: { [score: string]: string } = {};

  if (rubricCriteria) {
    if (Array.isArray(rubricCriteria)) {
      rubricCriteria.forEach((item: unknown) => {
        if (item && typeof item === 'object' && 'score' in item && 'description' in item) {
          const rubricItem = item as { score: string | number; description: string };
          if (rubricItem.score && rubricItem.description) {
            rubricCriteriaObject[String(rubricItem.score)] = rubricItem.description;
          }
        }
      });
    } else if (typeof rubricCriteria === 'object' && rubricCriteria !== null) {
      rubricCriteriaObject = rubricCriteria as { [score: string]: string };
    } else if (typeof rubricCriteria === 'string') {
      try {
        const parsed = JSON.parse(rubricCriteria);
        if (Array.isArray(parsed)) {
          parsed.forEach((item: unknown) => {
            if (item && typeof item === 'object' && 'score' in item && 'description' in item) {
              const rubricItem = item as { score: string | number; description: string };
              if (rubricItem.score && rubricItem.description) {
                rubricCriteriaObject[String(rubricItem.score)] = rubricItem.description;
              }
            }
          });
        } else {
          rubricCriteriaObject = parsed as { [score: string]: string };
        }
      } catch (e) {
        console.warn('Gagal mengurai kriteria rubrik:', e);
      }
    }
  }

  return rubricCriteriaObject;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string; projectId: string }> }
) {
  try {
    const { user: teacher } = await requireTeacherUser()
    const { classId, projectId } = await params

    // Get class info and verify teacher access
    const classAccess = await db
      .select({
        id: classes.id,
        name: classes.name
      })
      .from(classes)
      .innerJoin(userClassAssignments, eq(classes.id, userClassAssignments.classId))
      .where(
        and(
          eq(classes.id, classId),
          eq(userClassAssignments.userId, teacher.id)
        )
      )
      .limit(1)

    if (classAccess.length === 0) {
      return NextResponse.json(
        { error: "You don't have access to this class" },
        { status: 403 }
      )
    }

    const selectedClassInfo = classAccess[0]

    // Get project details
    const project = await db
      .select({
        id: projects.id,
        title: projects.title,
        description: projects.description,
      })
      .from(projects)
      .where(
        and(
          eq(projects.id, projectId),
          eq(projects.classId, classId)
        )
      )
      .limit(1)

    if (project.length === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Get all data needed for export first
    const exportData = await getProjectExportData(classId, projectId, teacher.id, selectedClassInfo)
    const { studentScores, statements } = exportData

    // Generate Excel file with 3-level headers for journals
    const workbook = XLSX.utils.book_new()

    // Build header rows (3-level for journals, 2-level for others)
    const headerRow1 = ['Kelas', 'Nama']
    const headerRow2 = [null, null]
    const headerRow3 = [null, null]

    // Calculate column positions for merges
    let currentCol = 2 // Start after Kelas and Nama columns

    // Add Jurnal Refleksi section with 3-level headers
    const journalStartCol = currentCol
    let journalTotalCols = 0

    // Header Row 1: "Jurnal Refleksi" (will span all journal columns)
    headerRow1.push('Jurnal Refleksi')

    // For each journal question, add: question text (level 2) + its rubrics (level 3)
    statements.journalQuestions.forEach(question => {
      // Level 2: Question text
      headerRow2.push(question.text.length > 50 ? question.text.substring(0, 50) + '...' : question.text)

      // Level 3: Add rubric columns for this question (no student answer column)
      question.rubrics.forEach((rubric, rubricIndex) => {
        if (rubricIndex === 0) {
          // First rubric spans with question text in level 2
          headerRow3.push(rubric.text.length > 30 ? rubric.text.substring(0, 30) + '...' : rubric.text)
        } else {
          // Additional rubrics have no question text in level 2
          headerRow2.push(null) // No question text for additional rubrics
          headerRow3.push(rubric.text.length > 30 ? rubric.text.substring(0, 30) + '...' : rubric.text)
        }
        currentCol += 1
        journalTotalCols += 1
      })
    })

    const journalEndCol = journalStartCol + journalTotalCols - 1

    // Add Penilaian Diri section (2-level headers only)
    const selfStartCol = currentCol
    const selfEndCol = currentCol + statements.selfAssessmentStatements.length - 1
    if (statements.selfAssessmentStatements.length > 0) {
      headerRow1.push('Penilaian Diri')
      headerRow1.push(...Array(statements.selfAssessmentStatements.length - 1).fill(null))
      statements.selfAssessmentStatements.forEach(stmt => {
        headerRow2.push(stmt.text.length > 50 ? stmt.text.substring(0, 50) + '...' : stmt.text)
        headerRow3.push(null) // Add null for 3rd row to maintain array consistency
      })
      currentCol += statements.selfAssessmentStatements.length
    }

    // Add Penilaian Teman Sebaya section (simplified for current data structure)
    const peerStartCol = currentCol
    const peerEndCol = currentCol + statements.peerAssessmentStatements.length - 1
    if (statements.peerAssessmentStatements.length > 0) {
      headerRow1.push('Penilaian Teman Sebaya')
      headerRow1.push(...Array(statements.peerAssessmentStatements.length - 1).fill(null))
      statements.peerAssessmentStatements.forEach(stmt => {
        headerRow2.push(stmt.text.length > 50 ? stmt.text.substring(0, 50) + '...' : stmt.text)
        headerRow3.push('Skor Rata-rata') // Since data is currently averaged
      })
      currentCol += statements.peerAssessmentStatements.length
    }

    // Add Lembar Observasi section (2-level headers only)
    const obsStartCol = currentCol
    const obsEndCol = currentCol + statements.observationStatements.length - 1
    if (statements.observationStatements.length > 0) {
      headerRow1.push('Lembar Observasi')
      headerRow1.push(...Array(statements.observationStatements.length - 1).fill(null))
      statements.observationStatements.forEach(stmt => {
        headerRow2.push(stmt.text.length > 50 ? stmt.text.substring(0, 50) + '...' : stmt.text)
        headerRow3.push(null) // Add null for 3rd row to maintain array consistency
      })
    }

    // Build merges array for 3-level headers
    const merges = []

    // Row 1 merges (main categories)
    if (journalTotalCols > 0) {
      merges.push({ s: { r: 0, c: journalStartCol }, e: { r: 0, c: journalEndCol } })
    }
    if (statements.selfAssessmentStatements.length > 1) {
      merges.push({ s: { r: 0, c: selfStartCol }, e: { r: 0, c: selfEndCol } })
    }
    if (statements.peerAssessmentStatements.length > 1) {
      merges.push({ s: { r: 0, c: peerStartCol }, e: { r: 0, c: peerEndCol } })
    }
    if (statements.observationStatements.length > 1) {
      merges.push({ s: { r: 0, c: obsStartCol }, e: { r: 0, c: obsEndCol } })
    }

    // Row 2 merges for journal questions
    let colIndex = journalStartCol
    statements.journalQuestions.forEach(question => {
      const questionColCount = question.rubrics.length // only rubrics now
      // Merge question text across its rubric columns
      merges.push({ s: { r: 1, c: colIndex }, e: { r: 1, c: colIndex + questionColCount - 1 } })
      colIndex += questionColCount
    })

    
    // Build student data rows
    const studentRows = studentScores.map(student => {
      const row = [student['Kelas'], student['Nama']]

      // Add journal rubric scores for each question (no student answers)
      statements.journalQuestions.forEach(question => {
        // Add rubric scores for this question only
        question.rubrics.forEach(rubric => {
          row.push(student[`Rubric_${rubric.id}`] || 0)
        })
      })

      // Add self assessment scores
      statements.selfAssessmentStatements.forEach((_, index) => {
        row.push(student[`Self_${index + 1}`] || 0)
      })

      // Add peer assessment scores (averaged per question)
      statements.peerAssessmentStatements.forEach((_, index) => {
        row.push(student[`Peer_${index + 1}`] || 0)
      })

      // Add observation scores
      statements.observationStatements.forEach((_, index) => {
        row.push(student[`Obs_${index + 1}`] || 0)
      })

      return row
    })

    // Combine all data with 3 header rows
    const mainData = [
      headerRow1,
      headerRow2,
      headerRow3,
      ...studentRows
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(mainData)
    worksheet['!merges'] = merges

    // Set column widths
    const colWidths = [
      { wch: 12 }, // Kelas
      { wch: 20 }, // Nama
    ]

    // Add dynamic column widths for journal section
    colWidths.push({ wch: 30 }) // Jawaban Murid column

    // Add widths for individual rubric columns
    const allRubricIds = Array.from(new Set(
      statements.journalQuestions.flatMap(q => q.rubrics.map(r => r.id))
    ))
    allRubricIds.forEach(() => colWidths.push({ wch: 12 })) // Rubric columns

    // Add dynamic column widths for other assessments
    statements.selfAssessmentStatements.forEach(() => colWidths.push({ wch: 15 }))
    statements.peerAssessmentStatements.forEach(() => colWidths.push({ wch: 15 }))
    statements.observationStatements.forEach(() => colWidths.push({ wch: 15 }))

    worksheet['!cols'] = colWidths

    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Nilai")

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Create filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `Rekap_Nilai_${project[0].title}_${classId}_${timestamp}.xlsx`

    // Return file as response
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    )
  }
}

async function getProjectExportData(classId: string, projectId: string, teacherId: string, selectedClassInfo: { name: string }) {
  // Get project stages
  const stages = await db
    .select({
      id: projectStages.id,
      name: projectStages.name,
      order: projectStages.order,
    })
    .from(projectStages)
    .where(eq(projectStages.projectId, projectId))
    .orderBy(projectStages.order)

  const stageIds = stages.map(s => s.id)

  // Get stage instruments
  const instruments = await db
    .select({
      id: projectStageInstruments.id,
      projectStageId: projectStageInstruments.projectStageId,
      instrumentType: projectStageInstruments.instrumentType,
      isRequired: projectStageInstruments.isRequired,
    })
    .from(projectStageInstruments)
    .where(inArray(projectStageInstruments.projectStageId, stageIds))

  // Get template configs
  const templateConfigRows = await db
    .select({
      id: templateStageConfigs.id,
      stageName: templateStageConfigs.stageName,
      instrumentType: templateStageConfigs.instrumentType,
    })
    .from(templateStageConfigs)
    .where(inArray(templateStageConfigs.stageName, stages.map(s => s.name)))

  // Create indexed mapping for multiple instruments
  const configKeyToId = new Map<string, string>()
  const instrumentCounters = new Map<string, number>()

  const sortedConfigs = templateConfigRows.sort((a, b) => {
    if (a.stageName !== b.stageName) return a.stageName.localeCompare(b.stageName)
    if (a.instrumentType !== b.instrumentType) return a.instrumentType.localeCompare(b.instrumentType)
    return 0
  })

  for (const row of sortedConfigs) {
    const key = `${row.stageName}__${row.instrumentType}`
    const count = instrumentCounters.get(key) || 0
    const uniqueKey = `${key}__${count}`
    configKeyToId.set(uniqueKey, row.id)
    instrumentCounters.set(key, count + 1)
  }

  // Map instruments to template configs
  const instrumentsWithConfig = instruments.map(instrument => {
    const stage = stages.find(s => s.id === instrument.projectStageId)
    if (!stage) return { ...instrument, templateStageConfigId: null }

    // Count instruments of same type in this stage
    const sameTypeInstruments = instruments.filter(
      i => i.projectStageId === instrument.projectStageId && i.instrumentType === instrument.instrumentType
    )
    const index = sameTypeInstruments.findIndex(i => i.id === instrument.id)

    const configId = configKeyToId.get(`${stage.name}__${instrument.instrumentType}__${index}`)
    return { ...instrument, templateStageConfigId: configId }
  })

  // Get students in class
  const students = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
    })
    .from(user)
    .innerJoin(userClassAssignments, eq(user.id, userClassAssignments.userId))
    .where(
      and(
        eq(userClassAssignments.classId, classId),
        eq(user.role, "STUDENT")
      )
    )
    .orderBy(user.name)

  const studentIds = students.map(s => s.id)

  // Build statements object for header generation and student processing
  const selfAssessmentStatements: Array<{ id: string; text: string }> = []
  const peerAssessmentStatements: Array<{ id: string; text: string }> = []
  const observationStatements: Array<{ id: string; text: string }> = []

  // Get journal questions/prompts with their rubrics
  const journalQuestionsMap = new Map<string, Array<{ id: string; text: string; rubrics: Array<{ id: string; text: string }> }>>()

  for (const configId of Array.from(configKeyToId.values())) {
    const questions = await db
      .select({
        id: templateQuestions.id,
        questionText: templateQuestions.questionText,
        questionType: templateQuestions.questionType,
      })
      .from(templateQuestions)
      .where(eq(templateQuestions.configId, configId))

    // Get rubrics for this config
    const rubrics = await db
      .select({
        id: templateJournalRubrics.id,
        indicatorText: templateJournalRubrics.indicatorText,
      })
      .from(templateJournalRubrics)
      .where(eq(templateJournalRubrics.configId, configId))

    // Combine questions with rubrics (all rubrics belong to all questions in same config)
    questions.forEach(q => {
      if (q.questionType === 'ESSAY_PROMPT') {
        journalQuestionsMap.set(configId, [{
          id: q.id,
          text: q.questionText,
          rubrics: rubrics.map(r => ({
            id: r.id,
            text: r.indicatorText
          }))
        }])
      }
    })
  }

  // Flatten the questions for easier processing
  const journalQuestions = Array.from(journalQuestionsMap.values()).flat()

  // Get self assessment questions
  const selfAssessmentQuestions = await db
    .select({
      id: templateQuestions.id,
      questionText: templateQuestions.questionText,
    })
    .from(templateQuestions)
    .leftJoin(templateStageConfigs, eq(templateQuestions.configId, templateStageConfigs.id))
    .where(eq(templateStageConfigs.instrumentType, 'SELF_ASSESSMENT'))

  selfAssessmentQuestions.forEach(q => {
    selfAssessmentStatements.push({
      id: q.id,
      text: q.questionText
    })
  })

  // Get peer assessment questions
  const peerAssessmentQuestions = await db
    .select({
      id: templateQuestions.id,
      questionText: templateQuestions.questionText,
    })
    .from(templateQuestions)
    .leftJoin(templateStageConfigs, eq(templateQuestions.configId, templateStageConfigs.id))
    .where(eq(templateStageConfigs.instrumentType, 'PEER_ASSESSMENT'))

  peerAssessmentQuestions.forEach(q => {
    peerAssessmentStatements.push({
      id: q.id,
      text: q.questionText
    })
  })

  // Get observation questions
  const observationQuestions = await db
    .select({
      id: templateQuestions.id,
      questionText: templateQuestions.questionText,
    })
    .from(templateQuestions)
    .leftJoin(templateStageConfigs, eq(templateQuestions.configId, templateStageConfigs.id))
    .where(eq(templateStageConfigs.instrumentType, 'OBSERVATION'))

  observationQuestions.forEach(q => {
    observationStatements.push({
      id: q.id,
      text: q.questionText
    })
  })

  const statements = {
    journalQuestions,
    selfAssessmentStatements,
    peerAssessmentStatements,
    observationStatements
  }

  // Get group information
  const groupRows = await db
    .select({
      groupId: groups.id,
      groupName: groups.name,
      studentId: groupMembers.studentId,
    })
    .from(groups)
    .innerJoin(groupMembers, eq(groups.id, groupMembers.groupId))
    .where(eq(groups.projectId, projectId))

  const studentGroups = new Map<string, string>()
  groupRows.forEach(row => {
    studentGroups.set(row.studentId, row.groupName || 'Unknown')
  })

  // Get all submissions
  const allSubmissions = await db
    .select({
      id: submissions.id,
      submittedById: submissions.submittedById,
      submittedBy: submissions.submittedBy,
      templateStageConfigId: submissions.templateStageConfigId,
      targetStudentId: submissions.targetStudentId,
      content: submissions.content,
      score: submissions.score,
      feedback: submissions.feedback,
      submittedAt: submissions.submittedAt,
      instrumentType: templateStageConfigs.instrumentType,
    })
    .from(submissions)
    .leftJoin(templateStageConfigs, eq(submissions.templateStageConfigId, templateStageConfigs.id))
    .where(
      and(
        eq(submissions.projectId, projectId),
        or(
          inArray(submissions.submittedById, studentIds),
          eq(submissions.submittedBy, 'TEACHER')
        )
      )
    )

  
  // Process student scores with detailed data
  const studentScores = []

  for (const student of students) {
    const groupName = studentGroups.get(student.id) || 'No Group'

    // Get student's group members for peer assessment
    const groupMemberIds = groupRows
      .filter(row => row.groupId === groupRows.find(g => g.studentId === student.id)?.groupId)
      .map(row => row.studentId)
      .filter(id => id !== student.id) // Exclude self

    // Initialize student data row
    const studentRow: any = {
      'Kelas': selectedClassInfo?.name || 'Unknown',
      'Nama': student.name || 'Unknown',
    }

    // Get all unique rubric IDs
    const allRubricIds = Array.from(new Set(
      statements.journalQuestions.flatMap(q => q.rubrics.map(r => r.id))
    ))

    // Initialize journal columns
    studentRow['Jawaban_Murid'] = '' // Default empty
    allRubricIds.forEach(rubricId => {
      studentRow[`Rubric_${rubricId}`] = 0 // Default score
    })

    // Initialize self assessment scores array
    const selfAssessmentAnswers: number[] = []

    // Process peer assessment scores (from each peer)
    statements.peerAssessmentStatements.forEach((statement, index) => {
      studentRow[`Peer_${index + 1}`] = 0 // Default score
    })

    // Process observation scores
    statements.observationStatements.forEach((statement, index) => {
      studentRow[`Obs_${index + 1}`] = 0 // Default score
    })

    // Get actual scores from student submissions, sorted by stage order
    const studentSubmissions = allSubmissions.filter(s => s.submittedById === student.id)

    // Sort submissions by stage order to ensure correct sequence
    studentSubmissions.sort((a, b) => {
      const stageA = stages.find(s => s.id === a.projectStageId)
      const stageB = stages.find(s => s.id === b.projectStageId)
      return (stageA?.order || 0) - (stageB?.order || 0)
    })

    studentSubmissions.forEach(submission => {
      if (submission.instrumentType === 'JOURNAL' && typeof submission.content === 'object' && submission.content) {
        const content = submission.content as any

        // Extract student text/jawaban
        if (content.text) {
          studentRow['Jawaban_Murid'] = content.text
        } else if (content.student_answers) {
          studentRow['Jawaban_Murid'] = Array.isArray(content.student_answers)
            ? content.student_answers.join('; ')
            : content.student_answers
        } else if (content.answers) {
          studentRow['Jawaban_Murid'] = Array.isArray(content.answers)
            ? content.answers.join('; ')
            : content.answers
        }

        // Extract grades from content.grades array
        if (content.grades && Array.isArray(content.grades)) {
          content.grades.forEach((grade: any) => {
            if (grade.rubric_id && grade.score !== undefined) {
              const key = `Rubric_${grade.rubric_id}`
              if (studentRow[key] !== undefined) {
                studentRow[key] = grade.score
              }
            }
          })
        }
      } else if (submission.instrumentType === 'SELF_ASSESSMENT' && typeof submission.content === 'object' && submission.content && 'answers' in submission.content) {
        const answers = (submission.content as any).answers || []
        // Append all answers to the continuous array
        selfAssessmentAnswers.push(...answers)
      }
    })

    // Assign all self assessment answers to student row
    selfAssessmentAnswers.forEach((answer, index) => {
      studentRow[`Self_${index + 1}`] = answer
    })

    // Get peer assessment scores from group members
    const peerAssessments = allSubmissions.filter(s =>
      s.instrumentType === 'PEER_ASSESSMENT' &&
      s.targetStudentId === student.id
    )

    // Calculate average score for each peer assessment question
    statements.peerAssessmentStatements.forEach((statement, index) => {
      const scores: number[] = []

      peerAssessments.forEach(peerSubmission => {
        if (typeof peerSubmission.content === 'object' && peerSubmission.content && 'answers' in peerSubmission.content) {
          const answers = (peerSubmission.content as any).answers || []
          if (answers[index] !== undefined) {
            scores.push(answers[index])
          }
        }
      })

      if (scores.length > 0) {
        studentRow[`Peer_${index + 1}`] = Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100) / 100
      }
    })

    // Get observation scores from teacher
    const observations = allSubmissions.filter(s =>
      s.instrumentType === 'OBSERVATION' &&
      s.targetStudentId === student.id &&
      s.submittedBy === 'TEACHER'
    )

    statements.observationStatements.forEach((statement, index) => {
      const obsScores: number[] = []

      observations.forEach(obs => {
        if (typeof obs.content === 'object' && obs.content && 'answers' in obs.content) {
          const answers = (obs.content as any).answers || []
          if (answers[index] !== undefined) {
            obsScores.push(answers[index])
          }
        }
      })

      if (obsScores.length > 0) {
        studentRow[`Obs_${index + 1}`] = Math.round((obsScores.reduce((sum, score) => sum + score, 0) / obsScores.length) * 100) / 100
      }
    })

    studentScores.push(studentRow)
  }

  // Clean up unused variables
  console.log('Processing export data...')

  return {
    studentScores,
    statements,
  }
}