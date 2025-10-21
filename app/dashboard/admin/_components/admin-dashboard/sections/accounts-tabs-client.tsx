"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AccountRow, AccountsTable } from "./accounts-table";
import { CreateAccountDialog } from "./create-account-dialog";
import { EditAccountDialog } from "./edit-account-dialog";
import { DeleteAccountDialog } from "./delete-account-dialog";
import { ImportStudentsDialog } from "./import-students-dialog";
import { DownloadTemplateButton } from "./download-template-button";
import { ExportStudentsDialog } from "./export-students-dialog";
import { getAvailableClasses } from "@/app/dashboard/admin/actions";
import { Upload, Download } from "lucide-react";

export function AccountsTabsClient({ teacherRows, studentRows }: { teacherRows: AccountRow[]; studentRows: AccountRow[] }) {
  const [addDialog, setAddDialog] = useState<"TEACHER" | "STUDENT" | null>(null);
  const [editDialog, setEditDialog] = useState<{ account: AccountRow; role: "TEACHER" | "STUDENT" } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ account: AccountRow; role: "TEACHER" | "STUDENT" } | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  const handleExportSuccess = () => {
    toast.success("Export data siswa berhasil!");
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
  useEffect(() => {
    if (exportDialogOpen && availableClasses.length === 0) {
      loadAvailableClasses();
    }
  }, [exportDialogOpen]);

  return (
    <>
      <CreateAccountDialog open={addDialog === "TEACHER"} setOpen={(open) => setAddDialog(open ? "TEACHER" : null)} role="TEACHER" />
      <CreateAccountDialog open={addDialog === "STUDENT"} setOpen={(open) => setAddDialog(open ? "STUDENT" : null)} role="STUDENT" />
      <EditAccountDialog open={!!editDialog} setOpen={(open) => setEditDialog(open && editDialog ? editDialog : null)} account={editDialog?.account ?? null} role={editDialog?.role ?? "TEACHER"} />
      <DeleteAccountDialog open={!!deleteDialog} setOpen={(open) => setDeleteDialog(open && deleteDialog ? deleteDialog : null)} account={deleteDialog?.account ?? null} role={deleteDialog?.role ?? "TEACHER"} />
      <Tabs defaultValue="guru" className="w-full">
        <TabsList>
          <TabsTrigger
            value="guru"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
          >
            Guru
          </TabsTrigger>
          <TabsTrigger
            value="siswa"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
          >
            Siswa
          </TabsTrigger>
        </TabsList>
        <TabsContent value="guru">
          <div className="mt-4">
            <div className="flex justify-end mb-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2"
                onClick={() => setAddDialog("TEACHER")}
              >
                <span>+ Tambah Guru</span>
              </button>
            </div>
            <AccountsTable
              data={teacherRows}
              role="TEACHER"
              onEdit={(account) => setEditDialog({ account, role: "TEACHER" })}
              onDelete={(account) => setDeleteDialog({ account, role: "TEACHER" })}
            />
          </div>
        </TabsContent>
        <TabsContent value="siswa">
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
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
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2"
                onClick={() => setAddDialog("STUDENT")}
              >
                <span>+ Tambah Siswa</span>
              </button>
            </div>
            <AccountsTable
              data={studentRows}
              role="STUDENT"
              onEdit={(account) => setEditDialog({ account, role: "STUDENT" })}
              onDelete={(account) => setDeleteDialog({ account, role: "STUDENT" })}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Import Students Dialog */}
      <ImportStudentsDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onSuccess={() => {
          // Refresh page after successful import
          window.location.reload()
        }}
      />

      {/* Export Students Dialog */}
      <ExportStudentsDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        availableClasses={availableClasses}
        onSuccess={handleExportSuccess}
      />
    </>
  );
}
