"use client"

import { Fragment } from "react"
import { CalendarCheck2, GraduationCap, Layers3, Users } from "lucide-react"

import type { AdminDashboardData } from "../../../queries"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type OverviewSectionProps = {
  data: AdminDashboardData
  onNavigate?: (section: string) => void
}

const metricIcons = {
  terms: CalendarCheck2,
  classes: Layers3,
  teachers: GraduationCap,
  students: Users,
}

type MetricItem = {
  id: keyof typeof metricIcons
  label: string
  value: number | string
  helper: string
}

export function OverviewSection({ data, onNavigate }: OverviewSectionProps) {
  const activeTerm = data.terms.find((term) => term.status === "ACTIVE")

  const classesWithoutTeacher = data.classes.filter((kelas) =>
    (data.assignments[kelas.id]?.teacherIds.length ?? 0) === 0,
  )
  const classesWithNoStudents = data.classes.filter((kelas) =>
    (data.assignments[kelas.id]?.studentIds.length ?? 0) === 0,
  )

  const averageClassesPerTeacher = data.teachers.length
    ? Math.round(((data.classes.length || 0) / data.teachers.length) * 10) / 10
    : 0
  const averageStudentsPerClass = data.classes.length
    ? Math.round((data.students.length / data.classes.length) * 10) / 10
    : 0

  const metricItems: MetricItem[] = [
    {
      id: "terms",
      label: "Academic Terms",
      value: data.terms.length,
      helper: activeTerm
        ? `${activeTerm.academicYear} • Semester ${activeTerm.semester === "ODD" ? "Ganjil" : "Genap"}`
        : "Activate a term to begin",
    },
    {
      id: "classes",
      label: "Classes",
      value: data.classes.length,
      helper:
        data.classes.length === 0
          ? "No classes created"
          : classesWithoutTeacher.length === 0 && classesWithNoStudents.length === 0
            ? "All classes staffed and enrolled"
            : `${classesWithoutTeacher.length} without facilitator${
                classesWithNoStudents.length ? ` • ${classesWithNoStudents.length} without students` : ""
              }`,
    },
    {
      id: "teachers",
      label: "Teachers",
      value: data.teachers.length,
      helper: data.teachers.length ? `${averageClassesPerTeacher} class avg` : "Invite facilitators",
    },
    {
      id: "students",
      label: "Students",
      value: data.students.length,
      helper: data.students.length ? `${averageStudentsPerClass} learner avg / class` : "Awaiting enrollments",
    },
  ]

  const recentClasses = [...data.classes]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricItems.map((item) => {
          const Icon = metricIcons[item.id]
          return (
            <Card key={item.id} className="border-muted/60">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{item.value}</div>
                <p className="text-xs text-muted-foreground">{item.helper}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-muted/60">
        <CardHeader className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle>Active Term Snapshot</CardTitle>
            <CardDescription>Keep your school calendar aligned with the P5 implementation.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => onNavigate?.("terms")}>
            Manage terms
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeTerm ? (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 p-4">
              <div>
                <p className="text-sm text-muted-foreground">Current semester</p>
                <p className="text-lg font-semibold">
                  {activeTerm.academicYear} • Semester {activeTerm.semester === "ODD" ? "Ganjil" : "Genap"}
                </p>
              </div>
              <Separator orientation="vertical" className="hidden h-10 md:block" />
              <div className="text-sm text-muted-foreground">
                <p>Classes linked: {data.classes.filter((kelas) => kelas.termId === activeTerm.id).length}</p>
                <p>
                  Teachers assigned: {
                    data.classes.filter((kelas) => kelas.termId === activeTerm.id)
                      .filter((kelas) => (data.assignments[kelas.id]?.teacherIds.length ?? 0) > 0).length
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed bg-muted/40 p-6 text-center text-sm text-muted-foreground">
              Activate an academic term to coordinate projects, classes, and assessments.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-muted/60">
        <CardHeader className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle>Recently Created Classes</CardTitle>
            <CardDescription>Track new cohorts and ensure facilitators are in place.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => onNavigate?.("classes")}>
            View all classes
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentClasses.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/40 p-6 text-center text-sm text-muted-foreground">
              No classes have been created yet. Start by setting up a class for the active term.
            </div>
          ) : (
            recentClasses.map((kelas) => {
              const assignment = data.assignments[kelas.id] ?? { teacherIds: [], studentIds: [] }
              const term = data.terms.find((termItem) => termItem.id === kelas.termId)
              return (
                <Fragment key={kelas.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{kelas.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {term ? `${term.academicYear} • Semester ${term.semester === "ODD" ? "Ganjil" : "Genap"}` : "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant={assignment.teacherIds.length ? "outline" : "destructive"}>
                        {assignment.teacherIds.length ? `${assignment.teacherIds.length} teacher${assignment.teacherIds.length > 1 ? "s" : ""}` : "No teacher"}
                      </Badge>
                      <Badge variant="secondary">
                        {assignment.studentIds.length} student{assignment.studentIds.length === 1 ? "" : "s"}
                      </Badge>
                    </div>
                  </div>
                  <Separator className="last:hidden" />
                </Fragment>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
