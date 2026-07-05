import { zipSync, strToU8 } from 'fflate'

import type { CsvHeader } from './csvExport'

export type XlsxHeader = CsvHeader

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function colLetter(index: number): string {
  let result = ''
  let n = index
  while (n >= 0) {
    result = String.fromCharCode(65 + (n % 26)) + result
    n = Math.floor(n / 26) - 1
  }
  return result
}

function buildSharedStrings(values: string[]): string {
  const items = values
    .map((v) => `    <si><t xml:space="preserve">${escapeXml(v)}</t></si>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${values.length}" uniqueCount="${values.length}">
${items}
</sst>`
}

function buildSheetXml(
  rows: Record<string, string | number | undefined>[],
  headers: XlsxHeader[],
  sharedStringsMap: Map<string, number>
): string {
  const cells: string[] = []

  // Header row
  headers.forEach((header, colIdx) => {
    const ref = `${colLetter(colIdx)}1`
    const strIdx = sharedStringsMap.get(header.label)!
    cells.push(`        <c r="${ref}" t="s"><v>${strIdx}</v></c>`)
  })

  // Data rows
  rows.forEach((row, rowIdx) => {
    const rowNum = rowIdx + 2
    headers.forEach((header, colIdx) => {
      const ref = `${colLetter(colIdx)}${rowNum}`
      const raw = row[header.key]
      if (raw === undefined || raw === null || raw === '') {
        return
      }
      if (typeof raw === 'number' && Number.isFinite(raw)) {
        cells.push(`        <c r="${ref}"><v>${raw}</v></c>`)
      } else {
        const strIdx = sharedStringsMap.get(String(raw))!
        cells.push(`        <c r="${ref}" t="s"><v>${strIdx}</v></c>`)
      }
    })
  })

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
${cells.join('\n')}
  </sheetData>
</worksheet>`
}

const CONTENT_TYPES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
</Types>`

const ROOT_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`

const WORKBOOK_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Sheet1" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`

const WORKBOOK_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>
</Relationships>`

export function buildXlsxBlob(
  headers: XlsxHeader[],
  rows: Record<string, string | number | undefined>[]
): Blob {
  const stringValues: string[] = []
  const sharedStringsMap = new Map<string, number>()

  function intern(value: string): number {
    let idx = sharedStringsMap.get(value)
    if (idx === undefined) {
      idx = stringValues.length
      stringValues.push(value)
      sharedStringsMap.set(value, idx)
    }
    return idx
  }

  headers.forEach((h) => intern(h.label))
  rows.forEach((row) => {
    headers.forEach((h) => {
      const raw = row[h.key]
      if (raw === undefined || raw === null || raw === '') return
      if (typeof raw === 'number' && Number.isFinite(raw)) return
      intern(String(raw))
    })
  })

  const sheetXml = buildSheetXml(rows, headers, sharedStringsMap)
  const sharedStringsXml = buildSharedStrings(stringValues)

  const files: Record<string, Uint8Array> = {
    '[Content_Types].xml': strToU8(CONTENT_TYPES_XML),
    '_rels/.rels': strToU8(ROOT_RELS_XML),
    'xl/workbook.xml': strToU8(WORKBOOK_XML),
    'xl/_rels/workbook.xml.rels': strToU8(WORKBOOK_RELS_XML),
    'xl/worksheets/sheet1.xml': strToU8(sheetXml),
    'xl/sharedStrings.xml': strToU8(sharedStringsXml),
  }

  const zipData = zipSync(files)
  return new Blob([zipData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

export function exportToXlsx(
  filename: string,
  headers: XlsxHeader[],
  rows: Record<string, string | number | undefined>[]
): void {
  if (rows.length === 0) return
  const blob = buildXlsxBlob(headers, rows)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
