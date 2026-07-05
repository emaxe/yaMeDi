import { exportToCsv, type CsvHeader } from './csvExport'
import { exportToPdf } from './pdfExport'
import { exportToXlsx } from './xlsxExport'

export type ExportFormat = 'csv' | 'pdf' | 'xlsx'

export type ExportHeader = CsvHeader

export function exportData(
  filename: string,
  headers: ExportHeader[],
  rows: Record<string, string | number | undefined>[],
  format: ExportFormat
): void {
  if (rows.length === 0) return
  if (format === 'xlsx') {
    const xlsxFilename = filename.replace(/\.csv$/, '.xlsx')
    exportToXlsx(xlsxFilename, headers, rows)
  } else if (format === 'pdf') {
    const pdfFilename = filename.replace(/\.csv$/, '.pdf')
    exportToPdf(pdfFilename, headers, rows)
  } else {
    exportToCsv(filename, headers, rows)
  }
}
