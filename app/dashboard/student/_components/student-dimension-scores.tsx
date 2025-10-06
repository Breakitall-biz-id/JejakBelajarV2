"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { DimensionScore, StudentDimensionScores } from "@/lib/scoring/dimension-scorer"
import type { CurrentUser } from "@/lib/auth/session"

type StudentDimensionScoresProps = {
  student: CurrentUser
  projectId: string
}

export function StudentDimensionScores({ student, projectId }: StudentDimensionScoresProps) {
  const [dimensionScores, setDimensionScores] = useState<StudentDimensionScores | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDimensionScores() {
      try {
        const response = await fetch(`/api/student/dimension-scores/${projectId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch dimension scores")
        }
        const data = await response.json()
        setDimensionScores(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kesalahan tidak diketahui")
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      fetchDimensionScores()
    }
  }, [projectId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progres Dimensi</CardTitle>
          <CardDescription>Memuat skor dimensi Anda...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse"></div>
                <div className="h-2 bg-muted rounded animate-pulse"></div>
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
          <CardTitle>Progres Dimensi</CardTitle>
          <CardDescription>Tidak dapat memuat skor dimensi</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!dimensionScores || dimensionScores.dimensionScores.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progres Dimensi</CardTitle>
          <CardDescription>Belum ada skor dimensi</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Kerjakan beberapa penilaian untuk melihat progres berdasarkan dimensi.
          </p>
        </CardContent>
      </Card>
    )
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Progres Dimensi
          <Badge variant={getScoreVariant(dimensionScores.overallAverageScore)}>
            Rata-rata: {dimensionScores.overallAverageScore.toFixed(1)}/100
          </Badge>
        </CardTitle>
        <CardDescription>
          Progres Anda dalam berbagai dimensi Kokurikuler
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Rata-rata Keseluruhan</span>
              <span className={`font-semibold ${getScoreColor(dimensionScores.overallAverageScore)}`}>
                {dimensionScores.overallAverageScore.toFixed(1)}/100
              </span>
            </div>
            <Progress value={getProgressValue(dimensionScores.overallAverageScore)} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {dimensionScores.overallQualitativeScore?.qualitativeScore || dimensionScores.overallQualitativeScore}
            </p>
          </div>

          {/* Dimension Scores */}
          <div className="space-y-4">
            <h4 className="font-medium">Skor Dimensi Detail</h4>
            {dimensionScores.dimensionScores
              .sort((a, b) => b.averageScore - a.averageScore)
              .map((dimension: DimensionScore) => (
                <div key={dimension.dimensionId} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{dimension.dimensionName}</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-sm ${getScoreColor(dimension.averageScore)}`}>
                        {dimension.averageScore.toFixed(1)}/100
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {dimension.qualitativeScore?.qualitativeScore || dimension.qualitativeScore}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={getProgressValue(dimension.averageScore)} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Berdasarkan {dimension.totalSubmissions} penilaian{dimension.totalSubmissions !== 1 ? '' : ''}
                  </p>
                </div>
              ))}
          </div>

          {/* Performance Insights */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Wawasan Kinerja</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-sm font-medium text-green-600">Kelebihan</span>
                <div className="text-sm text-muted-foreground">
                  {dimensionScores.dimensionScores
                    .filter(d => d.averageScore >= 75.0)
                    .map(d => d.dimensionName)
                    .join(', ') || 'Belum ada yang teridentifikasi'}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium text-yellow-600">Perlu Dikembangkan</span>
                <div className="text-sm text-muted-foreground">
                  {dimensionScores.dimensionScores
                    .filter(d => d.averageScore < 75.0 && d.averageScore > 0)
                    .map(d => d.dimensionName)
                    .join(', ') || 'Belum ada yang teridentifikasi'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}