"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts"
import { ArrowLeft, Download, Calendar, Filter, Users, TrendingUp, CheckCircle, Clock, Eye, MessageSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCSVExport } from "@/lib/hooks/use-csv-export"

interface TeacherActivityData {
  guru_id: string
  nama_guru: string
  email_guru: string
  tipe_aktivitas: string
  deskripsi_aktivitas: string
  instrumen_id: string
  tahapan: string
  proyek: string
  tanggal_aktivitas: string
  siswa_id: string
  status: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function TeacherActivityReportPage() {
  const [data, setData] = useState<TeacherActivityData[]>([])
  const [loading, setLoading] = useState(true)
  const { exportTeacherActivity } = useCSVExport()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/reports/export/teacher-activity')
      if (response.ok) {
        const result = await response.json()
        setData(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching teacher activity data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Process data for charts
  const teacherActivityCount = data.reduce((acc: any[], item) => {
    if (item.tipe_aktivitas === 'RINGKASAN') return acc

    const existing = acc.find(t => t.nama_guru === item.nama_guru)
    if (existing) {
      existing.aktivitas += 1
    } else {
      acc.push({
        nama_guru: item.nama_guru,
        aktivitas: 1
      })
    }
    return acc
  }, []).sort((a, b) => b.aktivitas - a.aktivitas).slice(0, 10)

  const activityTypeData = data.reduce((acc: any[], item) => {
    if (item.tipe_aktivitas === 'RINGKASAN') return acc

    const existing = acc.find(a => a.tipe_aktivitas === item.tipe_aktivitas)
    if (existing) {
      existing.count += 1
    } else {
      acc.push({
        tipe_aktivitas: item.tipe_aktivitas,
        count: 1,
        displayName: item.tipe_aktivitas === 'Observasi' ? 'Observasi' : 'Review Peer Assessment'
      })
    }
    return acc
  }, [])

  const uniqueTeachers = [...new Set(data.filter(d => d.tipe_aktivitas !== 'RINGKASAN').map(d => d.nama_guru))].length
  const totalActivities = data.filter(d => d.tipe_aktivitas !== 'RINGKASAN').length

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
            <h1 className="text-2xl font-bold">Aktivitas Guru</h1>
            <p className="text-muted-foreground">Log observasi dan feedback yang dikumpulkan</p>
          </div>
        </div>
        <Button onClick={() => exportTeacherActivity()}>
          <Download className="mr-2 h-4 w-4" />
          Unduh CSV
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guru</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueTeachers}</div>
            <p className="text-xs text-muted-foreground">Guru aktif</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Aktivitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActivities}</div>
            <p className="text-xs text-muted-foreground">Kegiatan total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Observasi</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activityTypeData.find(a => a.tipe_aktivitas === 'Observasi')?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">Sesi observasi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Review Assessment</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activityTypeData.find(a => a.tipe_aktivitas === 'Review Peer Assessment')?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">Review dilakukan</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Guru Aktif</CardTitle>
            <CardDescription>Guru dengan aktivitas terbanyak</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teacherActivityCount}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nama_guru" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="aktivitas" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribusi Tipe Aktivitas</CardTitle>
            <CardDescription>Jenis aktivitas yang dilakukan guru</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={activityTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ displayName, percent }) => `${displayName} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {activityTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Aktivitas Guru</CardTitle>
          <CardDescription>Log lengkap aktivitas observasi dan review</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left font-medium">Guru</th>
                    <th className="p-3 text-left font-medium">Tipe Aktivitas</th>
                    <th className="p-3 text-left font-medium">Deskripsi</th>
                    <th className="p-3 text-left font-medium">Proyek</th>
                    <th className="p-3 text-left font-medium">Tahapan</th>
                    <th className="p-3 text-left font-medium">Tanggal</th>
                    <th className="p-3 text-center font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.filter(item => item.tipe_aktivitas !== 'RINGKASAN').map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{item.nama_guru}</p>
                          <p className="text-sm text-muted-foreground">{item.email_guru}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant={item.tipe_aktivitas === 'Observasi' ? 'default' : 'secondary'}>
                          {item.tipe_aktivitas}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <p className="text-sm">{item.deskripsi_aktivitas}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-medium">{item.proyek}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-sm">{item.tahapan}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-sm">{item.tanggal_aktivitas}</p>
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
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.filter(item => item.tipe_aktivitas === 'RINGKASAN').map((summary, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{summary.nama_guru}</CardTitle>
              <CardDescription>{summary.email_guru}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{summary.deskripsi_aktivitas}</p>
              <Separator className="my-2" />
              <p className="text-xs text-muted-foreground">{summary.tanggal_aktivitas}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}