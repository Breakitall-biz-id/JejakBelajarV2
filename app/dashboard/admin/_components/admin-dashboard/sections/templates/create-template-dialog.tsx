"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { createTemplate } from "@/app/dashboard/admin/actions"
import { TemplateWizard } from "./components/template-wizard"
import { TemplateFormData } from "./types"

type CreateTemplateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateTemplateDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateTemplateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (values: TemplateFormData) => {
    setIsSubmitting(true)
    try {
      // Backend will handle displayOrder sequentially
      const transformedData = {
        templateName: values.templateName,
        description: values.description,
        stageConfigs: values.stageConfigs.flatMap((stage) =>
          stage.instruments.map((instrument) => ({
            stageName: stage.stageName,
            instrumentType: instrument.instrumentType,
            description: instrument.description || stage.description || "",
            estimatedDuration: stage.estimatedDuration || "",
          }))
        ),
      }

      const result = await createTemplate(transformedData)
      if (!result.success) {
        toast.error(result.error || "Gagal membuat template")
        return
      }

      toast.success("Template berhasil dibuat!")
      onSuccess()
    } catch (err) {
      toast.error("Gagal membuat template")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl p-0 overflow-hidden">
        <div className="bg-card">
          <div className="px-6 pt-6 pb-2 border-b border-muted/60">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Buat Template Baru</DialogTitle>
              <DialogDescription>
                Atur template proyek untuk digunakan guru dalam PjBL
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="h-[600px]">
            <TemplateWizard
              onSubmit={onSubmit}
              onCancel={handleCancel}
              submitButtonText="Buat Template"
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
