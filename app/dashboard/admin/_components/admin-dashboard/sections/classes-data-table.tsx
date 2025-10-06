import * as React from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import type { Kelas } from "./classes-table";


export interface ClassesDataTableProps {
  data: Kelas[];
  onShowDetail: (kelas: Kelas) => void;
  onEdit: (kelas: Kelas) => void;
  onDelete: (kelas: Kelas) => void;
  selectedTermId: string; // "ALL" untuk semua tahun
}

export function ClassesDataTable({ data, onShowDetail, onEdit, onDelete, selectedTermId }: ClassesDataTableProps) {
  const columns = React.useMemo<ColumnDef<Kelas>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Nama Kelas",
        cell: ({ row }: { row: Row<Kelas> }) => row.getValue("name"),
      },
      {
        accessorKey: "termLabel",
        header: "Tahun Ajaran / Semester",
        cell: ({ row }: { row: Row<Kelas> }) => row.getValue("termLabel"),
      },
      {
        accessorKey: "termStatus",
        header: "Status Semester",
        cell: ({ row }: { row: Row<Kelas> }) => (
          <Badge variant={row.original.termStatus === "ACTIVE" ? "default" : "secondary"}>
            {row.original.termStatus === "ACTIVE" ? "Aktif" : "Tidak Aktif"}
          </Badge>
        ),
      },
      {
        accessorKey: "teachers",
        header: "Jumlah Pengampu",
        cell: ({ row }: { row: Row<Kelas> }) => (
          <span>{row.original.teachers.length} guru</span>
        ),
      },
      {
        accessorKey: "students",
        header: "Jumlah Siswa",
        cell: ({ row }: { row: Row<Kelas> }) => (
          <span>{row.original.students.length} siswa</span>
        ),
      },
      {
        id: "actions",
        header: "Aksi",
        cell: ({ row }: { row: Row<Kelas> }) => (
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShowDetail(row.original)}
              title="Lihat Detail"
            >
              <Eye className="w-4 h-4 mr-1" /> Detail
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(row.original)}
              title="Sunting"
            >
              Sunting
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(row.original)}
              title="Hapus"
            >
              Hapus
            </Button>
          </div>
        ),
      },
    ],
    [onShowDetail, onEdit, onDelete]
  );

  // Filter: semua kelas jika ALL, atau kelas di tahun tertentu
  const filteredData = React.useMemo(() => {
    if (selectedTermId === "ALL") return data;
    return data.filter((kelas) => kelas.academicTermId === selectedTermId);
  }, [data, selectedTermId]);

  return (
    <DataTable columns={columns} data={filteredData} />
  );
}
