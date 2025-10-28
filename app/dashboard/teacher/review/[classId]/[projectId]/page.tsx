"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
type DialogState = {
  open: boolean;
  student: {
    id: string;
    name: string | null;
    submission: {
      id: string;
      instrumentType: string;
      content: unknown;
      submittedAt: string;
      score?: number | null;
      feedback?: string | null;
    };
  } | null;
  instrumentType: string | null;
  instrumentDesc?: string | null;
  stageId?: string;
  instrumentId?: string; // Add this to track specific instrument
};
import * as React from "react"
import { use } from "react"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { TeacherJournalAssessmentDialog } from "../../../_components/teacher-dashboard/teacher-journal-assessment-dialog"
import { TeacherJournalIndividualAssessmentDialog } from "../../../_components/teacher-dashboard/teacher-journal-individual-assessment-dialog"
import { PeerAssessmentDialog } from "../../../../student/_components/student-dashboard/peer-assessment-dialog"
import { ArrowLeft } from "lucide-react"
import { QuestionnaireAssessmentDialog } from "../../../../student/_components/student-dashboard/questionnaire-assessment-dialog"
import type { ProjectDetailData } from "../../queries"
import { ObservationSheetDialog } from "../../../_components/observation-sheet-dialog";
import { submitTeacherReport } from "@/app/dashboard/teacher/actions"

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
  templateStageConfigId: string | null;
  instrumentType: string;
  isRequired: boolean;
  description?: string | null;
  questions?: { id: string; questionText: string; questionType?: string; scoringGuide?: string | null; rubricCriteria?: unknown }[];
  rubrics?: { id: string; indicatorText: string; criteria: { [score: string]: string } }[];
};

type ObservationSubmission = {
  id: string;
  instrumentType: string;
  studentId: string;
  targetStudentId?: string;
  content: unknown;
};


type ObservationContent = {
  answers?: number[];
  [key: string]: unknown;
};

type StageData = {
  id: string;
  name: string;
  description?: string;
  order: number;
  students: StudentWithPeerMatrix[];
  requiredInstruments: InstrumentWithQuestions[];
  submissionsByInstrument?: {
    [key: string]: ObservationSubmission[];
  };
};



// Helper function to convert rubric criteria from array format to object format
function convertRubricCriteria(rubricCriteria?: unknown): { [score: string]: string } {
  let rubricCriteriaObject: { [score: string]: string } = {};

  if (rubricCriteria) {
    if (Array.isArray(rubricCriteria)) {
      // Convert from [{score: "4", description: "..."}, ...] to {"4": "...", ...}
      rubricCriteria.forEach((item: unknown) => {
        if (item && typeof item === 'object' && 'score' in item && 'description' in item) {
          const rubricItem = item as { score: string | number; description: string };
          if (rubricItem.score && rubricItem.description) {
            rubricCriteriaObject[String(rubricItem.score)] = rubricItem.description;
          }
        }
      });
    } else if (typeof rubricCriteria === 'object' && rubricCriteria !== null) {
      // Already in object format, use as-is
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

export default function ProjectDetailPage({
  params
}: {
  params: Promise<{ classId: string; projectId: string }>
}) {
  const { classId, projectId } = use(params)
  // Dialog state for all instruments
  const [dialog, setDialog] = React.useState<DialogState>({ open: false, student: null, instrumentType: null });
  const [observationDialog, setObservationDialog] = React.useState<{
    open: boolean;
    stageId?: string;
    instrument?: InstrumentWithQuestions;
    students?: { id: string; name: string }[];
    initialValue?: Array<{ [studentId: string]: number }>;
    isEdit?: boolean;
  }>({ open: false });
  const router = useRouter()
  const [tab, setTab] = React.useState("tentang")
  const [project, setProject] = React.useState<ProjectDetailData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [teacherFeedbacks, setTeacherFeedbacks] = React.useState<Map<string, string>>(new Map())
  const [journalSubmissions, setJournalSubmissions] = React.useState<Array<{
    id: string
    questionIndex: number
    questionText: string
    answer: string
    submittedAt: string
    score?: number
    feedback?: string
    grades?: Array<{
      rubric_id: string
      score: number
    }>
  }>>([])
  const [individualJournalDialog, setIndividualJournalDialog] = React.useState<{
    open: boolean
    student: {
      id: string
      name: string | null
    } | null
    stageId?: string
  }>({ open: false, student: null })

  // Feedback dialog state
  const [feedbackDialog, setFeedbackDialog] = React.useState<{
    open: boolean
    student: {
      id: string
      name: string | null
    } | null
    initialFeedback?: string
    isLoading?: boolean
  }>({ open: false, student: null })

  // Export state
  const [isExporting, setIsExporting] = React.useState(false)

  const handleExportExcel = React.useCallback(async () => {
    if (isExporting) return

    setIsExporting(true)
    try {
      const response = await fetch(`/api/teacher/export/class/${classId}/projectId/${projectId}`)

      if (!response.ok) {
        throw new Error('Failed to export data')
      }

      // Get the blob
      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      // Get filename from response headers or create default
      const contentDisposition = response.headers.get('content-disposition')
      let filename = 'Rekap_Nilai.xlsx'

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }

      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

    } catch (error) {
      console.error('Export error:', error)
      // You might want to show a toast or alert here
      alert('Gagal mengekspor data. Silakan coba lagi.')
    } finally {
      setIsExporting(false)
    }
  }, [classId, projectId, isExporting])

  const loadProject = React.useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/teacher/project-detail?classId=${classId}&projectId=${projectId}`)
      if (response.ok) {
        const data = await response.json()
        console.log("🔍 DEBUG - Raw project data:", data);
        console.log("🔍 DEBUG - Observation submissions check:", {
          stages: data.stages?.map((s: any) => ({
            stageName: s.name,
            submissionsByInstrument: s.submissionsByInstrument,
            hasObservationSubmissions: s.submissionsByInstrument,
            observationSubmissions: s.submissionsByInstrument?.["OBSERVATION"],
            observationSubmissionsDetail: s.submissionsByInstrument?.["OBSERVATION"]?.map((sub: any) => ({
              id: sub.id,
              instrumentType: sub.instrumentType,
              studentId: sub.studentId,
              targetStudentId: sub.targetStudentId,
              content: sub.content
            }))
          }))
        });
        setProject(data)
      }
    } finally {
      setLoading(false)
    }
  }, [classId, projectId])

  const loadTeacherFeedbacks = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/teacher/student-feedback/list?projectId=${projectId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const feedbackMap = new Map<string, string>()
          data.data?.forEach((feedback: { studentId: string; feedback: string }) => {
            feedbackMap.set(feedback.studentId, feedback.feedback)
          })
          setTeacherFeedbacks(feedbackMap)
        }
      }
    } catch (error) {
      console.error('Error loading teacher feedbacks:', error)
    }
  }, [projectId])

  React.useEffect(() => {
    loadProject()
  }, [classId, projectId, loadProject])

  React.useEffect(() => {
    if (project) {
      loadTeacherFeedbacks()
    }
  }, [project, loadTeacherFeedbacks])

  // Use stages as-is without grouping by name to preserve unique instruments
  const groupedStages = React.useMemo(() => {
    if (!project) return []

    // Sort stages by order to maintain proper sequence
    return [...project.stages].sort((a, b) => a.order - b.order)
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
            <div className="text-lg font-semibold mb-2">Memuat...</div>
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
            <div className="text-lg font-semibold mb-2">Proyek tidak ditemukan</div>
            <div className="text-muted-foreground mb-4">
              Proyek yang diminta tidak dapat ditemukan.
            </div>
            <Button onClick={() => router.push("/dashboard/teacher/review")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Proyek
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
          Kembali ke Proyek
        </Button>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">{project.title}</h1>
                <p className="text-muted-foreground">{project.title}</p>
              </div>
              <Button
                onClick={() => handleExportExcel()}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Mengekspor...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export Excel
                  </>
                )}
              </Button>
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
                        // For other instruments (like JOURNAL), match submissions by templateStageConfigId
                        // This ensures each instrument gets the correct submissions based on the template configuration
                        const studentSubmissions = new Map();

                        stage.students.forEach(student => {
                          // Find submission that matches this instrument's templateStageConfigId
                          const matchingSubmission = student.submissions?.find(sub =>
                            sub.templateStageConfigId === instrument.templateStageConfigId
                          );

                          if (matchingSubmission) {
                            studentSubmissions.set(student.id, { student, submission: matchingSubmission });
                          }
                        });
                        submissions = Array.from(studentSubmissions.values());
                      }
                      return (
                        <div key={instrument.id} className="rounded-lg border p-3 flex flex-col gap-2 bg-muted/40">
                          <div className="font-semibold text-foreground text-base mb-1">
                            {(() => {
                              const baseName =
                                instrument.instrumentType === "JOURNAL" ? "Refleksi (Jurnal)" :
                                instrument.instrumentType === "SELF_ASSESSMENT" ? "Penilaian Diri" :
                                instrument.instrumentType === "PEER_ASSESSMENT" ? "Penilaian Teman" :
                                instrument.instrumentType === "OBSERVATION" ? "Lembar Observasi (Diisi Guru)" :
                                instrument.instrumentType === "DAILY_NOTE" ? "Catatan Harian" :
                                instrument.instrumentType;

                              // Check if there are multiple instruments of the same type in this stage
                              const instrumentsOfSameType = stage.requiredInstruments.filter(i => i.instrumentType === instrument.instrumentType);
                              const sameTypeCount = instrumentsOfSameType.length;
                              const displayIndex = instrumentsOfSameType.findIndex(i => i.id === instrument.id);

                              // If multiple instruments of same type, add index to differentiate
                              return sameTypeCount > 1
                                ? `${baseName} ${displayIndex + 1}`
                                : baseName;
                            })()}
                            {instrument.description && (
                              <span className="text-sm text-muted-foreground font-normal ml-2">
                                - {instrument.description}
                              </span>
                            )}
                          </div>
                          {/* Accordion submissions murid, default collapsed */}
                          <div className="ml-4">
                            <details className="group" open={false}>
                              <summary className="flex items-center gap-2 cursor-pointer py-2 px-3 select-none rounded border focus:outline-none focus:ring-2 focus:ring-primary/30">
                                <span className="font-semibold text-sm">Daftar Siswa</span>
                                <span className="ml-2 text-xs text-muted-foreground">{submissions.length} siswa</span>
                              </summary>
                              <div className="pl-4 py-2 flex flex-col">
                                {submissions.length === 0 ? (
                                  <span className="text-sm text-muted-foreground py-4">Belum ada pengumpulan</span>
                                ) : (
                                  submissions.map(({ student, submission }, idx) => (
                                    <div
                                      key={`${student.id}-${instrument.id}`}
                                      className={`flex items-center gap-2 justify-between py-2 ${idx !== submissions.length - 1 ? 'border-b border-muted' : ''}`}
                                    >
                                      <span className="text-sm font-medium truncate max-w-[60vw] md:max-w-xs">{student.name || student.id}</span>
                                      <Button
                                        variant={(() => {
                                          if (instrument.instrumentType === "JOURNAL") {
                                            const content = submission.content;
                                            const hasGrades = typeof content === 'object' && content && 'grades' in content && Array.isArray(content.grades) && content.grades.length > 0;
                                            return hasGrades ? "default" : "ghost";
                                          }
                                          return "ghost";
                                        })()}
                                        size="icon"
                                        aria-label={`${(() => {
                                          if (instrument.instrumentType === "JOURNAL") {
                                            const content = submission.content;
                                            const hasGrades = typeof content === 'object' && content && 'grades' in content && Array.isArray(content.grades) && content.grades.length > 0;
                                            return hasGrades ? "Edit nilai" : "Lihat detail";
                                          }
                                          return "Lihat detail";
                                        })()} ${student.name || student.id}`}
                                        onClick={async () => {
                                          // Check if this is an individual submission format
                                          const content = submission.content;
                                          const hasIndividualSubmissions = typeof content === 'object' && content && 'question_index' in content;

                                          if (hasIndividualSubmissions) {
                                            // Use new individual submission dialog
                                            try {
                                              const response = await fetch(`/api/teacher/journal-submissions/${classId}/${projectId}/${student.id}/${stage.id}`)
                                              if (response.ok) {
                                                const data = await response.json()
                                                setJournalSubmissions(data.data || [])
                                                setIndividualJournalDialog({
                                                  open: true,
                                                  student: { id: student.id, name: student.name },
                                                  stageId: stage.id
                                                })
                                              } else {
                                                // Fallback to old dialog
                                                setDialog({ open: true, student: { ...student, submission }, instrumentType: instrument.instrumentType, instrumentDesc: instrument.description || '', stageId: stage.id, instrumentId: instrument.id })
                                              }
                                            } catch (error) {
                                              console.error("Gagal mengambil pengumpulan jurnal:", error)
                                              // Fallback to old dialog
                                              setDialog({ open: true, student: { ...student, submission }, instrumentType: instrument.instrumentType, instrumentDesc: instrument.description || '', stageId: stage.id, instrumentId: instrument.id })
                                            }
                                          } else {
                                            // Use old dialog for backward compatibility
                                            setDialog({ open: true, student: { ...student, submission }, instrumentType: instrument.instrumentType, instrumentDesc: instrument.description || '', stageId: stage.id, instrumentId: instrument.id })
                                          }
                                        }}
                                      >
                                        {(() => {
                                          if (instrument.instrumentType === "JOURNAL") {
                                            const content = submission.content;
                                            const hasGrades = typeof content === 'object' && content && 'grades' in content && Array.isArray(content.grades) && content.grades.length > 0;
                                            return hasGrades ? <span className="text-xs font-bold">Edit</span> : <Eye className="w-5 h-5" />;
                                          }
                                          return <Eye className="w-5 h-5" />;
                                        })()}
                                      </Button>
                                    </div>
                                  ))
                                )}
                              </div>
                            </details>
                          </div>
                          {instrument.instrumentType === "OBSERVATION" && (
                            <div className="flex gap-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const students = stage.students.map(s => ({ id: s.id, name: s.name || "" }));
                                  const statements = ((instrument as InstrumentWithQuestions).questions || []).map((q: { id: string; questionText: string; rubricCriteria?: unknown }) => ({
                                    id: q.id,
                                    questionText: q.questionText,
                                    rubricCriteria: convertRubricCriteria(q.rubricCriteria),
                                  }));
                                  let initialValue: Array<{ [studentId: string]: number }> = [];
                                  if (statements.length > 0) {
                                    initialValue = statements.map((_: { id: string }, stmtIndex: number) => {
                                      const row: { [studentId: string]: number } = {};
                                      students.forEach(stu => {
                                        const sub = (stage.submissionsByInstrument?.["OBSERVATION"] as ObservationSubmission[] || []).find((sub) =>
                                          sub.targetStudentId === stu.id &&
                                          sub.content &&
                                          typeof sub.content === 'object' &&
                                          sub.content !== null &&
                                          'answers' in sub.content &&
                                          Array.isArray((sub.content as ObservationContent).answers)
                                        );
                                        if (sub && sub.content && typeof sub.content === 'object' && sub.content !== null && 'answers' in sub.content && (sub.content as ObservationContent).answers && (sub.content as ObservationContent).answers![stmtIndex] !== undefined) {
                                          row[stu.id] = (sub.content as ObservationContent).answers![stmtIndex];
                                        }
                                      });
                                      return row;
                                    });
                                  }
                                  const observationSubmissions = (stage as StageData).submissionsByInstrument?.["OBSERVATION"] || [];
                                  const allStudents = stage.students;
                                  const studentsWithObservation = new Set(
                                    observationSubmissions
                                      .filter((sub: any) => sub.targetStudentId)
                                      .map((sub: any) => sub.targetStudentId)
                                  );
                                  const hasExistingSubmission = allStudents.length > 0 &&
                                    allStudents.every(student => studentsWithObservation.has(student.id));
                                  setObservationDialog({
                                    open: true,
                                    stageId: stage.id,
                                    instrument,
                                    students,
                                    initialValue,
                                    isEdit: hasExistingSubmission,
                                  });
                                }}
                              >
                                {(() => {
  const observationSubmissions = (stage as StageData).submissionsByInstrument?.["OBSERVATION"] || [];
  const allStudents = stage.students;
  const studentsWithObservation = new Set(
    observationSubmissions
      .filter((sub: any) => sub.targetStudentId)
      .map((sub: any) => sub.targetStudentId)
  );
  const allStudentsHaveObservation = allStudents.length > 0 &&
    allStudents.every(student => studentsWithObservation.has(student.id));
  return allStudentsHaveObservation ? "Ubah" : "Kerjakan";
})()}
                              </Button>
                            </div>
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
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {allStudents.map((student) => (
                <Card key={student.id} className="border border-border/50 shadow-none hover:shadow-sm transition-shadow">
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      {/* Student Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-medium text-sm">{student.name || 'Siswa Tidak Dikenal'}</h4>
                          {teacherFeedbacks.has(student.id) && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded-full">
                              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs font-medium">Feedback</span>
                            </div>
                          )}
                        </div>
                        <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                          student.progress.status === "COMPLETED" ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300" :
                          student.progress.status === "IN_PROGRESS" ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                          "bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
                        }`}>
                          {student.progress.status === "COMPLETED" ? "Selesai" :
                           student.progress.status === "IN_PROGRESS" ? "Proses" :
                           "Belum"}
                        </span>
                      </div>

                      {student.groupName && (
                        <p className="text-xs text-muted-foreground">Kelompok: {student.groupName}</p>
                      )}

                      {/* Progress Bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(100, (student.submissions.length / Math.max(1, groupedStages.length)) * 100)}%`
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {student.submissions.length}/{groupedStages.length}
                        </span>
                      </div>

                      {/* Feedback Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-7 text-xs hover:bg-muted/50"
                        onClick={async () => {
                          // Set loading state
                          setFeedbackDialog({
                            open: true,
                            student: {
                              id: student.id,
                              name: student.name || 'Siswa Tidak Dikenal'
                            },
                            initialFeedback: '',
                            isLoading: true
                          });

                          try {
                            // Fetch existing feedback
                            const response = await fetch(`/api/teacher/student-feedback?studentId=${student.id}&projectId=${projectId}`);
                            const data = await response.json();

                            if (response.ok && data.success) {
                              setFeedbackDialog(prev => ({
                                ...prev,
                                initialFeedback: data.data?.feedback || '',
                                isLoading: false
                              }));
                            } else {
                              throw new Error(data.error || 'Failed to fetch feedback');
                            }
                          } catch (error) {
                            console.error('Error fetching feedback:', error);
                            // Still open dialog but with empty feedback
                            setFeedbackDialog(prev => ({
                              ...prev,
                              initialFeedback: '',
                              isLoading: false
                            }));
                          }
                        }}
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Feedback
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog untuk lihat detail submission - dipindahkan ke luar loop */}
      {dialog.open && dialog.student && (
        dialog.instrumentType === "JOURNAL" ? (
          <TeacherJournalAssessmentDialog
            open={dialog.open}
            onOpenChange={open => setDialog(d => ({ ...d, open }))}
            studentName={dialog.student.name || "Siswa Tidak Dikenal"}
            studentAnswers={(() => {
              const content = dialog.student.submission.content;
              if (typeof content === 'object' && content) {
                if ('texts' in content && Array.isArray(content.texts)) {
                  // Handle multiple texts array format
                  return content.texts.map((text: unknown) => String(text || ""));
                } else if ('text' in content) {
                  // Handle single text answer for backward compatibility
                  return [String(content.text || "")];
                } else if ('student_answers' in content && Array.isArray(content.student_answers)) {
                  // Handle teacher graded format
                  return content.student_answers.map((answer: unknown) => String(answer || ""));
                } else if ('answers' in content && Array.isArray((content as { answers?: unknown[] }).answers)) {
                  // Handle multiple answers array (old format - for backward compatibility)
                  return (content as { answers: unknown[] }).answers.map((answer: unknown) => String(answer || ""));
                }
              }
              return [];
            })()}
            prompts={(() => {
              const stageObj = project.stages.find(s => s.id === dialog.stageId)
              // Find specific instrument by ID, fallback to first JOURNAL if instrumentId not available
              const instrumentObj = dialog.instrumentId
                ? stageObj?.requiredInstruments.find(i => i.id === dialog.instrumentId) as InstrumentWithQuestions | undefined
                : stageObj?.requiredInstruments.find(i => i.instrumentType === "JOURNAL") as InstrumentWithQuestions | undefined;
              return instrumentObj?.questions?.map((q: { questionText: string }) => q.questionText) || [dialog.instrumentDesc || "Tulis refleksi kamu di sini..."];
            })()}
            rubrics={(() => {
              const stageObj = project.stages.find(s => s.id === dialog.stageId)
              // Find specific instrument by ID, fallback to first JOURNAL if instrumentId not available
              const instrumentObj = dialog.instrumentId
                ? stageObj?.requiredInstruments.find(i => i.id === dialog.instrumentId) as InstrumentWithQuestions | undefined
                : stageObj?.requiredInstruments.find(i => i.instrumentType === "JOURNAL") as InstrumentWithQuestions | undefined;
              return instrumentObj?.rubrics?.map((r: { id: string; indicatorText: string; criteria: { [score: string]: string } }) => ({
                id: r.id,
                indicatorText: r.indicatorText,
                criteria: r.criteria,
              })) || [];
            })()}
            initialGrades={(() => {
              const content = dialog.student.submission.content;
              if (typeof content === 'object' && content && 'grades' in content && Array.isArray(content.grades)) {
                return content.grades.map((grade: { rubric_id: string; score: number }) => ({
                  rubricId: grade.rubric_id,
                  score: String(grade.score),
                }));
              }
              return [];
            })()}
            onSubmit={async (grades) => {
              try {
                const response = await fetch('/api/teacher/journal-assessment', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    submissionId: dialog.student?.submission.id,
                    grades,
                  }),
                });

                if (response.ok) {
                  // Refresh project data to update scores
                  await loadProject();
                  setDialog(d => ({ ...d, open: false }));
                } else {
                  console.error('Gagal mengirimkan nilai');
                }
              } catch (error) {
                console.error('Kesalahan mengirimkan nilai:', error);
              }
            }}
            onCancel={() => setDialog(d => ({ ...d, open: false }))}
          />
        ) : dialog.instrumentType === "SELF_ASSESSMENT" ? (
          <QuestionnaireAssessmentDialog
            open={dialog.open}
            onOpenChange={open => setDialog(d => ({ ...d, open }))}
            title="Self Assessment"
            statements={(() => {
              const stageObj = project.stages.find(s => s.id === dialog.stageId)
              // Find specific instrument by ID, fallback to first SELF_ASSESSMENT if instrumentId not available
              const instrumentObj = dialog.instrumentId
                ? stageObj?.requiredInstruments.find(i => i.id === dialog.instrumentId) as InstrumentWithQuestions | undefined
                : stageObj?.requiredInstruments.find(i => i.instrumentType === "SELF_ASSESSMENT") as InstrumentWithQuestions | undefined;
              return instrumentObj?.questions?.map((q: { questionText: string }) => q.questionText) || [];
            })()}
            initialValue={typeof dialog.student?.submission.content === 'object' && dialog.student?.submission.content && 'answers' in dialog.student?.submission.content ? (dialog.student?.submission.content as { answers: number[] }).answers : []}
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
              if (!stageObj) return [];

              // Get current student's group
              const currentStudent = stageObj.students.find(stu => stu.id === dialog.student.id);
              if (!currentStudent || !currentStudent.groupId) return [];

              // Use only group members from the same group, except self
              return stageObj.students
                .filter(stu =>
                  dialog.student &&
                  stu.id !== dialog.student.id &&
                  stu.groupId === currentStudent.groupId
                )
                .map(stu => ({ id: stu.id, name: stu.name || "" }));
            })()}
            statements={(() => {
              const stageObj = project.stages.find(s => s.id === dialog.stageId)
              // Find specific instrument by ID, fallback to first PEER_ASSESSMENT if instrumentId not available
              const instrumentObj = dialog.instrumentId
                ? stageObj?.requiredInstruments.find(i => i.id === dialog.instrumentId) as InstrumentWithQuestions | undefined
                : stageObj?.requiredInstruments.find(i => i.instrumentType === "PEER_ASSESSMENT") as InstrumentWithQuestions | undefined;
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
            title={() => {
              if (!dialog.student) return "Peer Assessment";
              const stageObj = project.stages.find(s => s.id === dialog.stageId);
              if (!stageObj) return "Peer Assessment";

              const currentStudent = stageObj.students.find(stu => stu.id === dialog.student.id);
              if (!currentStudent) return "Peer Assessment";

              if (!currentStudent.groupId) {
                return "Peer Assessment - Tidak Ada Kelompok";
              }

              return `Peer Assessment - ${currentStudent.groupName || 'Kelompok ' + currentStudent.groupId.slice(0, 8)}`;
            }}
            readOnly={true}
            stageId={dialog.stageId || ''}
            projectId={project.id}
            instrumentType="PEER_ASSESSMENT"
            onSubmitSuccess={() => {}}
          />
        ) : null
      )}

      {/* ObservationSheetDialog integration */}
      {observationDialog.open && observationDialog.instrument && observationDialog.students && (
        <ObservationSheetDialog
          open={observationDialog.open}
          onOpenChange={open => setObservationDialog(d => ({ ...d, open }))}
          students={observationDialog.students}
          statements={(observationDialog.instrument.questions || []).map((q: { id: string; questionText: string; rubricCriteria?: unknown }) => ({
            id: q.id,
            questionText: q.questionText,
            rubricCriteria: convertRubricCriteria(q.rubricCriteria),
          }))}
          initialValue={observationDialog.initialValue}
          loading={false}
          title={observationDialog.isEdit ? "Edit Lembar Observasi" : "Lembar Observasi"}
          readOnly={false} // Allow editing for both new and existing submissions
          onSubmit={async (answers: Array<{ [studentId: string]: number }>) => {
            try {
              // For observation, we need to submit scores for each student separately
              // The answers array contains one entry per question, with studentId -> score mapping
              for (const student of observationDialog.students || []) {
                const studentScores = answers.map(answerRow => answerRow[student.id]).filter(score => score !== undefined);

                if (studentScores.length > 0) {
                  const result = await submitTeacherReport({
                    projectId: project.id,
                    stageId: observationDialog.stageId || '',
                    instrumentType: "OBSERVATION",
                    content: { answers: studentScores },
                    targetStudentId: student.id,
                  });

                  if (!result.success) {
                    console.error(`Gagal mengirimkan observasi untuk siswa ${student.name}:`, result.error);
                    return;
                  }
                }
              }

              // All submissions successful
              setObservationDialog(d => ({ ...d, open: false }));

              // Refresh project data to update submission status
              await loadProject();
            } catch (error) {
              console.error("Kesalahan mengirimkan observasi:", error);
            }
          }}
        />
      )}

      {/* Individual Journal Assessment Dialog */}
      {individualJournalDialog.open && individualJournalDialog.student && individualJournalDialog.stageId && (
        <TeacherJournalIndividualAssessmentDialog
          open={individualJournalDialog.open}
          onOpenChange={open => setIndividualJournalDialog(d => ({ ...d, open }))}
          studentName={individualJournalDialog.student.name || "Siswa Tidak Dikenal"}
          submissions={journalSubmissions}
          prompts={(() => {
            const stageObj = project.stages.find(s => s.id === individualJournalDialog.stageId)
            const instrumentObj = stageObj?.requiredInstruments.find(i => i.instrumentType === "JOURNAL") as InstrumentWithQuestions | undefined;
            return instrumentObj?.questions?.map((q: { questionText: string }) => q.questionText) || [""];
          })()}
          rubrics={(() => {
            const stageObj = project.stages.find(s => s.id === individualJournalDialog.stageId)
            const instrumentObj = stageObj?.requiredInstruments.find(i => i.instrumentType === "JOURNAL") as InstrumentWithQuestions | undefined;
            return instrumentObj?.rubrics?.map((r: { id: string; indicatorText: string; criteria: { [score: string]: string } }) => ({
              id: r.id,
              indicatorText: r.indicatorText,
              criteria: r.criteria,
            })) || [];
          })()}
          onQuestionGrade={async (submissionId, grades) => {
            try {
              const response = await fetch('/api/teacher/journal-question-assessment', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  submissionId,
                  grades,
                }),
              });

              if (!response.ok) {
                throw new Error('Gagal mengirimkan nilai');
              }
            } catch (error) {
              console.error('Kesalahan mengirimkan nilai:', error);
              throw error;
            }
          }}
          onRefresh={async () => {
            try {
              const response = await fetch(`/api/teacher/journal-submissions/${classId}/${projectId}/${individualJournalDialog.student?.id}/${individualJournalDialog.stageId}`)
              if (response.ok) {
                const data = await response.json()
                setJournalSubmissions(data.data || [])
              }
            } catch (error) {
              console.error("Gagal memperbarui pengumpulan jurnal:", error)
            }
          }}
          onCancel={() => setIndividualJournalDialog(d => ({ ...d, open: false }))}
        />
      )}

      {/* Feedback Dialog */}
      {feedbackDialog.open && feedbackDialog.student && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-border/50 shadow-2xl w-full max-w-sm rounded-2xl">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-medium text-foreground">
                  {feedbackDialog.initialFeedback ? 'Edit Feedback' : 'Beri Feedback'}
                </h3>
                <button
                  onClick={() => setFeedbackDialog(d => ({ ...d, open: false }))}
                  className="text-muted-foreground hover:text-foreground transition-all duration-200 p-1.5 rounded-lg hover:bg-muted/50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Siswa</p>
                  <p className="text-sm font-medium">{feedbackDialog.student.name}</p>
                </div>

                <div>
                  <textarea
                    id="feedback"
                    rows={3}
                    className="w-full px-2.5 py-2 text-sm bg-background border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none dark:bg-background dark:border-border/50 disabled:opacity-50"
                    placeholder={feedbackDialog.isLoading ? "Memuat feedback..." : "Tulis feedback..."}
                    defaultValue={feedbackDialog.initialFeedback || ''}
                    autoFocus
                    disabled={feedbackDialog.isLoading}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setFeedbackDialog(d => ({ ...d, open: false }))}
                    className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all duration-200"
                  >
                    Batal
                  </button>
                  <button
                    onClick={async () => {
                      const feedbackText = (document.getElementById('feedback') as HTMLTextAreaElement)?.value;
                      if (!feedbackText?.trim()) return;

                      try {
                        const response = await fetch('/api/teacher/student-feedback', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            studentId: feedbackDialog.student?.id,
                            projectId: project.id,
                            feedback: feedbackText.trim(),
                          }),
                        });

                        if (response.ok) {
                          // Update local feedbacks state
                          if (feedbackDialog.student?.id) {
                            setTeacherFeedbacks(prev => {
                              const newMap = new Map(prev);
                              newMap.set(feedbackDialog.student!.id, feedbackText.trim());
                              return newMap;
                            });
                          }
                          setFeedbackDialog(d => ({ ...d, open: false }));
                        } else {
                          throw new Error('Gagal menyimpan feedback');
                        }
                      } catch (error) {
                        console.error('Error saving feedback:', error);
                      }
                    }}
                    disabled={feedbackDialog.isLoading}
                    className="px-3 py-1.5 text-xs font-medium text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
                  >
                    {feedbackDialog.initialFeedback ? 'Perbarui' : 'Simpan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}