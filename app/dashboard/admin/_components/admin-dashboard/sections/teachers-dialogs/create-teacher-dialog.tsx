import * as React from "react";
import {
  Dialog,
  DialogTrigger,
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
import { Plus } from "lucide-react";

interface CreateTeacherDialogProps {
  onSuccess?: () => void;
}

type FormValues = {
  nama: string;
  email: string;
  aktif: boolean;
};

export function CreateTeacherDialog({ onSuccess }: CreateTeacherDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormValues>({
    defaultValues: { nama: "", email: "", aktif: true },
  });

  const onSubmit = async (values: FormValues) => {
    // TODO: Call backend action to create teacher
    // await createTeacher(values)
    setOpen(false);
    reset();
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Tambah <Plus className="ml-2 h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Guru</DialogTitle>
          <DialogDescription>Isi data guru baru di bawah ini.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Nama</label>
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
          <p className="text-xs text-muted-foreground mt-2">
            Setelah akun dibuat, guru akan menerima email untuk aktivasi dan membuat password sendiri.
          </p>
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
