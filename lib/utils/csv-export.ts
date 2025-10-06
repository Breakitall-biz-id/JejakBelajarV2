/**
 * CSV Export Utilities
 *
 * Helper functions untuk mengekspor data ke format CSV
 */

export interface CSVExportOptions {
  filename?: string
  separator?: string
  includeHeaders?: boolean
}

/**
 * Convert array of objects ke CSV string
 */
export function convertToCSV<T extends Record<string, any>>(
  data: T[],
  options: CSVExportOptions = {}
): string {
  const {
    separator = ',',
    includeHeaders = true
  } = options

  if (data.length === 0) {
    return includeHeaders ? '' : ''
  }

  const headers = Object.keys(data[0])
  const csvRows: string[] = []

  // Add headers if requested
  if (includeHeaders) {
    csvRows.push(headers.join(separator))
  }

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header]
      // Handle null/undefined values
      if (value === null || value === undefined) {
        return ''
      }
      // Handle values that contain separator or quotes
      const stringValue = String(value)
      if (stringValue.includes(separator) || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    })
    csvRows.push(values.join(separator))
  }

  return csvRows.join('\n')
}

/**
 * Download CSV file
 */
export function downloadCSV(
  csvContent: string,
  filename: string = 'export.csv'
): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

/**
 * Export data ke CSV dengan download otomatis
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  options?: Omit<CSVExportOptions, 'filename'>
): void {
  const csvContent = convertToCSV(data, options)
  downloadCSV(csvContent, filename)
}

/**
 * Format date untuk CSV filename
 */
export function formatDateForFilename(date: Date = new Date()): string {
  return date.toISOString().split('T')[0] // YYYY-MM-DD format
}