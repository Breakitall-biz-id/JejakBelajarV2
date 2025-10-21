"use client"

import { useMemo, useState } from "react"

import type { ClassWizardValues } from "@/app/dashboard/admin/classroom-schemas"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import type { Kelas } from "../classes-table"
import { ClassWizardForm } from "./class-wizard-form"
import type { Option, ParticipantOption } from "./types"

type EditKelasDialogProps = {
  open: boolean
  kelas: Kelas
  termOptions: Option[]
  teacherOptions: ParticipantOption[]
  studentOptions: ParticipantOption[]
  onClose: () => void
  onSubmit: (values: ClassWizardValues) => Promise<boolean>
}

export function EditKelasDialog({
  open,
  kelas,
  termOptions,
  teacherOptions,
  studentOptions,
  onClose,
  onSubmit,
}: EditKelasDialogProps) {
  const [currentStep, setCurrentStep] = useState(1)

  const defaultValues = useMemo<ClassWizardValues>(
    () => ({
      name: kelas.name,
      termId: kelas.academicTermId,
      teacherIds: kelas.teacherIds,
      studentIds: kelas.studentIds,
    }),
    [kelas],
  )

  // Dynamic modal width based on content and current step
  const modalWidth = useMemo(() => {
    const isStudentsStep = currentStep === 3
    const hasSelectedItems = kelas.studentIds.length > 0

    // Base width based on total options
    let baseWidth = studentOptions.length > 100 ? 'max-w-7xl' :
                    studentOptions.length > 50 ? 'max-w-6xl' :
                    studentOptions.length > 20 ? 'max-w-5xl' : 'max-w-4xl'

    // Expand width if many students are selected and we're on students step
    if (isStudentsStep && hasSelectedItems && kelas.studentIds.length > 30) {
      baseWidth = 'max-w-7xl'
    } else if (isStudentsStep && hasSelectedItems && kelas.studentIds.length > 15) {
      baseWidth = 'max-w-7xl'
    }

    // Shrink for other steps
    if (!isStudentsStep) {
      baseWidth = 'max-w-7xl'
    }

    return `${baseWidth} lg:${baseWidth} md:max-w-7xl max-w-[95vw]`
  }, [studentOptions.length, currentStep, kelas.studentIds.length])

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className={`${modalWidth} max-h-[90vh] p-0 overflow-hidden`}>
        <div className="bg-card">
          <div className="px-6 pt-6 pb-2 border-b border-muted/60">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold tracking-tight mb-1">Edit Kelas</DialogTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Step {currentStep} dari 3</span>
                <span>•</span>
                <span>{studentOptions.length} siswa tersedia</span>
                {kelas.studentIds.length > 0 && (
                  <>
                    <span>•</span>
                    <span>{kelas.studentIds.length} terpilih</span>
                  </>
                )}
              </div>
            </DialogHeader>
          </div>
          <div className="px-6 py-6 max-h-[calc(90vh-120px)] overflow-y-auto">
            <ClassWizardForm
              mode="edit"
              defaultValues={defaultValues}
              termOptions={termOptions}
              teacherOptions={teacherOptions}
              studentOptions={studentOptions}
              submitLabel="Simpan perubahan"
              onSubmit={onSubmit}
              onCancel={onClose}
              onStepChange={setCurrentStep}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
