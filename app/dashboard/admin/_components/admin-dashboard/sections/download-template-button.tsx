"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import { toast } from "sonner"

export function DownloadTemplateButton() {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (isDownloading) return

    setIsDownloading(true)
    try {
      const response = await fetch('/api/admin/students/download-template')

      if (!response.ok) {
        throw new Error('Gagal download template')
      }

      // Get blob from response
      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'template-import-siswa-jejakbelajar.xlsx'
      document.body.appendChild(a)
      a.click()

      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Template berhasil diunduh')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Gagal mengunduh template')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleDownload}
      disabled={isDownloading}
      className="gap-2"
    >
      {isDownloading ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Mendownload...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Download Template
        </>
      )}
    </Button>
  )
}