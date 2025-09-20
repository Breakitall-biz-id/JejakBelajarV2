import { z } from "zod"

const nameSchema = z.string().trim().min(1, "Nama kelas wajib diisi").max(255)
const termIdSchema = z.string().uuid({ message: "Tahun ajaran wajib dipilih" })
const teacherIdsSchema = z
  .array(z.string().uuid())
  .nonempty("Pilih minimal satu guru untuk kelas ini")
const studentIdsSchema = z
  .array(z.string().uuid())
  .nonempty("Tambahkan minimal satu siswa ke kelas ini")

export const classWizardSchema = z.object({
  name: nameSchema,
  termId: termIdSchema,
  teacherIds: teacherIdsSchema,
  studentIds: studentIdsSchema,
})

export const createClassroomSchema = classWizardSchema

export const updateClassroomSchema = classWizardSchema.extend({
  id: z.string().uuid(),
})

export type ClassWizardValues = z.infer<typeof classWizardSchema>
export type CreateClassroomValues = z.infer<typeof createClassroomSchema>
export type UpdateClassroomValues = z.infer<typeof updateClassroomSchema>
