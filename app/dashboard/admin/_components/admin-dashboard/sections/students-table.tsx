// StudentsTable.tsx
// Modular DataTable untuk CRUD Siswa
// Bahasa Indonesia, shadcn/ui DataTable, icon actions, modular dialogs

import * as React from "react";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";

export type Student = {
  id: string;
  nama: string;
  email: string;
  status: "aktif" | "nonaktif";
  dibuatPada: string;
};

interface StudentsTableProps {
  data: Student[];
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onToggleActive: (student: Student) => void;
  loading?: boolean;
}

export function StudentsTable({ data, onEdit, onDelete, onToggleActive, loading }: StudentsTableProps) {
  const [deleteDialogStudent, setDeleteDialogStudent] = React.useState<Student | null>(null);

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: "nama",
      header: "Nama Siswa",
      cell: ({ row }: { row: Row<Student> }) => row.getValue("nama"),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }: { row: Row<Student> }) => row.getValue("email"),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: Row<Student> }) => (
        <Button
          variant={row.getValue("status") === "aktif" ? "default" : "outline"}
          size="sm"
          onClick={() => onToggleActive(row.original)}
          disabled={loading}
        >
          {row.getValue("status") === "aktif" ? (
            <>
              <Eye className="w-4 h-4 mr-1" /> Aktif
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4 mr-1" /> Nonaktif
            </>
          )}
        </Button>
      ),
    },
    {
      accessorKey: "dibuatPada",
      header: "Dibuat Pada",
      cell: ({ row }: { row: Row<Student> }) => row.getValue("dibuatPada"),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }: { row: Row<Student> }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Edit Siswa"
            onClick={() => onEdit(row.original)}
            disabled={loading}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <AlertDialog open={deleteDialogStudent?.id === row.original.id} onOpenChange={(open) => setDeleteDialogStudent(open ? row.original : null)}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Hapus Siswa"
                onClick={() => setDeleteDialogStudent(row.original)}
                disabled={loading}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Siswa?</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus siswa {`'${row.original.nama}'`}? Tindakan ini tidak dapat dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel asChild>
                  <Button variant="outline">Batal</Button>
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setDeleteDialogStudent(null);
                      onDelete(row.original);
                    }}
                  >
                    Hapus
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
    />
  );
}
