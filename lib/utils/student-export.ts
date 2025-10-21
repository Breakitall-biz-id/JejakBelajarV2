import * as XLSX from 'xlsx'

export interface StudentExportData {
  id: string
  nama: string
  email: string
  kelas: string
  status: string
  createdAt: string
}

export interface ExportResult {
  success: boolean
  data?: {
    totalExported: number
    className?: string
    allClasses?: string[]
  }
  error?: string
}

/**
 * Generate Excel file untuk export data siswa
 * @param students Array of student data
 * @param className Optional class name for filtering
 * @returns Buffer of Excel file
 */
export function generateStudentExportExcel(
  students: StudentExportData[],
  className?: string
): Buffer {
  // Prepare data for export
  const exportData = students.map((student, index) => ({
    'No': index + 1,
    'Nama Lengkap': student.nama,
    'Email': student.email,
    'Kelas': student.kelas,
    'Status': student.status,
    'Tanggal Dibuat': new Date(student.createdAt).toLocaleDateString('id-ID'),
    'Password Default': 'jejakbelajar123'
  }))

  // Create empty worksheet first
  const ws = XLSX.utils.aoa_to_sheet([])

  // Set column widths
  const colWidths = [
    { wch: 8 },   // No column width
    { wch: 30 },  // Nama Lengkap column width
    { wch: 35 },  // Email column width
    { wch: 15 },  // Kelas column width
    { wch: 10 },  // Status column width
    { wch: 15 },  // Tanggal Dibuat column width
    { wch: 20 },  // Password Default column width
  ]
  ws['!cols'] = colWidths

  // Create workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Data Siswa')

  // Add the data directly
  XLSX.utils.sheet_add_json(ws, exportData, { origin: 'A1' })

  // Generate buffer
  const excelBuffer = XLSX.write(wb, {
    bookType: 'xlsx',
    type: 'buffer',
    compression: true
  })

  return excelBuffer as Buffer
}

/**
 * Generate Excel file untuk export credentials (email dan password)
 * @param students Array of student data with passwords
 * @returns Buffer of Excel file
 */
export function generateStudentCredentialsExcel(
  students: Array<{
    nama: string
    email: string
    kelas: string
    password: string
  }>
): Buffer {
  // Prepare data for export
  const exportData = students.map((student, index) => ({
    'No': index + 1,
    'Nama Lengkap': student.nama,
    'Email': student.email,
    'Password': student.password,
    'Kelas': student.kelas
  }))

  // Create empty worksheet first
  const ws = XLSX.utils.aoa_to_sheet([])

  // Set column widths
  const colWidths = [
    { wch: 8 },   // No column width
    { wch: 30 },  // Nama Lengkap column width
    { wch: 35 },  // Email column width
    { wch: 25 },  // Password column width
    { wch: 15 },  // Kelas column width
  ]
  ws['!cols'] = colWidths

  // Create workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Credentials Siswa')

  // Add the data directly
  XLSX.utils.sheet_add_json(ws, exportData, { origin: 'A1' })

  // Generate buffer
  const excelBuffer = XLSX.write(wb, {
    bookType: 'xlsx',
    type: 'buffer',
    compression: true
  })

  return excelBuffer as Buffer
}