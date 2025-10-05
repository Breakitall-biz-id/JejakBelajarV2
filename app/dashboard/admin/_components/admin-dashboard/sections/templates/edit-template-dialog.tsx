"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { updateTemplate } from "@/app/dashboard/admin/actions"
import { ProjectTemplate } from "@/app/dashboard/admin/queries"
import { TemplateWizard } from "./components/template-wizard"
import { transformTemplateToFormData } from "./hooks/useTemplateDataTransform"
import { TemplateFormData } from "./types"

type EditTemplateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  template: ProjectTemplate | null
}

export function EditTemplateDialog({
  open,
  onOpenChange,
  onSuccess,
  template,
}: EditTemplateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [initialData, setInitialData] = useState<Partial<TemplateFormData> | null>(null)

  useEffect(() => {
    if (template && open) {
      const transformedData = transformTemplateToFormData(template)
      setInitialData(transformedData)
    } else {
      setInitialData(null)
    }
  }, [template, open])

  const onSubmit = async (values: TemplateFormData) => {
    if (!template) return

    setIsSubmitting(true)
    try {
      // Transform stageConfigs to flat array for backend, preserving configIds for existing instruments
      // Backend will handle displayOrder sequentially
      const flatStageConfigs = values.stageConfigs.flatMap((stage) =>
        stage.instruments.map((instrument) => ({
          stageName: stage.stageName,
          instrumentType: instrument.instrumentType,
          description: instrument.description || stage.description || "",
          estimatedDuration: stage.estimatedDuration || "",
          id: instrument.configId, // ✅ Preserve existing configId to maintain questions
        }))
      )
      const payload = {
        templateId: template.id,
        templateName: values.templateName,
        description: values.description,
        stageConfigs: flatStageConfigs,
      }
      const result = await updateTemplate(payload)
      if (!result.success) {
        toast.error(result.error || "Gagal memperbarui template")
        return
      }
      toast.success("Template berhasil diperbarui!")
      onSuccess()
    } catch (e) {
      toast.error("Gagal memperbarui template")
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
              <DialogTitle className="text-xl font-bold">
                Edit Template
              </DialogTitle>
              <DialogDescription>
                Ubah konfigurasi dan tahapan penilaian template proyek
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="h-[600px]">
            {initialData && (
              <TemplateWizard
                onSubmit={onSubmit}
                onCancel={handleCancel}
                initialData={initialData}
                submitButtonText="Update Template"
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
