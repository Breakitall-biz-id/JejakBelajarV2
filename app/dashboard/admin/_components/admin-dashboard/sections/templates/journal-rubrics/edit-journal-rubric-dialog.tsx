"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

type JournalRubric = {
  id: string
  indicatorText: string
  criteria: { [score: string]: string }
  createdAt: string
}

type EditJournalRubricDialogProps = {
  rubric: JournalRubric
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditJournalRubricDialog({
  rubric,
  open,
  onOpenChange,
  onSuccess
}: EditJournalRubricDialogProps) {
  const [indicatorText, setIndicatorText] = useState("")
  const [criteria, setCriteria] = useState({
    "4": "",
    "3": "",
    "2": "",
    "1": ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (rubric && open) {
      setIndicatorText(rubric.indicatorText)
      setCriteria(rubric.criteria as {"4": string; "3": string; "2": string; "1": string})
    }
  }, [rubric, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!indicatorText.trim()) {
      alert("Indicator text is required")
      return
    }

    // Validate that all criteria have descriptions
    if (Object.values(criteria).some(desc => !desc.trim())) {
      alert("All score criteria must have descriptions")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/templates/journal-rubrics/${rubric.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          indicatorText,
          criteria
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update rubric')
      }

      onSuccess()
    } catch (error) {
      console.error('Error updating rubric:', error)
      alert('Failed to update rubric')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Journal Rubric</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="indicator">Indicator Text</Label>
            <Textarea
              id="indicator"
              placeholder="e.g., Mengajukan pertanyaan terbuka..."
              value={indicatorText}
              onChange={(e) => setIndicatorText(e.target.value)}
              rows={2}
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Scoring Criteria</Label>
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(criteria).map(([score, description]) => (
                <div key={score} className="flex items-start gap-3">
                  <div className="flex items-center gap-2 min-w-[80px]">
                    <span className="font-medium text-sm bg-primary/10 px-2 py-1 rounded text-center">
                      Score {score}
                    </span>
                  </div>
                  <div className="flex-1">
                    <Textarea
                      placeholder={`Description for score ${score}...`}
                      value={description}
                      onChange={(e) => setCriteria(prev => ({
                        ...prev,
                        [score]: e.target.value
                      }))}
                      rows={2}
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Rubric"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}