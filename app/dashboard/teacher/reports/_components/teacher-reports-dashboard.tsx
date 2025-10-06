"use client"

import { useMemo, useState } from "react"
import { Download, Users, BookOpen, Target, TrendingUp, Search } from "lucide-react"

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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type TeacherReportsDashboardProps = {
  data: TeacherReportData
}

export function TeacherReportsDashboard({ data }: TeacherReportsDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState<string>("all")
  const [selectedAssignment, setSelectedAssignment] = useState<string>("all")

  const aggregate = useMemo(() => {
    if (!data?.classes || !Array.isArray(data.classes) || data.classes.length === 0) {
      return {
        totalStudents: 0,
        totalProjects: 0,
        averageCompletion: 0,
        averageGrade: 0,
        latestSubmissionAt: null as string | null,
      }
    }

    const totalStudents = data.classes.reduce((acc, item) => acc + (item.totalStudents || 0), 0)
    const totalProjects = data.classes.reduce((acc, item) => acc + (item.totalProjects || 0), 0)
    const averageCompletion = Math.round(
      data.classes.reduce((acc, item) => acc + (item.completionRate || 0), 0) / data.classes.length,
    )

    const averageGrade = Math.round(
      data.classes.reduce((acc, item) => {
        // Use overallAverageScore from dimension-based calculation
        const avgScore = item.overallAverageScore || 0
        return acc + avgScore
      }, 0) / data.classes.length
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
      averageGrade,
      latestSubmissionAt,
    }
  }, [data?.classes])

  const filteredClasses = useMemo(() => {
    if (!data?.classes) return []

    return data.classes.filter(cls => {
      const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesClass = selectedClass === "all" || cls.id === selectedClass
      return matchesSearch && matchesClass
    })
  }, [data?.classes, searchTerm, selectedClass])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nilai</h1>
          <p className="text-muted-foreground">
            Pantau kemajuan siswa dan penyelesaian tugas di semua kelas Anda
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/api/teacher/reports?type=summary" download>
              <Download className="mr-2 h-4 w-4" />
              Ekspor Ringkasan
            </a>
          </Button>
          <Button size="sm" asChild>
            <a href="/api/teacher/reports?type=student" download>
              <Download className="mr-2 h-4 w-4" />
              Ekspor Semua Nilai
            </a>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aggregate.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Seluruh kelas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tugas Aktif</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aggregate.totalProjects}</div>
            <p className="text-xs text-muted-foreground">Proyek dan tahapan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nilai Rata-rata</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aggregate.averageGrade.toFixed(1)}/100</div>
            <p className="text-xs text-muted-foreground">Skala 0-100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tingkat Penyelesaian</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aggregate.averageCompletion}%</div>
            <p className="text-xs text-muted-foreground">Penyelesaian rata-rata</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Tabs removed - only showing classes overview */}

        {/* Classes Overview */}
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari kelas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Semua kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kelas</SelectItem>
                    {data?.classes?.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Classes Table */}
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Kelas</CardTitle>
              <CardDescription>
                Pantau kemajuan dan performa setiap kelas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!filteredClasses.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  Tidak ada kelas yang cocok dengan kriteria pencarian Anda.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Kelas</TableHead>
                        <TableHead>Siswa</TableHead>
                        <TableHead>Proyek</TableHead>
                        <TableHead>Nilai Rata-rata</TableHead>
                        <TableHead>Penyelesaian</TableHead>
                        <TableHead>Aktivitas Terakhir</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClasses.map((cls) => (
                        <TableRow key={cls.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{cls.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {cls.totalStages} tahapan dikonfigurasi
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              {cls.totalStudents}
                            </div>
                          </TableCell>
                          <TableCell>{cls.totalProjects}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {calculateOverallGrade(cls).toFixed(1)}/100
                              </span>
                              <GradeBadge grade={calculateOverallGrade(cls)} />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{ width: `${cls.completionRate}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium min-w-fit">
                                {cls.completionRate}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {cls.lastSubmissionAt ? (
                              <div className="text-sm">
                                {new Date(cls.lastSubmissionAt).toLocaleDateString()}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">Tidak ada aktivitas</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <a href={`/api/teacher/reports?type=student&classId=${cls.id}`} download>
                                  <Download className="mr-2 h-4 w-4" />
                                  Nilai
                                </a>
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <a href={`/dashboard/teacher/reports/${cls.id}`}>
                                  Lihat Detail
                                </a>
                              </Button>
                              <Button size="sm" asChild>
                                <a href={`/dashboard/teacher/reports/${cls.id}?view=rapor`}>
                                  📊 Rapor
                                </a>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
      </div>
    </div>
  )
}

function calculateOverallGrade(cls: any) {
  // Use the new overallAverageScore from dimension-based calculation
  return cls.overallAverageScore || 0
}

function GradeBadge({ grade }: { grade: number }) {
  let variant: "default" | "secondary" | "destructive" = "secondary"
  let label = ""

  // Update thresholds for 0-100 scale
  // 3.5/4.0 = 87.5%, 3.0/4.0 = 75%, 2.0/4.0 = 50%
  if (grade >= 87.5) {
    variant = "default"
    label = "Sangat Baik"
  } else if (grade >= 75.0) {
    variant = "default"
    label = "Baik"
  } else if (grade >= 50.0) {
    variant = "secondary"
    label = "Cukup"
  } else if (grade > 0) {
    variant = "destructive"
    label = "Perlu Perbaikan"
  }

  if (!label) return null

  return (
    <Badge variant={variant} className="text-xs">
      {label}
    </Badge>
  )
}