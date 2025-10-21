import * as XLSX from 'xlsx'

export interface ParsedStudent {
  nama: string
  kelas: string
  rowIndex: number
  errors: string[]
}

export interface ParseResult {
  students: ParsedStudent[]
  totalRows: number
  validRows: number
  invalidRows: number
  errors: string[]
}

/**
 * Parse Excel file untuk import siswa
 * @param buffer Excel file buffer
 * @returns ParseResult dengan parsed students dan validation errors
 */
export function parseStudentImportExcel(buffer: Buffer): ParseResult {
  try {
    // Read workbook
    const wb = XLSX.read(buffer, { type: 'buffer' })

    // Get first worksheet
    const wsname = wb.SheetNames[0]
    const ws = wb.Sheets[wsname]

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][]

    const result: ParseResult = {
      students: [],
      totalRows: jsonData.length,
      validRows: 0,
      invalidRows: 0,
      errors: []
    }

    // Skip header rows and instruction rows
    // Look for actual data start (find row with "Nama" and "Kelas" headers)
    let dataStartIndex = -1

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i]
      if (row && row.length >= 2) {
        const firstCol = String(row[0] || '').toLowerCase()
        const secondCol = String(row[1] || '').toLowerCase()

        if ((firstCol.includes('nama') || firstCol === 'nama') &&
            (secondCol.includes('kelas') || secondCol === 'kelas')) {
          dataStartIndex = i + 1 // Start from next row after headers
          break
        }
      }
    }

    if (dataStartIndex === -1) {
      result.errors.push('Format file tidak valid. Header "Nama" dan "Kelas" tidak ditemukan.')
      return result
    }

    // Parse data rows
    for (let i = dataStartIndex; i < jsonData.length; i++) {
      const row = jsonData[i]
      const actualRowIndex = i + 1 // Excel row number (1-based)

      // Skip empty rows
      if (!row || row.every(cell => !cell || String(cell).trim() === '')) {
        continue
      }

      const student: ParsedStudent = {
        nama: '',
        kelas: '',
        rowIndex: actualRowIndex,
        errors: []
      }

      // Parse Nama (column 0)
      if (row[0]) {
        student.nama = String(row[0]).trim()
      }

      // Parse Kelas (column 1)
      if (row[1]) {
        student.kelas = String(row[1]).trim()
      }

      // Validate required fields
      if (!student.nama) {
        student.errors.push('Nama wajib diisi')
      }

      if (!student.kelas) {
        student.errors.push('Kelas wajib diisi')
      }

      // Validate name format
      if (student.nama && student.nama.length < 2) {
        student.errors.push('Nama minimal 2 karakter')
      }

      if (student.nama && student.nama.length > 100) {
        student.errors.push('Nama maksimal 100 karakter')
      }

      // Validate class format
      if (student.kelas && student.kelas.length < 1) {
        student.errors.push('Kelas minimal 1 karakter')
      }

      if (student.kelas && student.kelas.length > 50) {
        student.errors.push('Kelas maksimal 50 karakter')
      }

      // Check for invalid characters
      const namePattern = /^[a-zA-Z\s\.\-']+$/
      if (student.nama && !namePattern.test(student.nama)) {
        student.errors.push('Nama hanya boleh mengandung huruf, spasi, titik, strip, dan apostrof')
      }

      if (student.errors.length === 0) {
        result.validRows++
      } else {
        result.invalidRows++
      }

      result.students.push(student)
    }

    return result
  } catch (error) {
    console.error('Error parsing Excel file:', error)
    return {
      students: [],
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      errors: ['Gagal membaca file Excel. Pastikan file format benar.']
    }
  }
}

/**
 * Validate file type
 * @param filename File name to validate
 * @returns boolean indicating if file is valid Excel file
 */
export function isValidExcelFile(filename: string): boolean {
  const validExtensions = ['.xlsx', '.xls']
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  return validExtensions.includes(extension)
}

/**
 * Get file size in MB
 * @param buffer File buffer
 * @returns File size in MB
 */
export function getFileSizeInMB(buffer: Buffer): number {
  return buffer.length / (1024 * 1024)
}