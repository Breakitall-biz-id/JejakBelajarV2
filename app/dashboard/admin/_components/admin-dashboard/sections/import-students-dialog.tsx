"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExcelUploadZone } from "./excel-upload-zone"
import { ImportPreviewTable } from "./import-preview-table"
import { DownloadTemplateButton } from "./download-template-button"
import { parseStudentImportExcel, ParsedStudent } from "@/lib/utils/excel-parser"
import { importStudentsFromExcel } from "@/app/dashboard/admin/actions"
import { Upload, Eye, FileText, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface ImportStudentsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

type ImportStep = 'upload' | 'preview' | 'processing' | 'complete'

interface ImportResult {
  totalProcessed: number
  successCount: number
  errorCount: number
  createdClasses: string[]
  results: Array<{
    rowIndex: number
    nama: string
    kelas: string
    email: string
    password: string
    status: string
  }>
  errors: string[]
}

export function ImportStudentsDialog({
  open,
  onOpenChange,
  onSuccess
}: ImportStudentsDialogProps) {
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<{
    students: ParsedStudent[]
    totalRows: number
    validRows: number
    invalidRows: number
  } | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isPending, startTransition] = useTransition()

  const resetState = () => {
    setCurrentStep('upload')
    setSelectedFile(null)
    setParsedData(null)
    setImportResult(null)
  }

  const handleClose = () => {
    if (currentStep === 'processing') return
    resetState()
    onOpenChange(false)
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setCurrentStep('preview')

    // Parse file locally for preview
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const buffer = Buffer.from(e.target?.result as ArrayBuffer)
        const parseResult = parseStudentImportExcel(buffer)
        setParsedData(parseResult)
      } catch (error) {
        console.error('Error parsing file:', error)
        toast.error('Gagal membaca file Excel')
        setCurrentStep('upload')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleConfirmImport = () => {
    if (!selectedFile || !parsedData) return

    setCurrentStep('processing')
    startTransition(async () => {
      try {
        // Convert file to base64
        const fileBuffer = await selectedFile.arrayBuffer()
        const base64String = Buffer.from(fileBuffer).toString('base64')

        // Call server action
        const result = await importStudentsFromExcel({
          fileData: base64String
        })

        if (result.success) {
          setImportResult(result.data as ImportResult)
          setCurrentStep('complete')
          toast.success('Import siswa berhasil!')
          onSuccess?.()
        } else {
          toast.error(result.error || 'Gagal mengimport siswa')
          setCurrentStep('preview')
        }
      } catch (error) {
        console.error('Import error:', error)
        toast.error('Terjadi kesalahan saat mengimport siswa')
        setCurrentStep('preview')
      }
    })
  }

  const handleBack = () => {
    if (currentStep === 'preview') {
      setCurrentStep('upload')
      setSelectedFile(null)
      setParsedData(null)
    }
  }

  const handleDownloadResults = () => {
    if (!importResult) return

    // Create CSV content for results
    const csvContent = [
      ['No', 'Nama', 'Kelas', 'Email', 'Password', 'Status'],
      ...importResult.results.map(result => [
        result.rowIndex,
        result.nama,
        result.kelas,
        result.email,
        result.password,
        result.status
      ])
    ].map(row => row.join(',')).join('\n')

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'hasil-import-siswa-jejakbelajar.csv'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    toast.success('Hasil import berhasil diunduh')
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Upload File Excel</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Pilih file Excel yang berisi data siswa yang akan diimport
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center">
                <DownloadTemplateButton />
              </div>

              <ExcelUploadZone
                onFileSelect={handleFileSelect}
                disabled={isPending}
                maxSize={5}
              />
            </div>

            <div className="text-xs text-muted-foreground text-center">
              <p>Format file: .xlsx atau .xls (maksimal 5MB)</p>
              <p>Struktur kolom: Nama | Kelas</p>
            </div>
          </div>
        )

      case 'preview':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Preview Data</h3>
            </div>

            {parsedData && (
              <ImportPreviewTable
                students={parsedData.students}
                totalRows={parsedData.totalRows}
                validRows={parsedData.validRows}
                invalidRows={parsedData.invalidRows}
              />
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isPending}
              >
                Kembali
              </Button>

              <Button
                onClick={handleConfirmImport}
                disabled={!parsedData || parsedData.validRows === 0 || isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  `Import ${parsedData?.validRows || 0} Siswa`
                )}
              </Button>
            </div>
          </div>
        )

      case 'processing':
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h3 className="text-lg font-semibold">Sedang Memproses</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Membuat akun siswa dan assign ke kelas...
            </p>
            <p className="text-xs text-muted-foreground">
              Mohon tunggu, jangan tutup halaman ini.
            </p>
          </div>
        )

      case 'complete':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-800">Import Berhasil!</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Data siswa berhasil diimport ke sistem
              </p>
            </div>

            {importResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="font-medium text-green-800">Berhasil</p>
                    <p className="text-2xl font-bold text-green-600">
                      {importResult.successCount}
                    </p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="font-medium text-red-800">Gagal</p>
                    <p className="text-2xl font-bold text-red-600">
                      {importResult.errorCount}
                    </p>
                  </div>
                </div>

                {importResult.createdClasses.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="font-medium text-blue-800 text-sm">Kelas yang dibuat:</p>
                    <p className="text-sm text-blue-700 mt-1">
                      {importResult.createdClasses.join(', ')}
                    </p>
                  </div>
                )}

                {importResult.errors.length > 0 && (
                  <div className="bg-amber-50 p-3 rounded-lg">
                    <p className="font-medium text-amber-800 text-sm">Error Details:</p>
                    <ul className="text-xs text-amber-700 mt-1 space-y-1">
                      {importResult.errors.slice(0, 5).map((error, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>{error}</span>
                        </li>
                      ))}
                      {importResult.errors.length > 5 && (
                        <li className="text-amber-600 italic">
                          ...dan {importResult.errors.length - 5} error lainnya
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleClose}
              >
                Tutup
              </Button>

              {importResult && importResult.results.length > 0 && (
                <Button
                  onClick={handleDownloadResults}
                  className="gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Download Hasil
                </Button>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Siswa dari Excel</DialogTitle>
          <DialogDescription>
            Upload file Excel untuk menambahkan data siswa ke sistem
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {renderStepContent()}
        </div>
      </DialogContent>
    </Dialog>
  )
}