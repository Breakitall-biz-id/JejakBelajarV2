"use client"

import { useMemo } from "react"
import { Download, LineChart, PieChart, Share2 } from "lucide-react"

import type { AdminDashboardData } from "../../../queries"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const reportShortcuts = [
  {
    id: "class-progress",
    title: "Class Progress Overview",
    description: "Stage completion snapshot per PjBL project",
    icon: LineChart,
  },
  {
    id: "teacher-activity",
    title: "Teacher Activity",
    description: "Observation and feedback submission logs",
    icon: Share2,
  },
  {
    id: "student-engagement",
    title: "Student Engagement",
    description: "Submission volume and streaks",
    icon: PieChart,
  },
] as const

type ReportsSectionProps = {
  data: AdminDashboardData
}

export function ReportsSection({ data }: ReportsSectionProps) {
  const coverage = useMemo(() => {
    const classesWithTeacher = data.classes.filter((kelas) => (data.assignments[kelas.id]?.teacherIds.length ?? 0) > 0)
    const classesWithStudents = data.classes.filter((kelas) => (data.assignments[kelas.id]?.studentIds.length ?? 0) > 0)

    return {
      teacherCoverage: data.classes.length
        ? Math.round((classesWithTeacher.length / data.classes.length) * 100)
        : 0,
      enrollmentCoverage: data.classes.length
        ? Math.round((classesWithStudents.length / data.classes.length) * 100)
        : 0,
    }
  }, [data.classes, data.assignments])

  return (
    <div className="space-y-6">
      <Card className="border-muted/60">
        <CardHeader className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle>Download Center</CardTitle>
            <CardDescription>Export data for accreditation, reporting, or internal reviews.</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-muted/40 p-4">
            <p className="text-sm text-muted-foreground">Teacher coverage</p>
            <p className="text-2xl font-semibold">{coverage.teacherCoverage}%</p>
            <p className="text-xs text-muted-foreground">
              Classes with at least one assigned facilitator.
            </p>
          </div>
          <div className="rounded-lg border bg-muted/40 p-4">
            <p className="text-sm text-muted-foreground">Enrollment coverage</p>
            <p className="text-2xl font-semibold">{coverage.enrollmentCoverage}%</p>
            <p className="text-xs text-muted-foreground">
              Classes with enrolled students for the active term.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-muted/60">
        <CardHeader>
          <CardTitle>Popular Reports</CardTitle>
          <CardDescription>Use the shortcuts below to jump into the insights your stakeholders request most.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {reportShortcuts.map((shortcut) => {
            const Icon = shortcut.icon
            return (
              <div key={shortcut.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </span>
                    <div>
                      <p className="font-semibold">{shortcut.title}</p>
                      <p className="text-xs text-muted-foreground">{shortcut.description}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View details
                  </Button>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card className="border-muted/60">
        <CardHeader>
          <CardTitle>Data Health Checklist</CardTitle>
          <CardDescription>Resolve the items below for clean exports.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.classes.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/40 p-6 text-center text-sm text-muted-foreground">
              Create classes and assign facilitators to generate detailed reports.
            </div>
          ) : (
            <>
              <ChecklistItem
                label="Classes missing facilitators"
                value={data.classes.filter((kelas) => (data.assignments[kelas.id]?.teacherIds.length ?? 0) === 0).length}
              />
              <Separator />
              <ChecklistItem
                label="Classes without enrolled students"
                value={data.classes.filter((kelas) => (data.assignments[kelas.id]?.studentIds.length ?? 0) === 0).length}
              />
              <Separator />
              <ChecklistItem label="Periode akademik aktif" value={data.terms.filter((term) => term.status === "ACTIVE").length} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

type ChecklistItemProps = {
  label: string
  value: number
}

function ChecklistItem({ label, value }: ChecklistItemProps) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <p>{label}</p>
      <Badge variant={value === 0 ? "secondary" : "destructive"}>{value}</Badge>
    </div>
  )
}
