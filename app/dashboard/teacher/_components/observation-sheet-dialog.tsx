"use client"

import * as React from "react"
import { toast } from "@/components/ui/toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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

  const allAnswered =
    answers.length === statements.length &&
    answers.every(row =>
      students.every(s => row[s.id] && row[s.id] >= 1 && row[s.id] <= 4)
    )

  const handleChange = (studentId: string, value: number) => {
    if (!readOnly) {
      setAnswers(ans =>
        ans.map((row, sIdx) =>
          sIdx === currentStatement ? { ...row, [studentId]: value } : row
        )
      );
    }
  }

  const handleSubmit = async () => {
    setError(null)
    if (!allAnswered) {
      setError("Harap nilai semua siswa untuk semua pertanyaan sebelum menyimpan.")
      return
    }
    setIsSubmitting(true)
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-center">
            {title || "Observation Sheet"}
          </DialogTitle>
        </DialogHeader>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((currentStatement + 1) / statements.length) * 100}%` }}
          ></div>
        </div>
        <div className="flex flex-col gap-6 py-4">
          <div className="text-lg font-semibold text-foreground text-center" dangerouslySetInnerHTML={{ __html: statement.questionText }} />
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr>
                  <th className="w-40 text-left text-base font-medium"></th>
                  {[4, 3, 2, 1].map(score => (
                    <th key={score} className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-base mb-1 text-primary">{score}</span>
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="mb-1 p-1 h-7 w-7">?</Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="max-w-xs text-xs">
                              {(() => {
                                const criteria = typeof statement.rubricCriteria === 'string'
                                  ? (statement.rubricCriteria ? JSON.parse(statement.rubricCriteria) : {})
                                  : statement.rubricCriteria || {};
                                return criteria[String(score)] || "-";
                              })()}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="">
                    <td className="pr-2 py-2 text-base font-medium whitespace-nowrap">{student.name}</td>
                    {[4, 3, 2, 1].map(score => (
                      <td key={score} className="text-center">
                        <RadioGroup
                          value={String(answers[currentStatement]?.[student.id] || "")}
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
                          className="flex flex-row justify-center"
                          name={`student-${student.id}-statement-${currentStatement}`}
                        >
                          <RadioGroupItem
                            value={String(score)}
                            className={`size-6 border-2 transition-colors duration-150
                              ${answers[currentStatement][student.id] === score
                                ? 'border-primary ring-2 ring-primary/30 bg-primary/10'
                                : 'border-gray-300 bg-white'}
                            `}
                          />
                        </RadioGroup>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {error && <p className="px-6 text-sm text-red-500">{error}</p>}
        <DialogFooter className="flex justify-between">
          <Button variant="outline" disabled={currentStatement === 0} onClick={() => setCurrentStatement(currentStatement - 1)}>
            Previous
          </Button>
          {currentStatement < statements.length - 1 ? (
            <Button onClick={() => setCurrentStatement(currentStatement + 1)} disabled={loading}>
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading || !allAnswered || readOnly}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
