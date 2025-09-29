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
import { ChevronDown, ChevronRight } from "lucide-react"

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
  initialGrades?: { rubricId: string; score: string }[]
  loading?: boolean
  onSubmit: (grades: { rubricId: string; score: string }[]) => void
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
  const [grades, setGrades] = React.useState<{ rubricId: string; score: string }[]>(initialGrades || [])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [showCriteria, setShowCriteria] = React.useState<string | null>(null)

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

  
  const getScoreForRubric = (rubricId: string) => {
    return grades.find(g => g.rubricId === rubricId)?.score || ""
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-center">
            Penilaian Jurnal - {studentName}
          </DialogTitle>
        </DialogHeader>

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
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${((currentPrompt + 1) / prompts.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-base font-medium text-center mb-4"
                   dangerouslySetInnerHTML={{ __html: prompts[currentPrompt] }} />

              <Card>
                <CardContent className="pt-4">
                  <Textarea
                    value={studentAnswers[currentPrompt] || ""}
                    rows={6}
                    readOnly
                    className="resize-none bg-muted/50 text-sm"
                  />
                </CardContent>
              </Card>
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
                        value={getScoreForRubric(rubric.id)}
                        onValueChange={(value) => handleScoreChange(rubric.id, value)}
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
                                ${getScoreForRubric(rubric.id) === score
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
            onClick={handleSubmit}
            disabled={loading || (rubrics.length > 0 && !allGraded)}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}