"use client"

import React, { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { ArrowLeft, Download, Calendar, Filter, Users, TrendingUp, CheckCircle, Clock, FileText } from "lucide-react"
import { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCSVExport } from "@/lib/hooks/use-csv-export"
import { ReportsFilter } from "../../_components/admin-dashboard/sections/reports-filter"

interface ClassProgressData {
  kelas_id: string
  nama_kelas: string
  periode_akademik: string
  status_periode: string
  guru_pengampu: string
  email_guru: string
  proyek_id: string
  nama_proyek: string
  tema_proyek: string
  status_proyek: string
  tahapan_id: string
  nama_tahapan: string
  urutan_tahapan: number
  instrumen_id: string
  tipe_instrumen: string
  wajib: string
  total_pengumpulan: number
  pengumpulan_selesai: number
  tanggal_dibuat_kelas: string
  tanggal_dibuat_proyek: string
}

export default function ClassProgressReportPage() {
  const [data, setData] = useState<ClassProgressData[]>([])
  const [filteredData, setFilteredData] = useState<ClassProgressData[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Record<string, any>>({})
  const { exportClassProgress, exportToPDFReport, isExportingPDF } = useCSVExport()
  const reportRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [data, filters])

  const fetchData = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.termId) params.append('termId', filters.termId)
      if (filters.classId) params.append('classId', filters.classId)

      const response = await fetch(`/api/admin/reports/export/class-progress?${params.toString()}`)
      if (response.ok) {
        const result = await response.json()
        setData(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching class progress data:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...data]

    // Apply date range filter
    if (filters.dateRange?.from || filters.dateRange?.to) {
      filtered = filtered.filter(item => {
        const projectDate = new Date(item.tanggal_dibuat_proyek)
        const fromDate = filters.dateRange?.from
        const toDate = filters.dateRange?.to

        if (fromDate && projectDate < fromDate) return false
        if (toDate && projectDate > toDate) return false
        return true
      })
    }

    // Apply teacher filter
    if (filters.teacherId) {
      filtered = filtered.filter(item => item.email_guru.includes(filters.teacherId))
    }

    // Apply project status filter
    if (filters.projectStatus) {
      filtered = filtered.filter(item => item.status_proyek === filters.projectStatus)
    }

    setFilteredData(filtered)
  }

  const handleFiltersChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters)
  }

  // Process data for charts using filtered data
  const classCompletionData = filteredData.reduce((acc: any[], item) => {
    const existingClass = acc.find(c => c.nama_kelas === item.nama_kelas)
    if (existingClass) {
      existingClass.totalInstruments += 1
      existingClass.completions += item.pengumpulan_selesai
    } else {
      acc.push({
        nama_kelas: item.nama_kelas,
        totalInstruments: 1,
        completions: item.pengumpulan_selesai
      })
    }
    return acc
  }, []).map(c => ({
    ...c,
    completionRate: c.totalInstruments > 0 ? Math.round((c.completions / c.totalInstruments) * 100) : 0
  }))

  const projectStatusData = filteredData.reduce((acc: any[], item) => {
    const existing = acc.find(p => p.status_proyek === item.status_proyek)
    if (existing) {
      existing.count += 1
    } else {
      acc.push({
        status_proyek: item.status_proyek,
        count: 1
      })
    }
    return acc
  }, [])

  // Get unique values for filters
  const availableTerms = [...new Set(data.map(d => d.periode_akademik))].map((term, index) => ({
    id: `term-${index}`,
    name: term,
    status: 'ACTIVE' // Simplified, would need real data
  }))

  const availableClasses = [...new Set(data.map(d => ({ id: d.kelas_id, name: d.nama_kelas, teacherId: d.email_guru })))]

  const availableTeachers = [...new Set(data.map(d => d.email_guru))].map((email, index) => ({
    id: `teacher-${index}`,
    name: email
  }))

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
    <div ref={reportRef} className="space-y-6 px-4 pb-10 pt-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Ringkasan Progres Kelas</h1>
            <p className="text-muted-foreground">Snapshot penyelesaian tahapan per proyek Kokurikuler</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => exportClassProgress()}>
            <Download className="mr-2 h-4 w-4" />
            Unduh CSV
          </Button>
          <Button
            onClick={() => exportToPDFReport('class-progress')}
            disabled={isExportingPDF === 'class-progress'}
          >
            <FileText className="mr-2 h-4 w-4" />
            {isExportingPDF === 'class-progress' ? 'Membuat PDF...' : 'Unduh PDF'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <ReportsFilter
        onFiltersChange={handleFiltersChange}
        availableTerms={availableTerms}
        availableClasses={availableClasses}
        availableTeachers={availableTeachers}
      />

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kelas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classCompletionData.length}</div>
            <p className="text-xs text-muted-foreground">Kelas aktif</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classCompletionData.length > 0
                ? Math.round(classCompletionData.reduce((sum, c) => sum + c.completionRate, 0) / classCompletionData.length)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Rata-rata penyelesaian</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proyek Aktif</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[...new Set(data.map(d => d.proyek_id))].length}
            </div>
            <p className="text-xs text-muted-foreground">Proyek berjalan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Instrumen</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length}</div>
            <p className="text-xs text-muted-foreground">Instrumen total</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tingkat Penyelesaian per Kelas</CardTitle>
            <CardDescription>Persentase penyelesaian instrumen per kelas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classCompletionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nama_kelas" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completionRate" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Proyek</CardTitle>
            <CardDescription>Distribusi status proyek</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status_proyek" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Progres per Kelas</CardTitle>
          <CardDescription>Data lengkap progres penyelesaian instrumen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left font-medium">Kelas</th>
                    <th className="p-3 text-left font-medium">Proyek</th>
                    <th className="p-3 text-left font-medium">Tahapan</th>
                    <th className="p-3 text-left font-medium">Instrumen</th>
                    <th className="p-3 text-center font-medium">Wajib</th>
                    <th className="p-3 text-center font-medium">Pengumpulan</th>
                    <th className="p-3 text-center font-medium">Selesai</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{item.nama_kelas}</p>
                          <p className="text-sm text-muted-foreground">{item.guru_pengampu}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{item.nama_proyek}</p>
                          <p className="text-sm text-muted-foreground">{item.tema_proyek}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{item.nama_tahapan}</p>
                          <p className="text-sm text-muted-foreground">Urutan {item.urutan_tahapan}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant={item.tipe_instrumen === 'JOURNAL' ? 'default' : 'secondary'}>
                          {item.tipe_instrumen}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={item.wajib === 'Ya' ? 'default' : 'outline'}>
                          {item.wajib}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">{item.total_pengumpulan}</td>
                      <td className="p-3 text-center">{item.pengumpulan_selesai}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}