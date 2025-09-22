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

import { ClassesDataTable } from "./classes-data-table"
import type { Kelas } from "./classes-table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase()
  }
  return `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`.toUpperCase()
}
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

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

export function ClassesSection({ classes, terms, teachers, students, assignments }: ClassesSectionProps) {
  // Opsi tahun akademik untuk filter
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
  const [detailTarget, setDetailTarget] = useState<Kelas | null>(null)

  // Default: tahun akademik aktif
  const activeTermId = useMemo(() => {
    const active = terms.find((term) => term.status === "ACTIVE")
    return active?.id ?? termOptions[0]?.id ?? ""
  }, [terms, termOptions])

  // State filter select
  const [selectedTermId, setSelectedTermId] = useState<string>(activeTermId)

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
        {/* Filter tahun akademik */}
        <div className="flex items-center gap-2 mb-2">
          <Select
            value={selectedTermId}
            onValueChange={setSelectedTermId}
            defaultValue={activeTermId}
          >
            <SelectTrigger id="filter-term" className="min-w-[200px]">
              <SelectValue placeholder="Pilih tahun akademik" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Tahun</SelectItem>
              {termOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ClassesDataTable
          data={kelasData}
          onEdit={setEditTarget}
          onDelete={handleDeleteClick}
          onShowDetail={setDetailTarget}
          selectedTermId={selectedTermId}
        />
        {/* Modal Detail Kelas */}
        <Dialog open={!!detailTarget} onOpenChange={open => !open && setDetailTarget(null)}>
          <DialogContent className="max-w-xl p-0 overflow-hidden">
            {detailTarget && (
              <div className="bg-card">
                <div className="px-6 pt-6 pb-2 border-b border-muted/60">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold tracking-tight mb-1">{detailTarget.name}</DialogTitle>
                    <DialogDescription className="text-base text-muted-foreground mb-0">{detailTarget.termLabel}</DialogDescription>
                  </DialogHeader>
                </div>
                <div className="px-6 py-4 space-y-6">
                  <section>
                    <div className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wide">Guru Pengampu</div>
                    <div className="rounded-lg border bg-muted/40">
                      {detailTarget.teachers.length === 0 ? (
                        <div className="text-xs text-muted-foreground px-4 py-6 text-center">Belum ada guru yang ditautkan.</div>
                      ) : (
                        <ScrollArea className="max-h-32">
                          <ul className="divide-y divide-muted/60">
                            {detailTarget.teachers.map((teacher) => (
                              <li key={teacher.id} className="flex items-center gap-3 px-4 py-2">
                                <Avatar className="h-8 w-8 border">
                                  <AvatarFallback className="text-xs font-semibold uppercase">
                                    {getInitials(teacher.name?.trim() || teacher.email.split("@")[0])}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <div className="truncate text-sm font-medium leading-tight">{teacher.name || teacher.email.split("@")[0]}</div>
                                  <div className="truncate text-xs text-muted-foreground">{teacher.email}</div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </ScrollArea>
                      )}
                    </div>
                  </section>
                  <section>
                    <div className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wide">Siswa</div>
                    <div className="rounded-lg border bg-muted/40">
                      {detailTarget.students.length === 0 ? (
                        <div className="text-xs text-muted-foreground px-4 py-6 text-center">Belum ada siswa yang ditambahkan.</div>
                      ) : (
                        <ScrollArea className="max-h-40">
                          <ul className="divide-y divide-muted/60">
                            {detailTarget.students.map((student) => (
                              <li key={student.id} className="flex items-center gap-3 px-4 py-2">
                                <Avatar className="h-8 w-8 border">
                                  <AvatarFallback className="text-xs font-semibold uppercase">
                                    {getInitials(student.name?.trim() || student.email.split("@")[0])}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <div className="truncate text-sm font-medium leading-tight">{student.name || student.email.split("@")[0]}</div>
                                  <div className="truncate text-xs text-muted-foreground">{student.email}</div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </ScrollArea>
                      )}
                    </div>
                  </section>
                  <DialogClose asChild>
                    <button className="mt-2 w-full rounded-md bg-primary text-primary-foreground py-2 font-semibold hover:bg-primary/90 transition">Tutup</button>
                  </DialogClose>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

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
