"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { toast } from "sonner"
import { updateAcademicTerm } from "@/app/dashboard/admin/actions"
import { formSchema, TermFormFields, TermFormValues } from "./shared"

type EditTermDialogProps = {
  term: {
    id: string
    academicYear: string
    semester: string
    startsAt: string | null
    endsAt: string | null
    status: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditTermDialog({ term, open, onOpenChange, onSuccess }: EditTermDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<TermFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      academicYear: term.academicYear,
      semester: term.semester as TermFormValues["semester"],
      startsAt: term.startsAt ? term.startsAt.slice(0, 10) : "",
      endsAt: term.endsAt ? term.endsAt.slice(0, 10) : "",
      setActive: term.status === "ACTIVE",
    },
  })

  const onSubmit = async (values: TermFormValues) => {
    setIsSubmitting(true)
    try {
      const result = await updateAcademicTerm({
        id: term.id,
        academicYear: values.academicYear,
        semester: values.semester,
        startsAt: values.startsAt,
        endsAt: values.endsAt,
        setActive: values.setActive,
      })

      if (!result.success) {
        if (result.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            form.setError(field as keyof TermFormValues, {
              message: messages?.[0],
            })
          }
        }
        toast.error(result.error || "Failed to update term")
        return
      }

      toast.success("Term akademik berhasil diperbarui!")
      onSuccess()
    } catch (err) {
      toast.error("Failed to update term")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="bg-card">
          <div className="px-6 pt-6 pb-2 border-b border-muted/60">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Edit Term Akademik</DialogTitle>
              <DialogDescription>
                Ubah informasi term akademik yang sudah ada
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <TermFormFields form={form} />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={handleCancel}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Menyimpan…" : "Simpan Perubahan"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
