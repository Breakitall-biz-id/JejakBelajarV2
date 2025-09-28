"use client";

import { useRouter } from "next/navigation";
import { TeachersTable } from "./teachers-table";
import { CreateTeacherDialog } from "./teachers-dialogs/create-teacher-dialog";
import { EditTeacherDialog } from "./teachers-dialogs/edit-teacher-dialog";
import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import type { Teacher } from "./teachers-table";

export interface TeachersSectionProps {
  teachers: Teacher[];
}

export function TeachersSection({ teachers: initialTeachers }: TeachersSectionProps) {
  const router = useRouter();
  const [teachers, setTeachers] = React.useState<Teacher[]>(initialTeachers);
  const [editTeacher, setEditTeacher] = React.useState<Teacher | null>(null);

  const handleCreate = (data: { nama: string; email: string; aktif: boolean }) => {
    setTeachers((prev) => [
      ...prev,
      {
        id: (Math.random() * 100000).toFixed(0),
        nama: data.nama,
        email: data.email,
        status: data.aktif ? "aktif" : "nonaktif",
        dibuatPada: new Date().toISOString(),
      },
    ]);
  };

  const handleEdit = (teacher: Teacher) => setEditTeacher(teacher);

  const handleEditSave = (values: { nama: string; email: string; aktif: boolean }) => {
    if (!editTeacher) return;
    setTeachers((prev) => prev.map((t) => t.id === editTeacher.id ? {
      ...t,
      nama: values.nama,
      email: values.email,
      status: values.aktif ? "aktif" : "nonaktif",
    } : t));
    setEditTeacher(null);
  };

  const handleDelete = (teacher: Teacher) => {
    setTeachers((prev) => prev.filter((t) => t.id !== teacher.id));
  };

  const handleToggleActive = (teacher: Teacher) => {
    setTeachers((prev) => prev.map((t) => t.id === teacher.id ? {
      ...t,
      status: t.status === "aktif" ? "nonaktif" : "aktif",
    } : t));
  };

  return (
    <Card>
      <CardHeader className="flex flex-wrap justify-between gap-4">
        <div>
          <CardTitle>Daftar Guru</CardTitle>
          <CardDescription>Kelola data guru di sekolah.</CardDescription>
        </div>
        <CreateTeacherDialog onSuccess={() => {}} />
      </CardHeader>
      <CardContent className="space-y-4">
        <TeachersTable
          data={teachers}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
        {editTeacher && (
          <EditTeacherDialog
            teacher={{
              id: editTeacher.id,
              nama: editTeacher.nama,
              email: editTeacher.email,
              aktif: editTeacher.status === "aktif",
            }}
            open={!!editTeacher}
            onOpenChange={(open) => !open && setEditTeacher(null)}
            onSuccess={() => {
              // Refresh the page after successful edit
              router.refresh();
              setEditTeacher(null);
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
