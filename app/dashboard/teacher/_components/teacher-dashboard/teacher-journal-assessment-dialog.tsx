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

export type JournalRubric = {
  id: string
  indicatorText: string
  criteria: { [score: string]: string }
}

export type TeacherJournalAssessmentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentName: string
  studentAnswers: string[]
  prompts: string[]
  rubrics: JournalRubric[]
  initialGrades?: { rubricId: string; score: string; feedback?: string }[]
  loading?: boolean
  onSubmit: (grades: { rubricId: string; score: string; feedback?: string }[]) => void
  onCancel: () => void
}

export function TeacherJournalAssessmentDialog({
  open,
  onOpenChange,
  studentName,
  studentAnswers,
  prompts,
  rubrics,
  initialGrades,
  loading,
  onSubmit,
  onCancel,
}: TeacherJournalAssessmentDialogProps) {
  const [currentPrompt, setCurrentPrompt] = React.useState(0)
  const [grades, setGrades] = React.useState<{ rubricId: string; score: string; feedback?: string }[]>(initialGrades || [])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setGrades(initialGrades || [])
    setCurrentPrompt(0)
  }, [initialGrades, open])

  const handleScoreChange = (rubricId: string, score: string) => {
    setGrades(prev => {
      const existing = prev.find(g => g.rubricId === rubricId)
      if (existing) {
        return prev.map(g => g.rubricId === rubricId ? { ...g, score } : g)
      } else {
        return [...prev, { rubricId, score }]
      }
    })
  }

  const handleFeedbackChange = (rubricId: string, feedback: string) => {
    setGrades(prev => {
      const existing = prev.find(g => g.rubricId === rubricId)
      if (existing) {
        return prev.map(g => g.rubricId === rubricId ? { ...g, feedback } : g)
      } else {
        return [...prev, { rubricId, score: "1", feedback }]
      }
    })
  }

  const getScoreForRubric = (rubricId: string) => {
    return grades.find(g => g.rubricId === rubricId)?.score || ""
  }

  const getFeedbackForRubric = (rubricId: string) => {
    return grades.find(g => g.rubricId === rubricId)?.feedback || ""
  }

  const allGraded = rubrics.length > 0 && rubrics.every(rubric =>
    grades.find(g => g.rubricId === rubric.id)?.score
  )

  const handleSubmit = async () => {
    setError(null)
    if (rubrics.length > 0 && !allGraded) {
      setError("Harap berikan nilai untuk semua indikator sebelum menyimpan.")
      return
    }
    setIsSubmitting(true)
    try {
      await onSubmit(grades)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Penilaian Jurnal Refleksi - {studentName}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="answers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="answers">Jawaban Siswa</TabsTrigger>
            <TabsTrigger value="assessment">Penilaian</TabsTrigger>
          </TabsList>

          <TabsContent value="answers" className="mt-4">
            <div className="space-y-4">
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${((currentPrompt + 1) / prompts.length) * 100}%` }}
                ></div>
              </div>

              <div className="text-lg font-semibold text-foreground text-center mb-4"
                   dangerouslySetInnerHTML={{ __html: prompts[currentPrompt] }} />

              <Card>
                <CardContent className="pt-6">
                  <Textarea
                    value={studentAnswers[currentPrompt] || ""}
                    rows={8}
                    readOnly
                    className="resize-none bg-muted/50"
                  />
                </CardContent>
              </Card>
            </div>

            <DialogFooter className="flex justify-between mt-6">
              <Button variant="outline" disabled={currentPrompt === 0} onClick={() => setCurrentPrompt(currentPrompt - 1)}>
                Sebelumnya
              </Button>
              <Button onClick={() => setCurrentPrompt(currentPrompt + 1)} disabled={currentPrompt >= prompts.length - 1}>
                Berikutnya
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="assessment" className="mt-4">
            <div className="space-y-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Rubrik Penilaian</h3>
                <p className="text-sm text-muted-foreground">Beri nilai untuk setiap indikator berdasarkan kriteria yang tersedia</p>
              </div>

              {rubrics.map((rubric, index) => (
                <Card key={rubric.id}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      {rubric.indicatorText}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(rubric.criteria).map(([score, description]) => (
                        <div key={score} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50">
                          <RadioGroupItem
                            value={score}
                            checked={getScoreForRubric(rubric.id) === score}
                            onCheckedChange={() => handleScoreChange(rubric.id, score)}
                            id={`${rubric.id}-${score}`}
                          />
                          <div className="flex-1">
                            <Label htmlFor={`${rubric.id}-${score}`} className="font-medium text-sm">
                              Skor {score}
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">{description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4">
                      <Label className="text-sm font-medium">Feedback (Opsional)</Label>
                      <Textarea
                        value={getFeedbackForRubric(rubric.id)}
                        onChange={(e) => handleFeedbackChange(rubric.id, e.target.value)}
                        placeholder="Berikan feedback untuk indikator ini..."
                        rows={2}
                        className="mt-1"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              {rubrics.length === 0 && (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    Tidak ada rubrik yang tersedia untuk instrumen ini
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || (rubrics.length > 0 && !allGraded)}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Penilaian"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}