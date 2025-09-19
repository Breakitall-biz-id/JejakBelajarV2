import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Edit2Icon, Trash2Icon } from "lucide-react";

export type Kelas = {
  id: string;
  name: string;
  academicTermId: string;
  createdAt: string;
  updatedAt: string;
};

export function ClassesTable({
  data,
  onEdit,
  onDelete,
}: {
  data: Kelas[];
  onEdit: (kelas: Kelas) => void;
  onDelete: (kelas: Kelas) => void;
}) {
  const columns = React.useMemo<ColumnDef<Kelas>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Nama Kelas",
        cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
      },
      {
        accessorKey: "createdAt",
        header: "Dibuat Pada",
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("id-ID"),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex gap-1 justify-end">
            <Button size="icon" variant="ghost" title="Edit" onClick={() => onEdit(row.original)}>
              <Edit2Icon className="w-4 h-4 text-yellow-600" />
            </Button>
            <Button size="icon" variant="ghost" title="Hapus" onClick={() => onDelete(row.original)}>
              <Trash2Icon className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    [onEdit, onDelete]
  );

  return <DataTable columns={columns} data={data} />;
}
