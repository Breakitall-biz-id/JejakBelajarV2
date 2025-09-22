"use client";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { deleteAccount } from "../../../actions";

export function DeleteAccountDialog({
  open,
  setOpen,
  account,
  role,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  account: { id: string; name: string | null; email: string } | null;
  role: "TEACHER" | "STUDENT";
}) {
  const [isPending, startTransition] = useTransition();

  const onDelete = () => {
    if (!account) return;
    startTransition(async () => {
      const result = await deleteAccount({ userId: account.id });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Akun berhasil dihapus.");
      setOpen(false);
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus akun?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus akun <b>{account?.name || account?.email}</b>? Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete} disabled={isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {isPending ? "Menghapus…" : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
