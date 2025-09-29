"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, CheckCircle, Circle } from "lucide-react"

export type JournalRubric = {
  id: string
  indicatorText: string
  criteria: { [score: string]: string }
}

export type JournalSubmission = {
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
}

export type TeacherJournalIndividualAssessmentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentName: string
  submissions: JournalSubmission[]
  prompts: string[]
  rubrics: JournalRubric[]
  loading?: boolean
  onQuestionGrade: (submissionId: string, grades: { rubricId: string; score: string }[]) => Promise<void>
  onRefresh: () => Promise<void>
  onCancel: () => void
}

export function TeacherJournalIndividualAssessmentDialog({
  open,
  onOpenChange,
  studentName,
  submissions,
  prompts,
  rubrics,
  loading,
  onQuestionGrade,
  onRefresh,
  onCancel,
}: TeacherJournalIndividualAssessmentDialogProps) {
  const [currentPrompt, setCurrentPrompt] = React.useState(0)
  const [grades, setGrades] = React.useState<Record<string, { rubricId: string; score: string }[]>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [showCriteria, setShowCriteria] = React.useState<string | null>(null)

  // Find the current submission
  const currentSubmission = submissions.find(s => s.questionIndex === currentPrompt)

  React.useEffect(() => {
    // Initialize grades from existing submissions
    const initialGrades: Record<string, { rubricId: string; score: string }[]> = {}
    submissions.forEach(submission => {
      if (submission.grades && submission.grades.length > 0) {
        initialGrades[submission.id] = submission.grades.map(grade => ({
          rubricId: grade.rubric_id,
          score: String(grade.score),
        }))
      }
    })
    setGrades(initialGrades)
    setCurrentPrompt(0)
  }, [submissions, open])

  const handleScoreChange = (submissionId: string, rubricId: string, score: string) => {
    setGrades(prev => {
      const submissionGrades = prev[submissionId] || []
      const existing = submissionGrades.find(g => g.rubricId === rubricId)

      if (existing) {
        return {
          ...prev,
          [submissionId]: submissionGrades.map(g => g.rubricId === rubricId ? { ...g, score } : g)
        }
      } else {
        return {
          ...prev,
          [submissionId]: [...submissionGrades, { rubricId, score }]
        }
      }
    })
  }

  const getScoreForRubric = (submissionId: string, rubricId: string) => {
    return grades[submissionId]?.find(g => g.rubricId === rubricId)?.score || ""
  }

  const isQuestionGraded = (submissionId: string) => {
    const submissionGrades = grades[submissionId] || []
    return rubrics.length > 0 && rubrics.every(rubric =>
      submissionGrades.find(g => g.rubricId === rubric.id)?.score
    )
  }

  const handleQuestionGrade = async () => {
    if (!currentSubmission) return

    setError(null)
    if (rubrics.length > 0 && !isQuestionGraded(currentSubmission.id)) {
      setError("Harap berikan nilai untuk semua indikator sebelum menyimpan.")
      return
    }

    setIsSubmitting(true)
    try {
      await onQuestionGrade(currentSubmission.id, grades[currentSubmission.id] || [])
      await onRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getQuestionStatus = (questionIndex: number) => {
    const submission = submissions.find(s => s.questionIndex === questionIndex)
    if (!submission) return "not_submitted"

    if (submission.score !== undefined && submission.score > 0) return "graded"
    if (submission.answer) return "submitted"
    return "not_submitted"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-center">
            Penilaian Jurnal - {studentName}
          </DialogTitle>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex gap-2 mb-4">
          {prompts.map((_, index) => {
            const status = getQuestionStatus(index)
            const submission = submissions.find(s => s.questionIndex === index)

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-1 cursor-pointer"
                onClick={() => setCurrentPrompt(index)}
              >
                <div
                  className={`w-full h-1 rounded-full transition-colors ${
                    index === currentPrompt
                      ? 'bg-primary'
                      : status === 'graded'
                      ? 'bg-green-500'
                      : status === 'submitted'
                      ? 'bg-blue-500'
                      : 'bg-muted'
                  }`}
                />
                <div className="text-xs text-muted-foreground">
                  {index + 1}
                </div>
                {submission && (
                  <div className="text-xs">
                    {status === 'graded' ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                      <Circle className="w-3 h-3 text-blue-500" />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <Tabs defaultValue="answers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="answers">Jawaban</TabsTrigger>
            <TabsTrigger value="assessment">Penilaian</TabsTrigger>
          </TabsList>

          <TabsContent value="answers" className="mt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-muted-foreground">
                  Pertanyaan {currentPrompt + 1} dari {prompts.length}
                </div>
                <Badge variant={
                  currentSubmission?.score !== undefined && currentSubmission.score > 0
                    ? "default"
                    : currentSubmission?.answer
                    ? "secondary"
                    : "outline"
                }>
                  {currentSubmission?.score !== undefined && currentSubmission.score > 0
                    ? `Nilai: ${currentSubmission.score}`
                    : currentSubmission?.answer
                    ? "Terkirim"
                    : "Belum Dijawab"
                  }
                </Badge>
              </div>

              <div className="text-base font-medium text-center mb-4"
                   dangerouslySetInnerHTML={{ __html: prompts[currentPrompt] }} />

              <Card>
                <CardContent className="pt-4">
                  {currentSubmission?.answer ? (
                    <Textarea
                      value={currentSubmission.answer}
                      rows={6}
                      readOnly
                      className="resize-none bg-muted/50 text-sm"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      Student hasn't submitted this question yet.
                    </div>
                  )}
                </CardContent>
              </Card>

              {currentSubmission?.submittedAt && (
                <div className="text-xs text-muted-foreground text-center">
                  Dikirim pada: {new Date(currentSubmission.submittedAt).toLocaleString('id-ID')}
                </div>
              )}
            </div>

            <DialogFooter className="flex justify-between mt-4">
              <Button variant="outline" size="sm" disabled={currentPrompt === 0} onClick={() => setCurrentPrompt(currentPrompt - 1)}>
                ← Sebelumnya
              </Button>
              <Button size="sm" onClick={() => setCurrentPrompt(currentPrompt + 1)} disabled={currentPrompt >= prompts.length - 1}>
                Berikutnya →
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="assessment" className="mt-4">
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-base font-semibold">Rubrik Penilaian</h3>
                <p className="text-xs text-muted-foreground">Tap untuk lihat kriteria</p>
              </div>

              {!currentSubmission?.answer ? (
                <Card>
                  <CardContent className="pt-4 text-center text-muted-foreground text-sm">
                    Student hasn't submitted this question yet.
                  </CardContent>
                </Card>
              ) : (
                <>
                  {rubrics.map((rubric, index) => (
                    <Card key={rubric.id} className="border-border/50">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <Badge variant="secondary" className="text-xs mt-0.5">
                              {index + 1}
                            </Badge>
                            <p className="text-sm font-medium leading-tight">{rubric.indicatorText}</p>
                          </div>

                          {/* Score Selection */}
                          <RadioGroup
                            value={getScoreForRubric(currentSubmission.id, rubric.id)}
                            onValueChange={(value) => handleScoreChange(currentSubmission.id, rubric.id, value)}
                            className="flex gap-2"
                          >
                            {["4", "3", "2", "1"].map((score) => (
                              <div key={score} className="flex-1">
                                <RadioGroupItem
                                  value={score}
                                  id={`${rubric.id}-${score}`}
                                  className="sr-only"
                                />
                                <Label
                                  htmlFor={`${rubric.id}-${score}`}
                                  className={`
                                    cursor-pointer text-xs font-medium px-3 py-2 rounded-md border transition-colors w-full text-center
                                    ${getScoreForRubric(currentSubmission.id, rubric.id) === score
                                      ? 'bg-primary text-primary-foreground border-primary'
                                      : 'bg-background hover:bg-muted border-border'
                                    }
                                  `}
                                >
                                  {score}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>

                          {/* Criteria Collapsible */}
                          <Collapsible open={showCriteria === rubric.id} onOpenChange={() => setShowCriteria(showCriteria === rubric.id ? null : rubric.id)}>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm" className="w-full justify-between p-2 h-auto">
                                <span className="text-xs">Lihat Kriteria</span>
                                {showCriteria === rubric.id ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-2 mt-2">
                              {["4", "3", "2", "1"].map((score) => (
                                <div key={score} className="text-xs p-2 bg-muted/50 rounded">
                                  <span className="font-medium">Skor {score}:</span> {rubric.criteria[score]}
                                </div>
                              ))}
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {rubrics.length === 0 && (
                    <Card>
                      <CardContent className="pt-4 text-center text-muted-foreground text-sm">
                        Tidak ada rubrik tersedia
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        <DialogFooter className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Batal
          </Button>
          <Button
            size="sm"
            onClick={handleQuestionGrade}
            disabled={loading || !currentSubmission?.answer || (rubrics.length > 0 && !isQuestionGraded(currentSubmission.id))}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Nilai"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}