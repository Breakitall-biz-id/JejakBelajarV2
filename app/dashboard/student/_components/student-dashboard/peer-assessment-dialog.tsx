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
  initialValue?: number[]
  loading?: boolean
  currentUserId?: string | null
  title?: string
  readOnly?: boolean
  stageId: string
  projectId: string
  instrumentType: "PEER_ASSESSMENT"
  onSubmitSuccess?: () => void
  prompt?: string
}

export function PeerAssessmentDialog({
  open,
  onOpenChange,
  members,
  initialValue,
  loading,
  currentUserId,
  title,
  readOnly,
  stageId,
  projectId,
  instrumentType,
  onSubmitSuccess,
  prompt,
}: PeerAssessmentDialogProps) {
  // Filter out self from members
  const filteredMembers = React.useMemo(() => {
    if (!currentUserId) return members
    return members.filter((m) => m.id !== currentUserId)
  }, [members, currentUserId])

  const [answers, setAnswers] = React.useState<number[]>(initialValue || Array(filteredMembers.length).fill(0))
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setAnswers(initialValue || Array(filteredMembers.length).fill(0))
  }, [initialValue, filteredMembers.length, open])

  const allAnswered = answers.length === filteredMembers.length && answers.every((a) => a > 0)

  const handleChange = (idx: number, value: number) => {
    if (!readOnly) {
      setAnswers((ans) => ans.map((a, i) => (i === idx ? value : a)))
    }
  }

  const handleSubmit = async () => {
    setError(null)
    if (answers.length !== filteredMembers.length || answers.some((v) => !v)) {
      setError("Harap nilai semua teman kelompok sebelum menyimpan.")
      return
    }
    setIsSubmitting(true)
    try {
      // Submit one by one for each peer
      for (let i = 0; i < filteredMembers.length; i++) {
        const member = filteredMembers[i]
        const answer = answers[i]
        const content = { answers: [answer] }
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-center">
            {title || "Peer Assessment"}
          </DialogTitle>
        </DialogHeader>

        {prompt && <div className="text-base text-center mb-2">{prompt}</div>}

        <div className="flex flex-col gap-4 py-2">
          {filteredMembers.map((member, idx) => (
            <div key={member.id} className="rounded-lg border p-3 flex flex-col gap-2 bg-muted/40">
              <div className="font-semibold text-foreground text-base mb-1">{member.name}</div>
                <RadioGroup
                  value={answers[idx] ? String(answers[idx]) : undefined}
                  onValueChange={val => handleChange(idx, Number(val))}
                  disabled={readOnly}
                  className="flex flex-row gap-4 justify-between"
                  name={`peer-${idx}`}
                >
                  {SCALE.map((scale) => (
                    <label
                      key={scale.value}
                      className={`flex-1 flex flex-col items-center cursor-pointer select-none ${
                        answers[idx] === scale.value ? "font-bold text-primary" : "text-foreground"
                      }`}
                    >
                      <RadioGroupItem
                        value={String(scale.value)}
                        disabled={readOnly}
                        className={
                          `mb-2 size-5 border-2 transition-colors duration-150 ` +
                          (answers[idx] === scale.value
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-gray-300")
                        }
                      />
                      <span className={`text-xs ${answers[idx] === scale.value ? "font-medium text-primary" : ""}`}>{scale.label}</span>
                    </label>
                  ))}
                </RadioGroup>
            </div>
          ))}
        </div>

        {error && <p className="px-6 text-sm text-red-500">{error}</p>}

        <DialogFooter className="flex justify-end">
          <Button onClick={handleSubmit} disabled={loading || !allAnswered || readOnly}>
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
