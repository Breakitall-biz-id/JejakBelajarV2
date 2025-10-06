"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from "recharts"
import { ArrowLeft, Download, Calendar, Filter, Users, TrendingUp, CheckCircle, Clock, BookOpen, Award, Target } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCSVExport } from "@/lib/hooks/use-csv-export"

interface StudentEngagementData {
  siswa_id: string
  nama_siswa: string
  email_siswa: string
  tipe_pengumpulan: string
  deskripsi: string
  tahapan: string
  proyek: string
  tanggal_pengumpulan: string
  konten_length: string | number
  status: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function StudentEngagementReportPage() {
  const [data, setData] = useState<StudentEngagementData[]>([])
  const [loading, setLoading] = useState(true)
  const { exportStudentEngagement } = useCSVExport()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/reports/export/student-engagement')
      if (response.ok) {
        const result = await response.json()
        setData(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching student engagement data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Process data for charts
  const studentSummaries = data.filter(item => item.tipe_pengumpulan === 'RINGKASAN')
  const actualSubmissions = data.filter(item => item.tipe_pengumpulan !== 'RINGKASAN')

  const submissionTypeData = actualSubmissions.reduce((acc: any[], item) => {
    const existing = acc.find(a => a.tipe_pengumpulan === item.tipe_pengumpulan)
    if (existing) {
      existing.count += 1
    } else {
      acc.push({
        tipe_pengumpulan: item.tipe_pengumpulan,
        count: 1
      })
    }
    return acc
  }, [])

  const topEngagedStudents = studentSummaries
    .filter(summary => summary.konten_length && typeof summary.konten_length === 'string')
    .map(summary => {
      const match = summary.konten_length.match(/Total: (\d+)/)
      return {
        nama_siswa: summary.nama_siswa,
        totalSubmissions: match ? parseInt(match[1]) : 0,
        email_siswa: summary.email_siswa,
        status: summary.status
      }
    })
    .sort((a, b) => b.totalSubmissions - a.totalSubmissions)
    .slice(0, 10)

  const uniqueStudents = [...new Set(actualSubmissions.map(d => d.nama_siswa))].length
  const totalSubmissions = actualSubmissions.length
  const avgSubmissionsPerStudent = uniqueStudents > 0 ? Math.round(totalSubmissions / uniqueStudents) : 0

  // Calculate streak data
  const streakData = studentSummaries
    .filter(summary => summary.status && summary.status.includes('Streak'))
    .map(summary => {
      const match = summary.status.match(/Streak: (\d+)/)
      return {
        nama_siswa: summary.nama_siswa,
        streak: match ? parseInt(match[1]) : 0
      }
    })
    .filter(s => s.streak > 0)
    .sort((a, b) => b.streak - a.streak)

  const avgStreak = streakData.length > 0
    ? Math.round(streakData.reduce((sum, s) => sum + s.streak, 0) / streakData.length)
    : 0

  if (loading) {
    return (
      <div className="space-y-6 px-4 pb-10 pt-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold">Memuat data...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 pb-10 pt-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Keterlibatan Siswa</h1>
            <p className="text-muted-foreground">Volume pengumpulan dan streaks</p>
          </div>
        </div>
        <Button onClick={() => exportStudentEngagement()}>
          <Download className="mr-2 h-4 w-4" />
          Unduh CSV
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueStudents}</div>
            <p className="text-xs text-muted-foreground">Siswa aktif</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengumpulan</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">Pengumpulan total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Siswa</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSubmissionsPerStudent}</div>
            <p className="text-xs text-muted-foreground">Rata-rata pengumpulan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Streak</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgStreak} hari</div>
            <p className="text-xs text-muted-foreground">Rata-rata streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tipe Pengumpulan</CardTitle>
            <CardDescription>Distribusi jenis pengumpulan siswa</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={submissionTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ tipe_pengumpulan, percent }) => `${tipe_pengumpulan} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {submissionTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 Siswa Terlibat</CardTitle>
            <CardDescription>Siswa dengan pengumpulan terbanyak</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topEngagedStudents}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nama_siswa" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalSubmissions" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Streak Leaders */}
      {streakData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pemimpin Streak</CardTitle>
            <CardDescription>Siswa dengan streak pengumpulan terpanjang</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {streakData.slice(0, 6).map((student, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{student.nama_siswa}</p>
                    <p className="text-sm text-muted-foreground">{student.streak} hari streak</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Keterlibatan Siswa</CardTitle>
          <CardDescription>Data lengkap pengumpulan dan engagement siswa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left font-medium">Siswa</th>
                    <th className="p-3 text-left font-medium">Tipe</th>
                    <th className="p-3 text-left font-medium">Deskripsi</th>
                    <th className="p-3 text-left font-medium">Proyek</th>
                    <th className="p-3 text-left font-medium">Tahapan</th>
                    <th className="p-3 text-left font-medium">Tanggal</th>
                    <th className="p-3 text-center font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {actualSubmissions.slice(0, 50).map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{item.nama_siswa}</p>
                          <p className="text-sm text-muted-foreground">{item.email_siswa}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant={
                          item.tipe_pengumpulan === 'Journal' ? 'default' :
                          item.tipe_pengumpulan === 'SELF_ASSESSMENT' ? 'secondary' :
                          item.tipe_pengumpulan === 'PEER_ASSESSMENT' ? 'outline' : 'destructive'
                        }>
                          {item.tipe_pengumpulan}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <p className="text-sm">{item.deskripsi}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-medium">{item.proyek}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-sm">{item.tahapan}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-sm">{item.tanggal_pengumpulan}</p>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="default">{item.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {actualSubmissions.length > 50 && (
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Menampilkan 50 dari {actualSubmissions.length} pengumpulan total
            </p>
          )}
        </CardContent>
      </Card>

      {/* Student Summary Cards */}
      {studentSummaries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan per Siswa</CardTitle>
            <CardDescription>Statistik lengkap engagement setiap siswa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {studentSummaries.slice(0, 9).map((summary, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{summary.nama_siswa}</CardTitle>
                    <CardDescription>{summary.email_siswa}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{summary.deskripsi}</p>
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">{summary.tanggal_pengumpulan}</p>
                      <Badge variant="outline">{summary.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {studentSummaries.length > 9 && (
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Menampilkan 9 dari {studentSummaries.length} siswa total
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}