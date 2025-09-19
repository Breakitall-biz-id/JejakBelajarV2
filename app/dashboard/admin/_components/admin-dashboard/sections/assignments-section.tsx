"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  setTeacherAssignments,
  setStudentAssignments,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const teacherAssignmentSchema = z.object({
  teacherIds: z.array(z.string().uuid()),
})

const studentAssignmentSchema = z.object({
  studentIds: z.array(z.string().uuid()),
})

type AssignmentsSectionProps = {
  classes: Array<{ id: string; name: string }>
  teachers: Array<{ id: string; name: string | null; email: string }>
  students: Array<{ id: string; name: string | null; email: string }>
  assignments: Record<string, { teacherIds: string[]; studentIds: string[] }>
}

export function AssignmentsSection({ classes, teachers, students, assignments }: AssignmentsSectionProps) {
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]?.id ?? "")

  const assignment = assignments[selectedClass] ?? { teacherIds: [], studentIds: [] }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>Class assignments</CardTitle>
            <CardDescription>
              Assign teachers and students to each class. Teachers can manage multiple classes if needed.
            </CardDescription>
          </div>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((classItem) => (
                <SelectItem key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        <AssignmentList
          title="Teachers"
          description="Select facilitators responsible for this class."
          options={teachers}
          assignedIds={assignment.teacherIds}
          onSubmit={async (ids) => {
            const result = await setTeacherAssignments({ classId: selectedClass, teacherIds: ids })
            if (!result.success) {
              toast.error(result.error)
              return false
            }
            toast.success("Teacher assignments updated.")
            return true
          }}
        />
        <AssignmentList
          title="Students"
          description="Assign learners enrolled in this class."
          options={students}
          assignedIds={assignment.studentIds}
          onSubmit={async (ids) => {
            const result = await setStudentAssignments({ classId: selectedClass, studentIds: ids })
            if (!result.success) {
              toast.error(result.error)
              return false
            }
            toast.success("Student assignments updated.")
            return true
          }}
        />
      </CardContent>
    </Card>
  )
}

type AssignmentListProps = {
  title: string
  description: string
  options: Array<{ id: string; name: string | null; email: string }>
  assignedIds: string[]
  onSubmit: (ids: string[]) => Promise<boolean>
}

function AssignmentList({ title, description, options, assignedIds, onSubmit }: AssignmentListProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<{ ids: string[] }>({
    resolver: zodResolver(z.object({ ids: z.array(z.string().uuid()) })),
    defaultValues: { ids: assignedIds },
  })

  useEffect(() => {
    form.reset({ ids: assignedIds })
  }, [assignedIds, form])

  const toggle = (id: string, checked: boolean) => {
    const current = new Set(form.getValues("ids"))
    if (checked) {
      current.add(id)
    } else {
      current.delete(id)
    }
    form.setValue("ids", Array.from(current))
  }

  const submit = (values: { ids: string[] }) => {
    startTransition(async () => {
      const success = await onSubmit(values.ids)
      if (success) {
        form.reset({ ids: values.ids })
      }
    })
  }

  const selected = new Set(form.watch("ids"))

  return (
    <form
      onSubmit={form.handleSubmit(submit)}
      className="flex h-full flex-col gap-4 rounded-lg border bg-muted/50 p-4"
    >
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto rounded-md border bg-background p-3">
        {options.length === 0 ? (
          <p className="text-sm text-muted-foreground">No accounts available.</p>
        ) : (
          options.map((option) => (
            <div key={option.id} className="flex items-center space-x-3">
              <Checkbox
                id={`${title}-${option.id}`}
                checked={selected.has(option.id)}
                onCheckedChange={(value) => toggle(option.id, Boolean(value))}
              />
              <Label htmlFor={`${title}-${option.id}`} className="flex flex-col text-sm">
                <span>{option.name ?? option.email}</span>
                <span className="text-xs text-muted-foreground">{option.email}</span>
              </Label>
            </div>
          ))
        )}
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  )
}
