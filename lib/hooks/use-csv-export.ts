'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { exportToCSV, formatDateForFilename } from '@/lib/utils/csv-export'
import { exportToPDF, createReportPDF } from '@/lib/utils/pdf-export'

export type ExportType = 'class-progress' | 'teacher-activity' | 'student-engagement'

export interface ExportOptions {
  termId?: string
  classId?: string
  startDate?: string
  endDate?: string
}

export function useCSVExport() {
  const [isExporting, setIsExporting] = useState<ExportType | null>(null)
  const [isExportingPDF, setIsExportingPDF] = useState<ExportType | null>(null)

  const exportData = async (type: ExportType, options: ExportOptions = {}) => {
    try {
      setIsExporting(type)

      // Build query parameters
      const params = new URLSearchParams()
      if (options.termId) params.append('termId', options.termId)
      if (options.classId) params.append('classId', options.classId)
      if (options.startDate) params.append('startDate', options.startDate)
      if (options.endDate) params.append('endDate', options.endDate)

      // Fetch data from API
      const response = await fetch(`/api/admin/reports/export/${type}?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Gagal mengambil data export')
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Gagal mengekspor data')
      }

      // Generate filename
      const date = formatDateForFilename()
      let filename = ''

      switch (type) {
        case 'class-progress':
          filename = `class-progress-${date}.csv`
          break
        case 'teacher-activity':
          filename = `teacher-activity-${date}.csv`
          break
        case 'student-engagement':
          filename = `student-engagement-${date}.csv`
          break
      }

      // Export to CSV
      exportToCSV(result.data, filename)

      toast.success(`Berhasil mengekspor ${result.total} baris data ke ${filename}`)

    } catch (error) {
      console.error('Export error:', error)
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan saat export data')
    } finally {
      setIsExporting(null)
    }
  }

  const exportClassProgress = (options?: ExportOptions) => {
    exportData('class-progress', options)
  }

  const exportTeacherActivity = (options?: ExportOptions) => {
    exportData('teacher-activity', options)
  }

  const exportStudentEngagement = (options?: ExportOptions) => {
    exportData('student-engagement', options)
  }

  const exportToPDFReport = async (type: ExportType, element?: HTMLElement, options: ExportOptions = {}) => {
    try {
      setIsExportingPDF(type)

      if (element) {
        // Export specific element to PDF
        const titles = {
          'class-progress': 'Laporan Progres Kelas',
          'teacher-activity': 'Laporan Aktivitas Guru',
          'student-engagement': 'Laporan Keterlibatan Siswa'
        }

        await exportToPDF(element, {
          title: titles[type],
          filename: `${type}-${formatDateForFilename()}.pdf`,
          orientation: 'landscape'
        })
      } else {
        // Export data as table PDF
        const response = await fetch(`/api/admin/reports/export/${type}?${new URLSearchParams(options).toString()}`)

        if (!response.ok) {
          throw new Error('Gagal mengambil data export')
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Gagal mengekspor data')
        }

        const titles = {
          'class-progress': 'Laporan Progres Kelas',
          'teacher-activity': 'Laporan Aktivitas Guru',
          'student-engagement': 'Laporan Keterlibatan Siswa'
        }

        const headers = type === 'class-progress' ? [
          { key: 'nama_kelas', label: 'Kelas', width: 2 },
          { key: 'nama_proyek', label: 'Proyek', width: 2 },
          { key: 'nama_tahapan', label: 'Tahapan', width: 1.5 },
          { key: 'tipe_instrumen', label: 'Instrumen', width: 1.5 },
          { key: 'total_pengumpulan', label: 'Total', width: 1 },
          { key: 'pengumpulan_selesai', label: 'Selesai', width: 1 }
        ] : type === 'teacher-activity' ? [
          { key: 'nama_guru', label: 'Guru', width: 2 },
          { key: 'tipe_aktivitas', label: 'Aktivitas', width: 1.5 },
          { key: 'proyek', label: 'Proyek', width: 2 },
          { key: 'tanggal_aktivitas', label: 'Tanggal', width: 1.5 }
        ] : [
          { key: 'nama_siswa', label: 'Siswa', width: 2 },
          { key: 'tipe_pengumpulan', label: 'Tipe', width: 1.5 },
          { key: 'proyek', label: 'Proyek', width: 2 },
          { key: 'tanggal_pengumpulan', label: 'Tanggal', width: 1.5 }
        ]

        await createReportPDF(result.data, titles[type], headers, {
          orientation: 'landscape'
        })
      }

      toast.success(`Berhasil mengekspor PDF ${type}`)
    } catch (error) {
      console.error('PDF Export error:', error)
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan saat export PDF')
    } finally {
      setIsExportingPDF(null)
    }
  }

  return {
    isExporting,
    isExportingPDF,
    exportClassProgress,
    exportTeacherActivity,
    exportStudentEngagement,
    exportToPDFReport,
  }
}