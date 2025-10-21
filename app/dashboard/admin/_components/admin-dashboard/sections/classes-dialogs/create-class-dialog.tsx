"use client"

import { useMemo, useState } from "react"
import { Plus } from "lucide-react"

import type { ClassWizardValues } from "@/app/dashboard/admin/classroom-schemas"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { ClassWizardForm } from "./class-wizard-form"
import type { Option, ParticipantOption } from "./types"

type CreateKelasDialogProps = {
  termOptions: Option[]
  teacherOptions: ParticipantOption[]
  studentOptions: ParticipantOption[]
  defaultValues: ClassWizardValues
  disabled?: boolean
  onSubmit: (values: ClassWizardValues) => Promise<boolean>
}

export function CreateKelasDialog({
  termOptions,
  teacherOptions,
  studentOptions,
  defaultValues,
  disabled,
  onSubmit,
}: CreateKelasDialogProps) {
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  // Dynamic modal width based on content and current step
  const modalWidth = useMemo(() => {
    const isStudentsStep = currentStep === 3

    // Base width based on total options
    let baseWidth = studentOptions.length > 100 ? 'max-w-7xl' :
                    studentOptions.length > 50 ? 'max-w-6xl' :
                    studentOptions.length > 20 ? 'max-w-5xl' : 'max-w-4xl'

    // Expand for students step
    if (isStudentsStep) {
      baseWidth = studentOptions.length > 50 ? 'max-w-7xl' :
                  studentOptions.length > 20 ? 'max-w-6xl' : 'max-w-5xl'
    }

    // Shrink for other steps
    if (!isStudentsStep) {
      baseWidth = 'max-w-4xl'
    }

    return `${baseWidth} lg:${baseWidth} md:max-w-3xl max-w-[95vw]`
  }, [studentOptions.length, currentStep])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={disabled}>
          Tambah kelas
          <Plus className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className={`${modalWidth} max-h-[90vh] p-0 overflow-hidden`}>
        <div className="bg-card">
          <div className="px-6 pt-6 pb-2 border-b border-muted/60">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold tracking-tight mb-1">Tambah Kelas</DialogTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Step {currentStep} dari 3</span>
                <span>•</span>
                <span>{studentOptions.length} siswa tersedia</span>
              </div>
            </DialogHeader>
          </div>
          <div className="px-6 py-6 max-h-[calc(90vh-120px)] overflow-y-auto">
            <ClassWizardForm
              mode="create"
              defaultValues={defaultValues}
              termOptions={termOptions}
              teacherOptions={teacherOptions}
              studentOptions={studentOptions}
              onSubmit={onSubmit}
              onCancel={() => setOpen(false)}
              onStepChange={setCurrentStep}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
