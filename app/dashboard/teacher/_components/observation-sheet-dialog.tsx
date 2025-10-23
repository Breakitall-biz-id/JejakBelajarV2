"use client"

import * as React from "react"
import { toast } from "@/components/ui/toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"

export interface ObservationStudent {
  id: string
  name: string
}

export interface ObservationStatement {
  id: string
  questionText: string
  rubricCriteria: { [score: string]: string }
}

export type ObservationSheetDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  students: ObservationStudent[]
  statements: ObservationStatement[]
  initialValue?: Array<{ [studentId: string]: number }>
  loading?: boolean
  title?: string
  readOnly?: boolean
  onSubmit: (answers: Array<{ [studentId: string]: number }>) => Promise<void> | void
}

export function ObservationSheetDialog({
  open,
  onOpenChange,
  students,
  statements,
  initialValue,
  loading,
  title,
  readOnly,
  onSubmit,
}: ObservationSheetDialogProps) {
  // answers[statementIdx][studentId] = score
  const [answers, setAnswers] = React.useState<Array<{ [studentId: string]: number }>>(() =>
    initialValue && initialValue.length === statements.length
      ? initialValue
      : statements.map(() => ({}))
  )
  const [currentStatement, setCurrentStatement] = React.useState(0)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const newAnswers = initialValue && initialValue.length === statements.length
        ? initialValue
        : statements.map(() => ({}));
    setAnswers(newAnswers);
  }, [initialValue, statements.length, open])

  // Prevent accidental navigation during submit
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSubmitting) {
        e.preventDefault()
        e.returnValue = "Data sedang disimpan. Apakah Anda yakin ingin keluar?"
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isSubmitting])

  const allAnswered =
    answers.length === statements.length &&
    answers.every(row =>
      students.every(s => row[s.id] && row[s.id] >= 1 && row[s.id] <= 4)
    )

  // Calculate completion status for current statement
  const currentStatementAnswers = answers[currentStatement] || {}
  const assessedCount = Object.keys(currentStatementAnswers).filter(
    studentId => currentStatementAnswers[studentId] >= 1 && currentStatementAnswers[studentId] <= 4
  ).length
  const remainingCount = students.length - assessedCount

  const handleChange = (studentId: string, value: number) => {
    if (!readOnly) {
      setAnswers(ans =>
        ans.map((row, sIdx) =>
          sIdx === currentStatement ? { ...row, [studentId]: value } : row
        )
      );
    }
  }

  // Helper function to get rubric criteria description
  const getCriteriaDescription = (score: number): string => {
    const criteria = typeof statement.rubricCriteria === 'string'
      ? (statement.rubricCriteria ? JSON.parse(statement.rubricCriteria) : {})
      : statement.rubricCriteria || {};
    return criteria[String(score)] || "";
  }

  const handleSubmit = async () => {
    setError(null)
    if (!allAnswered) {
      setError("Harap nilai semua siswa untuk semua pertanyaan sebelum menyimpan.")
      return
    }
    setIsSubmitting(true)

    // Show warning toast
    toast.warning("Sedang menyimpan data. Jangan refresh atau tutup aplikasi.", {
      duration: 3000, // 3 seconds
      position: 'top-center'
    })

    try {
      await onSubmit(answers)
      toast.success("Berhasil menyimpan observasi!")
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.")
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan observasi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const statement = statements[currentStatement]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold text-center">
            {title || "Lembar Observasi"}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((currentStatement + 1) / statements.length) * 100}%` }}
          ></div>
        </div>

        {/* Statement */}
        <div className="border-b pb-4">
          <div className="text-base md:text-lg font-semibold text-foreground text-center mb-4" dangerouslySetInnerHTML={{ __html: statement.questionText }} />
          {/* Progress Status */}
          <div className="flex justify-center">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              remainingCount === 0
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
            }`}>
              {remainingCount === 0
                ? '✓ Semua siswa telah dinilai'
                : `${assessedCount} dari ${students.length} siswa sudah dinilai (${remainingCount} lagi)`
              }
            </div>
          </div>
        </div>

        {/* Rubric Scale Descriptions - Collapsible */}
        <details className="border-b pb-4 mb-4 group">
          <summary className="flex items-center justify-between cursor-pointer py-2 px-3 select-none rounded-lg hover:bg-muted/50 transition-colors">
            <span className="text-xs md:text-sm font-medium">Skala Penilaian (Skor 1-4)</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs md:text-sm">
            {[4, 3, 2, 1].map(score => (
              <div key={score} className="bg-muted/50 rounded-lg p-2 md:p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                    score === 4 ? 'bg-green-100 border-green-600 text-green-700' :
                    score === 3 ? 'bg-blue-100 border-blue-600 text-blue-700' :
                    score === 2 ? 'bg-yellow-100 border-yellow-600 text-yellow-700' :
                    'bg-red-100 border-red-600 text-red-700'
                  }`}>
                    {score}
                  </div>
                  <span className="font-medium text-xs md:text-sm">Skor {score}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {getCriteriaDescription(score)}
                </p>
              </div>
            ))}
          </div>
        </details>

        {/* Scrollable Student List */}
        <div className="flex-1 overflow-auto min-h-0">
          {students.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Tidak ada siswa untuk dinilai</p>
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {students.map((student) => {
                const currentValue = answers[currentStatement]?.[student.id];

                return (
                  <div key={student.id} className="bg-muted/30 rounded-lg p-3 md:p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-2 md:mb-3">
                      <h4 className="font-semibold text-sm md:text-base">{student.name}</h4>
                      {currentValue && (
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          currentValue === 4 ? 'bg-green-100 text-green-700' :
                          currentValue === 3 ? 'bg-blue-100 text-blue-700' :
                          currentValue === 2 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          Skor: {currentValue}
                        </div>
                      )}
                    </div>

                    <RadioGroup
                      value={String(currentValue || "")}
                      onValueChange={val => {
                        if (val) {
                          handleChange(student.id, Number(val));
                        } else {
                          // Remove the value when deselected
                          setAnswers(ans =>
                            ans.map((row, sIdx) => {
                              if (sIdx === currentStatement) {
                                const newRow = { ...row };
                                delete newRow[student.id];
                                return newRow;
                              }
                              return row;
                            })
                          );
                        }
                      }}
                      disabled={readOnly}
                      className="flex flex-row justify-between"
                      name={`student-${student.id}-statement-${currentStatement}`}
                    >
                      {[4, 3, 2, 1].map(score => (
                        <label
                          key={score}
                          className={`flex flex-col items-center cursor-pointer select-none p-1.5 md:p-2 rounded-lg border-2 transition-all ${
                            currentValue === score
                              ? score === 4 ? 'border-green-600 bg-green-50 text-green-700' :
                                score === 3 ? 'border-blue-600 bg-blue-50 text-blue-700' :
                                score === 2 ? 'border-yellow-600 bg-yellow-50 text-yellow-700' :
                                'border-red-600 bg-red-50 text-red-700'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <RadioGroupItem
                            value={String(score)}
                            disabled={readOnly}
                            className="sr-only"
                          />
                          <div className="text-center">
                            <div className={`text-base md:text-lg font-bold ${
                              currentValue === score ? 'text-current' : 'text-gray-500'
                            }`}>
                              {score}
                            </div>
                          </div>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && <p className="px-6 text-sm text-red-500">{error}</p>}

        {/* Navigation Footer */}
        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
          <div className="flex-1 flex justify-between sm:justify-start items-center">
            <Button
              variant="outline"
              disabled={currentStatement === 0}
              onClick={() => setCurrentStatement(currentStatement - 1)}
              className="w-full sm:w-auto"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          </div>

          <div className="text-sm text-muted-foreground text-center px-4">
            {!readOnly && (
              <span>
                Pertanyaan {currentStatement + 1} dari {statements.length}
                {students.length > 0 && ` • ${students.length} siswa`}
              </span>
            )}
          </div>

          <div className="flex-1 flex justify-end">
            {currentStatement < statements.length - 1 ? (
              <Button
                onClick={() => setCurrentStatement(currentStatement + 1)}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                {isSubmitting && (
                  <div className="text-center">
                    <p className="text-xs text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300 px-2 py-1 rounded">
                      ⚠️ Jangan refresh atau tutup aplikasi. Data sedang disimpan...
                    </p>
                  </div>
                )}
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !allAnswered || readOnly || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan"
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
