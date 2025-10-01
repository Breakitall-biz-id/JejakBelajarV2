"use client"

import { InstrumentChecklistItem } from "./instrument-checklist-item"
import { JournalAssessmentDialog } from "./journal-assessment-dialog"
import { QuestionnaireAssessmentDialog } from "./questionnaire-assessment-dialog"
import { PeerAssessmentDialog } from "./peer-assessment-dialog"
import { submitStageInstrument, debugStageProgress, updateGroupMemberComment } from "../../actions"
import { toast } from "sonner"
import type { StudentDashboardData } from "../../queries"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ProjectProgressBar } from "./project-progress-bar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import * as React from "react"
import { OverlaySpinner } from "@/components/ui/overlay-spinner"
import { useRouter } from "next/navigation"



type InstrumentWithStatements = {
  id: string;
  instrumentType: string;
  isRequired: boolean;
  statements?: string[];
  description?: string | null;
  templateStageConfigId?: string | null;
  questions?: Array<{
    id: string;
    questionText: string;
    questionType: string;
    scoringGuide: string | null;
  }>;
};

type Submission = {
  id: string;
  instrumentType: string;
  content: { text?: string } | { answers: number[] } | null;
  submittedAt: string;
  targetStudentId: string | null;
  targetStudentName: string | null;
};

export function ProjectDetail({ project }: { project: StudentDashboardData["projects"][number] }) {
  const [tab, setTab] = React.useState("stages")
  const [journalDialog, setJournalDialog] = React.useState<{
    open: boolean
    stageName?: string
    instrumentId?: string
    templateStageConfigId?: string | null
    prompts?: string[]
    initialValue?: string[]
    stageId?: string
  }>({ open: false })
  const [journalLoading, setJournalLoading] = React.useState(false)
    const [selfDialog, setSelfDialog] = React.useState<{
    open: boolean
    stageName?: string
    instrumentId?: string
    statements?: string[]
    initialValue?: number[]
  }>({ open: false })
  const [peerDialog, setPeerDialog] = React.useState<{
    open: boolean
    stageName?: string
    instrumentId?: string
    statements?: string[]
    initialValue?: number[][]
  }>({ open: false })
  const [globalLoading, setGlobalLoading] = React.useState(false)
  const [editingComment, setEditingComment] = React.useState<{
    memberId: string
    comment: string
  } | null>(null)

  // Local state for optimistic updates
  const [localComments, setLocalComments] = React.useState<Record<string, string>>({})

  // Initialize local comments from project data
  React.useEffect(() => {
    const comments: Record<string, string> = {}
    project.group?.members.forEach((member) => {
      if (member.comment) {
        comments[member.studentId] = member.comment
      }
    })
    setLocalComments(comments)
  }, [project.group?.members])

  const handleDebugStage = async (stageId: string) => {
    try {
      const result = await debugStageProgress(project.id, stageId)
      alert(`Debug info logged to console. Check browser dev tools.`)
    } catch (error) {
      console.error('Debug failed:', error)
      alert('Debug failed')
    }
  }

  const groupedStages = React.useMemo(() => {
    type Instrument = InstrumentWithStatements;
    const map = new Map<string, {
      id: string;
      name: string;
      description: string | null;
      order: number;
      unlocksAt: string | null;
      dueAt: string | null;
      status: string;
      requiredInstruments: Instrument[];
      submissionsByInstrument: Record<string, Submission[]>;
    }>();

    for (const stage of project.stages) {
      const submissionsByInstrument: Record<string, Submission[]> = {}
      for (const [key, arr] of Object.entries(stage.submissionsByInstrument)) {
        submissionsByInstrument[key] = (arr as Submission[]).map((sub) => {
          let content: { text?: string } | { answers: number[] } | null = null;
          if (sub.content && typeof sub.content === "object") {
            if (Array.isArray((sub.content as { answers?: unknown }).answers)) {
              content = { answers: (sub.content as { answers: number[] }).answers };
            } else if (typeof (sub.content as { text?: unknown }).text === "string") {
              content = { text: (sub.content as { text: string }).text };
            } else {
              content = sub.content;
            }
          }
          return {
            ...sub,
            content,
          };
        });
      }
      if (!map.has(stage.name)) {
        map.set(stage.name, {
          id: stage.id,
          name: stage.name,
          description: stage.description,
          order: stage.order,
          unlocksAt: stage.unlocksAt,
          dueAt: stage.dueAt,
          status: stage.status,
          requiredInstruments: [...stage.requiredInstruments],
          submissionsByInstrument,
        })
      } else {
        const existing = map.get(stage.name)!
        const existingIds = new Set(existing.requiredInstruments.map(i => i.id))
        for (const ins of stage.requiredInstruments) {
          if (!existingIds.has(ins.id)) {
            existing.requiredInstruments.push(ins)
          }
        }
        for (const [key, arr] of Object.entries(submissionsByInstrument)) {
          if (!existing.submissionsByInstrument[key]) {
            existing.submissionsByInstrument[key] = []
          }
          existing.submissionsByInstrument[key].push(...arr)
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => a.order - b.order)
  }, [project])

  const router = useRouter()
  return (
    <>
      <OverlaySpinner show={globalLoading} text="Menyimpan dan memperbarui progres..." />
      <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 py-6">
      <Card className="mb-6">
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">{project.title}</h1>
              <div className="text-base text-muted-foreground font-medium">{project.theme}</div>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
            </div>
          </div>
          <ProjectProgressBar project={project} />
        </CardContent>
      </Card>
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-4 w-full flex">
          <TabsTrigger value="about" className="flex-1">Tentang Proyek</TabsTrigger>
          <TabsTrigger value="stages" className="flex-1">Tahapan</TabsTrigger>
          <TabsTrigger value="group" className="flex-1">Kelompok</TabsTrigger>
        </TabsList>
        <TabsContent value="stages">
          <div className="flex flex-col gap-4">
            {groupedStages.map((stage, idx) => (
              <Card key={stage.name} className="border-muted">
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 flex items-center justify-center rounded-full text-background font-bold text-base bg-primary">{idx + 1}</span>
                    <span className="font-semibold text-foreground text-base">{stage.name}</span>
                    {stage.status === "LOCKED" && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground border border-muted">Locked</span>
                    )}
                    <button
                      onClick={() => handleDebugStage(stage.id)}
                      className="ml-2 text-xs px-2 py-0.5 rounded bg-red-500 text-white hover:bg-red-600"
                    >
                      Debug
                    </button>
                  </div>
                  <div className="flex flex-col gap-1 mt-2 ml-8">
                    {stage.requiredInstruments.map((ins) => {
                      // For journals, use unique key with templateStageConfigId to differentiate multiple journals
                      const submissionKey = ins.instrumentType === 'JOURNAL' && ins.templateStageConfigId
                        ? `${ins.instrumentType}_${ins.templateStageConfigId}`
                        : ins.instrumentType
                      const submission: Submission | undefined = ((stage.submissionsByInstrument[submissionKey] || []) as Submission[])[0]
                      let status: "done" | "pending" | "waiting" = "pending"
                      let actionLabel: string | undefined = undefined
                      let onAction: (() => void) | undefined = undefined
                      let disabled = stage.status === "LOCKED"

                      if (ins.instrumentType === "OBSERVATION") {
                        status = "waiting"
                        actionLabel = undefined
                        onAction = undefined
                        disabled = true
                      } else if (submission) {
                        status = "done"
                        actionLabel = "Lihat"
                      } else {
                        status = disabled ? "pending" : "pending"
                        actionLabel = disabled ? undefined : "Kerjakan"
                      }

                      let title = ""
                      if (ins.instrumentType === "JOURNAL") title = "Refleksi (Journal)"
                      else if (ins.instrumentType === "SELF_ASSESSMENT") title = "Self Assessment"
                      else if (ins.instrumentType === "PEER_ASSESSMENT") title = "Peer Assessment"
                      else if (ins.instrumentType === "OBSERVATION") title = "Observasi (Guru)"
                      else title = ins.instrumentType

                      if (ins.instrumentType === "JOURNAL" && actionLabel && !submission) {
                        onAction = async () => {
                          setJournalDialog({
                            open: true,
                            stageName: stage.name,
                            instrumentId: ins.id,
                            templateStageConfigId: ins.templateStageConfigId,
                            prompts: ins.questions?.map((q: { questionText: string }) => q.questionText) || [ins.description || "Tulis refleksi kamu di sini..."],
                            initialValue: (() => {
                              // For journals, use unique key with templateStageConfigId to differentiate multiple journals
                      const submissionKey = ins.instrumentType === 'JOURNAL' && ins.templateStageConfigId
                        ? `${ins.instrumentType}_${ins.templateStageConfigId}`
                        : ins.instrumentType
                      const submission: Submission | undefined = ((stage.submissionsByInstrument[submissionKey] || []) as Submission[])[0]
                              if (
                                submission?.content &&
                                typeof submission.content === "object" &&
                                "text" in submission.content &&
                                (submission.content as { text?: unknown }).text != null
                              ) {
                                // Handle single text answer for backward compatibility
                                return [String((submission.content as { text?: unknown }).text ?? "")]
                              }
                              return undefined
                            })(),
                            stageId: stage.id
                          })
                        }
                      }
                      if (ins.instrumentType === "SELF_ASSESSMENT" && actionLabel && !submission) {
                        onAction = () => setSelfDialog({
                          open: true,
                          stageName: stage.name,
                          instrumentId: ins.id,
                          statements: ins.questions?.map((q: { questionText: string }) => q.questionText) || [], // Pass questions as statements
                          initialValue: (() => {
                            // For journals, use unique key with templateStageConfigId to differentiate multiple journals
                      const submissionKey = ins.instrumentType === 'JOURNAL' && ins.templateStageConfigId
                        ? `${ins.instrumentType}_${ins.templateStageConfigId}`
                        : ins.instrumentType
                      const submission: Submission | undefined = ((stage.submissionsByInstrument[submissionKey] || []) as Submission[])[0]
                            if (
                              submission?.content &&
                              typeof submission.content === "object" &&
                              Array.isArray((submission.content as { answers: number[] }).answers)
                            ) {
                              return (submission.content as { answers: number[] }).answers
                            }
                            return undefined
                          })()
                        })
                      }
                      if (ins.instrumentType === "PEER_ASSESSMENT" && actionLabel && !submission) {
                        onAction = () => setPeerDialog({
                          open: true,
                          stageName: stage.name,
                          instrumentId: ins.id,
                          statements: ins.questions?.map((q: { questionText: string }) => q.questionText) || ["Teman saya menunjukkan sikap menghargai saat mendengarkan pendapat teman kelompok."],
                          initialValue: (() => {
                            // For journals, use unique key with templateStageConfigId to differentiate multiple journals
                      const submissionKey = ins.instrumentType === 'JOURNAL' && ins.templateStageConfigId
                        ? `${ins.instrumentType}_${ins.templateStageConfigId}`
                        : ins.instrumentType
                      const submission: Submission | undefined = ((stage.submissionsByInstrument[submissionKey] || []) as Submission[])[0]
                            if (
                              submission?.content &&
                              typeof submission.content === "object" &&
                              Array.isArray((submission.content as { answers: number[][] }).answers)
                            ) {
                              return (submission.content as { answers: number[][] }).answers
                            }
                            return undefined
                          })()
                        })
                      }

                      return (
                        <InstrumentChecklistItem
                          key={ins.id}
                          instrumentType={ins.instrumentType}
                          title={title}
                          status={status}
                          actionLabel={actionLabel}
                          onAction={onAction}
                          disabled={disabled}
                        />
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="group">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Anggota Kelompok</h3>
                <div className="text-sm text-muted-foreground">
                  {project.group?.members.length || 0} anggota
                </div>
              </div>

              <div className="space-y-4">
                {project.group?.members.map((member) => (
                  <Card key={member.studentId} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {member.name?.charAt(0).toUpperCase() || member.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{member.name || 'Tanpa Nama'}</div>
                          <div className="text-sm text-muted-foreground">{member.email}</div>
                        </div>
                      </div>

                      <div className="w-80 bg-muted/30 rounded-lg border border-border/50">
                        <div className="p-3 border-b border-border/50">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Komentar</div>
                        </div>
                        <div className="p-3">
                          {editingComment?.memberId === member.studentId ? (
                            <div className="space-y-3">
                              <Textarea
                                value={editingComment.comment}
                                onChange={(e) => setEditingComment({
                                  ...editingComment,
                                  comment: e.target.value
                                })}
                                placeholder="Tulis komentar tentang kontribusi atau ide..."
                                rows={3}
                                className="resize-none text-sm border-border/50 focus:border-primary"
                              />
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingComment(null)}
                                  className="text-xs h-7 px-3"
                                >
                                  Batal
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={async () => {
                                    setGlobalLoading(true)
                                    const result = await updateGroupMemberComment({
                                      projectId: project.id,
                                      targetMemberId: member.studentId,
                                      comment: editingComment.comment.trim() || undefined,
                                    })
                                    if (result.success) {
                                      // Optimistic update - update local state immediately
                                      const newComment = editingComment.comment.trim() || undefined
                                      if (newComment) {
                                        setLocalComments(prev => ({
                                          ...prev,
                                          [member.studentId]: newComment
                                        }))
                                      } else {
                                        setLocalComments(prev => {
                                          const newState = { ...prev }
                                          delete newState[member.studentId]
                                          return newState
                                        })
                                      }

                                      toast.success("Komentar berhasil disimpan!")
                                      // Clear editing state
                                      setEditingComment(null)

                                      // Refresh data to sync with server
                                      await router.refresh()
                                      setGlobalLoading(false)
                                    } else {
                                      setGlobalLoading(false)
                                      toast.error(result.error || "Gagal menyimpan komentar.")
                                    }
                                  }}
                                  className="text-xs h-7 px-3"
                                >
                                  Simpan
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="text-sm text-muted-foreground min-h-[2.5rem] flex items-center">
                                {localComments[member.studentId] || member.comment ? (
                                  <span className="line-clamp-2">{localComments[member.studentId] || member.comment}</span>
                                ) : (
                                  <span className="italic text-muted-foreground/60">Belum ada komentar</span>
                                )}
                              </div>
                              <div className="flex justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingComment({
                                    memberId: member.studentId,
                                    comment: localComments[member.studentId] || member.comment || ''
                                  })}
                                  className="text-xs h-7 px-3 hover:bg-primary/10 hover:text-primary"
                                >
                                  {localComments[member.studentId] || member.comment ? 'Edit' : 'Tambah'}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {!project.group?.members || project.group.members.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">Belum ada anggota kelompok</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="about">
          <Card>
            <CardContent className="p-4">
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: project.description || "<i>Tidak ada deskripsi.</i>" }} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>

      {/* Journal Assessment Dialog */}
      <JournalAssessmentDialog
        open={journalDialog.open}
        onOpenChange={open => setJournalDialog(journalDialog => ({ ...journalDialog, open }))}
        prompts={journalDialog.prompts || ["Tulis refleksi kamu di sini..."]}
        initialValue={journalDialog.initialValue}
        loading={journalLoading}
        readOnly={(() => {
          const stage = groupedStages.find(s => s.name === journalDialog.stageName)
          const instrument = stage?.requiredInstruments.find(i => i.id === journalDialog.instrumentId)
          // For journals, use unique key with templateStageConfigId
          const submissionKey = instrument?.instrumentType === 'JOURNAL' && instrument?.templateStageConfigId
            ? `${instrument.instrumentType}_${instrument.templateStageConfigId}`
            : instrument?.instrumentType || ""
          const submission = stage?.submissionsByInstrument[submissionKey]?.[0]
          return !!submission
        })()}
        onSubmit={async answers => {
          setJournalLoading(true)
          setGlobalLoading(true)
          const stage = groupedStages.find(s => s.name === journalDialog.stageName)
          const instrument = stage?.requiredInstruments.find(i => i.id === journalDialog.instrumentId)
          const stageId = stage?.id || project.stages[0].id
          const instrumentType = (instrument?.instrumentType || "JOURNAL") as "JOURNAL" | "SELF_ASSESSMENT" | "PEER_ASSESSMENT" | "OBSERVATION" | "DAILY_NOTE"

          // For backward compatibility, if single answer, submit as single text
          // If multiple answers, submit as texts array for better data structure
          const content = answers.length === 1
            ? { text: answers[0] }
            : { texts: answers } // Send as structured texts array for multiple questions

          const result = await submitStageInstrument({
            projectId: project.id,
            stageId,
            instrumentType,
            templateStageConfigId: instrument?.templateStageConfigId,
            content,
          })
          setJournalLoading(false)
          if (result.success) {
            toast.success("Refleksi berhasil disimpan!")
            setJournalDialog(journalDialog => ({ ...journalDialog, open: false }))
            // Wait for router.refresh to finish before hiding overlay
            await new Promise(res => setTimeout(res, 300))
            router.refresh()
            setTimeout(() => setGlobalLoading(false), 600)
          } else {
            setGlobalLoading(false)
            toast.error(result.error || "Gagal menyimpan refleksi.")
          }
        }}
      />
      {/* Self Assessment Dialog */}
      <QuestionnaireAssessmentDialog
        open={selfDialog.open}
        onOpenChange={open => setSelfDialog(selfDialog => ({ ...selfDialog, open }))}
        title="Self Assessment"
        statements={selfDialog.statements || []}
        initialValue={selfDialog.initialValue}
        projectId={project.id}
        stageId={(() => {
          const stage = groupedStages.find(s => s.name === selfDialog.stageName)
          return stage?.id || project.stages[0].id
        })() as string}
        instrumentType="SELF_ASSESSMENT"
        readOnly={(() => {
          const stage = groupedStages.find(s => s.name === selfDialog.stageName)
          const instrument = stage?.requiredInstruments.find(i => i.id === selfDialog.instrumentId)
          // For journals, use unique key with templateStageConfigId (though not needed for self assessment)
          const submissionKey = instrument?.instrumentType === 'JOURNAL' && instrument?.templateStageConfigId
            ? `${instrument.instrumentType}_${instrument.templateStageConfigId}`
            : instrument?.instrumentType || ""
          const submission = stage?.submissionsByInstrument[submissionKey]?.[0]
          return !!submission
        })()}
        onSubmitSuccess={async () => {
          setGlobalLoading(true)
          await new Promise(res => setTimeout(res, 300))
          router.refresh()
          setTimeout(() => setGlobalLoading(false), 600)
        }}
      />

      {/* Peer Assessment Dialog */}
      <PeerAssessmentDialog
        open={peerDialog.open}
        onOpenChange={open => setPeerDialog(peerDialog => ({ ...peerDialog, open }))}
        members={(project.group?.members || []).map(m => ({ id: m.studentId, name: m.name || m.email }))}
        currentUserId={project.currentStudentId}
        statements={peerDialog.statements || ["Teman saya menunjukkan sikap menghargai saat mendengarkan pendapat teman kelompok."]}
        initialValue={peerDialog.initialValue}
        projectId={project.id}
        stageId={(() => {
          const stage = groupedStages.find(s => s.name === peerDialog.stageName)
          return stage?.id || project.stages[0].id
        })() as string}
        instrumentType="PEER_ASSESSMENT"
        readOnly={(() => {
          const stage = groupedStages.find(s => s.name === peerDialog.stageName)
          const instrument = stage?.requiredInstruments.find(i => i.id === peerDialog.instrumentId)
          // For journals, use unique key with templateStageConfigId (though not needed for peer assessment)
          const submissionKey = instrument?.instrumentType === 'JOURNAL' && instrument?.templateStageConfigId
            ? `${instrument.instrumentType}_${instrument.templateStageConfigId}`
            : instrument?.instrumentType || ""
          const submission = stage?.submissionsByInstrument[submissionKey]?.[0]
          return !!submission
        })()}
        onSubmitSuccess={async () => {
          setGlobalLoading(true)
          await new Promise(res => setTimeout(res, 300))
          router.refresh()
          setTimeout(() => setGlobalLoading(false), 600)
        }}
      />

      {/* Self Assessment Dialog */}
      <QuestionnaireAssessmentDialog
        open={selfDialog.open}
        onOpenChange={open => setSelfDialog(selfDialog => ({ ...selfDialog, open }))}
        title="Self Assessment"
        statements={selfDialog.statements || []}
        initialValue={selfDialog.initialValue}
        projectId={project.id}
        stageId={(() => {
          const stage = groupedStages.find(s => s.name === selfDialog.stageName)
          return stage?.id || project.stages[0].id
        })() as string}
        instrumentType="SELF_ASSESSMENT"
        readOnly={(() => {
          const stage = groupedStages.find(s => s.name === selfDialog.stageName)
          const instrument = stage?.requiredInstruments.find(i => i.id === selfDialog.instrumentId)
          // For journals, use unique key with templateStageConfigId (though not needed for self assessment)
          const submissionKey = instrument?.instrumentType === 'JOURNAL' && instrument?.templateStageConfigId
            ? `${instrument.instrumentType}_${instrument.templateStageConfigId}`
            : instrument?.instrumentType || ""
          const submission = stage?.submissionsByInstrument[submissionKey]?.[0]
          return !!submission
        })()}
        onSubmitSuccess={async () => {
          setGlobalLoading(true)
          await new Promise(res => setTimeout(res, 300))
          router.refresh()
          setTimeout(() => setGlobalLoading(false), 600)
        }}
      />
    </>
  )
}
