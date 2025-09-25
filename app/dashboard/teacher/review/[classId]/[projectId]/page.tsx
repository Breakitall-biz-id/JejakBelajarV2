"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ProjectProgressBar } from "../../../../student/_components/student-dashboard/project-progress-bar"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { ProjectDetailData } from "../../queries"

const SCALE = [
  { value: 4, label: "Selalu" },
  { value: 3, label: "Sering" },
  { value: 2, label: "Kadang-kadang" },
  { value: 1, label: "Tidak Pernah" },
]



export default function ProjectDetailPage({
  params
}: {
  params: { classId: string; projectId: string }
}) {
  const router = useRouter()
  const [tab, setTab] = React.useState("tentang")
  const [project, setProject] = React.useState<ProjectDetailData | null>(null)
  const [loading, setLoading] = React.useState(true)

  // State for assessment answers
  const [selfAssessmentAnswers, setSelfAssessmentAnswers] = React.useState<Record<string, number>>({})
  const [peerAssessmentAnswers, setPeerAssessmentAnswers] = React.useState<Record<string, Record<string, number>>>({})

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
            <ProjectProgressBar project={project} />
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
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-8 h-8 flex items-center justify-center rounded-full text-background font-bold bg-primary">{idx + 1}</span>
                    <h3 className="text-lg font-semibold">{stage.name}</h3>
                    {stage.description && (
                      <p className="text-sm text-muted-foreground">{stage.description}</p>
                    )}
                  </div>

                  {/* Assessment Questions */}
                  <div className="space-y-4">
                    <div className="text-sm font-medium text-foreground mb-3">Penilaian Tahapan:</div>

                    {/* Self Assessment Questions */}
                    <div className="rounded-lg border p-3 flex flex-col gap-2 bg-muted/40">
                      <div className="font-semibold text-foreground text-base mb-1">Self Assessment</div>
                      <div className="space-y-3">
                        {[
                          "Saya dapat memahami tujuan pembelajaran tahapan ini.",
                          "Saya dapat menyelesaikan tugas dengan baik.",
                          "Saya aktif berpartisipasi dalam diskusi kelompok.",
                          "Saya dapat mengelola waktu dengan efektif."
                        ].map((question, qIdx) => (
                          <div key={qIdx} className="flex flex-col gap-2">
                            <div className="text-sm text-foreground">{question}</div>
                            <RadioGroup
                              value={selfAssessmentAnswers[`self-${qIdx}`] ? String(selfAssessmentAnswers[`self-${qIdx}`]) : undefined}
                              onValueChange={(val) => setSelfAssessmentAnswers(prev => ({ ...prev, [`self-${qIdx}`]: Number(val) }))}
                              className="flex flex-row gap-4 justify-between"
                              name={`self-assessment-${qIdx}`}
                            >
                              {SCALE.map((scale) => (
                                <label
                                  key={scale.value}
                                  className={`flex-1 flex flex-col items-center cursor-pointer select-none ${
                                    selfAssessmentAnswers[`self-${qIdx}`] === scale.value ? "font-bold text-primary" : "text-foreground"
                                  }`}
                                >
                                  <RadioGroupItem
                                    value={String(scale.value)}
                                    className={
                                      `mb-2 size-5 border-2 transition-colors duration-150 ` +
                                      (selfAssessmentAnswers[`self-${qIdx}`] === scale.value
                                        ? "border-primary ring-2 ring-primary/30"
                                        : "border-gray-300")
                                    }
                                  />
                                  <span className={`text-xs ${selfAssessmentAnswers[`self-${qIdx}`] === scale.value ? "font-medium text-primary" : ""}`}>{scale.label}</span>
                                </label>
                              ))}
                            </RadioGroup>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Peer Assessment per student */}
                    {stage.students.length > 0 && (
                      <div className="space-y-4">
                        <div className="font-semibold text-foreground text-base">Peer Assessment</div>
                        {stage.students.map((student) => (
                          <div key={student.id} className="rounded-lg border p-3 flex flex-col gap-2 bg-muted/40">
                            <div className="font-semibold text-foreground text-base mb-1">{student.name || 'Unknown Student'}</div>
                            <div className="space-y-3">
                              {[
                                "Teman ini menunjukkan sikap menghargai saat mendengarkan pendapat.",
                                "Teman ini aktif berkontribusi dalam diskusi kelompok.",
                                "Teman ini dapat bekerja sama dengan baik.",
                                "Teman ini menyelesaikan tugas dengan tepat waktu."
                              ].map((question, qIdx) => (
                                <div key={qIdx} className="flex flex-col gap-2">
                                  <div className="text-sm text-foreground">{question}</div>
                                  <RadioGroup
                                    value={peerAssessmentAnswers[student.id]?.[qIdx] ? String(peerAssessmentAnswers[student.id]?.[qIdx]) : undefined}
                                    onValueChange={(val) => setPeerAssessmentAnswers(prev => ({
                                      ...prev,
                                      [student.id]: { ...(prev[student.id] || {}), [qIdx]: Number(val) }
                                    }))}
                                    className="flex flex-row gap-4 justify-between"
                                    name={`peer-${student.id}-${qIdx}`}
                                  >
                                    {SCALE.map((scale) => (
                                      <label
                                        key={scale.value}
                                        className={`flex-1 flex flex-col items-center cursor-pointer select-none ${
                                          peerAssessmentAnswers[student.id]?.[qIdx] === scale.value ? "font-bold text-primary" : "text-foreground"
                                        }`}
                                      >
                                        <RadioGroupItem
                                          value={String(scale.value)}
                                          className={
                                            `mb-2 size-5 border-2 transition-colors duration-150 ` +
                                            (peerAssessmentAnswers[student.id]?.[qIdx] === scale.value
                                              ? "border-primary ring-2 ring-primary/30"
                                              : "border-gray-300")
                                          }
                                        />
                                        <span className={`text-xs ${peerAssessmentAnswers[student.id]?.[qIdx] === scale.value ? "font-medium text-primary" : ""}`}>{scale.label}</span>
                                      </label>
                                    ))}
                                  </RadioGroup>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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