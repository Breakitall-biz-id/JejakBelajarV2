"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  createAccount,
  updateAccount,
  deleteAccount,
} from "../../../actions"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

const createAccountForm = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  email: z.string().trim().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

type CreateAccountValues = z.infer<typeof createAccountForm>

type AccountsSectionProps = {
  teachers: Array<{ id: string; name: string | null; email: string; createdAt: string }>
  students: Array<{ id: string; name: string | null; email: string; createdAt: string }>
}

export function AccountsSection({ teachers, students }: AccountsSectionProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AccountCard title="Teachers" description="Manage facilitator accounts." accounts={teachers} role="TEACHER" />
      <AccountCard title="Students" description="Manage learner accounts." accounts={students} role="STUDENT" />
    </div>
  )
}

type AccountCardProps = {
  title: string
  description: string
  accounts: Array<{ id: string; name: string | null; email: string; createdAt: string }>
  role: "TEACHER" | "STUDENT"
}

function AccountCard({ title, description, accounts, role }: AccountCardProps) {
  const roleLabel = role === "TEACHER" ? "teacher" : "student"

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <CreateAccountButton role={role} />
      </CardHeader>
      <CardContent className="space-y-4">
        {accounts.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            No {roleLabel} accounts yet. Create one to get started.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.name ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{account.email}</TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <EditAccountButton account={account} role={role} />
                    <DeleteAccountButton userId={account.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

function CreateAccountButton({ role }: { role: "TEACHER" | "STUDENT" }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<CreateAccountValues>({
    resolver: zodResolver(createAccountForm),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  const submit = (values: CreateAccountValues) => {
    startTransition(async () => {
      const result = await createAccount({ ...values, role })
      if (!result.success) {
        if (result.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            form.setError(field as keyof CreateAccountValues, {
              message: messages?.[0],
            })
          }
        }
        toast.error(result.error)
        return
      }

      toast.success(`${role === "TEACHER" ? "Teacher" : "Student"} account created.`)
      form.reset()
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">New {role === "TEACHER" ? "teacher" : "student"}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create {role === "TEACHER" ? "teacher" : "student"}</DialogTitle>
          <DialogDescription>
            Provide initial credentials. Share the password with the user so they can sign in.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temporary password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="At least 8 characters" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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

const updateAccountForm = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
})

type UpdateAccountValues = z.infer<typeof updateAccountForm>

function EditAccountButton({
  account,
  role,
}: {
  account: { id: string; name: string | null; email: string }
  role: "TEACHER" | "STUDENT"
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<UpdateAccountValues>({
    resolver: zodResolver(updateAccountForm),
    defaultValues: {
      name: account.name ?? "",
    },
  })

  const submit = (values: UpdateAccountValues) => {
    startTransition(async () => {
      const result = await updateAccount({
        userId: account.id,
        name: values.name,
        role,
      })

      if (!result.success) {
        if (result.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            form.setError(field as keyof UpdateAccountValues, {
              message: messages?.[0],
            })
          }
        }
        toast.error(result.error)
        return
      }

      toast.success("Account updated.")
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit account</DialogTitle>
          <DialogDescription>{account.email}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving…" : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteAccountButton({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition()

  const onDelete = () => {
    startTransition(async () => {
      const result = await deleteAccount({ userId })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success("Account deleted.")
    })
  }

  return (
    <Button variant="destructive" size="sm" onClick={onDelete} disabled={isPending}>
      {isPending ? "Removing…" : "Delete"}
    </Button>
  )
}
