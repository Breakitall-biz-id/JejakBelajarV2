"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StudentsTable, Student } from "./students-table";
import { EditStudentDialog } from "./students-dialogs/edit-student-dialog";
import { CreateStudentDialog } from "./students-dialogs/create-student-dialog";
import { deleteAccount } from "@/app/dashboard/admin/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export interface StudentsSectionProps {
  students: Student[];
}


export function StudentsSection({ students: initialStudents }: StudentsSectionProps) {
  const [editStudent, setEditStudent] = React.useState<Student | null>(null);
  const router = useRouter();

  const handleEdit = (student: Student) => setEditStudent(student);

  const handleDelete = async (student: Student) => {
    const result = await deleteAccount({ userId: student.id });
    if (!result.success) {
      toast.error(result.error || "Gagal menghapus siswa.");
      return;
    }
    toast.success("Siswa berhasil dihapus.");
    router.refresh();
  };

  // Toggle active: not implemented, as status is not in backend yet

  return (
    <Card>
      <CardHeader className="flex flex-wrap justify-between gap-4">
        <div>
          <CardTitle>Daftar Siswa</CardTitle>
          <CardDescription>Kelola data siswa di sekolah.</CardDescription>
        </div>
        <CreateStudentDialog onSuccess={() => {}} />
      </CardHeader>
      <CardContent className="space-y-4">
        <StudentsTable
          data={initialStudents}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={() => {}}
        />
        {editStudent && (
          <EditStudentDialog
            student={{
              id: editStudent.id,
              nama: editStudent.nama,
              email: editStudent.email,
              aktif: editStudent.status === "aktif",
            }}
            open={!!editStudent}
            onOpenChange={(open) => !open && setEditStudent(null)}
            onSuccess={(values) => handleEditSave(values)}
          />
        )}
      </CardContent>
    </Card>
  );
}
