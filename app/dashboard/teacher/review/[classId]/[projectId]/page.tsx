"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
type DialogState = {
  open: boolean;
  student: {
    id: string;
    name: string | null;
    submission: any;
  } | null;
  instrumentType: string | null;
  instrumentDesc?: string | null;
  stageId?: string;
};
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { JournalAssessmentDialog } from "../../../../student/_components/student-dashboard/journal-assessment-dialog"
import { PeerAssessmentDialog } from "../../../../student/_components/student-dashboard/peer-assessment-dialog"
import { ArrowLeft } from "lucide-react"
import { QuestionnaireAssessmentDialog } from "../../../../student/_components/student-dashboard/questionnaire-assessment-dialog"
import type { ProjectDetailData } from "../../queries"
import { ObservationSheetDialog } from "../../../_components/observation-sheet-dialog";

type StudentWithPeerMatrix = {
  id: string;
  name: string;
  groupName?: string | null;
  groupId?: string | null;
  progress: { status: string };
  submissions: Array<{
    id: string;
    instrumentType: string;
    content: unknown;
    submittedAt: string;
    score?: number | null;
    feedback?: string | null;
  }>;
  peerAssessmentMatrix?: number[][];
};

type InstrumentWithQuestions = {
  id: string;
  instrumentType: string;
  isRequired: boolean;
  description?: string | null;
  questions?: { id: string; questionText: string; questionType: string; scoringGuide: string | null }[];
};



export default function ProjectDetailPage({
  params
}: {
  params: { classId: string; projectId: string }
}) {
  // Dialog state for all instruments
  const [dialog, setDialog] = React.useState<DialogState>({ open: false, student: null, instrumentType: null });
  const [observationDialog, setObservationDialog] = React.useState<{
    open: boolean;
    stageId?: string;
    instrument?: InstrumentWithQuestions;
    students?: { id: string; name: string }[];
    initialValue?: Array<{ [studentId: string]: number }>;
  }>({ open: false });
  const router = useRouter()
  const [tab, setTab] = React.useState("tentang")
  const [project, setProject] = React.useState<ProjectDetailData | null>(null)
  const [loading, setLoading] = React.useState(true)


  React.useEffect(() => {
    async function loadProject() {
      try {
        setLoading(true)
        const response = await fetch(`/api/teacher/project-detail?classId=${params.classId}&projectId=${params.projectId}`)
        if (response.ok) {
          const data = await response.json()
          setProject(data)
        }
      } finally {
        setLoading(false)
      }
    }

    loadProject()
  }, [params.classId, params.projectId])

  // Group stages by name and combine data
  const groupedStages = React.useMemo(() => {
    if (!project) return []
    const map = new Map<string, typeof project.stages[number]>()
    for (const stage of project.stages) {
      if (!map.has(stage.name)) {
        map.set(stage.name, stage)
      } else {
        const existing = map.get(stage.name)!
        if (stage.order < existing.order) {
          map.set(stage.name, stage)
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => a.order - b.order)
  }, [project])

  // Get all unique students from all stages
  const allStudents = React.useMemo(() => {
    if (!project) return []
    const studentMap = new Map<string, typeof project.stages[0]['students'][0]>()
    project.stages.forEach(stage => {
      stage.students.forEach(student => {
        if (!studentMap.has(student.id)) {
          studentMap.set(student.id, student)
        }
      })
    })
    return Array.from(studentMap.values())
  }, [project])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-lg font-semibold mb-2">Loading...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-lg font-semibold mb-2">Project not found</div>
            <div className="text-muted-foreground mb-4">
              The requested project could not be found.
            </div>
            <Button onClick={() => router.push("/dashboard/teacher/review")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 py-6">
      {/* Header with back button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/teacher/review")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>

        <Card>
          <CardContent className="p-6">
            <div className="mb-4">
              <h1 className="text-2xl font-bold">{project.title}</h1>
              <p className="text-muted-foreground">{project.title}</p>
            </div>
            {/* ProjectProgressBar: pastikan props sesuai, jika error bisa dihilangkan sementara */}
            {/* <ProjectProgressBar project={project} /> */}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-6 w-full flex">
          <TabsTrigger value="tentang" className="flex-1">Tentang</TabsTrigger>
          <TabsTrigger value="tahapan" className="flex-1">Tahapan</TabsTrigger>
          <TabsTrigger value="murid" className="flex-1">Murid</TabsTrigger>
        </TabsList>

        <TabsContent value="tentang">
          <Card>
            <CardContent className="p-6">
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: project.description || "<i>Tidak ada deskripsi.</i>" }} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tahapan">
          <div className="space-y-6">
            {groupedStages.map((stage, idx) => (
              <Card key={stage.id}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-8 h-8 flex items-center justify-center rounded-full text-background font-bold bg-primary">{idx + 1}</span>
                    <h3 className="text-lg font-semibold">{stage.name}</h3>
                  </div>
                  {stage.description && (
                    <p className="text-sm text-muted-foreground mb-3 ml-11">{stage.description}</p>
                  )}
                  <div className="space-y-4">
                    {stage.requiredInstruments.map((instrument) => {
                      // Ambil SEMUA submissions murid untuk instrumen ini (bisa lebih dari satu, misal peer assessment)
                      let submissions;
                      if (instrument.instrumentType === "PEER_ASSESSMENT") {
                        // Hanya tampilkan murid yang sudah submit peer assessment (minimal satu submission)
                        const submittedStudents = [];
                        const seen = new Set();
                        for (const student of stage.students) {
                          if (seen.has(student.id)) continue;
                          const submission = (student.submissions?.find(sub => sub.instrumentType === "PEER_ASSESSMENT")) || undefined;
                          if (submission) {
                            seen.add(student.id);
                            submittedStudents.push({ student, submission });
                          }
                        }
                        submissions = submittedStudents;
                      } else {
                        submissions = stage.students
                          .flatMap(student => {
                            const subs = student.submissions?.filter(sub => sub.instrumentType === instrument.instrumentType) || [];
                            return subs.map(submission => ({ student, submission }));
                          });
                      }
                      return (
                        <div key={instrument.id} className="rounded-lg border p-3 flex flex-col gap-2 bg-muted/40">
                          <div className="font-semibold text-foreground text-base mb-1">
                            {instrument.instrumentType === "JOURNAL" && "Refleksi (Jurnal)"}
                            {instrument.instrumentType === "SELF_ASSESSMENT" && "Self Assessment"}
                            {instrument.instrumentType === "PEER_ASSESSMENT" && "Peer Assessment"}
                            {instrument.instrumentType === "OBSERVATION" && "Lembar Observasi (Diisi Guru)"}
                            {instrument.instrumentType === "DAILY_NOTE" && "Catatan Harian"}
                          </div>
                          {/* Accordion submissions murid, default collapsed */}
                          <div className="ml-4">
                            <details className="group" open={false}>
                              <summary className="flex items-center gap-2 cursor-pointer py-2 px-3 select-none rounded border focus:outline-none focus:ring-2 focus:ring-primary/30">
                                <span className="font-semibold text-sm">Daftar Murid</span>
                                <span className="ml-2 text-xs text-muted-foreground">{submissions.length} murid</span>
                              </summary>
                              <div className="pl-4 py-2 flex flex-col">
                                {submissions.length === 0 ? (
                                  <span className="text-sm text-muted-foreground py-4">Belum ada submission</span>
                                ) : (
                                  submissions.map(({ student, submission }, idx) => (
                                    <div
                                      key={student.id}
                                      className={`flex items-center gap-2 justify-between py-2 ${idx !== submissions.length - 1 ? 'border-b border-muted' : ''}`}
                                    >
                                      <span className="text-sm font-medium truncate max-w-[60vw] md:max-w-xs">{student.name || student.id}</span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`Lihat detail submission ${student.name || student.id}`}
                                        onClick={() => setDialog({ open: true, student: { ...student, submission }, instrumentType: instrument.instrumentType, instrumentDesc: instrument.description || '', stageId: stage.id })}
                                      >
                                        <Eye className="w-5 h-5" />
                                      </Button>
                                    </div>
                                  ))
                                )}
                              </div>
                            </details>
                          </div>
                          {/* Dialog untuk lihat detail submission */}
                  {/* Dialog untuk lihat detail submission, di luar map agar tidak error hooks */}
                  {dialog.open && dialog.student && (
                    dialog.instrumentType === "JOURNAL" ? (
                      <JournalAssessmentDialog
                        open={dialog.open}
                        onOpenChange={open => setDialog(d => ({ ...d, open }))}
                        prompt={dialog.instrumentDesc || "Tulis refleksi kamu di sini..."}
                        initialValue={typeof dialog.student.submission.content === 'object' && dialog.student.submission.content && 'text' in dialog.student.submission.content ? dialog.student.submission.content.text : ''}
                        onSubmit={() => {}}
                        loading={false}
                        readOnly={true}
                      />
                    ) : dialog.instrumentType === "SELF_ASSESSMENT" ? (
                      <QuestionnaireAssessmentDialog
                        open={dialog.open}
                        onOpenChange={open => setDialog(d => ({ ...d, open }))}
                        title="Self Assessment"
                        statements={(() => {
                          const stageObj = project.stages.find(s => s.id === dialog.stageId)
                          const instrumentObj = stageObj?.requiredInstruments.find(i => i.instrumentType === "SELF_ASSESSMENT") as InstrumentWithQuestions | undefined;
                          return instrumentObj?.questions?.map((q: { questionText: string }) => q.questionText) || [];
                        })()}
                        initialValue={typeof dialog.student.submission.content === 'object' && dialog.student.submission.content && 'answers' in dialog.student.submission.content ? dialog.student.submission.content.answers : []}
                        projectId={project.id}
                        stageId={dialog.stageId || ''}
                        instrumentType="SELF_ASSESSMENT"
                        readOnly={true}
                        onSubmitSuccess={() => {}}
                      />
                    ) : dialog.instrumentType === "PEER_ASSESSMENT" ? (
                      <PeerAssessmentDialog
                        open={dialog.open}
                        onOpenChange={open => setDialog(d => ({ ...d, open }))}
                        members={(() => {
                          if (!dialog.student) return [];
                          const stageObj = project.stages.find(s => s.id === dialog.stageId);
                          // Use all group members except self
                          if (!stageObj) return [];
                          // Ensure name is string (fallback to empty string)
                          return stageObj.students
                            .filter(stu => dialog.student && stu.id !== dialog.student.id)
                            .map(stu => ({ id: stu.id, name: stu.name || "" }));
                        })()}
                        statements={(() => {
                          const stageObj = project.stages.find(s => s.id === dialog.stageId)
                          const instrumentObj = stageObj?.requiredInstruments.find(i => i.instrumentType === "PEER_ASSESSMENT") as InstrumentWithQuestions | undefined;
                          return instrumentObj?.questions?.map(q => q.questionText) || [];
                        })()}
                        initialValue={(() => {
                          // Use new peerAssessmentMatrix from backend
                          if (!dialog.student) return [];
                          const stageObj = project.stages.find(s => s.id === dialog.stageId);
                          const stu = (stageObj?.students.find(stu => stu.id === dialog.student?.id) || {}) as StudentWithPeerMatrix;
                          return stu.peerAssessmentMatrix || [];
                        })()}
                        loading={false}
                        currentUserId={null}
                        title={"Peer Assessment"}
                        readOnly={true}
                        stageId={dialog.stageId || ''}
                        projectId={project.id}
                        instrumentType="PEER_ASSESSMENT"
                        onSubmitSuccess={() => {}}
                      />
                    ) : null
                  )}
                          {/* Hanya tampilkan tombol Kerjakan untuk OBSERVATION, hilangkan tombol Detail */}
                          {instrument.instrumentType === "OBSERVATION" && (
                            <div className="flex gap-2 mt-2">
                              {Array.isArray(stage.submissionsByInstrument?.["OBSERVATION"]) && stage.submissionsByInstrument["OBSERVATION"].length > 0 ? (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    const students = stage.students.map(s => ({ id: s.id, name: s.name || "" }));
                                    const statements = (instrument.questions || []).map(q => ({
                                      id: q.id,
                                      questionText: q.questionText,
                                      rubricCriteria: q.rubricCriteria || {},
                                    }));
                                    let initialValue: Array<{ [studentId: string]: number }> = [];
                                    if (statements.length > 0) {
                                      initialValue = statements.map((stmt, sIdx) => {
                                        const row: { [studentId: string]: number } = {};
                                        students.forEach(stu => {
                                          const sub = (stage.submissionsByInstrument?.["OBSERVATION"] || []).find((sub: any) => sub.targetStudentId === stu.id && sub.content && typeof sub.content === 'object' && sub.content.answers && typeof sub.content.answers === 'object');
                                          if (sub && sub.content.answers && sub.content.answers[stmt.id]) {
                                            row[stu.id] = sub.content.answers[stmt.id];
                                          }
                                        });
                                        return row;
                                      });
                                    }
                                    setObservationDialog({
                                      open: true,
                                      stageId: stage.id,
                                      instrument,
                                      students,
                                      initialValue,
                                    });
                                  }}
                                >Lihat</Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const students = stage.students.map(s => ({ id: s.id, name: s.name || "" }));
                                    const statements = (instrument.questions || []).map(q => ({
                                      id: q.id,
                                      questionText: q.questionText,
                                      rubricCriteria: q.rubricCriteria || {},
                                    }));
                                    let initialValue: Array<{ [studentId: string]: number }> = [];
                                    if (statements.length > 0) {
                                      initialValue = statements.map((stmt, sIdx) => {
                                        const row: { [studentId: string]: number } = {};
                                        students.forEach(stu => {
                                          const sub = (stage.submissionsByInstrument?.["OBSERVATION"] || []).find((sub: any) => sub.targetStudentId === stu.id && sub.content && typeof sub.content === 'object' && sub.content.answers && typeof sub.content.answers === 'object');
                                          if (sub && sub.content.answers && sub.content.answers[stmt.id]) {
                                            row[stu.id] = sub.content.answers[stmt.id];
                                          }
                                        });
                                        return row;
                                      });
                                    }
                                    setObservationDialog({
                                      open: true,
                                      stageId: stage.id,
                                      instrument,
                                      students,
                                      initialValue,
                                    });
                                  }}
                                >Kerjakan</Button>
                              )}
                            </div>
                          )}
      {/* ObservationSheetDialog integration */}
      {observationDialog.open && observationDialog.instrument && observationDialog.students && (
        <ObservationSheetDialog
          open={observationDialog.open}
          onOpenChange={open => setObservationDialog(d => ({ ...d, open }))}
          students={observationDialog.students}
          statements={(observationDialog.instrument.questions || []).map(q => ({
            id: q.id,
            questionText: q.questionText,
            rubricCriteria: q.rubricCriteria || {},
          }))}
          initialValue={observationDialog.initialValue}
          loading={false}
          title={"Lembar Observasi"}
          readOnly={Array.isArray(project?.stages.find(s => s.id === observationDialog.stageId)?.submissionsByInstrument?.["OBSERVATION"]) && project?.stages.find(s => s.id === observationDialog.stageId)?.submissionsByInstrument?.["OBSERVATION"].length > 0}
          onSubmit={async (answers) => {
            setObservationDialog(d => ({ ...d, open: false }));
          }}
        />
      )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="murid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allStudents.map((student) => (
              <Card key={student.id}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-semibold">{student.name || 'Unknown Student'}</h4>
                      {student.groupName && (
                        <p className="text-sm text-muted-foreground">Kelompok: {student.groupName}</p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Status: <span className={`font-medium ${
                        student.progress.status === "COMPLETED" ? "text-green-600" :
                        student.progress.status === "IN_PROGRESS" ? "text-blue-600" :
                        "text-gray-600"
                      }`}>
                        {student.progress.status}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Submissions: {student.submissions.length}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}