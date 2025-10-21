"use client"

import React, { useState } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type CreateJournalRubricDialogProps = {
  configId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

type Dimension = {
  id: string
  name: string
  description: string | null
}

export function CreateJournalRubricDialog({
  configId,
  open,
  onOpenChange,
  onSuccess
}: CreateJournalRubricDialogProps) {
  const [indicatorText, setIndicatorText] = useState("")
  const [criteria, setCriteria] = useState({
    "4": "",
    "3": "",
    "2": "",
    "1": ""
  })
  const [dimensionId, setDimensionId] = useState("no-dimension")
  const [dimensions, setDimensions] = useState<Dimension[]>([])
  const [isLoadingDimensions, setIsLoadingDimensions] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch dimensions when dialog opens
  React.useEffect(() => {
    if (open) {
      fetchDimensions()
    }
  }, [open])

  const fetchDimensions = async () => {
    setIsLoadingDimensions(true)
    try {
      const response = await fetch('/api/admin/dimensions')
      if (response.ok) {
        const data = await response.json()
        setDimensions(data.data || [])
      } else {
        console.error('Error fetching dimensions')
      }
    } catch (error) {
      console.error('Error fetching dimensions:', error)
    } finally {
      setIsLoadingDimensions(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!indicatorText.trim()) {
      alert("Teks indikator wajib diisi")
      return
    }

    // Validate that all criteria have descriptions
    if (Object.values(criteria).some(desc => !desc.trim())) {
      alert("Semua kriteria skor harus memiliki deskripsi")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/templates/journal-rubrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          configId,
          indicatorText,
          criteria,
          dimensionId: dimensionId === "no-dimension" ? null : dimensionId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create rubric')
      }

      onSuccess()
    } catch (error) {
      console.error('Error creating rubric:', error)
      alert('Gagal membuat rubrik')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setIndicatorText("")
      setCriteria({
        "4": "",
        "3": "",
        "2": "",
        "1": ""
      })
      setDimensionId("no-dimension")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Journal Rubric</DialogTitle>
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

          <div className="space-y-2">
            <Label htmlFor="dimension">Dimension</Label>
            <Select value={dimensionId} onValueChange={setDimensionId} disabled={isLoadingDimensions}>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingDimensions ? "Memuat dimensi..." : "Pilih dimensi penilaian"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-dimension">Tidak ada dimensi</SelectItem>
                {dimensions.map((dimension) => (
                  <SelectItem key={dimension.id} value={dimension.id}>
                    {dimension.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Membuat..." : "Buat Rubrik"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}