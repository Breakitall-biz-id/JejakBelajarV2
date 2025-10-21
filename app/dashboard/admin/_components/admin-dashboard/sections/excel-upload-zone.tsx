"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, FileText, AlertCircle, X } from "lucide-react"
import { toast } from "sonner"

interface ExcelUploadZoneProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
  maxSize?: number // in MB
}

export function ExcelUploadZone({
  onFileSelect,
  disabled = false,
  maxSize = 5
}: ExcelUploadZoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]

    if (!file) return

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ]

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      toast.error('Format file tidak valid. Gunakan file Excel (.xlsx atau .xls)')
      return
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSize) {
      toast.error(`Ukuran file terlalu besar. Maksimal ${maxSize}MB`)
      return
    }

    setSelectedFile(file)
    onFileSelect(file)
    toast.success(`File "${file.name}" berhasil dipilih`)
  }, [onFileSelect, maxSize])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    disabled,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false)
  })

  const handleRemoveFile = () => {
    setSelectedFile(null)
  }

  return (
    <Card className={`w-full p-6 border-2 border-dashed transition-colors ${
      isDragging
        ? 'border-primary bg-primary/5'
        : isDragActive
          ? 'border-primary/50 bg-primary/2'
          : 'border-muted-foreground/25'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <div {...getRootProps()}>
        <input {...getInputProps()} />

        {selectedFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-sm">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveFile()
                }}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div className="mb-2">
              <p className="text-sm font-medium">
                {isDragActive ? 'Drop file di sini...' : 'Upload file Excel siswa'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Drag & drop file atau klik untuk browse
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
              <p>Format: .xlsx atau .xls (maks. {maxSize}MB)</p>
              <div className="flex items-center gap-1 text-amber-600">
                <AlertCircle className="h-3 w-3" />
                <span>Pastikan format: Nama | Kelas</span>
              </div>
            </div>
            {!isDragActive && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                disabled={disabled}
              >
                Pilih File
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}