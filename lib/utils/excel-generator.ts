import * as XLSX from 'xlsx'

/**
 * Generate Excel template untuk import siswa
 * Format: Nama | Kelas
 */
export function generateStudentImportTemplate(): Buffer {
  // Data template dengan contoh
  const templateData = [
    {
      Nama: 'Budi Santoso',
      Kelas: 'X IPA 1'
    },
    {
      Nama: 'Siti Aminah',
      Kelas: 'X IPS 2'
    },
    {
      Nama: 'Ahmad Rizki',
      Kelas: 'XI BAHASA'
    },
    {
      Nama: 'Dewi Lestari',
      Kelas: 'XII MIPA 3'
    }
  ]

  // Create workbook
  const ws = XLSX.utils.json_to_sheet(templateData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Template Import Siswa')

  // Set column widths
  const colWidths = [
    { wch: 25 }, // Nama column width
    { wch: 15 }, // Kelas column width
  ]
  ws['!cols'] = colWidths

  // Add title row
  XLSX.utils.sheet_add_aoa(ws, [['Template Import Siswa JejakBelajar']], { origin: 'A1' })
  XLSX.utils.sheet_add_aoa(ws, [['']], { origin: 'A2' }) // Empty row
  XLSX.utils.sheet_add_aoa(ws, [['Petunjuk:']], { origin: 'A3' })
  XLSX.utils.sheet_add_aoa(ws, [['1. Hapus contoh data di bawah ini']], { origin: 'A4' })
  XLSX.utils.sheet_add_aoa(ws, [['2. Isi data siswa dengan format yang sama']], { origin: 'A5' })
  XLSX.utils.sheet_add_aoa(ws, [['3. Kolom Nama dan Kelas wajib diisi']], { origin: 'A6' })
  XLSX.utils.sheet_add_aoa(ws, [['4. Upload file yang sudah diisi']], { origin: 'A7' })
  XLSX.utils.sheet_add_aoa(ws, [['']], { origin: 'A8' }) // Empty row
  XLSX.utils.sheet_add_aoa(ws, [['Data Siswa (hapus contoh ini):']], { origin: 'A9' })
  XLSX.utils.sheet_add_aoa(ws, [['']], { origin: 'A10' }) // Empty row

  // Re-add the template data after instructions
  XLSX.utils.sheet_add_json(ws, templateData, { origin: 'A11' })

  // Generate buffer
  const excelBuffer = XLSX.write(wb, {
    bookType: 'xlsx',
    type: 'buffer',
    compression: true
  })

  return excelBuffer as Buffer
}

/**
 * Generate Excel file untuk menampilkan hasil import dengan credentials
 */
export function generateImportResultsFile(results: any[]): Buffer {
  // Create workbook
  const ws = XLSX.utils.json_to_sheet(results)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Hasil Import Siswa')

  // Set column widths
  const colWidths = [
    { wch: 8 },   // No column width
    { wch: 25 },  // Nama column width
    { wch: 30 },  // Email column width
    { wch: 15 },  // Kelas column width
    { wch: 20 },  // Password column width
    { wch: 15 },  // Status column width
  ]
  ws['!cols'] = colWidths

  // Generate buffer
  const excelBuffer = XLSX.write(wb, {
    bookType: 'xlsx',
    type: 'buffer',
    compression: true
  })

  return excelBuffer as Buffer
}