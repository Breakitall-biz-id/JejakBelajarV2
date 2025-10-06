
"use client"

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

import { AcademicTermsTable, AcademicTerm } from "./academic-terms-table";
import { CreateTermDialog } from "./academic-terms-dialogs/create-term-dialog";
import { EditTermDialog } from "./academic-terms-dialogs/edit-term-dialog";


type TermsSectionProps = {
  terms: Array<AcademicTerm>
};

export default function TermsSection({ terms }: TermsSectionProps) {
  const [editTerm, setEditTerm] = React.useState<AcademicTerm | null>(null);
  const [deleteTerm, setDeleteTerm] = React.useState<AcademicTerm | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const activeTerm = terms.find((term) => term.status === "ACTIVE");

  const handleEdit = (term: AcademicTerm) => setEditTerm(term);
  const handleEditDialogClose = () => setEditTerm(null);

  const handleDelete = (term: AcademicTerm) => {
    setDeleteTerm(term);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTerm) {
      await import("@/app/dashboard/admin/actions").then((m) => m.deleteAcademicTerm({ termId: deleteTerm.id }));
      setDeleteTerm(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setDeleteTerm(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-wrap justify-between gap-4">
        <div>
          <CardTitle>Tahun Akademik</CardTitle>
          <CardDescription>Kelola tahun ajaran dan aktifkan semester saat ini</CardDescription>
        </div>
        <CreateTermDialog onSuccess={() => { /* TODO: refresh data */ }} />
      </CardHeader>
      <CardContent className="space-y-4">
        <AcademicTermsTable
          data={terms}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={async (term) => {
            if (term.status === "ACTIVE") {
              // Nonaktifkan: update status ke INACTIVE
              const updateAcademicTerm = (await import("@/app/dashboard/admin/actions")).updateAcademicTerm;
              await updateAcademicTerm({
                id: term.id,
                academicYear: term.academicYear,
                semester: term.semester as 'ODD' | 'EVEN',
                startsAt: term.startsAt,
                endsAt: term.endsAt,
                status: "INACTIVE",
              });
            } else {
              // Aktifkan: set active
              const setActiveAcademicTerm = (await import("@/app/dashboard/admin/actions")).setActiveAcademicTerm;
              await setActiveAcademicTerm({ termId: term.id });
            }
          }}
          activeTermId={activeTerm?.id}
        />
        {editTerm && (
          <EditTermDialog
            term={editTerm}
            open={!!editTerm}
            onOpenChange={(open) => !open && handleEditDialogClose()}
            onSuccess={() => {
              handleEditDialogClose();
              // TODO: refresh data
            }}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => { if (!open) handleDeleteDialogClose(); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Periode Akademik?</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteTerm && (
                  <span>
                    Apakah Anda yakin ingin menghapus periode akademik <b>{deleteTerm.academicYear}</b> semester <b>{deleteTerm.semester}</b>? Tindakan ini tidak dapat dibatalkan.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleDeleteDialogClose}>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-white hover:bg-destructive/90">Hapus</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
