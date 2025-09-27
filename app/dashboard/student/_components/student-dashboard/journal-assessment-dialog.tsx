import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export type JournalAssessmentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  prompts?: string[]
  initialValue?: string[]
  loading?: boolean
  title?: string
  readOnly?: boolean
  onSubmit: (answers: string[]) => void
}

export function JournalAssessmentDialog({
  open,
  onOpenChange,
  prompts = ["Tuliskan refleksi Anda tentang pembelajaran hari ini."],
  initialValue,
  loading,
  title,
  readOnly,
  onSubmit,
}: JournalAssessmentDialogProps) {
  // Multi-prompt support: answers[index] for each prompt
  const [answers, setAnswers] = React.useState<string[]>(initialValue || prompts.map(() => ""))
  const [currentPrompt, setCurrentPrompt] = React.useState(0)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setAnswers(initialValue || prompts.map(() => ""))
    setCurrentPrompt(0) // Reset currentPrompt when dialog opens or parameters change
  }, [initialValue, prompts.length, open])

  const allAnswered = answers.length === prompts.length && answers.every(a => a.trim().length > 0)

  const handleChange = (val: string) => {
    if (!readOnly) {
      setAnswers(ans => {
        const newAnswers = [...ans]
        newAnswers[currentPrompt] = val
        return newAnswers
      })
    }
  }

  const handleSubmit = async () => {
    setError(null)
    if (!allAnswered) {
      setError("Harap isi semua jawaban sebelum menyimpan.")
      return
    }
    setIsSubmitting(true)
    try {
      await onSubmit(answers)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" key="journal-assessment-dialog"> 
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-center">
            {title || "Jurnal Refleksi"}
          </DialogTitle>
        </DialogHeader>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((currentPrompt + 1) / prompts.length) * 100}%` }}
          ></div>
        </div>
        <div className="flex flex-col gap-6 py-4">
          <div className="text-lg font-semibold text-foreground text-center" dangerouslySetInnerHTML={{ __html: prompts[currentPrompt] }} />
          <Textarea
            value={answers[currentPrompt]}
            onChange={e => handleChange(e.target.value)}
            rows={8}
            placeholder="Tuliskan jawaban Anda di sini..."
            className="resize-none"
            disabled={readOnly}
          />
        </div>
        {error && <p className="px-6 text-sm text-red-500">{error}</p>}
        <DialogFooter className="flex justify-between">
          <Button variant="outline" disabled={currentPrompt === 0} onClick={() => setCurrentPrompt(currentPrompt - 1)}>
            Previous
          </Button>
          {currentPrompt < prompts.length - 1 ? (
            <Button onClick={() => setCurrentPrompt(currentPrompt + 1)} disabled={loading}>
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
