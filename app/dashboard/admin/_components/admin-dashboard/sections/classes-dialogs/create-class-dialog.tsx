"use client"

import { useState } from "react"
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={disabled}>
          Tambah kelas
          <Plus className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Buat kelas baru</DialogTitle>
          <DialogDescription>
            Lengkapi detail kelas lalu hubungkan minimal satu guru dan siswa sebelum disimpan.
          </DialogDescription>
        </DialogHeader>
        <ClassWizardForm
          mode="create"
          defaultValues={defaultValues}
          termOptions={termOptions}
          teacherOptions={teacherOptions}
          studentOptions={studentOptions}
          onSubmit={onSubmit}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
