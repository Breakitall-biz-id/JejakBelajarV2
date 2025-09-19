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

interface EditTeacherDialogProps {
  teacher: {
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

export function EditTeacherDialog({ teacher, open, onOpenChange, onSuccess }: EditTeacherDialogProps) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormValues>({
    defaultValues: teacher,
  });

  React.useEffect(() => {
    reset(teacher);
  }, [teacher, reset]);

  const onSubmit = async (values: FormValues) => {
    // TODO: Call backend action to update teacher
    // await updateTeacher({ id: teacher.id, ...values })
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Guru</DialogTitle>
          <DialogDescription>Perbarui data guru di bawah ini.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Nama Guru</label>
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
