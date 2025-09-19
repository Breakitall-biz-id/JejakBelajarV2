"use client"

import { useMemo, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import {
  createClassroom,
  updateClassroom,
  deleteClassroom,
} from "../../../actions"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ClassesTable, Kelas } from "./classes-table"
import { CreateKelasDialog } from "./classes-dialogs/create-class-dialog"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

const classFormSchema = z.object({
  name: z.string().trim().min(1, "Class name is required").max(255),
  termId: z.string().uuid(),
})

type ClassFormValues = z.infer<typeof classFormSchema>

type ClassesSectionProps = {
  classes: Array<{
    id: string
    name: string
    termId: string
    termYear: string
    termSemester: string
    termStatus: string
    createdAt: string
  }>
  terms: Array<{
    id: string
    academicYear: string
    semester: string
    status: string
    startsAt: string | null
    endsAt: string | null
    createdAt: string
  }>
}

export function ClassesSection({ classes, terms }: ClassesSectionProps) {
  const [isCreatePending, setIsCreatePending] = useState(false);
  const [editClassId, setEditClassId] = useState<string | null>(null)
  const termOptions = useMemo(
    () =>
      terms.map((term) => ({
        id: term.id,
        label: `${term.academicYear} • Semester ${term.semester === "ODD" ? "Ganjil" : "Genap"}`,
      })),
    [terms],
  )

  const kelasData: Kelas[] = classes.map((c) => ({
    id: c.id,
    name: c.name,
    academicTermId: c.termId,
    createdAt: c.createdAt,
    updatedAt: c.createdAt, 
  }));

  const [editKelas, setEditKelas] = useState<Kelas | null>(null);
  const [deleteKelas, setDeleteKelas] = useState<Kelas | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditPending, setIsEditPending] = useState(false);

  const handleEdit = (kelas: Kelas) => setEditKelas(kelas);
  const handleDelete = (kelas: Kelas) => {
    setDeleteKelas(kelas);
    setIsDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = async () => {
    if (deleteKelas) {
      await deleteClassroom({ classId: deleteKelas.id });
      setDeleteKelas(null);
      setIsDeleteDialogOpen(false);
      toast.success("Kelas berhasil dihapus.");
    }
  };
  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setDeleteKelas(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-wrap justify-between gap-4">
        <div>
          <CardTitle>Daftar Kelas</CardTitle>
          <CardDescription>
            Kelola kelas dan hubungkan ke tahun ajaran & semester aktif
          </CardDescription>
        </div>
        <CreateKelasDialog
          termOptions={termOptions}
          isPending={isCreatePending}
          onSubmit={async (values) => {
            setIsCreatePending(true);
            const result = await createClassroom(values);
            setIsCreatePending(false);
            if (!result.success) {
              // Error handling di dalam dialog
              return;
            }
            toast.success("Kelas berhasil dibuat.");
          }}
        />
      </CardHeader>
      <CardContent className="space-y-4">
        <ClassesTable data={kelasData} onEdit={handleEdit} onDelete={handleDelete} />
        {/* Dialog Edit Kelas */}
        {editKelas && (
          <EditKelasDialog
            kelas={editKelas}
            termOptions={termOptions}
            open={!!editKelas}
            isPending={isEditPending}
            onClose={() => setEditKelas(null)}
            onSubmit={async (values) => {
              setIsEditPending(true);
              const result = await updateClassroom({
                id: editKelas.id,
                name: values.name,
                termId: values.termId,
              });
              setIsEditPending(false);
              if (!result.success) {
                return;
              }
              toast.success("Kelas berhasil diubah.");
              setEditKelas(null);
            }}
          />
        )}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => { if (!open) handleDeleteDialogClose(); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Kelas?</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteKelas && (
                  <span>
                    Apakah Anda yakin ingin menghapus kelas <b>{deleteKelas.name}</b>? Tindakan ini tidak dapat dibatalkan.
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
  )
function EditKelasDialog({ kelas, termOptions, onClose, onSuccess }: { kelas: Kelas, termOptions: Option[], onClose: () => void, onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: kelas.name,
      termId: kelas.academicTermId,
    },
  });

  const submit = (values: ClassFormValues) => {
    startTransition(async () => {
      const result = await updateClassroom({
        id: kelas.id,
        name: values.name,
        termId: values.termId,
      });
      if (!result.success) {
        if (result.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            form.setError(field as keyof ClassFormValues, {
              message: messages?.[0],
            });
          }
        }
        toast.error(result.error);
        return;
      }
      toast.success("Kelas berhasil diubah.");
      onSuccess();
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Kelas</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <ClassFormFields form={form} termOptions={termOptions} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Menyimpan…" : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
}

type Option = { id: string; label: string }



function ClassFormFields({
  form,
  termOptions,
}: {
  form: ReturnType<typeof useForm<ClassFormValues>>
  termOptions: Option[]
}) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Class name</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Grade 10 Science" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="termId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Academic term</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {termOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}


