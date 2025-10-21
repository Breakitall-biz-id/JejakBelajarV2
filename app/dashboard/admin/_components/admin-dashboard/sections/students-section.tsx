"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StudentsTable, Student } from "./students-table";
import { EditStudentDialog } from "./students-dialogs/edit-student-dialog";
import { CreateStudentDialog } from "./students-dialogs/create-student-dialog";
import { ImportStudentsDialog } from "./import-students-dialog";
import { DownloadTemplateButton } from "./download-template-button";
import { ExportStudentsDialog } from "./export-students-dialog";
import { deleteAccount, getAvailableClasses } from "@/app/dashboard/admin/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, Download } from "lucide-react";

export interface StudentsSectionProps {
  students: Student[];
}


export function StudentsSection({ students: initialStudents }: StudentsSectionProps) {
  const [editStudent, setEditStudent] = React.useState<Student | null>(null);
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false);
  const [availableClasses, setAvailableClasses] = React.useState<any[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = React.useState(false);
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

  const handleImportSuccess = () => {
    toast.success("Import siswa berhasil!");
    router.refresh();
    setImportDialogOpen(false);
  };

  const handleExportSuccess = () => {
    toast.success("Export siswa berhasil!");
  };

  const loadAvailableClasses = async () => {
    setIsLoadingClasses(true);
    try {
      const result = await getAvailableClasses({});
      if (result.success && result.data) {
        setAvailableClasses(result.data);
      } else {
        console.error('Failed to load classes:', result.error);
        toast.error(result.error || "Gagal memuat data kelas");
      }
    } catch (error) {
      console.error('Failed to load classes:', error);
      toast.error("Gagal memuat data kelas");
    } finally {
      setIsLoadingClasses(false);
    }
  };

  // Load classes when export dialog is about to open
  React.useEffect(() => {
    if (exportDialogOpen && availableClasses.length === 0) {
      loadAvailableClasses();
    }
  }, [exportDialogOpen]);

  // Toggle active: not implemented, as status is not in backend yet

  return (
    <Card>
      <CardHeader className="flex flex-wrap justify-between gap-4">
        <div>
          <CardTitle>Daftar Siswa</CardTitle>
          <CardDescription>Kelola data siswa di sekolah.</CardDescription>
        </div>
        <div className="flex gap-2">
          <DownloadTemplateButton />
          <Button
            variant="outline"
            onClick={() => setImportDialogOpen(true)}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Import Excel
          </Button>
          <Button
            variant="outline"
            onClick={() => setExportDialogOpen(true)}
            className="gap-2"
            disabled={isLoadingClasses}
          >
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
          <CreateStudentDialog onSuccess={() => {}} />
        </div>
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
            onSuccess={() => {
              // Refresh the page after successful edit
              router.refresh();
              setEditStudent(null);
            }}
          />
        )}
      </CardContent>

      {/* Import Dialog */}
      <ImportStudentsDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onSuccess={handleImportSuccess}
      />

      {/* Export Dialog */}
      <ExportStudentsDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        availableClasses={availableClasses}
        onSuccess={handleExportSuccess}
      />
    </Card>
  );
}
