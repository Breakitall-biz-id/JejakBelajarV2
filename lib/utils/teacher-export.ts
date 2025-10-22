import * as XLSX from 'xlsx'

export interface TeacherExportData {
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
  }
  error?: string
}

/**
 * Generate Excel file untuk export data guru
 * @param teachers Array of teacher data
 * @returns Buffer of Excel file
 */
export function generateTeacherExportExcel(
  teachers: TeacherExportData[]
): Buffer {
  // Prepare data for export
  const exportData = teachers.map((teacher, index) => ({
    'No': index + 1,
    'Nama Lengkap': teacher.nama,
    'Email': teacher.email,
    'Kelas yang Diampu': teacher.kelas,
    'Status': teacher.status,
    'Tanggal Dibuat': new Date(teacher.createdAt).toLocaleDateString('id-ID'),
    'Password Default': 'jejakbelajar123'
  }))

  // Create empty worksheet first
  const ws = XLSX.utils.aoa_to_sheet([])

  // Set column widths
  const colWidths = [
    { wch: 8 },   // No column width
    { wch: 30 },  // Nama Lengkap column width
    { wch: 35 },  // Email column width
    { wch: 20 },  // Kelas column width
    { wch: 10 },  // Status column width
    { wch: 15 },  // Tanggal Dibuat column width
    { wch: 20 },  // Password Default column width
  ]
  ws['!cols'] = colWidths

  // Create workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Data Guru')

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
 * Generate Excel file untuk export credentials guru (email dan password)
 * @param teachers Array of teacher data with passwords
 * @returns Buffer of Excel file
 */
export function generateTeacherCredentialsExcel(
  teachers: Array<{
    nama: string
    email: string
    kelas: string
    password: string
  }>
): Buffer {
  // Prepare data for export
  const exportData = teachers.map((teacher, index) => ({
    'No': index + 1,
    'Nama Lengkap': teacher.nama,
    'Email': teacher.email,
    'Password': teacher.password,
    'Kelas yang Diampu': teacher.kelas,
    'Catatan': 'Silakan login menggunakan email dan password di atas. Ubah password setelah login pertama.'
  }))

  // Create empty worksheet first
  const ws = XLSX.utils.aoa_to_sheet([])

  // Set column widths
  const colWidths = [
    { wch: 8 },   // No column width
    { wch: 30 },  // Nama Lengkap column width
    { wch: 35 },  // Email column width
    { wch: 25 },  // Password column width
    { wch: 20 },  // Kelas column width
    { wch: 40 },  // Catatan column width
  ]
  ws['!cols'] = colWidths

  // Create workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Credentials Guru')

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