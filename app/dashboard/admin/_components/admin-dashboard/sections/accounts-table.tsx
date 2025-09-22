"use client";
import * as React from "react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import type { ClassMembership } from "../../../queries";

export type AccountRow = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  memberships: ClassMembership[];
};

interface AccountsTableProps {
  data: AccountRow[];
  onEdit: (account: AccountRow) => void;
  onDelete: (account: AccountRow) => void;
  loading?: boolean;
  role: "TEACHER" | "STUDENT";
}



export function AccountsTable({ data, onEdit, onDelete, loading, role }: AccountsTableProps) {
  const columns = React.useMemo<ColumnDef<AccountRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Nama Lengkap",
        cell: ({ row }: { row: Row<AccountRow> }) => (
          <span className="font-medium">{row.original.name || row.original.email.split("@")[0]}</span>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }: { row: Row<AccountRow> }) => (
          <span className="text-muted-foreground">{row.original.email}</span>
        ),
      },
      {
        accessorKey: "memberships",
        header: role === "TEACHER" ? "Kelas Diampu" : "Kelas Diikuti",
        cell: ({ row }: { row: Row<AccountRow> }) => (
          row.original.memberships.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {row.original.memberships.map((m) => (
                <Badge
                  key={m.id}
                  variant={m.termStatus === "ACTIVE" ? "default" : "secondary"}
                  className="!bg-primary/90 !text-primary-foreground !border-primary/80 dark:!bg-primary dark:!text-white dark:!border-primary"
                >
                  {m.name}
                  <span className="ml-1 text-[10px] text-primary-foreground dark:text-white/90">({m.termLabel})</span>
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">Belum ada kelas</span>
          )
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Dibuat",
        cell: ({ row }: { row: Row<AccountRow> }) => (
          <span className="text-xs text-muted-foreground">{formatDate(row.original.createdAt)}</span>
        ),
      },
      {
        id: "actions",
        header: "Aksi",
        cell: ({ row }: { row: Row<AccountRow> }) => (
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="icon"
              aria-label="Edit"
              onClick={() => onEdit(row.original)}
              disabled={loading}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              aria-label="Hapus"
              onClick={() => onDelete(row.original)}
              disabled={loading}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ),
      },
    ],
    [onEdit, onDelete, loading, role]
  );
  return <DataTable columns={columns} data={data} />;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "-";
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}
