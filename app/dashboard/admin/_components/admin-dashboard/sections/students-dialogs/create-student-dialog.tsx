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
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAccount } from "@/app/dashboard/admin/actions";
import { toast } from "sonner";

interface CreateStudentDialogProps {
  onSuccess?: () => void;
}

type FormValues = {
  nama: string;
  email: string;
  aktif: boolean;
};


export function CreateStudentDialog({ onSuccess }: CreateStudentDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { nama: "", email: "", aktif: true },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const password = Math.random().toString(36).slice(-10) + "A1!"; // random strong password
      const result = await createAccount({
        name: values.nama,
        email: values.email,
        password,
        role: "STUDENT",
      });
      if (!result.success) {
        toast.error(result.error || "Gagal menambah siswa.");
        return;
      }
      toast.success("Siswa berhasil ditambahkan.");
      setOpen(false);
      reset();
      router.refresh();
      onSuccess?.();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Tambah Siswa</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Siswa</DialogTitle>
          <DialogDescription>Isi data siswa baru di bawah ini.</DialogDescription>
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
          <p className="text-xs text-muted-foreground mt-2">
            Setelah akun dibuat, siswa akan menerima email untuk aktivasi dan membuat password sendiri.
          </p>
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
