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

export type Teacher = {
  id: string;
  nama: string;
  email: string;
  status: "aktif" | "nonaktif";
  dibuatPada: string;
};

interface TeachersTableProps {
  data: Teacher[];
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
  onToggleActive: (teacher: Teacher) => void;
  loading?: boolean;
}

export function TeachersTable({ data, onEdit, onDelete, onToggleActive, loading }: TeachersTableProps) {
  const [deleteDialogTeacher, setDeleteDialogTeacher] = React.useState<Teacher | null>(null);

  const columns: ColumnDef<Teacher>[] = [
    {
      accessorKey: "nama",
      header: "Nama",
  cell: ({ row }: { row: Row<Teacher> }) => row.getValue("nama"),
    },
    {
      accessorKey: "email",
      header: "Email",
  cell: ({ row }: { row: Row<Teacher> }) => row.getValue("email"),
    },
    {
      accessorKey: "status",
      header: "Status",
  cell: ({ row }: { row: Row<Teacher> }) => (
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
  cell: ({ row }: { row: Row<Teacher> }) => row.getValue("dibuatPada"),
    },
    {
      id: "actions",
      header: "Aksi",
  cell: ({ row }: { row: Row<Teacher> }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Edit Guru"
            onClick={() => onEdit(row.original)}
            disabled={loading}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <AlertDialog open={deleteDialogTeacher?.id === row.original.id} onOpenChange={(open) => setDeleteDialogTeacher(open ? row.original : null)}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Hapus Guru"
                onClick={() => setDeleteDialogTeacher(row.original)}
                disabled={loading}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Guru?</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus guru {`'${row.original.nama}'`}? Tindakan ini tidak dapat dibatalkan.
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
                      setDeleteDialogTeacher(null);
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
