"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { submitStageInstrument } from "../../actions"
import { toast } from "sonner"

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

  React.useEffect(() => {
    if (!open) return
    
    const newAnswers = initialValue && initialValue.length === statements.length
      ? initialValue.map(row => [...row])
      : Array.from({ length: statements.length }, () => 
          Array.from({ length: filteredMembers.length }, () => null)
        )
    
    setAnswers(newAnswers)
    setCurrentStatement(0)
  }, [open, initialValue, filteredMembers.length, statements.length])

  const allAnswered =
    answers.length === statements.length &&
    answers.every(row => row.length === filteredMembers.length && row.every(a => a != null && a > 0))

  const handleChange = (peerIdx: number, value: number) => {
    if (!readOnly) {
      setAnswers(ans => {
        const newAnswers = ans.map(row => [...row]);
        newAnswers[currentStatement][peerIdx] = value;
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
      <DialogContent className="max-w-lg" key="peer-assessment-dialog">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-center">
            {title || "Peer Assessment"}
          </DialogTitle>
        </DialogHeader>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((currentStatement + 1) / statements.length) * 100}%` }}
          ></div>
        </div>
        <div className="flex flex-col gap-6 py-4">
          <div className="text-lg font-semibold text-foreground text-center" dangerouslySetInnerHTML={{ __html: statements[currentStatement] }} />
          <div className="flex flex-col gap-4">
            {filteredMembers.map((member, idx) => (
              <div key={member.id} className="rounded-lg border p-3 flex flex-col gap-2 bg-muted/40">
                <div className="font-semibold text-foreground text-base mb-1">{member.name}</div>
                <RadioGroup
                  value={
                    answers[currentStatement]?.[idx] != null 
                      ? String(answers[currentStatement][idx]) 
                      : ""
                  }
                  onValueChange={val => handleChange(idx, Number(val))}
                  disabled={readOnly}
                  className="flex flex-row gap-4 justify-between"
                  name={`peer-${currentStatement}-${idx}`}
                >
                  {SCALE.map((scale) => (
                    <label
                      key={scale.value}
                      className={`flex-1 flex flex-col items-center cursor-pointer select-none ${
                        answers[currentStatement][idx] === scale.value ? "font-bold text-primary" : "text-foreground"
                      }`}
                    >
                      <RadioGroupItem
                        value={String(scale.value)}
                        disabled={readOnly}
                        className={
                          `mb-2 size-5 border-2 transition-colors duration-150 ` +
                          (answers[currentStatement][idx] === scale.value
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-gray-300")
                        }
                      />
                      <span className={`text-xs ${answers[currentStatement][idx] === scale.value ? "font-medium text-primary" : ""}`}>{scale.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </div>
        </div>
        {error && <p className="px-6 text-sm text-red-500">{error}</p>}
        <DialogFooter className="flex justify-between">
          <Button 
            variant="outline" 
            disabled={currentStatement === 0} 
            onClick={() => setCurrentStatement(currentStatement - 1)}
          >
            Previous
          </Button>
          {currentStatement < statements.length - 1 ? (
            <Button 
              onClick={() => setCurrentStatement(currentStatement + 1)} 
              disabled={loading}
            >
              Next Question
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