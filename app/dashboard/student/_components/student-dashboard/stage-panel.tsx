"use client"

import { useMemo } from "react"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import type { CurrentUser } from "@/lib/auth/session"
import type { StudentDashboardData } from "../../queries"

import {
  getStageStatusBadge,
  formatDate,
  STUDENT_INSTRUMENT_TYPES,
  extractSubmissionText,
} from "./helpers"
import { InstrumentSubmissionCard } from "./submission-card"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"


type StagePanelProps = {
  stage: StudentDashboardData["projects"][number]["stages"][number]
  index: number
  totalStages: number
  student: CurrentUser
  projectId: string
  groupMembers: Array<{
    studentId: string
    name: string | null
    email: string
  }>
  router: AppRouterInstance
}

export function StagePanel({
  stage,
  index,
  totalStages,
  student,
  projectId,
  groupMembers,
  router,
}: StagePanelProps) {
  const statusBadge = getStageStatusBadge(stage.status)

  const studentPeers = useMemo(
    () => groupMembers.filter((member) => member.studentId !== student.id),
    [groupMembers, student.id],
  )

  const studentInstruments = stage.requiredInstruments.filter((instrument) =>
    STUDENT_INSTRUMENT_TYPES.has(instrument.instrumentType),
  )

  return (
    <section className="space-y-4 rounded-lg border border-muted bg-muted/10 p-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              Stage {index + 1} of {totalStages}
            </Badge>
            <span className="font-semibold">{stage.name}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {stage.description || "No description provided."}
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {stage.unlocksAt && <span>Unlocks {formatDate(stage.unlocksAt)}</span>}
            {stage.dueAt && <span>Due {formatDate(stage.dueAt)}</span>}
          </div>
        </div>
        <Badge variant={statusBadge.variant} className="capitalize">
          {statusBadge.label}
        </Badge>
      </header>

      {stage.status === "LOCKED" && <LockedStageNotice />}

      {stage.status === "IN_PROGRESS" && studentInstruments.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Required submissions</h4>
          <div className="grid gap-4 md:grid-cols-2">
            {studentInstruments.map((instrument) => {
              // Find existing submission for this specific instrument type
              const existingSubmission = stage.submissionsByInstrument?.[instrument.instrumentType]?.[0]

              return (
                <InstrumentSubmissionCard
                  key={instrument.id}
                  stage={stage}
                  instrumentType={instrument.instrumentType}
                  existingSubmission={existingSubmission}
                  student={student}
                  projectId={projectId}
                  peers={studentPeers}
                  router={router}
                />
              )
            })}
          </div>
        </div>
      )}

      {stage.status === "COMPLETED" && stage.submissions.length > 0 && (
        <div className="space-y-3">
          <Separator />
          <h4 className="text-sm font-semibold">Your submissions</h4>
          <div className="space-y-2">
            {Object.entries(stage.submissionsByInstrument || {}).map(([instrumentType, submissions]) => (
              submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="rounded-md border bg-background p-3 text-sm"
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>{instrumentType.replace(/_/g, " ")}</span>
                    <span>{formatDate(submission.submittedAt)}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap">
                    {extractSubmissionText(submission.content)}
                  </p>
                  {submission.targetStudentName && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Feedback for {submission.targetStudentName}
                    </p>
                  )}
                </div>
              ))
            ))}
          </div>
        </div>
      )}

      {stage.status === "IN_PROGRESS" && studentInstruments.length === 0 && (
        <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          This stage does not require a student submission. Await instructions
          from your teacher.
        </p>
      )}
    </section>
  )
}

function LockedStageNotice() {
  return (
    <div className="flex items-center gap-2 rounded-md border border-dashed bg-background p-4 text-sm text-muted-foreground">
      <span role="img" aria-label="locked">
        🔒
      </span>
      <span>This stage unlocks after you complete the previous stage.</span>
    </div>
  )
}
