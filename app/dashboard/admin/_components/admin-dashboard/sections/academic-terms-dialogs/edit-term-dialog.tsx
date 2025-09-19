"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  const [isPending, startTransition] = useTransition()

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

  const submit = (values: TermFormValues) => {
    startTransition(async () => {
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
        toast.error(result.error)
        return
      }
      toast.success("Term updated.")
      onOpenChange(false)
      onSuccess()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit academic term</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <TermFormFields form={form} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
