import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, Clock } from "lucide-react"

export type JournalAssessmentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  prompts?: string[]
  initialValue?: string[]
  loading?: boolean
  title?: string
  readOnly?: boolean
  // Old submit function for backward compatibility
  onSubmit?: (answers: string[]) => void
  // New individual submission functions
  projectId?: string
  stageId?: string
  submissionStatus?: Array<{
    questionIndex: number
    isSubmitted: boolean
    submittedAt?: string
    answer?: string
  }>
  onIndividualSubmit?: (questionIndex: number, answer: string) => Promise<void>
  onRefreshStatus?: () => Promise<void>
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
  projectId,
  stageId,
  submissionStatus,
  onIndividualSubmit,
  onRefreshStatus,
}: JournalAssessmentDialogProps) {
  // Determine if we're using individual submission mode
  const useIndividualSubmission = !!(projectId && stageId && onIndividualSubmit)

  // Multi-prompt support: answers[index] for each prompt
  const [answers, setAnswers] = React.useState<string[]>(initialValue || prompts.map(() => ""))
  const [currentPrompt, setCurrentPrompt] = React.useState(0)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (useIndividualSubmission && submissionStatus) {
      // Initialize answers from submission status for individual submission mode
      const initializedAnswers = prompts.map((_, index) => {
        const status = submissionStatus.find(s => s.questionIndex === index)
        return status?.answer || ""
      })
      setAnswers(initializedAnswers)
    } else {
      setAnswers(initialValue || prompts.map(() => ""))
    }
    setCurrentPrompt(0)
  }, [initialValue, prompts.length, open, submissionStatus, useIndividualSubmission])

  const allAnswered = answers.length === prompts.length && answers.every(a => a.trim().length > 0)

  // Get current question status
  const currentQuestionStatus = submissionStatus?.find(s => s.questionIndex === currentPrompt)
  const isCurrentSubmitted = currentQuestionStatus?.isSubmitted || false

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
      if (onSubmit) {
        await onSubmit(answers)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleIndividualSubmit = async () => {
    setError(null)
    if (!answers[currentPrompt].trim()) {
      setError("Harap isi jawaban sebelum menyimpan.")
      return
    }
    setIsSubmitting(true)
    try {
      if (onIndividualSubmit) {
        await onIndividualSubmit(currentPrompt, answers[currentPrompt])
      }
      if (onRefreshStatus) {
        await onRefreshStatus()
      }
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
        {/* Progress indicator for individual submissions */}
        {useIndividualSubmission && (
          <div className="flex gap-2 mb-4">
            {prompts.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  submissionStatus?.find(s => s.questionIndex === index)?.isSubmitted
                    ? 'bg-green-500'
                    : index === currentPrompt
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        )}
        <div className="flex flex-col gap-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-foreground text-center flex-1" dangerouslySetInnerHTML={{ __html: prompts[currentPrompt] }} />
            {useIndividualSubmission && (
              <div className="ml-4">
                {isCurrentSubmitted ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs">Terkirim</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-orange-600">
                    <Circle className="h-4 w-4" />
                    <span className="text-xs">Belum dikirim</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <Textarea
            value={answers[currentPrompt]}
            onChange={e => handleChange(e.target.value)}
            rows={8}
            placeholder="Tuliskan jawaban Anda di sini..."
            className="resize-none"
            disabled={readOnly || (useIndividualSubmission && isCurrentSubmitted)}
          />
        </div>
        {error && <p className="px-6 text-sm text-red-500">{error}</p>}
        <DialogFooter className="flex justify-between">
          <Button variant="outline" disabled={currentPrompt === 0} onClick={() => setCurrentPrompt(currentPrompt - 1)}>
            Previous
          </Button>
          {currentPrompt < prompts.length - 1 ? (
            <Button
              onClick={() => setCurrentPrompt(currentPrompt + 1)}
              disabled={loading || (useIndividualSubmission && !answers[currentPrompt].trim())}
            >
              Next Question
            </Button>
          ) : useIndividualSubmission ? (
            <Button
              onClick={handleIndividualSubmit}
              disabled={loading || !answers[currentPrompt].trim() || readOnly || isCurrentSubmitted}
            >
              {isSubmitting ? "Menyimpan..." : isCurrentSubmitted ? "Sudah Dikirim" : "Kirim Jawaban"}
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
