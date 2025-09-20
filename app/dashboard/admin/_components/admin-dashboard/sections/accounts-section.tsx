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
import type { ClassMembership } from "../../../queries"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
  teacherClasses: Record<string, ClassMembership[]>
  studentClasses: Record<string, ClassMembership[]>
}

export function AccountsSection({ teachers, students, teacherClasses, studentClasses }: AccountsSectionProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <AccountCard
        title="Guru"
        description="Kelola akun fasilitator dan lihat kelas yang mereka ampu."
        accounts={teachers}
        role="TEACHER"
        membershipMap={teacherClasses}
      />
      <AccountCard
        title="Siswa"
        description="Kelola akun peserta dan pantau kelas yang mereka ikuti."
        accounts={students}
        role="STUDENT"
        membershipMap={studentClasses}
      />
    </div>
  )
}

type AccountCardProps = {
  title: string
  description: string
  accounts: Array<{ id: string; name: string | null; email: string; createdAt: string }>
  role: "TEACHER" | "STUDENT"
  membershipMap: Record<string, ClassMembership[]>
}

function AccountCard({ title, description, accounts, role, membershipMap }: AccountCardProps) {
  const totalAccounts = accounts.length
  const label = role === "TEACHER" ? "guru" : "siswa"

  return (
    <Card className="border-muted/70 shadow-sm">
      <CardHeader className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <CreateAccountButton role={role} />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-dashed border-muted/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
          <span>{totalAccounts} akun {label}</span>
          <span>Perbarui data dan bagikan kredensial awal</span>
        </div>
        {totalAccounts === 0 ? (
          <EmptyAccountsMessage label={label} />
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <AccountRow
                key={account.id}
                account={account}
                role={role}
                memberships={membershipMap[account.id] ?? []}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

type AccountRowProps = {
  account: { id: string; name: string | null; email: string; createdAt: string }
  role: "TEACHER" | "STUDENT"
  memberships: ClassMembership[]
}

function AccountRow({ account, role, memberships }: AccountRowProps) {
  const displayName = account.name?.trim() || account.email.split("@")[0]
  const initials = getInitials(displayName)
  const createdAt = formatDate(account.createdAt)
  const hasMemberships = memberships.length > 0

  return (
    <div className="rounded-xl border border-muted/60 bg-background p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarFallback className="text-sm font-semibold uppercase">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{account.email}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          <Badge variant="outline" className="text-[11px] uppercase tracking-wide">
            {hasMemberships ? `${memberships.length} kelas` : "Belum ada kelas"}
          </Badge>
          <span className="text-[11px] text-muted-foreground">Dibuat {createdAt}</span>
        </div>
      </div>

      <Separator className="my-3" />

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Kelas</p>
        {hasMemberships ? (
          <div className="flex flex-wrap gap-2">
            {memberships.map((membership) => (
              <ClassChip key={membership.id} membership={membership} />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-muted/50 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
            Belum bergabung dalam kelas mana pun.
          </p>
        )}
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <EditAccountButton account={account} role={role} />
        <DeleteAccountButton userId={account.id} />
      </div>
    </div>
  )
}

type ClassChipProps = {
  membership: ClassMembership
}

function ClassChip({ membership }: ClassChipProps) {
  const isActive = membership.termStatus === "ACTIVE"
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-muted/50 bg-muted/10 px-3 py-2 text-xs">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium leading-tight">{membership.name}</span>
        <Badge variant={isActive ? "default" : "secondary"} className="text-[10px] uppercase tracking-wide">
          {isActive ? "Aktif" : "Tidak aktif"}
        </Badge>
      </div>
      <span className="text-[11px] text-muted-foreground">{membership.termLabel}</span>
    </div>
  )
}

function EmptyAccountsMessage({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-muted/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
      Tidak ada akun {label} yang terdaftar. Buat akun baru untuk memulai.
    </div>
  )
}

const updateAccountForm = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
})

type UpdateAccountValues = z.infer<typeof updateAccountForm>

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
        <Button size="sm">Tambah {role === "TEACHER" ? "guru" : "siswa"}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Buat akun {role === "TEACHER" ? "guru" : "siswa"}</DialogTitle>
          <DialogDescription>
            Masukkan data awal. Bagikan password sementara kepada pengguna untuk login pertama.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama lengkap</FormLabel>
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="nama@example.com" {...field} />
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
                  <FormLabel>Password sementara</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Minimal 8 karakter" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Menyimpan…" : "Buat"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

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
          <DialogTitle>Edit akun</DialogTitle>
          <DialogDescription>{account.email}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama lengkap</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
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
      {isPending ? "Menghapus…" : "Hapus"}
    </Button>
  )
}

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase()
  }
  return `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`.toUpperCase()
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return "-"
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
}
