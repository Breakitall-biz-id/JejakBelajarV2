import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { formatDateForFilename } from './csv-export'

export interface PDFOptions {
  filename?: string
  title?: string
  orientation?: 'portrait' | 'landscape'
  format?: 'a4' | 'letter'
  margins?: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

export async function exportToPDF(
  element: HTMLElement,
  options: PDFOptions = {}
): Promise<void> {
  const {
    filename = `laporan-${formatDateForFilename()}.pdf`,
    title = 'Laporan',
    orientation = 'portrait',
    format = 'a4',
    margins = { top: 20, right: 20, bottom: 20, left: 20 }
  } = options

  try {
    // Show loading state
    const originalCursor = document.body.style.cursor
    document.body.style.cursor = 'wait'

    // Create canvas from element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    })

    // Calculate dimensions
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format
    })

    const pdfWidth = pdf.internal.pageSize.getWidth() - margins.left - margins.right
    const pdfHeight = pdf.internal.pageSize.getHeight() - margins.top - margins.bottom
    const imgWidth = canvas.width
    const imgHeight = canvas.height

    // Calculate scale to fit content within PDF bounds
    const ratio = Math.min(pdfWidth / (imgWidth * 0.264583), pdfHeight / (imgHeight * 0.264583))
    const imgX = margins.left
    const imgY = margins.top

    // Add title if provided
    if (title) {
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text(title, pdf.internal.pageSize.getWidth() / 2, 15, { align: 'center' })
    }

    // Add image to PDF
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * 0.264583 * ratio, imgHeight * 0.264583 * ratio)

    // Save PDF
    pdf.save(filename)

    // Restore cursor
    document.body.style.cursor = originalCursor
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Gagal membuat PDF')
  }
}

export async function exportChartToPDF(
  chartElement: HTMLElement,
  title: string,
  options: Partial<PDFOptions> = {}
): Promise<void> {
  return exportToPDF(chartElement, {
    ...options,
    filename: `chart-${title.toLowerCase().replace(/\s+/g, '-')}-${formatDateForFilename()}.pdf`,
    title
  })
}

export async function createReportPDF(
  data: any[],
  title: string,
  headers: { key: string; label: string; width?: number }[],
  options: Partial<PDFOptions> = {}
): Promise<void> {
  const {
    filename = `laporan-${title.toLowerCase().replace(/\s+/g, '-')}-${formatDateForFilename()}.pdf`,
    orientation = 'landscape',
    format = 'a4'
  } = options

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20
  const usableWidth = pageWidth - 2 * margin
  const usableHeight = pageHeight - 2 * margin

  let yPosition = margin

  // Add title
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.text(title, pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 15

  // Add generation date
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, margin, yPosition)
  yPosition += 10

  // Calculate column widths
  const totalColumnWidth = headers.reduce((sum, header) => sum + (header.width || 1), 0)
  const columnWidth = usableWidth / totalColumnWidth

  // Add table headers
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'bold')
  headers.forEach((header) => {
    const x = margin + headers.slice(0, headers.indexOf(header)).reduce((sum, h) => sum + (h.width || 1) * columnWidth, 0)
    pdf.text(header.label, x, yPosition)
  })
  yPosition += 7

  // Add separator line
  pdf.setLineWidth(0.1)
  pdf.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 5

  // Add data rows
  pdf.setFont('helvetica', 'normal')
  const maxRowsPerPage = Math.floor((usableHeight - yPosition) / 7)
  let currentRow = 0

  for (let i = 0; i < data.length; i++) {
    if (currentRow >= maxRowsPerPage) {
      // Add new page
      pdf.addPage()
      yPosition = margin
      currentRow = 0

      // Repeat headers on new page
      pdf.setFont('helvetica', 'bold')
      headers.forEach((header) => {
        const x = margin + headers.slice(0, headers.indexOf(header)).reduce((sum, h) => sum + (h.width || 1) * columnWidth, 0)
        pdf.text(header.label, x, yPosition)
      })
      yPosition += 7
      pdf.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 5
      pdf.setFont('helvetica', 'normal')
    }

    // Add row data
    headers.forEach((header) => {
      const x = margin + headers.slice(0, headers.indexOf(header)).reduce((sum, h) => sum + (h.width || 1) * columnWidth, 0)
      const cellValue = String(data[i][header.key] || '')
      const truncatedValue = cellValue.length > 30 ? cellValue.substring(0, 27) + '...' : cellValue
      pdf.text(truncatedValue, x, yPosition)
    })

    yPosition += 7
    currentRow++
  }

  // Add footer
  const totalPages = pdf.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Halaman ${i} dari ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' })
  }

  // Save PDF
  pdf.save(filename)
}