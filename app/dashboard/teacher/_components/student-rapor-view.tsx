"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Download,
  Star,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  User,
  BookOpen,
  Calendar,
  BarChart3
} from "lucide-react"
import type { StudentRaporData } from "@/app/api/teacher/student-rapor/[classId]/[studentId]/route"

type StudentRaporViewProps = {
  classId: string
  studentId: string
}

export function StudentRaporView({ classId, studentId }: StudentRaporViewProps) {
  const [raporData, setRaporData] = useState<StudentRaporData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRaporData() {
      try {
        const response = await fetch(`/api/teacher/student-rapor/${classId}/${studentId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch rapor data")
        }
        const data = await response.json()
        setRaporData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kesalahan tidak diketahui")
      } finally {
        setLoading(false)
      }
    }

    if (classId && studentId) {
      fetchRaporData()
    }
  }, [classId, studentId])

  const handleDownloadPDF = async () => {
    if (!raporData) return

    try {
      const response = await fetch(`/api/student/rapor/${raporData.project.id}/pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(raporData),
      })

      if (!response.ok) {
        throw new Error("Failed to generate PDF")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `rapor-${raporData.project.title}-${raporData.student.name}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error("Error mengunduh PDF:", err)
      // Fallback to print
      window.print()
    }
  }

  const getScoreColor = (score: number) => {
    // Update thresholds for 0-100 scale
    // 3.5/4.0 = 87.5%, 3.0/4.0 = 75%, 2.0/4.0 = 50%
    if (score >= 87.5) return "text-green-600"
    if (score >= 75.0) return "text-blue-600"
    if (score >= 50.0) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreVariant = (score: number): "default" | "secondary" | "destructive" => {
    // Update thresholds for 0-100 scale
    if (score >= 75.0) return "default"
    if (score >= 50.0) return "secondary"
    return "destructive"
  }

  const getProgressValue = (score: number) => {
    // Score is already in 0-100 scale, so return directly
    return score
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Memuat Rapor Siswa...</CardTitle>
          <CardDescription>Mengambil data penilaian siswa...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse"></div>
                <div className="h-2 bg-muted rounded animate-pulse w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Tidak dapat memuat rapor siswa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!raporData) {
    return null
  }

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Rapor Kokurikuler Siswa</CardTitle>
              <CardDescription>
                Laporan Penilaian Proyek Kokurikuler - {raporData.project.theme}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleDownloadPDF} className="print:hidden">
                <Download className="mr-2 h-4 w-4" />
                Unduh PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                Siswa
              </div>
              <p className="font-semibold">{raporData.student.name}</p>
              <p className="text-xs text-muted-foreground">{raporData.student.email}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                Proyek
              </div>
              <p className="font-semibold">{raporData.project.title}</p>
              <p className="text-xs text-muted-foreground">{raporData.class.name}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Tahun Ajaran
              </div>
              <p className="font-semibold">{raporData.class.academicYear}</p>
              <p className="text-xs text-muted-foreground">Semester {raporData.class.semester}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4" />
                Nilai Keseluruhan
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-lg ${getScoreColor(raporData.overallAverageScore)}`}>
                  {raporData.overallAverageScore.toFixed(1)}/100
                </span>
                <Badge variant={getScoreVariant(raporData.overallAverageScore)}>
                  {raporData.overallQualitativeCode}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs defaultValue="dimensions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dimensions" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Detail Dimensi
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analisis Performa
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Rekomendasi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dimensions" className="space-y-4">
          {/* Ringkasan Performa Keseluruhan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Ringkasan Performa Keseluruhan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Nilai Rata-rata Keseluruhan</span>
                    <span className={`font-bold ${getScoreColor(raporData.overallAverageScore)}`}>
                      {raporData.overallAverageScore.toFixed(1)}/100
                    </span>
                  </div>
                  <Progress value={getProgressValue(raporData.overallAverageScore)} className="h-3" />
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={getScoreVariant(raporData.overallAverageScore)} className="text-sm">
                      {raporData.overallQualitativeScore}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {raporData.overallQualitativeDescription}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Dimension Scores */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Performa Dimensi</CardTitle>
              <CardDescription>
                Penilaian mendalam di berbagai dimensi Kokurikuler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {raporData.dimensionScores
                  .sort((a, b) => b.averageScore - a.averageScore)
                  .map((dimension, index) => (
                    <div key={dimension.dimensionId} className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">#{index + 1} {dimension.dimensionName}</span>
                            <Badge variant="outline" className="text-xs">
                              {dimension.qualitativeCode}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Berdasarkan {dimension.totalSubmissions} penilaian
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${getScoreColor(dimension.averageScore)}`}>
                            {dimension.averageScore.toFixed(1)}/100
                          </div>
                          <Badge variant={getScoreVariant(dimension.averageScore)} className="text-xs mt-1">
                            {dimension.qualitativeScore}
                          </Badge>
                        </div>
                      </div>

                      <Progress value={getProgressValue(dimension.averageScore)} className="h-2" />

                      <div className="bg-muted/30 rounded-lg p-3">
                        <p className="text-sm text-muted-foreground">
                          {dimension.qualitativeDescription}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  Kelebihan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {raporData.performanceInsights.strengths.length > 0 ? (
                  <ul className="space-y-2">
                    {raporData.performanceInsights.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Terus kembangkan keterampilan dan kelebihan siswa.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Areas for Improvement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-600">
                  <AlertCircle className="h-5 w-5" />
                  Area Pengembangan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {raporData.performanceInsights.areasForImprovement.length > 0 ? (
                  <ul className="space-y-2">
                    {raporData.performanceInsights.areasForImprovement.map((area, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{area}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Tidak ada area pengembangan khusus yang diidentifikasi saat ini.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Lightbulb className="h-5 w-5" />
                Rekomendasi Pengembangan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {raporData.performanceInsights.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground print:mt-8">
        <Separator className="mb-4" />
        <p>Dibuat pada {new Date(raporData.generatedAt).toLocaleString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
        <p className="mt-1">Rapor Kokurikuler - Sistem Penilaian Proyek Kokurikuler</p>
      </div>
    </div>
  )
}