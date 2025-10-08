"use client"

import { useState, use } from "react"
import * as React from "react"
import { ArrowLeft, Search, Download, BarChart3, TrendingUp, Star, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudentRaporView } from "@/app/dashboard/teacher/_components/student-rapor-view"

type StudentDetailData = {
  id: string
  name: string
  email?: string
  className: string
  groupName?: string
  projects: Array<{
    id: string
    title: string
    grade: number | null
    submissions: Array<{
      id: string
      instrumentType: string
      score: number | null
      feedback: string | null
      submittedAt: string
    }>
    completionRate: number
    lastSubmissionAt?: string
  }>
  averageGrade: number
  totalSubmissions: number
  overallCompletionRate: number
}

type StudentDetailPageProps = {
  params: Promise<{
    classId: string
    studentId: string
  }>
}

export default function StudentDetailPage({ params }: StudentDetailPageProps) {
  const { classId, studentId } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [studentData, setStudentData] = useState<StudentDetailData | null>(null)

  React.useEffect(() => {
    async function loadStudentData() {
      try {
        const response = await fetch(`/api/teacher/student-detail?classId=${classId}&studentId=${studentId}`)
        if (response.ok) {
          const data = await response.json()
          setStudentData(data)
        }
      } finally {
        setLoading(false)
      }
    }

    loadStudentData()
  }, [classId, studentId])

  function GradeBadge({ grade }: { grade: number }) {
    // Update thresholds for 0-100 scale (for overall averages)
    // 3.5/4.0 = 87.5%, 3.0/4.0 = 75%, 2.0/4.0 = 50%
    if (grade >= 87.5) return (
      <Badge variant="default" className="text-xs">Sangat Baik</Badge>
    )
    if (grade >= 75.0) return (
      <Badge variant="default" className="text-xs">Baik</Badge>
    )
    if (grade >= 50.0) return (
      <Badge variant="secondary" className="text-xs">Cukup</Badge>
    )
    if (grade > 0) return (
      <Badge variant="destructive" className="text-xs">Perlu Perbaikan</Badge>
    )
    return null
  }

  function IndividualScoreBadge({ score }: { score: number }) {
    // For individual submission scores (1-4 scale)
    if (score >= 3.5) return (
      <Badge variant="default" className="text-xs">Sangat Baik</Badge>
    )
    if (score >= 3.0) return (
      <Badge variant="default" className="text-xs">Baik</Badge>
    )
    if (score >= 2.0) return (
      <Badge variant="secondary" className="text-xs">Cukup</Badge>
    )
    if (score > 0) return (
      <Badge variant="destructive" className="text-xs">Perlu Perbaikan</Badge>
    )
    return null
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-lg font-semibold mb-2">Memuat...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!studentData) {
    return (
      <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-lg font-semibold mb-2">Siswa tidak ditemukan</div>
            <div className="text-muted-foreground mb-4">
              Siswa yang diminta tidak dapat ditemukan.
            </div>
            <Button onClick={() => router.push(`/dashboard/teacher/reports/${classId}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Kelas
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/dashboard/teacher/reports/${classId}`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Kelas
        </Button>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">{studentData.name}</CardTitle>
                <p className="text-muted-foreground">
                  {studentData.className} {studentData.groupName && `• ${studentData.groupName}`}
                </p>
                {studentData.email && (
                  <p className="text-sm text-muted-foreground">{studentData.email}</p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Nilai Rata-rata</div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{studentData.averageGrade.toFixed(1)}/100</span>
                    <GradeBadge grade={studentData.averageGrade} />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Penyelesaian</div>
                  <div className="text-2xl font-bold">{studentData.overallCompletionRate}%</div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Ekspor Laporan
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Projects Overview */}
      <div className="space-y-4 mb-6">
        {studentData.projects.map((project) => (
          <Card key={project.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{project.title}</CardTitle>
                {project.grade !== null ? (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold">{project.grade.toFixed(1)}</span>
                    <GradeBadge grade={project.grade} />
                  </div>
                ) : (
                  <span className="text-muted-foreground">Belum ada nilai</span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BarChart3 className="h-4 w-4" />
                    Pengumpulan
                  </div>
                  <div className="text-2xl font-bold">{project.submissions.length}</div>
                  <div className="text-xs text-muted-foreground">Total submission</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    Penyelesaian
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${project.completionRate}%` }}
                      />
                    </div>
                    <span className="text-lg font-bold">{project.completionRate}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="h-4 w-4" />
                    Performa
                  </div>
                  <div className="text-lg font-medium text-muted-foreground">
                    {project.submissions.length > 0 ? "Aktif" : "Belum mulai"}
                  </div>
                </div>

                {project.lastSubmissionAt && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Aktivitas Terakhir
                    </div>
                    <div className="text-sm font-medium">
                      {new Date(project.lastSubmissionAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(project.lastSubmissionAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="submissions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="submissions">Pengumpulan</TabsTrigger>
          <TabsTrigger value="rapor">Rapor Detail</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="space-y-4">
          {/* Detailed Submissions */}
          <Card>
            <CardHeader>
              <CardTitle>Semua Pengumpulan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Proyek</TableHead>
                      <TableHead>Tipe Penilaian</TableHead>
                      <TableHead>Skor</TableHead>
                      <TableHead>Feedback</TableHead>
                      <TableHead>Dikumpulkan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentData.projects.flatMap(project =>
                      project.submissions.map(submission => (
                        <TableRow key={`${project.id}-${submission.id}`}>
                          <TableCell className="font-medium">{project.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{submission.instrumentType}</Badge>
                          </TableCell>
                          <TableCell>
                            {submission.score !== null ? (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{submission.score.toFixed(1)}/4</span>
                                <IndividualScoreBadge score={submission.score} />
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Belum dinilai</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {submission.feedback ? (
                              <div className="text-sm max-w-xs truncate">
                                {submission.feedback}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">Tidak ada feedback</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(submission.submittedAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(submission.submittedAt).toLocaleTimeString()}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    {studentData.projects.every(p => p.submissions.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          <div className="py-8 text-muted-foreground">
                            Tidak ada pengumpulan untuk siswa ini.
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rapor" className="space-y-4">
          <StudentRaporView classId={classId} studentId={studentId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}