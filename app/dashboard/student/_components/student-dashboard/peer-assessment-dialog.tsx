"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { submitStageInstrument } from "../../actions"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

const SCALE = [
  { value: 4, label: "Selalu" },
  { value: 3, label: "Sering" },
  { value: 2, label: "Kadang-kadang" },
  { value: 1, label: "Tidak Pernah" },
]

export interface PeerAssessmentMember {
  id: string
  name: string
}

export type PeerAssessmentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: PeerAssessmentMember[]
  statements?: string[]
  initialValue?: number[][]
  loading?: boolean
  currentUserId?: string | null
  title?: string
  readOnly?: boolean
  stageId: string
  projectId: string
  instrumentType: "PEER_ASSESSMENT"
  templateStageConfigId?: string | null
  onSubmitSuccess?: () => void
}

export function PeerAssessmentDialog({
  open,
  onOpenChange,
  members,
  statements = ["Teman saya menunjukkan sikap menghargai saat mendengarkan pendapat teman kelompok."],
  initialValue,
  loading,
  currentUserId,
  title,
  readOnly,
  stageId,
  projectId,
  instrumentType,
  templateStageConfigId,
  onSubmitSuccess,
}: PeerAssessmentDialogProps) {
  // Filter out self from members
  const filteredMembers = React.useMemo(() => {
    if (!currentUserId) return members
    return members.filter((m) => m.id !== currentUserId)
  }, [members, currentUserId])

  // answers[statementIdx][peerIdx]
  const [answers, setAnswers] = React.useState<(number|null)[][]>(() => {
    const memberCount = currentUserId ? members.filter(m => m.id !== currentUserId).length : members.length
    if (initialValue && initialValue.length === statements.length) {
      return initialValue.map(row => [...row])
    }
    return Array.from({ length: statements.length }, () =>
      Array.from({ length: memberCount }, () => null)
    )
  })
  const [currentStatement, setCurrentStatement] = React.useState(0)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 8 // Show 8 members per page for better UI

  React.useEffect(() => {
    if (!open) return

    const newAnswers = initialValue && initialValue.length === statements.length
      ? initialValue.map(row => [...row])
      : Array.from({ length: statements.length }, () =>
          Array.from({ length: filteredMembers.length }, () => null)
        )

    setAnswers(newAnswers)
    setCurrentStatement(0)
    setCurrentPage(1)
    setSearchQuery("")
  }, [open, initialValue, filteredMembers.length, statements.length])

  // Reset pagination when search changes or when moving to next statement
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, currentStatement])

  // Filter members based on search
  const filteredMembersWithSearch = React.useMemo(() => {
    if (!searchQuery) return filteredMembers
    const query = searchQuery.toLowerCase()
    return filteredMembers.filter(member =>
      member.name.toLowerCase().includes(query)
    )
  }, [filteredMembers, searchQuery])

  // Pagination logic
  const totalPages = Math.ceil(filteredMembersWithSearch.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedMembers = filteredMembersWithSearch.slice(startIndex, startIndex + itemsPerPage)

  // Reset to first page when search becomes empty or changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const allAnswered =
    answers.length === statements.length &&
    answers.every(row => row.length === filteredMembers.length && row.every(a => a != null && a > 0))

  const handleChange = (peerIdx: number, value: number) => {
    if (!readOnly) {
      // Convert paginated index back to original filteredMembers index
      const originalMemberIndex = startIndex + peerIdx
      const originalFilteredIndex = filteredMembers.findIndex(m =>
        m.id === filteredMembersWithSearch[originalMemberIndex].id
      )

      setAnswers(ans => {
        const newAnswers = ans.map(row => [...row]);
        newAnswers[currentStatement][originalFilteredIndex] = value;
        return newAnswers;
      });
    }
  }

  const handleSubmit = async () => {
    setError(null)
    if (!allAnswered) {
      setError("Harap nilai semua teman untuk semua pertanyaan sebelum menyimpan.")
      return
    }
    setIsSubmitting(true)
    try {
      // Submit one by one for each peer
      for (let i = 0; i < filteredMembers.length; i++) {
        // Kumpulkan semua jawaban untuk peer i (dari semua statement)
        const memberAnswers = answers.map(row => row[i]).map(a => a == null ? 0 : a)
        const member = filteredMembers[i]
        const content = { answers: memberAnswers }
        const result = await submitStageInstrument({
          projectId,
          stageId,
          instrumentType,
          templateStageConfigId,
          content,
          targetStudentId: member.id,
        })
        if (!result.success) {
          setError(result.error || `Gagal menyimpan penilaian untuk ${member.name}`)
          setIsSubmitting(false)
          return
        }
      }
      toast.success("Penilaian berhasil disimpan!")
      onOpenChange(false)
      if (onSubmitSuccess) onSubmitSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col" key="peer-assessment-dialog">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold text-center">
            {title || "Peer Assessment"}
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
          <div className="text-lg font-semibold text-foreground text-center mb-4" dangerouslySetInnerHTML={{ __html: statements[currentStatement] }} />

          {/* Search Bar - Only show if there are many members */}
          {filteredMembers.length > itemsPerPage && (
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cari nama teman..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="text-sm text-muted-foreground whitespace-nowrap">
                {filteredMembersWithSearch.length} dari {filteredMembers.length} teman
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto min-h-0">
          {paginatedMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>
                {searchQuery ? "Tidak ada teman yang cocok dengan pencarian" : "Tidak ada teman untuk dinilai"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 p-2">
              {paginatedMembers.map((member, idx) => {
                // Get the current value from the answers array
                const originalFilteredIndex = filteredMembers.findIndex(m => m.id === member.id)
                const currentValue = answers[currentStatement]?.[originalFilteredIndex]

                return (
                  <div key={member.id} className="rounded-lg border p-4 flex flex-col gap-3 bg-muted/40 hover:bg-muted/60 transition-colors">
                    <div className="font-semibold text-foreground text-base">{member.name}</div>
                    <RadioGroup
                      value={currentValue != null ? String(currentValue) : ""}
                      onValueChange={val => handleChange(idx, Number(val))}
                      disabled={readOnly}
                      className="flex flex-row gap-2 justify-between items-center"
                      name={`peer-${currentStatement}-${idx}`}
                    >
                      {SCALE.map((scale) => (
                        <label
                          key={scale.value}
                          className={`flex-1 flex flex-col items-center cursor-pointer select-none p-2 rounded-lg transition-colors ${
                            currentValue === scale.value
                              ? "font-bold text-primary bg-primary/10 border border-primary/30"
                              : "text-foreground hover:bg-muted/50"
                          }`}
                        >
                          <RadioGroupItem
                            value={String(scale.value)}
                            disabled={readOnly}
                            className={`mb-2 size-5 border-2 transition-colors duration-150 ${
                              currentValue === scale.value
                                ? "border-primary ring-2 ring-primary/30"
                                : "border-gray-300"
                            }`}
                          />
                          <span className={`text-xs text-center font-medium ${
                            currentValue === scale.value ? "text-primary" : ""
                          }`}>
                            {scale.label}
                          </span>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredMembersWithSearch.length)} dari {filteredMembersWithSearch.length} teman
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
          <Button
            variant="outline"
            disabled={currentStatement === 0}
            onClick={() => setCurrentStatement(currentStatement - 1)}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            {currentStatement + 1} dari {statements.length} pertanyaan
            {filteredMembersWithSearch.length > 0 && ` • ${filteredMembersWithSearch.length} teman`}
          </div>
          {currentStatement < statements.length - 1 ? (
            <Button
              onClick={() => setCurrentStatement(currentStatement + 1)}
              disabled={loading}
            >
              Next Question
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