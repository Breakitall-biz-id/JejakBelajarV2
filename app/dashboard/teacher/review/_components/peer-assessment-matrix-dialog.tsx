"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

export interface PeerAssessmentMatrixStudent {
  id: string
  name: string
}

export interface PeerAssessmentMatrixDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  students: PeerAssessmentMatrixStudent[]
  matrix: number[][]
  statements: string[]
  title?: string
}

export function PeerAssessmentMatrixDialog({
  open,
  onOpenChange,
  students,
  matrix,
  statements,
  title,
}: PeerAssessmentMatrixDialogProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 15 // Show 15 students per page for matrix view

  // Reset pagination when dialog opens or search changes
  React.useEffect(() => {
    if (open) {
      setCurrentPage(1)
      setSearchQuery("")
    }
  }, [open])

  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

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

  // Get average score for a student across all peers
  const getAverageScore = (studentIndex: number) => {
    const scores = matrix.map(row => row[studentIndex]).filter(score => score != null && score > 0)
    if (scores.length === 0) return 0
    const sum = scores.reduce((acc, score) => acc + score, 0)
    return (sum / scores.length).toFixed(1)
  }

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 3.5) return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
    if (score >= 2.5) return "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20"
    if (score >= 1.5) return "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20"
    return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold text-center">
            {title || "Matriks Penilaian Teman"}
          </DialogTitle>
        </DialogHeader>

        {/* Search Bar */}
        {students.length > itemsPerPage && (
          <div className="flex gap-4 items-center border-b pb-4">
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

        {/* Scrollable Matrix Content */}
        <div className="flex-1 overflow-auto min-h-0">
          {paginatedStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>
                {searchQuery ? "Tidak ada siswa yang cocok dengan pencarian" : "Tidak ada data penilaian"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-1">
                <thead className="sticky top-0 bg-background z-10">
                  <tr>
                    <th className="text-left text-sm font-medium px-4 py-3 bg-muted/50 min-w-[200px]">
                      Nama Siswa
                    </th>
                    {statements.map((_, statementIdx) => (
                      <th key={statementIdx} className="text-center px-4 py-3 bg-muted/50 min-w-[120px]">
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Pertanyaan {statementIdx + 1}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Rata-rata Nilai
                        </div>
                      </th>
                    ))}
                    <th className="text-center px-4 py-3 bg-muted/50 min-w-[120px">
                      <div className="text-sm font-medium">
                        Rata-rata Akhir
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.map((student, studentIdx) => {
                    const originalStudentIdx = students.findIndex(s => s.id === student.id)
                    const finalAverage = parseFloat(getAverageScore(originalStudentIdx))

                    return (
                      <tr key={student.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium whitespace-nowrap border-r border-border/50">
                          {student.name}
                        </td>
                        {statements.map((_, statementIdx) => {
                          const scores = matrix.map(row => row[originalStudentIdx]).filter(score => score != null && score > 0)
                          const statementScores = matrix[statementIdx] ? [matrix[statementIdx][originalStudentIdx]] : []
                          const statementAverage = statementScores.length > 0 && statementScores[0] != null
                            ? statementScores[0].toFixed(1)
                            : "-"

                          return (
                            <td key={statementIdx} className="text-center px-4 py-3">
                              <div className="flex justify-center">
                                {statementAverage !== "-" ? (
                                  <Badge className={getScoreColor(parseFloat(statementAverage))}>
                                    {statementAverage}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground text-sm">-</span>
                                )}
                              </div>
                            </td>
                          )
                        })}
                        <td className="text-center px-4 py-3">
                          <div className="flex justify-center">
                            {finalAverage > 0 ? (
                              <Badge className={`${getScoreColor(finalAverage)} font-semibold`}>
                                {finalAverage}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
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

        {/* Navigation Footer */}
        <DialogFooter className="flex justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Total {students.length} siswa " {statements.length} pertanyaan
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}