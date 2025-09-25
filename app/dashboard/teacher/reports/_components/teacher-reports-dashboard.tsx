"use client"

import { useMemo, type ComponentType, type SVGProps } from "react"
import { Download, LineChart, Users, Layers3 } from "lucide-react"

import type { TeacherReportData } from "../queries"
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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

type TeacherReportsDashboardProps = {
  data: TeacherReportData
}

export function TeacherReportsDashboard({ data }: TeacherReportsDashboardProps) {
  const aggregate = useMemo(() => {
    if (!data?.classes || !Array.isArray(data.classes) || data.classes.length === 0) {
      return {
        totalStudents: 0,
        totalProjects: 0,
        averageCompletion: 0,
        latestSubmissionAt: null as string | null,
      }
    }

    const totalStudents = data.classes.reduce((acc, item) => acc + (item.totalStudents || 0), 0)
    const totalProjects = data.classes.reduce((acc, item) => acc + (item.totalProjects || 0), 0)
    const averageCompletion = Math.round(
      data.classes.reduce((acc, item) => acc + (item.completionRate || 0), 0) / data.classes.length,
    )

    const latestSubmissionAt = data.classes
      .map((item) => item.lastSubmissionAt)
      .filter((value): value is string => Boolean(value))
      .sort()
      .pop() ?? null

    return {
      totalStudents,
      totalProjects,
      averageCompletion,
      latestSubmissionAt,
    }
  }, [data?.classes])

  return (
    <div className="space-y-6">
      <Card className="border-muted/70 shadow-sm">
        <CardHeader className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle>Performance Snapshot</CardTitle>
            <CardDescription>
              Overview of facilitation coverage and assessment progress across your classes.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/api/teacher/reports?type=summary" download>
                <Download className="mr-2 h-4 w-4" /> Download summary CSV
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/api/teacher/reports?type=student" download>
                <Download className="mr-2 h-4 w-4" /> Download student detail
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <StatTile icon={Users} label="Total students" value={aggregate.totalStudents?.toString() || '0'} helper="Across all assigned classes" />
          <StatTile icon={Layers3} label="Projects in flight" value={aggregate.totalProjects?.toString() || '0'} helper="Draft and published projects" />
          <StatTile
            icon={LineChart}
            label="Avg. stage completion"
            value={`${aggregate.averageCompletion?.toString() || '0'}%`}
            helper="Completed stage assignments"
          />
        </CardContent>
        {aggregate.latestSubmissionAt && (
          <div className="border-t border-muted/60 bg-muted/20 px-6 py-3 text-xs text-muted-foreground">
            Last submission received on {new Date(aggregate.latestSubmissionAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
          </div>
        )}
      </Card>

      <Card className="border-muted/70 shadow-sm">
        <CardHeader>
          <CardTitle>Class progress overview</CardTitle>
          <CardDescription>Monitor completion rates and scoring trends for each class you facilitate.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {!data?.classes || !Array.isArray(data.classes) || data.classes.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
              No classes assigned yet. Once your administrator links you to a class, assessment analytics will appear here.
            </div>
          ) : (
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Stages</TableHead>
                  <TableHead>Completion</TableHead>
                  <TableHead>Observation avg.</TableHead>
                  <TableHead>Reflection avg.</TableHead>
                  <TableHead>Daily note avg.</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.classes.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{item.name || 'Unknown Class'}</span>
                        <span className="text-xs text-muted-foreground">{item.totalStages || 0} stages configured</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.totalStudents || 0}</TableCell>
                    <TableCell>{item.totalProjects || 0}</TableCell>
                    <TableCell>{item.totalStages || 0}</TableCell>
                    <TableCell>
                      <Badge variant={(item.completionRate || 0) >= 75 ? "default" : "secondary"}>{item.completionRate || 0}%</Badge>
                    </TableCell>
                    <TableCell>{formatScore(item.averageScores?.observation)}</TableCell>
                    <TableCell>{formatScore(item.averageScores?.journal)}</TableCell>
                    <TableCell>{formatScore(item.averageScores?.dailyNote)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/api/teacher/reports?type=student&classId=${item.id}`} download>
                          <Download className="mr-2 h-4 w-4" /> Detail CSV
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="border-muted/70 shadow-sm">
        <CardHeader>
          <CardTitle>How to use these exports</CardTitle>
          <CardDescription>Share progress updates with stakeholders or import results into analytics tools.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div>
            <strong>Summary CSV</strong> &mdash; class-level overview covering student counts, configured stages, and average teacher-scored instruments.
          </div>
          <Separator />
          <div>
            <strong>Student detail CSV</strong> &mdash; row-per-student export including stage status, group membership, and instrument feedback for deeper analysis.
          </div>
          <Separator />
          <div>
            Tip: combine these exports with spreadsheets or BI dashboards to track trends across semesters.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

type StatTileProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  label: string
  value: string
  helper: string
}

function StatTile({ icon: Icon, label, value, helper }: StatTileProps) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-semibold leading-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{helper}</p>
        </div>
      </div>
    </div>
  )
}

function formatScore(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—"
  }
  return `${value.toFixed(1)}`
}
