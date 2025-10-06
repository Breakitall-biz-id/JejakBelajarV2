"use client"

import { useMemo } from "react"
import { Download, LineChart, PieChart, Share2, Calendar, Filter } from "lucide-react"
import { useRouter } from "next/navigation"

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useCSVExport } from "@/lib/hooks/use-csv-export"

const reportShortcuts = [
  {
    id: "class-progress",
    title: "Ringkasan Progres Kelas",
    description: "Snapshot penyelesaian tahapan per proyek Kokurikuler",
    icon: LineChart,
  },
  {
    id: "teacher-activity",
    title: "Aktivitas Guru",
    description: "Log observasi dan feedback yang dikumpulkan",
    icon: Share2,
  },
  {
    id: "student-engagement",
    title: "Keterlibatan Siswa",
    description: "Volume pengumpulan dan streaks",
    icon: PieChart,
  },
] as const

type ReportsSectionProps = {
  data: AdminDashboardData
}

export function ReportsSection({ data }: ReportsSectionProps) {
  const router = useRouter()
  const { isExporting, exportClassProgress, exportTeacherActivity, exportStudentEngagement } = useCSVExport()
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
            <CardTitle>Pusat Unduhan</CardTitle>
            <CardDescription>Ekspor data untuk akreditasi, pelaporan, atau review internal.</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                {isExporting === 'class-progress' ? 'Mengunduh...' : 'Ekspor CSV'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => exportClassProgress()} disabled={isExporting !== null}>
                <LineChart className="mr-2 h-4 w-4" />
                Progress Kelas
                <span className="ml-auto text-xs text-muted-foreground">Detail</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportTeacherActivity()} disabled={isExporting !== null}>
                <Share2 className="mr-2 h-4 w-4" />
                Aktivitas Guru
                <span className="ml-auto text-xs text-muted-foreground">Logs</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportStudentEngagement()} disabled={isExporting !== null}>
                <PieChart className="mr-2 h-4 w-4" />
                Keterlibatan Siswa
                <span className="ml-auto text-xs text-muted-foreground">Engagement</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <Calendar className="mr-2 h-4 w-4" />
                Filter Tanggal (Coming Soon)
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Filter className="mr-2 h-4 w-4" />
                Filter Lanjutan (Coming Soon)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-muted/40 p-4">
            <p className="text-sm text-muted-foreground">Cakupan guru</p>
            <p className="text-2xl font-semibold">{coverage.teacherCoverage}%</p>
            <p className="text-xs text-muted-foreground">
              Kelas dengan minimal satu fasilitator yang ditugaskan.
            </p>
          </div>
          <div className="rounded-lg border bg-muted/40 p-4">
            <p className="text-sm text-muted-foreground">Cakupan pendaftaran</p>
            <p className="text-2xl font-semibold">{coverage.enrollmentCoverage}%</p>
            <p className="text-xs text-muted-foreground">
              Kelas dengan siswa terdaftar untuk periode aktif.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-muted/60">
        <CardHeader>
          <CardTitle>Laporan Populer</CardTitle>
          <CardDescription>Gunakan pintasan di bawah untuk melihat insight yang paling sering diminta.</CardDescription>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (shortcut.id === 'class-progress') {
                        router.push('/dashboard/admin/reports/class-progress')
                      } else if (shortcut.id === 'teacher-activity') {
                        router.push('/dashboard/admin/reports/teacher-activity')
                      } else if (shortcut.id === 'student-engagement') {
                        router.push('/dashboard/admin/reports/student-engagement')
                      }
                    }}
                  >
                    Lihat detail
                  </Button>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card className="border-muted/60">
        <CardHeader>
          <CardTitle>Daftar Periksa Data</CardTitle>
          <CardDescription>Selesaikan item di bawah untuk ekspor data yang bersih.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.classes.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/40 p-6 text-center text-sm text-muted-foreground">
              Buat kelas dan tetapkan fasilitator untuk menghasilkan laporan detail.
            </div>
          ) : (
            <>
              <ChecklistItem
                label="Kelas tanpa fasilitator"
                value={data.classes.filter((kelas) => (data.assignments[kelas.id]?.teacherIds.length ?? 0) === 0).length}
              />
              <Separator />
              <ChecklistItem
                label="Kelas tanpa siswa terdaftar"
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
