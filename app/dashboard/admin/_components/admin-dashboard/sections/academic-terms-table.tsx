import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CheckIcon, XIcon, Trash2Icon, Edit2Icon } from "lucide-react";

export type AcademicTerm = {
  id: string;
  academicYear: string;
  semester: string;
  status: string;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
};

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={status === "ACTIVE" ? "default" : "destructive"}>
      {status === "ACTIVE" ? "Aktif" : "Tidak Aktif"}
    </Badge>
  );
}

function formatSchedule(startsAt: string | null, endsAt: string | null) {
  if (startsAt && endsAt) {
    return `${format(new Date(startsAt), "dd MMM yyyy")} – ${format(new Date(endsAt), "dd MMM yyyy")}`;
  }
  if (startsAt) {
    return `Starts ${format(new Date(startsAt), "dd MMM yyyy")}`;
  }
  if (endsAt) {
    return `Ends ${format(new Date(endsAt), "dd MMM yyyy")}`;
  }
  return "—";
}

export function AcademicTermsTable({
  data,
  onEdit,
  onDelete,
  onToggleActive,
  activeTermId,
}: {
  data: AcademicTerm[];
  onEdit: (term: AcademicTerm) => void;
  onDelete: (term: AcademicTerm) => void;
  onToggleActive: (term: AcademicTerm) => void;
  activeTermId?: string;
}) {
  const columns = React.useMemo<ColumnDef<AcademicTerm>[]>(
    () => [
      {
        accessorKey: "academicYear",
        header: "Academic Year",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.academicYear}</div>
        ),
      },
      {
        accessorKey: "semester",
        header: "Semester",
        cell: ({ row }) => (
          <span>{row.original.semester === "ODD" ? "Ganjil" : "Genap"}</span>
        ),
      },
      {
        accessorKey: "schedule",
        header: "Schedule",
        cell: ({ row }) => formatSchedule(row.original.startsAt, row.original.endsAt),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex gap-1 justify-end">
            {row.original.status === "ACTIVE" ? (
              <Button size="icon" variant="ghost" title="Nonaktifkan" onClick={() => onToggleActive(row.original)}>
                <XIcon className="w-4 h-4 text-muted-foreground" />
              </Button>
            ) : (
              <Button size="icon" variant="ghost" title="Aktifkan" onClick={() => onToggleActive(row.original)}>
                <CheckIcon className="w-4 h-4 text-primary" />
              </Button>
            )}
            <Button size="icon" variant="ghost" title="Edit" onClick={() => onEdit(row.original)}>
                <Edit2Icon className="w-4 h-4 text-yellow-600" />
            </Button>
            <Button size="icon" variant="ghost" title="Hapus" onClick={() => onDelete(row.original)} disabled={activeTermId === row.original.id}>
              <Trash2Icon className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
  [onEdit, onDelete, onToggleActive, activeTermId]
  );

  return <DataTable columns={columns} data={data} />;
}
