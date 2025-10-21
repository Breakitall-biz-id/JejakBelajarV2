"use client"

import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { ParsedStudent } from "@/lib/utils/excel-parser"

interface ImportPreviewTableProps {
  students: ParsedStudent[]
  totalRows: number
  validRows: number
  invalidRows: number
}

export function ImportPreviewTable({
  students,
  totalRows,
  validRows,
  invalidRows
}: ImportPreviewTableProps) {
  const hasErrors = invalidRows > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Preview Data Siswa</CardTitle>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span>Total: {totalRows}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span>Valid: {validRows}</span>
          </div>
          {hasErrors && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span>Error: {invalidRows}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center">No</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead className="w-24 text-center">Status</TableHead>
                <TableHead>Errors</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Tidak ada data untuk ditampilkan
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student, index) => (
                  <TableRow
                    key={index}
                    className={student.errors.length > 0 ? 'bg-red-50' : ''}
                  >
                    <TableCell className="text-center">
                      {student.rowIndex}
                    </TableCell>
                    <TableCell className="font-medium">
                      {student.nama}
                    </TableCell>
                    <TableCell>{student.kelas}</TableCell>
                    <TableCell className="text-center">
                      {student.errors.length === 0 ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Valid
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          Error
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {student.errors.length > 0 && (
                        <div className="space-y-1">
                          {student.errors.map((error, errorIndex) => (
                            <div
                              key={errorIndex}
                              className="flex items-start gap-1 text-xs text-red-600"
                            >
                              <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <span>{error}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {hasErrors && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">
                  Perhatian: Terdapat {invalidRows} data dengan error
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Data dengan error tidak akan diimport. Silakan perbaiki data yang error terlebih dahulu.
                </p>
              </div>
            </div>
          </div>
        )}

        {validRows > 0 && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">
                  {validRows} data siswa siap diimport
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Email dan password akan digenerate otomatis untuk setiap siswa.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}