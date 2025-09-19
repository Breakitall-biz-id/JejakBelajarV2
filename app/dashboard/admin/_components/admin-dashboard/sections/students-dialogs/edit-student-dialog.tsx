import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateAccount } from "@/app/dashboard/admin/actions";
import { toast } from "sonner";

interface EditStudentDialogProps {
  student: {
    id: string;
    nama: string;
    email: string;
    aktif: boolean;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type FormValues = {
  nama: string;
  email: string;
  aktif: boolean;
};


export function EditStudentDialog({ student, open, onOpenChange, onSuccess }: EditStudentDialogProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: student,
  });

  React.useEffect(() => {
    reset(student);
  }, [student, reset]);

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const result = await updateAccount({
        userId: student.id,
        name: values.nama,
        role: "STUDENT",
      });
      if (!result.success) {
        toast.error(result.error || "Gagal mengubah siswa.");
        return;
      }
      toast.success("Siswa berhasil diubah.");
      onOpenChange(false);
      router.refresh();
      onSuccess?.();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Siswa</DialogTitle>
          <DialogDescription>Perbarui data siswa di bawah ini.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Nama Siswa</label>
            <Input {...register("nama", { required: true })} placeholder="Nama lengkap" required />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Email</label>
            <Input type="email" {...register("email", { required: true })} placeholder="Email" required />
          </div>
          <div className="flex items-center gap-2">
            <Switch {...register("aktif")}/>
            <span>Akun Aktif</span>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Batal</Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
