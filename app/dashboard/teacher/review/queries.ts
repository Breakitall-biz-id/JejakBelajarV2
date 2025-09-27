import { and, asc, coalesce, eq, inArray, or, sql } from "drizzle-orm"

import { db } from "@/db"
import {
  classes,
  groupMembers,
  groups,
  instrumentTypeEnum,
  projectStageInstruments,
  projectStageProgress,
  projectStages,
  projects,
  submissions,
  templateJournalRubrics,
  templateStageConfigs,
  templateQuestions,
  userClassAssignments,
} from "@/db/schema/jejak"
import { user } from "@/db/schema/auth"

import type { CurrentUser } from "@/lib/auth/session"

export type TeacherReviewData = {
  classes: Array<{
    id: string
    name: string
  }>
  classProjects: Record<
    string,
    Array<{
      id: string
      title: string
      stages: Array<{
        id: string
        name: string
        order: number
        description: string | null
        unlocksAt: Date | null
        dueAt: Date | null
        instruments: Array<string>
        students: Array<{
          id: string
          name: string | null
          groupId: string | null
          groupName: string | null
          progress: {
            status: string
            unlockedAt: string | null
            completedAt: string | null
          }
          submissions: Array<{
            id: string
            instrumentType: string
            content: unknown
            score: number | null
            feedback: string | null
            submittedAt: string
          }>
        }>
      }>
    }>
  >
}

export async function getTeacherReviewData(teacher: CurrentUser): Promise<TeacherReviewData> {
  const assignedClasses = await db
    .select({
      classId: classes.id,
      className: classes.name,
    })
    .from(classes)
    .innerJoin(userClassAssignments, eq(classes.id, userClassAssignments.classId))
    .where(eq(userClassAssignments.userId, teacher.id))
    .orderBy(asc(classes.name))

  const classIds = assignedClasses.map((row) => row.classId)

  if (classIds.length === 0) {
    return { classes: [], classProjects: {} }
  }

  const projectsRows = await db
    .select({
      id: projects.id,
      classId: projects.classId,
      title: projects.title,
    })
    .from(projects)
    .where(
      and(
        eq(projects.teacherId, teacher.id),
        inArray(projects.classId, classIds),
      ),
    )
    .orderBy(asc(projects.classId), asc(projects.title))

  const projectIds = projectsRows.map((row) => row.id)

  if (projectIds.length === 0) {
    return {
      classes: assignedClasses.map((row) => ({ id: row.classId, name: row.className })),
      classProjects: {},
    }
  }

  const stageRows = await db
    .select({
      id: projectStages.id,
      projectId: projectStages.projectId,
      name: projectStages.name,
      order: projectStages.order,
      description: projectStages.description,
      unlocksAt: projectStages.unlocksAt,
      dueAt: projectStages.dueAt,
    })
    .from(projectStages)
    .where(inArray(projectStages.projectId, projectIds))
    .orderBy(asc(projectStages.projectId), asc(projectStages.order))

  const instrumentRows = await db
    .select({
      projectStageId: projectStageInstruments.projectStageId,
      instrumentType: projectStageInstruments.instrumentType,
      description: projectStageInstruments.description,
    })
    .from(projectStageInstruments)
    .where(inArray(projectStageInstruments.projectStageId, stageRows.map((stage) => stage.id)))

  const classStudentRows = await db
    .select({
      classId: userClassAssignments.classId,
      studentId: userClassAssignments.userId,
      studentName: user.name,
      studentEmail: user.email,
    })
    .from(userClassAssignments)
    .innerJoin(user, eq(user.id, userClassAssignments.userId))
    .where(
      and(
        inArray(userClassAssignments.classId, classIds),
        eq(user.role, "STUDENT"),
      ),
    )

  const userIds = classStudentRows.map((row) => row.studentId)
  const stageIds = stageRows.map((row) => row.id)

  const progressRows = await db
    .select({
      id: projectStageProgress.id,
      projectStageId: projectStageProgress.projectStageId,
      studentId: projectStageProgress.studentId,
      status: projectStageProgress.status,
      unlockedAt: projectStageProgress.unlockedAt,
      completedAt: projectStageProgress.completedAt,
    })
    .from(projectStageProgress)
    .where(
      and(
        inArray(projectStageProgress.projectStageId, stageIds),
        inArray(projectStageProgress.studentId, studentIds),
      ),
    )

  const submissionRows = await db
    .select({
      id: submissions.id,
      submittedById: submissions.submittedById,
      projectStageId: submissions.projectStageId,
      instrumentType: sql`COALESCE(${templateStageConfigs.instrumentType}, 'OBSERVATION')`,
      score: submissions.score,
      feedback: submissions.feedback,
      content: submissions.content,
      submittedAt: submissions.submittedAt,
    })
    .from(submissions)
    .leftJoin(templateStageConfigs, eq(submissions.templateStageConfigId, templateStageConfigs.id))
    .where(
      and(
        inArray(submissions.projectStageId, stageIds),
        or(
          // Student submissions
          inArray(submissions.submittedById, userIds),
          // Teacher submissions (including OBSERVATION instruments)
          eq(submissions.submittedBy, 'TEACHER')
        )
      ),
    )

  const groupRows = await db
    .select({
      groupId: groups.id,
      groupName: groups.name,
      projectId: groups.projectId,
      studentId: groupMembers.studentId,
    })
    .from(groups)
    .innerJoin(groupMembers, eq(groups.id, groupMembers.groupId))
    .where(inArray(groups.projectId, projectIds))

  const classProjects: TeacherReviewData["classProjects"] = {}

  for (const project of projectsRows) {
    const stages = stageRows ? stageRows.filter((stage) => stage.projectId === project.id) : []
    const studentsInClass = classStudentRows
      ? classStudentRows
        .filter((row) => row.classId === project.classId)
        .map((row) => ({ id: row.studentId, name: row.studentName, email: row.studentEmail }))
      : []

    const stageData = stages.map((stage) => {
      const instruments = instrumentRows
        .filter((instrument) => instrument.projectStageId === stage.id)
        .map((instrument) => instrument.instrumentType)

      const students = studentsInClass.map((student) => {
        const progress = progressRows.find(
          (row) => row.projectStageId === stage.id && row.studentId === student.id,
        )

        const submissionsForStage = submissionRows.filter(
          (submission) => submission.projectStageId === stage.id && submission.submittedById === student.id,
        )

        const groupMembership = groupRows.find(
          (group) => group.projectId === project.id && group.studentId === student.id,
        )

        return {
          id: student.id,
          name: student.name,
          groupId: groupMembership?.groupId ?? null,
          groupName: groupMembership?.groupName ?? null,
          progress: {
            status: progress?.status ?? "LOCKED",
            unlockedAt: progress?.unlockedAt?.toISOString() ?? null,
            completedAt: progress?.completedAt?.toISOString() ?? null,
          },
          submissions: submissionsForStage.map((submission) => ({
            id: submission.id,
            instrumentType: submission.instrumentType,
            content: submission.content,
            score: submission.score,
            feedback: submission.feedback,
            submittedAt: submission.submittedAt ? submission.submittedAt.toISOString() : new Date().toISOString(),
          })),
        }
      })

      return {
        id: stage.id,
        name: stage.name,
        order: stage.order,
        description: stage.description,
        unlocksAt: stage.unlocksAt,
        dueAt: stage.dueAt,
        instruments,
        students,
      }
    })

    if (!classProjects[project.classId]) {
      classProjects[project.classId] = []
    }

    classProjects[project.classId].push({
      id: project.id,
      title: project.title,
      stages: stageData,
    })
  }

  return {
    classes: assignedClasses.map((row) => ({ id: row.classId, name: row.className })),
    classProjects,
  }
}

export type ProjectDetailData = {
  id: string
  title: string
  description?: string
  stages: Array<{
    id: string
    name: string
    description: string | null
    order: number
    unlocksAt: Date | null
    dueAt: Date | null
    status: string
    requiredInstruments: Array<{
      id: string
      instrumentType: string
      isRequired: boolean
      description?: string | null
      questions?: Array<{
        id: string
        questionText: string
        questionType: string
        scoringGuide: string | null
        rubricCriteria: { [score: string]: string }
      }>
      rubrics?: Array<{
        id: string
        indicatorText: string
        criteria: { [score: string]: string }
      }>
    }>
    submissionsByInstrument: Record<string, unknown[]>
    students: Array<{
      id: string
      name: string | null
      groupName?: string | null
      groupId?: string | null
      progress: { status: string }
      submissions: Array<{
        id: string
        instrumentType: string
        content: unknown
        submittedAt: string
        score?: number | null
        feedback?: string | null
        teacherGrades?: Array<{
          rubric_id: string
          score: number
          feedback?: string | null
        }>
      }>
    }>
  }>
  group?: {
    members: Array<{
      studentId: string
      name: string | null
      email: string | null
    }>
  }
}

export async function getProjectDetail(classId: string, projectId: string, teacher: CurrentUser): Promise<ProjectDetailData | null> {
  // Verify teacher has access to this class
  const classAccess = await db
    .select({ id: classes.id })
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
    return null
  }

  // Get project details
  const projectRow = await db
    .select({
      id: projects.id,
      title: projects.title,
      description: projects.description,
    })
    .from(projects)
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.classId, classId),
        eq(projects.teacherId, teacher.id)
      )
    )
    .limit(1)

  if (projectRow.length === 0) {
    return null
  }

  const project = projectRow[0]

  // Get stages for this project
  const stageRows = await db
    .select({
      id: projectStages.id,
      name: projectStages.name,
      order: projectStages.order,
      description: projectStages.description,
      unlocksAt: projectStages.unlocksAt,
      dueAt: projectStages.dueAt,
    })
    .from(projectStages)
    .where(eq(projectStages.projectId, projectId))
    .orderBy(asc(projectStages.order))

  const stageIds = stageRows.map(stage => stage.id)

  // Get instruments for each stage (with questions)
  const instrumentRows = await db
    .select({
      id: projectStageInstruments.id,
      projectStageId: projectStageInstruments.projectStageId,
      instrumentType: projectStageInstruments.instrumentType,
      description: projectStageInstruments.description,
      isRequired: projectStageInstruments.isRequired,
    })
    .from(projectStageInstruments)
    .where(inArray(projectStageInstruments.projectStageId, stageIds))

  // Map: stageId+instrumentType -> projectStageInstrumentId
  const instrumentKeyToId = new Map<string, string>()
  for (const row of instrumentRows) {
    instrumentKeyToId.set(`${row.projectStageId}__${row.instrumentType}`, row.id)
  }

  // Get templateStageConfigs for all stage/instrument
  const templateConfigRows = await db
    .select({
      id: templateStageConfigs.id,
      stageName: templateStageConfigs.stageName,
      instrumentType: templateStageConfigs.instrumentType,
    })
    .from(templateStageConfigs)
    .where(inArray(templateStageConfigs.stageName, stageRows.map(s => s.name)))

  const configKeyToId = new Map<string, string>()
  for (const row of templateConfigRows) {
    configKeyToId.set(`${row.stageName}__${row.instrumentType}`, row.id)
  }

  const allConfigIds = Array.from(configKeyToId.values())

  let questionRows: Array<{ id: string; configId: string; questionText: string; questionType: string; scoringGuide: string | null; rubricCriteria: string | null }> = []
  if (allConfigIds.length > 0) {
    questionRows = await db
      .select({
        id: templateQuestions.id,
        configId: templateQuestions.configId,
        questionText: templateQuestions.questionText,
        questionType: templateQuestions.questionType,
        scoringGuide: templateQuestions.scoringGuide,
        rubricCriteria: templateQuestions.rubricCriteria,
      })
      .from(templateQuestions)
      .where(inArray(templateQuestions.configId, allConfigIds))
  }

  const configIdToQuestions = new Map<string, Array<{ id: string; questionText: string; questionType: string; scoringGuide: string | null; rubricCriteria: { [score: string]: string } }>>()
  for (const q of questionRows) {
    if (!configIdToQuestions.has(q.configId)) configIdToQuestions.set(q.configId, [])
    configIdToQuestions.get(q.configId)!.push({
      id: q.id,
      questionText: q.questionText,
      questionType: q.questionType,
      scoringGuide: q.scoringGuide,
      rubricCriteria: (() => { try { return q.rubricCriteria ? JSON.parse(q.rubricCriteria) : {}; } catch { return {}; } })(),
    })
  }

  // Get journal rubrics for JOURNAL instruments
  let journalRubricRows: Array<{ id: string; configId: string; indicatorText: string; criteria: { [score: string]: string } }> = []
  if (allConfigIds.length > 0) {
    const rawRubricRows = await db
      .select({
        id: templateJournalRubrics.id,
        configId: templateJournalRubrics.configId,
        indicatorText: templateJournalRubrics.indicatorText,
        criteria: templateJournalRubrics.criteria,
      })
      .from(templateJournalRubrics)
      .where(inArray(templateJournalRubrics.configId, allConfigIds))

    journalRubricRows = rawRubricRows.map(row => ({
      ...row,
      criteria: typeof row.criteria === 'string' ? JSON.parse(row.criteria) : row.criteria
    }))
  }

  const configIdToRubrics = new Map<string, Array<{ id: string; indicatorText: string; criteria: { [score: string]: string } }>>()
  for (const r of journalRubricRows) {
    if (!configIdToRubrics.has(r.configId)) configIdToRubrics.set(r.configId, [])
    configIdToRubrics.get(r.configId)!.push({
      id: r.id,
      indicatorText: r.indicatorText,
      criteria: r.criteria,
    })
  }

  const studentRows = await db
    .select({
      studentId: user.id,
      studentName: user.name,
      studentEmail: user.email,
    })
    .from(user)
    .innerJoin(userClassAssignments, eq(user.id, userClassAssignments.userId))
    .where(
      and(
        eq(userClassAssignments.classId, classId),
        eq(user.role, "STUDENT")
      )
    )

  const studentIds = studentRows.map(row => row.studentId)

  // Get progress data
  const progressRows = await db
    .select({
      id: projectStageProgress.id,
      projectStageId: projectStageProgress.projectStageId,
      studentId: projectStageProgress.studentId,
      status: projectStageProgress.status,
      unlockedAt: projectStageProgress.unlockedAt,
      completedAt: projectStageProgress.completedAt,
    })
    .from(projectStageProgress)
    .where(
      and(
        inArray(projectStageProgress.projectStageId, stageIds),
        inArray(projectStageProgress.studentId, studentIds)
      )
    )

  // Get student submissions
  const studentSubmissionRows = await db
    .select({
      id: submissions.id,
      submittedById: submissions.submittedById,
      submittedBy: submissions.submittedBy,
      projectStageId: submissions.projectStageId,
      instrumentType: templateStageConfigs.instrumentType,
      targetStudentId: submissions.targetStudentId,
      score: submissions.score,
      feedback: submissions.feedback,
      content: submissions.content,
      submittedAt: submissions.submittedAt,
    })
    .from(submissions)
    .leftJoin(templateStageConfigs, eq(submissions.templateStageConfigId, templateStageConfigs.id))
    .where(
      and(
        inArray(submissions.projectStageId, stageIds),
        inArray(submissions.submittedById, studentIds)
      )
    )

  // Get teacher submissions (observations)
  const teacherSubmissionRows = await db
    .select({
      id: submissions.id,
      submittedById: submissions.submittedById,
      submittedBy: submissions.submittedBy,
      projectStageId: submissions.projectStageId,
      instrumentType: templateStageConfigs.instrumentType,
      targetStudentId: submissions.targetStudentId,
      score: submissions.score,
      feedback: submissions.feedback,
      content: submissions.content,
      submittedAt: submissions.submittedAt,
    })
    .from(submissions)
    .leftJoin(templateStageConfigs, eq(submissions.templateStageConfigId, templateStageConfigs.id))
    .where(
      and(
        inArray(submissions.projectStageId, stageIds),
        eq(submissions.submittedById, teacher.id),
        eq(submissions.submittedBy, 'TEACHER')
      )
    )

  // Combine all submissions
  const submissionRows = [...studentSubmissionRows, ...teacherSubmissionRows]

  // Process submission rows to handle NULL instrumentType
  console.log("🔍 BACKEND DEBUG - Raw submission rows:", submissionRows.length, submissionRows);

  const processedSubmissionRows = submissionRows.map(row => {
    // Determine instrument type if it's null
    let instrumentType = row.instrumentType;

    if (!instrumentType) {
      // For teacher submissions with targetStudentId, assume OBSERVATION
      if (row.targetStudentId) {
        instrumentType = "OBSERVATION";
      }
      // Add other fallback logic as needed
    }

    return {
      ...row,
      instrumentType: instrumentType || "UNKNOWN"
    };
  });

  console.log("🔍 BACKEND DEBUG - Processed submission rows:", processedSubmissionRows.length, processedSubmissionRows);

  // Get group data
  let groupRows: Array<{
    groupId: string
    groupName: string | null
    studentId: string
  }> = []

  try {
    const result = await db
      .select({
        groupId: groups.id,
        groupName: groups.name,
        studentId: groupMembers.studentId,
      })
      .from(groups)
      .innerJoin(groupMembers, eq(groups.id, groupMembers.groupId))
      .where(eq(groups.projectId, projectId))

    groupRows = result
  } catch {
    // Continue without group data if table doesn't exist
  }

  // Transform data
  const stages = stageRows.map(stage => {
    const instruments = instrumentRows
      .filter(instrument => instrument.projectStageId === stage.id)
      .map(instrument => {
        // Find template config for this stage/instrument
        const configId = configKeyToId.get(`${stage.name}__${instrument.instrumentType}`)
        const questions = configId ? configIdToQuestions.get(configId) || [] : []
        const rubrics = instrument.instrumentType === "JOURNAL" && configId ? configIdToRubrics.get(configId) || [] : []
        return {
          id: `${instrument.instrumentType.toLowerCase()}-${stage.id}`,
          instrumentType: instrument.instrumentType,
          isRequired: instrument.isRequired,
          description: instrument.description,
          questions,
          rubrics,
        }
      })

    // Separate teacher submissions from student submissions
    const teacherSubmissions = processedSubmissionRows.filter(
      s => s.projectStageId === stage.id && s.submittedById === teacher?.id && s.submittedBy === 'TEACHER'
    )

    console.log("🔍 BACKEND DEBUG - Teacher submissions for stage:", stage.name, {
      teacherId: teacher?.id,
      teacherSubmissions: teacherSubmissions,
      totalSubmissions: processedSubmissionRows.filter(s => s.projectStageId === stage.id).length
    })

    const students = studentRows.map(student => {
      const progress = progressRows.find(
        p => p.projectStageId === stage.id && p.studentId === student.studentId
      )

      const submissionsForStudent = processedSubmissionRows.filter(
        s => s.projectStageId === stage.id && s.submittedById === student.studentId
      )

      const groupMembership = groupRows.find(
        g => g.studentId === student.studentId
      )

      // Special handling for PEER_ASSESSMENT: parse matrix answers
      const peerAssessmentSubs = submissionsForStudent.filter(sub => sub.instrumentType === "PEER_ASSESSMENT")
      let peerAssessmentMatrix: number[][] | undefined = undefined
      if (peerAssessmentSubs.length > 0) {
        // Assume each submission.content.answers is an array of numbers (per question, per peer)
        // If student submits matrix, it should be [question][peer] or [peer][question]
        // We'll try to normalize to [question][peer]
        // If only one submission, content.answers is matrix; if multiple, merge by question
        // Try to find the shape
        const matrices = peerAssessmentSubs.map(sub => {
          if (sub.content && typeof sub.content === 'object' && 'answers' in sub.content && Array.isArray(sub.content.answers)) {
            return sub.content.answers as number[][]
          }
          return []
        }).filter(arr => Array.isArray(arr) && arr.length > 0)
        if (matrices.length > 0) {
          // If only one matrix, use it; if multiple, merge by question index
          if (matrices.length === 1) {
            peerAssessmentMatrix = matrices[0]
          } else {
            // Merge: for each question, collect all peer answers
            const maxQuestions = Math.max(...matrices.map(m => m.length))
            peerAssessmentMatrix = Array.from({ length: maxQuestions }, (_, qIdx) => {
              // For each matrix, take row qIdx if exists, flatten
              return matrices.flatMap(m => m[qIdx] || [])
            })
          }
        }
      }

      return {
        id: student.studentId,
        name: student.studentName,
        groupId: groupMembership?.groupId,
        groupName: groupMembership?.groupName,
        progress: {
          status: progress?.status || "LOCKED"
        },
        submissions: submissionsForStudent.map(submission => {
          // Handle journal submissions with the new data structure
          let processedContent = submission.content
          let teacherGrades = undefined

          if (submission.instrumentType === "JOURNAL" && submission.content && typeof submission.content === 'object') {
            // Extract student answers and teacher grades from the new structure
            if ('student_answers' in submission.content) {
              processedContent = submission.content.student_answers
            }
            if ('grades' in submission.content) {
              teacherGrades = submission.content.grades
            }
          }

          return {
            id: submission.id,
            instrumentType: submission.instrumentType,
            content: processedContent,
            submittedAt: submission.submittedAt?.toISOString() || new Date().toISOString(),
            score: submission.score,
            feedback: submission.feedback,
            teacherGrades,
          }
        }),
        peerAssessmentMatrix, // <-- add matrix for teacher review
      }
    })

    const submissionsByInstrument = students.reduce((acc, student) => {
      student.submissions.forEach(submission => {
        const instrumentType = submission.instrumentType || "UNKNOWN"
        if (!acc[instrumentType]) {
          acc[instrumentType] = []
        }
        acc[instrumentType].push(submission)
      })
      return acc
    }, {} as Record<string, unknown[]>)

    // Add teacher submissions to submissionsByInstrument
    teacherSubmissions.forEach(submission => {
      const instrumentType = submission.instrumentType || "UNKNOWN"
      if (!submissionsByInstrument[instrumentType]) {
        submissionsByInstrument[instrumentType] = []
      }
      submissionsByInstrument[instrumentType].push({
        id: submission.id,
        instrumentType: submission.instrumentType,
        targetStudentId: submission.targetStudentId,
        content: submission.content,
        submittedAt: submission.submittedAt?.toISOString() || new Date().toISOString(),
        score: submission.score,
        feedback: submission.feedback,
      })
    })

    console.log("🔍 BACKEND DEBUG - Final submissionsByInstrument for stage:", stage.name, {
      submissionsByInstrument,
      instrumentTypes: Object.keys(submissionsByInstrument),
      observationCount: submissionsByInstrument["OBSERVATION"]?.length || 0
    })

    return {
      id: stage.id,
      name: stage.name,
      description: stage.description,
      order: stage.order,
      unlocksAt: stage.unlocksAt,
      dueAt: stage.dueAt,
      status: "IN_PROGRESS", // Default status
      requiredInstruments: instruments,
      submissionsByInstrument,
      students,
    }
  })

  // Get group members
  const groupMembersMap = new Map<string, Array<{ studentId: string; name: string | null; email: string | null }>>()
  groupRows.forEach(row => {
    if (!groupMembersMap.has(row.groupId)) {
      groupMembersMap.set(row.groupId, [])
    }
    groupMembersMap.get(row.groupId)!.push({
      studentId: row.studentId,
      name: studentRows.find(s => s.studentId === row.studentId)?.studentName ?? null,
      email: studentRows.find(s => s.studentId === row.studentId)?.studentEmail ?? null,
    })
  })

  const groupList = Array.from(groupMembersMap.entries()).map(([groupId, members]) => ({
    id: groupId,
    name: groupRows.find(r => r.groupId === groupId)?.groupName || "Unknown Group",
    members,
  }))

  return {
    id: project.id,
    title: project.title,
    description: project.description || undefined,
    stages,
    group: groupList.length > 0 ? {
      members: groupList.flatMap(g => g.members)
    } : undefined,
  }
}
