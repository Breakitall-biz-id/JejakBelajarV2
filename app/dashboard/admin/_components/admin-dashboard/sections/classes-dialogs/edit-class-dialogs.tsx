"use client"

import { useMemo } from "react"

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
  const defaultValues = useMemo<ClassWizardValues>(
    () => ({
      name: kelas.name,
      termId: kelas.academicTermId,
      teacherIds: kelas.teacherIds,
      studentIds: kelas.studentIds,
    }),
    [kelas],
  )

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit kelas</DialogTitle>
        </DialogHeader>
        <ClassWizardForm
          mode="edit"
          defaultValues={defaultValues}
          termOptions={termOptions}
          teacherOptions={teacherOptions}
          studentOptions={studentOptions}
          submitLabel="Simpan perubahan"
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
