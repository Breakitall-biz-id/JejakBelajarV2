"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"

import {
  createClassroom,
  updateClassroom,
  deleteClassroom,
} from "../../../actions"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { ClassesTable, type Kelas } from "./classes-table"
import { CreateKelasDialog } from "./classes-dialogs/create-class-dialog"
import { EditKelasDialog } from "./classes-dialogs/edit-class-dialogs"
import type { ClassWizardValues } from "@/app/dashboard/admin/classroom-schemas"
import type {
  Option,
  ParticipantOption,
} from "./classes-dialogs/types"

type ClassesSectionProps = {
  classes: Array<{
    id: string
    name: string
    termId: string
    termYear: string
    termSemester: string
    termStatus: string
    createdAt: string
  }>
  terms: Array<{
    id: string
    academicYear: string
    semester: string
    status: string
    startsAt: string | null
    endsAt: string | null
    createdAt: string
  }>
  teachers: Array<{
    id: string
    name: string | null
    email: string
    createdAt: string
  }>
  students: Array<{
    id: string
    name: string | null
    email: string
    createdAt: string
  }>
  assignments: Record<string, { teacherIds: string[]; studentIds: string[] }>
}

export function ClassesSection({ classes, terms, teachers, students, assignments }: ClassesSectionProps) {
  const termOptions = useMemo<Option[]>(() => {
    return terms.map((term) => ({
      id: term.id,
      label: `${term.academicYear} • Semester ${term.semester === "ODD" ? "Ganjil" : "Genap"}`,
    }))
  }, [terms])

  const termLabelMap = useMemo(() => new Map(termOptions.map((option) => [option.id, option.label])), [termOptions])

  const teacherOptions = useMemo<ParticipantOption[]>(
    () => teachers.map((teacher) => ({ id: teacher.id, name: teacher.name, email: teacher.email })),
    [teachers],
  )
  const studentOptions = useMemo<ParticipantOption[]>(
    () => students.map((student) => ({ id: student.id, name: student.name, email: student.email })),
    [students],
  )

  const teacherMap = useMemo(
    () => new Map(teacherOptions.map((teacher) => [teacher.id, teacher])),
    [teacherOptions],
  )
  const studentMap = useMemo(
    () => new Map(studentOptions.map((student) => [student.id, student])),
    [studentOptions],
  )

  const kelasData: Kelas[] = useMemo(() => {
    return classes.map((kelas) => {
      const assignment = assignments[kelas.id] ?? { teacherIds: [], studentIds: [] }
      const teachersDetailed = assignment.teacherIds
        .map((teacherId) => teacherMap.get(teacherId))
        .filter((value): value is ParticipantOption => Boolean(value))
      const studentsDetailed = assignment.studentIds
        .map((studentId) => studentMap.get(studentId))
        .filter((value): value is ParticipantOption => Boolean(value))

      return {
        id: kelas.id,
        name: kelas.name,
        academicTermId: kelas.termId,
        termLabel: termLabelMap.get(kelas.termId) ?? "Belum ditautkan",
        termStatus: kelas.termStatus,
        createdAt: kelas.createdAt,
        teacherIds: assignment.teacherIds,
        studentIds: assignment.studentIds,
        teachers: teachersDetailed,
        students: studentsDetailed,
      }
    })
  }, [classes, assignments, teacherMap, studentMap, termLabelMap])

  const [editTarget, setEditTarget] = useState<Kelas | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Kelas | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeletePending, setIsDeletePending] = useState(false)

  const activeTermId = useMemo(() => {
    const active = terms.find((term) => term.status === "ACTIVE")
    return active?.id ?? termOptions[0]?.id ?? ""
  }, [terms, termOptions])

  const createDefaultValues = useMemo<ClassWizardValues>(
    () => ({
      name: "",
      termId: activeTermId,
      teacherIds: [],
      studentIds: [],
    }),
    [activeTermId],
  )

  const handleCreate = async (values: ClassWizardValues) => {
    const result = await createClassroom(values)
    if (!result.success) {
      toast.error(result.error)
      return false
    }
    toast.success("Kelas berhasil dibuat dan anggota sudah ditautkan.")
    return true
  }

  const handleUpdate = async (values: ClassWizardValues) => {
    if (!editTarget) return false
    const result = await updateClassroom({ id: editTarget.id, ...values })
    if (!result.success) {
      toast.error(result.error)
      return false
    }
    toast.success("Perubahan kelas berhasil disimpan.")
    return true
  }

  const handleDeleteClick = (kelas: Kelas) => {
    setDeleteTarget(kelas)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setIsDeletePending(true)
    const result = await deleteClassroom({ classId: deleteTarget.id })
    setIsDeletePending(false)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success(`Kelas ${deleteTarget.name} berhasil dihapus.`)
    setDeleteTarget(null)
    setIsDeleteOpen(false)
  }

  const teacherEmpty = teacherOptions.length === 0
  const studentEmpty = studentOptions.length === 0

  return (
    <Card>
      <CardHeader className="flex flex-wrap justify-between gap-4">
        <div>
          <CardTitle>Daftar Kelas</CardTitle>
          <CardDescription>
            Kelola kelas, hubungkan ke tahun ajaran aktif, dan pastikan guru serta siswa sudah ditautkan.
          </CardDescription>
        </div>
        <CreateKelasDialog
          termOptions={termOptions}
          teacherOptions={teacherOptions}
          studentOptions={studentOptions}
          defaultValues={createDefaultValues}
          disabled={termOptions.length === 0 || teacherEmpty || studentEmpty}
          onSubmit={handleCreate}
        />
      </CardHeader>
      <CardContent className="space-y-4">
        <ClassesTable data={kelasData} onEdit={setEditTarget} onDelete={handleDeleteClick} />

        {editTarget && (
          <EditKelasDialog
            open={Boolean(editTarget)}
            kelas={editTarget}
            termOptions={termOptions}
            teacherOptions={teacherOptions}
            studentOptions={studentOptions}
            onClose={() => setEditTarget(null)}
            onSubmit={handleUpdate}
          />
        )}

        <AlertDialog
          open={isDeleteOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsDeleteOpen(false)
              setDeleteTarget(null)
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus kelas?</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteTarget ? (
                  <span>
                    Kelas <strong>{deleteTarget.name}</strong> dan semua penugasan guru & siswa akan dilepas. Tindakan ini tidak dapat
                    dibatalkan.
                  </span>
                ) : (
                  "Tindakan ini tidak dapat dibatalkan."
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeletePending}>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeletePending} className="bg-destructive text-white hover:bg-destructive/90">
                {isDeletePending ? "Menghapus…" : "Hapus"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {(termOptions.length === 0 || teacherEmpty || studentEmpty) && (
          <p className="text-sm text-muted-foreground">
            Pastikan tahun ajaran aktif tersedia serta akun guru dan siswa sudah dibuat sebelum menambahkan kelas baru.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
