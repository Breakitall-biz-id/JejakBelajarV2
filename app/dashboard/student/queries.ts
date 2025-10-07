import { and, asc, eq, inArray } from "drizzle-orm"

import { db } from "@/db"
import {
  academicTerms,
  classes,
  groupComments,
  groupMembers,
  groups,
  projectStageInstruments,
  projectStageProgress,
  projectStages,
  projects,
  projectStatusEnum,
  submissions,
  templateStageConfigs,
  templateQuestions,
  userClassAssignments,
} from "@/db/schema/jejak"
import { user } from "@/db/schema/auth"
import type { CurrentUser } from "@/lib/auth/session"

type StageProgressRow = typeof projectStageProgress.$inferSelect

type StageRow = {
  id: string
  projectId: string
  name: string
  description: string | null
  order: number
  unlocksAt: Date | null
  dueAt: Date | null
}

type StudentSubmissionRow = {
  id: string
  stageId: string | null
  projectId: string
  instrumentType: string
  templateStageConfigId: string | null
  content: unknown
  submittedAt: Date
  targetStudentId: string | null
  targetStudentName: string | null
}

export type StudentDashboardData = {
  projects: Array<{
    id: string
    title: string
    description: string | null
    theme: string | null
    status: string
    class: {
      id: string
      name: string
      academicYear: string
      semester: string
    }
    teacher: {
      id: string | null
      name: string | null
      email: string | null
    }
    group: {
      id: string
      name: string
      members: Array<{
        studentId: string
        name: string | null
        email: string
        comment?: string | null
        feedbackToMe?: string | null
      }>
    } | null
    stages: Array<{
      id: string
      name: string
      description: string | null
      order: number
      unlocksAt: string | null
      dueAt: string | null
      status: StageProgressRow["status"]
      requiredInstruments: Array<{
        id: string
        instrumentType: string
        isRequired: boolean
        description: string | null
        templateStageConfigId: string | null
        questions?: Array<{
          id: string
          questionText: string
          questionType: string
          scoringGuide: string | null
        }>
      }>
      submissions: Array<{
        id: string
        instrumentType: string
        templateStageConfigId: string | null
        content: unknown
        submittedAt: string
        targetStudentId: string | null
        targetStudentName: string | null
      }>
      submissionsByInstrument: Record<string, Array<{
        id: string
        instrumentType: string
        templateStageConfigId: string | null
        content: unknown
        submittedAt: string
        targetStudentId: string | null
        targetStudentName: string | null
      }>>
    }>
    currentStudentId: string
  }>
}


const serializeDate = (value: Date | null) => value?.toISOString() ?? null

export async function getStudentDashboardData(
  student: CurrentUser,
): Promise<StudentDashboardData> {
  try {
    const classRows = await db
    .select({
      classId: classes.id,
      className: classes.name,
      academicYear: academicTerms.academicYear,
      semester: academicTerms.semester,
      termStatus: academicTerms.status,
    })
    .from(classes)
    .innerJoin(userClassAssignments, eq(classes.id, userClassAssignments.classId))
    .innerJoin(academicTerms, eq(classes.academicTermId, academicTerms.id))
    .where(
      and(
        eq(userClassAssignments.userId, student.id),
        eq(academicTerms.status, "ACTIVE"),
      ),
    )

  if (classRows.length === 0) {
    return { projects: [] }
  }

  const classIds = classRows.map((row) => row.classId).filter(Boolean)
  const classMap = new Map()
  for (const row of classRows) {
    if (row && row.classId) {
      classMap.set(row.classId, {
        id: row.classId,
        name: row.className || "",
        academicYear: row.academicYear || "",
        semester: row.semester || "",
      })
    }
  }

  const projectRows = await db
    .select({
      id: projects.id,
      title: projects.title,
      description: projects.description,
      theme: projects.theme,
      status: projects.status,
      classId: projects.classId,
      teacherId: projects.teacherId,
      teacherName: user.name,
      teacherEmail: user.email,
    })
    .from(projects)
    .leftJoin(user, eq(projects.teacherId, user.id))
    .where(
      and(
        eq(projects.status, "PUBLISHED" as (typeof projectStatusEnum.enumValues)[number]),
        inArray(projects.classId, classIds),
      ),
    )
    .orderBy(asc(projects.createdAt))

  if (projectRows.length === 0) {
    return { projects: [] }
  }

  const projectIds = projectRows.map((row) => row.id).filter(Boolean)

  const stageRows = await db
    .select({
      id: projectStages.id,
      projectId: projectStages.projectId,
      name: projectStages.name,
      description: projectStages.description,
      order: projectStages.order,
      unlocksAt: projectStages.unlocksAt,
      dueAt: projectStages.dueAt,
    })
    .from(projectStages)
    .where(inArray(projectStages.projectId, projectIds))
    .orderBy(asc(projectStages.projectId), asc(projectStages.order))

  // Group stages by name (like admin dialog) - merge stages with same name
  const stageRowsByProject: Record<string, StageRow[]> = {}

  for (const row of stageRows) {
    if (!stageRowsByProject[row.projectId]) {
      stageRowsByProject[row.projectId] = []
    }
    stageRowsByProject[row.projectId].push(row)
  }

  // Now merge stages with same name within each project
  const mergedStagesByProject: Record<string, StageRow[]> = {}

  for (const [projectId, projectStages] of Object.entries(stageRowsByProject)) {
    const stageMap = new Map<string, StageRow>()

    for (const stage of projectStages) {
      const existing = stageMap.get(stage.name)

      if (!existing) {
        // First stage with this name
        stageMap.set(stage.name, stage)
      } else {
        // Merge with existing stage - keep the one with lower order
        if (stage.order < existing.order) {
          stageMap.set(stage.name, stage)
        }
      }
    }

    mergedStagesByProject[projectId] = Array.from(stageMap.values()).sort((a, b) => a.order - b.order)
  }

  // Get all stage IDs from merged stages for instrument query
  const allStageIds = stageRows.map((row) => row.id)

  const instrumentRows = allStageIds.length
    ? await db
        .select({
          id: projectStageInstruments.id,
          projectStageId: projectStageInstruments.projectStageId,
          instrumentType: projectStageInstruments.instrumentType,
          isRequired: projectStageInstruments.isRequired,
          description: projectStageInstruments.description,
        })
        .from(projectStageInstruments)
        .where(inArray(projectStageInstruments.projectStageId, allStageIds))
    : []

  const instrumentsByStage: Record<string, typeof instrumentRows> = {}
  for (const instrument of instrumentRows) {
    if (instrument && instrument.projectStageId) {
      if (!instrumentsByStage[instrument.projectStageId]) {
        instrumentsByStage[instrument.projectStageId] = []
      }
      instrumentsByStage[instrument.projectStageId].push(instrument)
    }
  }

  const submissionRows: StudentSubmissionRow[] = (await db
    .select({
      id: submissions.id,
      stageId: submissions.projectStageId,
      projectId: submissions.projectId,
      instrumentType: templateStageConfigs.instrumentType,
      templateStageConfigId: submissions.templateStageConfigId,
      content: submissions.content,
      submittedAt: submissions.submittedAt,
      targetStudentId: submissions.targetStudentId,
      targetStudentName: user.name,
    })
    .from(submissions)
    .leftJoin(templateStageConfigs, eq(submissions.templateStageConfigId, templateStageConfigs.id))
    .leftJoin(user, eq(user.id, submissions.targetStudentId))
    .where(
      and(
        eq(submissions.submittedById, student.id),
        inArray(submissions.projectId, projectIds),
      ),
    ))
    .map((row) => ({
      ...row,
      instrumentType: row.instrumentType ?? '',
    }))

  const submissionsByStage: Record<string, StudentSubmissionRow[]> = {}
  if (submissionRows) {
    for (const submission of submissionRows) {
      if (!submission.stageId) {
        continue
      }
      if (!submissionsByStage[submission.stageId]) {
        submissionsByStage[submission.stageId] = []
      }
      submissionsByStage[submission.stageId].push(submission)
    }
  }

  const studentGroupRows = await db
    .select({
      groupId: groups.id,
      projectId: groups.projectId,
      groupName: groups.name,
    })
    .from(groupMembers)
    .innerJoin(groups, eq(groups.id, groupMembers.groupId))
    .where(
      and(
        eq(groupMembers.studentId, student.id),
        inArray(groups.projectId, projectIds),
      ),
    )

  const groupIds = (studentGroupRows || []).map((row) => row.groupId)

  // Fetch group members with their comments from the current student
  const groupMemberRows = groupIds.length
    ? await db
        .select({
          groupId: groupMembers.groupId,
          studentId: groupMembers.studentId,
          studentName: user.name,
          studentEmail: user.email,
          comment: groupComments.comment,
        })
        .from(groupMembers)
        .innerJoin(user, eq(user.id, groupMembers.studentId))
        .leftJoin(groupComments, and(
          eq(groupComments.groupId, groupMembers.groupId),
          eq(groupComments.targetMemberId, groupMembers.studentId),
          eq(groupComments.authorId, student.id)
        ))
        .where(inArray(groupMembers.groupId, groupIds))
        .orderBy(groupComments.createdAt)
    : []

  // Fetch feedback to current student from other group members
  const feedbackToMeRows = groupIds.length
    ? await db
        .select({
          groupId: groupComments.groupId,
          authorId: groupComments.authorId,
          comment: groupComments.comment,
        })
        .from(groupComments)
        .where(
          and(
            inArray(groupComments.groupId, groupIds),
            eq(groupComments.targetMemberId, student.id)
          )
        )
    : []

  // Create a map of feedback from each author to the current student
  const feedbackToMeByAuthor = new Map<string, string>()
  feedbackToMeRows.forEach(row => {
    if (row.comment && row.authorId) {
      feedbackToMeByAuthor.set(row.authorId, row.comment)
    }
  })

  // Process the data to keep only the latest comment for each member
  const processedMemberRows = (groupMemberRows || []).reduce((acc, row) => {
    const key = `${row.groupId}-${row.studentId}`
    const existing = acc.get(key)

    // If no existing entry or current row has a newer comment (not null), use this one
    if (!existing || (row.comment && !existing.comment)) {
      acc.set(key, row)
    }

    return acc
  }, new Map<string, typeof groupMemberRows[0]>())

  
  const membersByGroup = Array.from(processedMemberRows.values()).reduce<Record<string, typeof groupMemberRows>>((acc, member) => {
    if (!acc[member.groupId]) {
      acc[member.groupId] = []
    }
    acc[member.groupId].push(member)
    return acc
  }, {})

  await fetchClassStudents(classIds)

  const studentProjects = [] as StudentDashboardData["projects"]

  for (const project of projectRows) {
    if (!project || !project.id) {
      console.warn("Invalid project data")
      continue
    }

    const stagesForProject = stageRowsByProject[project.id] ?? []

    if (stagesForProject.length === 0) {
      continue
    }

    let progressMap: Map<string, StageProgressRow>
    try {
      progressMap = await ensureStageProgressEntries(student.id, project.id, stagesForProject)

      const missingProgress = stagesForProject.filter(stage => !progressMap.has(stage.id))
      if (missingProgress.length > 0) {
        for (const stage of missingProgress) {
          try {
            const [created] = await db
              .insert(projectStageProgress)
              .values({
                projectStageId: stage.id,
                studentId: student.id,
                status: stage.order === 1 ? "IN_PROGRESS" : "LOCKED",
                unlockedAt: stage.order === 1 ? new Date() : null,
              })
              .returning()
            if (created) {
              progressMap.set(stage.id, created)
            }
          } catch (createError) {
            if (createError instanceof Error && createError.message.includes('duplicate')) {
              const [existing] = await db
                .select()
                .from(projectStageProgress)
                .where(
                  and(
                    eq(projectStageProgress.projectStageId, stage.id),
                    eq(projectStageProgress.studentId, student.id),
                  ),
                )
                .limit(1)
              if (existing) {
                progressMap.set(stage.id, existing)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("An error occurred while fetching student dashboard data:", error);
      progressMap = new Map()
      for (const stage of stagesForProject) {
        try {
          const [created] = await db
            .insert(projectStageProgress)
            .values({
              projectStageId: stage.id,
              studentId: student.id,
              status: stage.order === 1 ? "IN_PROGRESS" : "LOCKED",
              unlockedAt: stage.order === 1 ? new Date() : null,
            })
            .returning()
          if (created) {
            progressMap.set(stage.id, created)
          }
        } catch (createError) {
          if (createError instanceof Error && createError.message.includes('duplicate')) {
            const [existing] = await db
              .select()
              .from(projectStageProgress)
              .where(
                and(
                  eq(projectStageProgress.projectStageId, stage.id),
                  eq(projectStageProgress.studentId, student.id),
                ),
              )
              .limit(1)
            if (existing) {
              progressMap.set(stage.id, existing)
            }
          }
        }
      }
    }

    const stageData = (await Promise.all(
      stagesForProject.map(async (stage) => {
        const progress = progressMap.get(stage.id)
        if (!progress) {
          return null
        }

        // Get template stage configs for this project to properly map instruments
        const projectTemplateConfigs = await db
          .select({
            id: templateStageConfigs.id,
            stageName: templateStageConfigs.stageName,
            instrumentType: templateStageConfigs.instrumentType,
            description: templateStageConfigs.description,
          })
          .from(templateStageConfigs)
          .innerJoin(projects, eq(templateStageConfigs.templateId, projects.templateId))
          .where(
            and(
              eq(projects.id, project.id),
              eq(templateStageConfigs.stageName, stage.name),
            )
          )

        // Create instruments data by mapping project stage instruments with template configs
        const instruments = (instrumentsByStage[stage.id]?.length
          ? await Promise.all(
              instrumentsByStage[stage.id].map(async (instrument, index) => {
                // For multiple instruments of the same type, use index to create unique mapping
                const matchingConfigs = projectTemplateConfigs.filter(config =>
                  config.instrumentType === instrument.instrumentType
                )

                // Use the config at the same index, or fallback to the first one
                const templateConfig = matchingConfigs[index] || matchingConfigs[0]
                const configId = templateConfig?.id

                // Fetch questions for this configId
                let questions: Array<{
                  id: string
                  questionText: string
                  questionType: string
                  scoringGuide: string | null
                }> = []
                if (configId) {
                  questions = await db
                    .select({
                      id: templateQuestions.id,
                      questionText: templateQuestions.questionText,
                      questionType: templateQuestions.questionType,
                      scoringGuide: templateQuestions.scoringGuide,
                    })
                    .from(templateQuestions)
                    .where(eq(templateQuestions.configId, configId))
                }
                return {
                  id: instrument.id,
                  instrumentType: instrument.instrumentType ?? '',
                  isRequired: instrument.isRequired,
                  description: instrument.description,
                  questions,
                  templateStageConfigId: configId || null,
                }
              })
            )
          : [])

        // Group submissions by instrument type and template config for multiple journals in same stage
        const submissionsByInstrument: Record<string, Array<{
          id: string
          instrumentType: string
          content: unknown
          submittedAt: string
          targetStudentId: string | null
          targetStudentName: string | null
          templateStageConfigId: string | null
        }>> = {}
        const stageSubmissions = submissionsByStage[stage.id] ?? []

        for (const submission of stageSubmissions) {
          const instrType = submission.instrumentType ?? ''

          // For journals, create a unique key using templateStageConfigId to differentiate multiple journals
          // For other instruments, just use the instrument type
          const key = instrType === 'JOURNAL' && submission.templateStageConfigId
            ? `${instrType}_${submission.templateStageConfigId}`
            : instrType

          if (!submissionsByInstrument[key]) {
            submissionsByInstrument[key] = []
          }
          submissionsByInstrument[key].push({
            id: submission.id,
            instrumentType: instrType,
            content: submission.content,
            submittedAt: typeof submission.submittedAt === 'string' ? submission.submittedAt : submission.submittedAt?.toISOString() ?? '',
            targetStudentId: submission.targetStudentId,
            targetStudentName: submission.targetStudentName,
            templateStageConfigId: submission.templateStageConfigId,
          })
        }

        return {
          id: stage.id,
          name: stage.name,
          description: stage.description,
          order: stage.order,
          unlocksAt: serializeDate(stage.unlocksAt),
          dueAt: serializeDate(stage.dueAt),
          status: progress.status,
          requiredInstruments: instruments,
          submissions: Object.values(submissionsByInstrument).flat(),
          submissionsByInstrument,
        }
      })
    )).filter((stage): stage is NonNullable<typeof stage> => stage !== null)

    const studentGroup = studentGroupRows.find((row) => row.projectId === project.id)
    const groupMembersList = studentGroup ? (membersByGroup[studentGroup.groupId] ?? []) : []

    const classData = classMap.get(project.classId)
    if (!classData || !project.classId) {
      console.warn(`Class data not found for project ${project.id}`)
      continue
    }

    studentProjects.push({
      id: project.id,
      title: project.title,
      description: project.description,
      theme: project.theme,
      status: project.status,
      class: classData,
      teacher: {
        id: project.teacherId,
        name: project.teacherName,
        email: project.teacherEmail,
      },
      group: studentGroup
        ? {
            id: studentGroup.groupId,
            name: studentGroup.groupName,
            members: groupMembersList.map((member) => ({
              studentId: member.studentId,
              name: member.studentName,
              email: member.studentEmail,
              comment: member.comment,
              feedbackToMe: member.studentId !== student.id ? feedbackToMeByAuthor.get(member.studentId) : undefined,
            })),
          }
        : null,
      stages: stageData,
      currentStudentId: student.id,
    })
  }

  return { projects: studentProjects }
  } catch (error) {
    console.error("An error occurred while fetching student dashboard data:", error);
    return { projects: [] }
  }
}

async function ensureStageProgressEntries(
  studentId: string,
  _projectId: string,
  stages: StageRow[],
): Promise<Map<string, StageProgressRow>> {
  if (stages.length === 0) {
    return new Map()
  }

  const sortedStages = [...stages].sort((a, b) => a.order - b.order)

  return db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(projectStageProgress)
      .where(
        and(
          eq(projectStageProgress.studentId, studentId),
          inArray(projectStageProgress.projectStageId, sortedStages.map((stage) => stage.id)),
        ),
      )

    const progressMap = new Map()
    for (const row of existing) {
      if (row && row.projectStageId) {
        progressMap.set(row.projectStageId, row)
      }
    }

    let encounteredIncomplete = false

    for (const stage of sortedStages) {
      let current = progressMap.get(stage.id)

      if (!current) {
        // Cek ulang di DB sebelum insert untuk mencegah race condition/duplicate
        const [existing] = await tx
          .select()
          .from(projectStageProgress)
          .where(
            and(
              eq(projectStageProgress.projectStageId, stage.id),
              eq(projectStageProgress.studentId, studentId)
            )
          )
          .limit(1)
        if (existing) {
          progressMap.set(stage.id, existing)
          continue
        }
        const status = encounteredIncomplete ? "LOCKED" : "IN_PROGRESS"
        const unlockedAt = status === "IN_PROGRESS" ? new Date() : null
        try {
          const [created] = await tx
            .insert(projectStageProgress)
            .values({
              projectStageId: stage.id,
              studentId,
              status,
              unlockedAt,
            })
            .returning()
          progressMap.set(stage.id, created)
          if (status === "IN_PROGRESS") {
            encounteredIncomplete = true
          }
        } catch (err: any) {
          // Jika error duplicate key, lakukan select ulang
          if (err && err.code === '23505') {
            const [existingAfter] = await tx
              .select()
              .from(projectStageProgress)
              .where(
                and(
                  eq(projectStageProgress.projectStageId, stage.id),
                  eq(projectStageProgress.studentId, studentId)
                )
              )
              .limit(1)
            if (existingAfter) {
              progressMap.set(stage.id, existingAfter)
            }
          } else {
            throw err
          }
        }
        continue
      }

      if (current.status === "COMPLETED") {
        continue
      }

      if (!encounteredIncomplete) {
        if (current.status !== "IN_PROGRESS") {
          const [updated] = await tx
            .update(projectStageProgress)
            .set({
              status: "IN_PROGRESS",
              unlockedAt: current.unlockedAt ?? new Date(),
              updatedAt: new Date(),
            })
            .where(eq(projectStageProgress.id, current.id))
            .returning()

          progressMap.set(stage.id, updated)
        } else if (!current.unlockedAt) {
          const [updated] = await tx
            .update(projectStageProgress)
            .set({ unlockedAt: new Date(), updatedAt: new Date() })
            .where(eq(projectStageProgress.id, current.id))
            .returning()

          progressMap.set(stage.id, updated)
        }

        encounteredIncomplete = true
      } else if (current.status !== "LOCKED") {
        const [updated] = await tx
          .update(projectStageProgress)
          .set({ status: "LOCKED", unlockedAt: null, updatedAt: new Date() })
          .where(eq(projectStageProgress.id, current.id))
          .returning()

        progressMap.set(stage.id, updated)
      }
    }

    const finalRows = await tx
      .select()
      .from(projectStageProgress)
      .where(
        and(
          eq(projectStageProgress.studentId, studentId),
          inArray(projectStageProgress.projectStageId, sortedStages.map((stage) => stage.id)),
        ),
      )

    const resultMap = new Map()
    if (finalRows) {
      for (const row of finalRows) {
        if (row && row.projectStageId) {
          resultMap.set(row.projectStageId, row)
        }
      }
    }
    return resultMap
  })
}

async function fetchClassStudents(classIds: string[]) {
  if (classIds.length === 0) {
    return {} as Record<
      string,
      Array<{
        studentId: string
        name: string | null
        email: string
      }>
    >
  }

  const rows = await db
    .select({
      classId: userClassAssignments.classId,
      studentId: userClassAssignments.userId,
      studentName: user.name,
      studentEmail: user.email,
      role: user.role,
    })
    .from(userClassAssignments)
    .innerJoin(user, eq(user.id, userClassAssignments.userId))
    .where(
      and(
        inArray(userClassAssignments.classId, classIds),
        eq(user.role, "STUDENT"),
      ),
    )

  const result: Record<
    string,
    Array<{
      studentId: string
      name: string | null
      email: string
    }>
  > = {}

  if (rows) {
    for (const row of rows) {
      if (row && row.classId) {
        if (!result[row.classId]) {
          result[row.classId] = []
        }
        result[row.classId].push({
          studentId: row.studentId || "",
          name: row.studentName,
          email: row.studentEmail || "",
        })
      }
    }
  }

  return result
}

