import { describe, expect, it, vi } from 'vitest'

import { exportToCsv } from './csvExport'
import { exportData } from './dataExport'
import { exportToPdf } from './pdfExport'
import { exportToXlsx } from './xlsxExport'

vi.mock('./csvExport', () => ({
  exportToCsv: vi.fn(),
  CsvHeader: {},
}))

vi.mock('./xlsxExport', () => ({
  exportToXlsx: vi.fn(),
}))

vi.mock('./pdfExport', () => ({
  exportToPdf: vi.fn(),
}))

describe('exportData', () => {
  const headers = [{ key: 'name', label: 'Name' }]
  const rows = [{ name: 'Alice' }]

  it('calls exportToCsv for csv format', () => {
    exportData('test.csv', headers, rows, 'csv')
    expect(exportToCsv).toHaveBeenCalledWith('test.csv', headers, rows)
    expect(exportToXlsx).not.toHaveBeenCalled()
    expect(exportToPdf).not.toHaveBeenCalled()
  })

  it('calls exportToXlsx with .xlsx extension for xlsx format', () => {
    vi.mocked(exportToXlsx).mockClear()
    exportData('test.csv', headers, rows, 'xlsx')
    expect(exportToXlsx).toHaveBeenCalledWith('test.xlsx', headers, rows)
    expect(exportToPdf).not.toHaveBeenCalled()
  })

  it('calls exportToPdf with .pdf extension for pdf format', () => {
    vi.mocked(exportToCsv).mockClear()
    vi.mocked(exportToXlsx).mockClear()
    vi.mocked(exportToPdf).mockClear()
    exportData('test.csv', headers, rows, 'pdf')
    expect(exportToPdf).toHaveBeenCalledWith('test.pdf', headers, rows)
    expect(exportToCsv).not.toHaveBeenCalled()
    expect(exportToXlsx).not.toHaveBeenCalled()
  })

  it('replaces .csv extension with .xlsx', () => {
    vi.mocked(exportToXlsx).mockClear()
    exportData('report-2024-01-01.csv', headers, rows, 'xlsx')
    expect(exportToXlsx).toHaveBeenCalledWith('report-2024-01-01.xlsx', headers, rows)
  })

  it('replaces .csv extension with .pdf', () => {
    vi.mocked(exportToPdf).mockClear()
    exportData('report-2024-01-01.csv', headers, rows, 'pdf')
    expect(exportToPdf).toHaveBeenCalledWith('report-2024-01-01.pdf', headers, rows)
  })

  it('does nothing when rows are empty', () => {
    vi.mocked(exportToCsv).mockClear()
    vi.mocked(exportToXlsx).mockClear()
    vi.mocked(exportToPdf).mockClear()
    exportData('test.csv', headers, [], 'csv')
    expect(exportToCsv).not.toHaveBeenCalled()
    exportData('test.csv', headers, [], 'xlsx')
    expect(exportToXlsx).not.toHaveBeenCalled()
    exportData('test.csv', headers, [], 'pdf')
    expect(exportToPdf).not.toHaveBeenCalled()
  })
})
