"use client"

import * as React from "react"
import { toast } from "@/components/ui/toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

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
  const [searchQuery, setSearchQuery] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 10 // Show 10 students per page for better UI

  React.useEffect(() => {
    const newAnswers = initialValue && initialValue.length === statements.length
        ? initialValue
        : statements.map(() => ({}));
    setAnswers(newAnswers);
  }, [initialValue, statements.length, open])

  // Reset pagination when search changes or when moving to next statement
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, currentStatement])

  // Filter students based on search
  const filteredStudents = React.useMemo(() => {
    if (!searchQuery) return students
    const query = searchQuery.toLowerCase()
    return students.filter(student =>
      student.name.toLowerCase().includes(query)
    )
  }, [students, searchQuery])

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage)

  // Reset to first page when search becomes empty or changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const allAnswered =
    answers.length === statements.length &&
    answers.every(row =>
      filteredStudents.every(s => row[s.id] && row[s.id] >= 1 && row[s.id] <= 4)
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
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
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

        {/* Statement and Search Header */}
        <div className="border-b pb-4">
          <div className="text-lg font-semibold text-foreground text-center mb-4" dangerouslySetInnerHTML={{ __html: statement.questionText }} />

          {/* Search Bar - Only show if there are many students */}
          {students.length > itemsPerPage && (
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cari nama siswa..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="text-sm text-muted-foreground whitespace-nowrap">
                {filteredStudents.length} dari {students.length} siswa
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Table Content */}
        <div className="flex-1 overflow-auto min-h-0">
          {paginatedStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>
                {searchQuery ? "Tidak ada siswa yang cocok dengan pencarian" : "Tidak ada siswa untuk dinilai"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-1">
                <thead className="sticky top-0 bg-background z-10">
                  <tr>
                    <th className="w-48 text-left text-base font-medium px-4 py-3 bg-muted/50">Nama Siswa</th>
                    {[4, 3, 2, 1].map(score => (
                      <th key={score} className="text-center px-4 py-3 bg-muted/50 min-w-[80px]">
                        <div className="flex flex-col items-center">
                          <span className="font-bold text-base mb-1 text-primary">{score}</span>
                          <TooltipProvider delayDuration={100}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="mb-1 p-1 h-6 w-6">?</Button>
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
                  {paginatedStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-base font-medium whitespace-nowrap border-r border-border/50">
                        {student.name}
                      </td>
                      {[4, 3, 2, 1].map(score => (
                        <td key={score} className="text-center px-2 py-3">
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
                              className={`size-5 border-2 transition-colors duration-150
                                ${answers[currentStatement]?.[student.id] === score
                                  ? 'border-primary ring-2 ring-primary/30 bg-primary/10'
                                  : 'border-gray-300 bg-white hover:border-primary/50'}
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
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredStudents.length)} dari {filteredStudents.length} siswa
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Sebelumnya
                </Button>
                <span className="text-sm px-3 py-1 bg-muted rounded">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Selanjutnya
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && <p className="px-6 text-sm text-red-500">{error}</p>}

        {/* Navigation Footer */}
        <DialogFooter className="flex justify-between pt-4 border-t">
          <Button variant="outline" disabled={currentStatement === 0} onClick={() => setCurrentStatement(currentStatement - 1)}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            {!readOnly && (
              <span>
                {currentStatement + 1} dari {statements.length} pernyataan
                {filteredStudents.length > 0 && ` • ${filteredStudents.length} siswa`}
              </span>
            )}
          </div>
          {currentStatement < statements.length - 1 ? (
            <Button onClick={() => setCurrentStatement(currentStatement + 1)} disabled={loading}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
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
