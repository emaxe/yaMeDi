export type CsvHeader = {
  key: string
  label: string
  metric?: string
}

export function escapeCsvCell(value: string | number | undefined): string {
  if (value === undefined || value === null) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function buildCsv(headers: CsvHeader[], rows: Record<string, string | number | undefined>[]): string {
  const lines: string[] = []
  lines.push(headers.map((h) => escapeCsvCell(h.label)).join(','))
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCsvCell(row[h.key])).join(','))
  }
  return lines.join('\n')
}

export function exportToCsv(
  filename: string,
  headers: CsvHeader[],
  rows: Record<string, string | number | undefined>[]
): void {
  if (rows.length === 0) return
  const csv = buildCsv(headers, rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
