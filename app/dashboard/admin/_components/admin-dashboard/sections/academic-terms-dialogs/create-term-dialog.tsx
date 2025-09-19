"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { toast } from "sonner"
import { createAcademicTerm } from "@/app/dashboard/admin/actions"
import { formSchema, TermFormFields, TermFormValues } from "./shared"
import { Plus } from "lucide-react"

export function CreateTermDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<TermFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      academicYear: "",
      semester: "ODD",
      startsAt: "",
      endsAt: "",
    },
  })

  const submit = (values: TermFormValues) => {
    startTransition(async () => {
      const result = await createAcademicTerm(values)
      if (!result.success) {
        if (result.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            form.setError(field as keyof TermFormValues, {
              message: messages?.[0],
            })
          }
        }
        toast.error(result.error)
        return
      }
      toast.success("Term created.")
      form.reset()
      setOpen(false)
      onSuccess()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Tambah 
            <Plus className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tahun Akademik</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <TermFormFields form={form} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving…" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
