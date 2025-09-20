import * as React from "react"
import {
  CalendarDays,
  GraduationCap,
  Users,
  Edit2Icon,
  Trash2Icon,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import type { ParticipantOption } from "./classes-dialogs/types"

export type Kelas = {
  id: string
  name: string
  academicTermId: string
  termLabel: string
  termStatus: string
  createdAt: string
  teacherIds: string[]
  studentIds: string[]
  teachers: ParticipantOption[]
  students: ParticipantOption[]
}

type ClassesTableProps = {
  data: Kelas[]
  onEdit: (kelas: Kelas) => void
  onDelete: (kelas: Kelas) => void
}

export function ClassesTable({ data, onEdit, onDelete }: ClassesTableProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/40 p-10 text-center">
        <p className="text-sm text-muted-foreground">
          Belum ada kelas yang terdaftar. Tambahkan kelas baru untuk mulai mengelola roster guru dan siswa.
        </p>
      </div>
    )
  }

  const sorted = React.useMemo(() => {
    return [...data].sort((a, b) => a.name.localeCompare(b.name, "id"))
  }, [data])

  return (
    <TooltipProvider delayDuration={150}>
      <div className="grid gap-4 xl:grid-cols-2">
        {sorted.map((kelas) => (
          <Card key={kelas.id} className="border-muted/70 shadow-sm">
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg font-semibold">{kelas.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-xs sm:text-sm">
                    <CalendarDays className="h-4 w-4" />
                    <span>{kelas.termLabel}</span>
                  </CardDescription>
                </div>
                <Badge
                  variant={kelas.termStatus === "ACTIVE" ? "default" : "secondary"}
                  className="uppercase tracking-wide"
                >
                  {kelas.termStatus === "ACTIVE" ? "Aktif" : "Tidak Aktif"}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground sm:text-sm">
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  {kelas.teachers.length} pengampu
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {kelas.students.length} siswa
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold tracking-tight">Guru pengampu</h3>
                  {kelas.teachers.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {kelas.teachers.length} orang
                    </Badge>
                  )}
                </div>
                {kelas.teachers.length === 0 ? (
                  <EmptyRosterMessage message="Belum ada guru yang ditautkan." />
                ) : (
                  <div className="space-y-2">
                    {kelas.teachers.map((teacher) => (
                      <RosterEntry key={teacher.id} participant={teacher} />
                    ))}
                  </div>
                )}
              </section>

              <Separator className="bg-muted" />

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold tracking-tight">Siswa</h3>
                  {kelas.students.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {kelas.students.length} siswa
                    </Badge>
                  )}
                </div>
                {kelas.students.length === 0 ? (
                  <EmptyRosterMessage message="Belum ada siswa yang ditambahkan." />
                ) : (
                  <ScrollArea className="max-h-48 rounded-lg border border-muted/40 bg-muted/30 p-2">
                    <div className="space-y-2 pr-2">
                      {kelas.students.map((student) => (
                        <RosterEntry key={student.id} participant={student} size="sm" />
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </section>

              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(kelas)}>
                  <Edit2Icon className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(kelas)}>
                  <Trash2Icon className="mr-2 h-4 w-4" />
                  Hapus
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  )
}

type RosterEntryProps = {
  participant: ParticipantOption
  size?: "sm" | "md"
}

function RosterEntry({ participant, size = "md" }: RosterEntryProps) {
  const displayName = participant.name?.trim() || participant.email.split("@")[0]
  const initials = getInitials(displayName)
  const email = participant.email

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg border border-transparent bg-background px-2 py-1.5 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.04)] transition hover:border-primary/30",
            size === "sm" ? "px-2 py-1" : undefined,
          )}
        >
          <Avatar className={cn("border", size === "sm" ? "h-8 w-8" : "h-9 w-9")}> 
            <AvatarFallback className="text-[11px] font-semibold uppercase">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium leading-tight">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>{email}</TooltipContent>
    </Tooltip>
  )
}

function EmptyRosterMessage({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-muted/60 bg-muted/20 px-3 py-6 text-center text-xs text-muted-foreground">
      {message}
    </div>
  )
}

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase()
  }
  return `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`.toUpperCase()
}
