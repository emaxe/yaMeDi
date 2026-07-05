import { describe, expect, it } from 'vitest'

import { buildXlsxBlob, colLetter, escapeXml } from './xlsxExport'

describe('escapeXml', () => {
  it('escapes special XML characters', () => {
    expect(escapeXml('a < b & c > d "e" \'f\'')).toBe('a &lt; b &amp; c &gt; d &quot;e&quot; &apos;f&apos;')
  })

  it('leaves normal text unchanged', () => {
    expect(escapeXml('Hello World')).toBe('Hello World')
  })
})

describe('colLetter', () => {
  it('returns A for index 0', () => {
    expect(colLetter(0)).toBe('A')
  })

  it('returns Z for index 25', () => {
    expect(colLetter(25)).toBe('Z')
  })

  it('returns AA for index 26', () => {
    expect(colLetter(26)).toBe('AA')
  })

  it('returns AB for index 27', () => {
    expect(colLetter(27)).toBe('AB')
  })
})

describe('buildXlsxBlob', () => {
  it('creates a blob with xlsx mime type', () => {
    const headers = [
      { key: 'name', label: 'Name' },
      { key: 'value', label: 'Value' },
    ]
    const rows = [
      { name: 'Alice', value: 42 },
      { name: 'Bob', value: 100 },
    ]

    const blob = buildXlsxBlob(headers, rows)

    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    expect(blob.size).toBeGreaterThan(0)
  })

  it('handles empty rows', () => {
    const headers = [{ key: 'name', label: 'Name' }]
    const blob = buildXlsxBlob(headers, [])

    expect(blob).toBeInstanceOf(Blob)
    expect(blob.size).toBeGreaterThan(0)
  })

  it('handles cells with special characters', () => {
    const headers = [{ key: 'text', label: 'Text' }]
    const rows = [{ text: 'Hello, "World" & <friends>' }]

    const blob = buildXlsxBlob(headers, rows)

    expect(blob).toBeInstanceOf(Blob)
    expect(blob.size).toBeGreaterThan(0)
  })
})
