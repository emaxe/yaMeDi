import { describe, expect, it, vi } from 'vitest'

import { buildCsv, escapeCsvCell, exportToCsv } from './csvExport'

describe('csvExport', () => {
  describe('escapeCsvCell', () => {
    it('returns empty string for undefined', () => {
      expect(escapeCsvCell(undefined)).toBe('')
    })

    it('returns value as-is for simple strings', () => {
      expect(escapeCsvCell('hello')).toBe('hello')
      expect(escapeCsvCell(123)).toBe('123')
    })

    it('wraps values containing commas in quotes', () => {
      expect(escapeCsvCell('hello, world')).toBe('"hello, world"')
    })

    it('escapes quotes by doubling them', () => {
      expect(escapeCsvCell('say "hello"')).toBe('"say ""hello"""')
    })

    it('wraps multiline values in quotes', () => {
      expect(escapeCsvCell('line1\nline2')).toBe('"line1\nline2"')
    })
  })

  describe('buildCsv', () => {
    it('builds a CSV with header and rows', () => {
      const headers = [
        { key: 'name', label: 'Name' },
        { key: 'value', label: 'Value' },
      ]
      const rows = [
        { name: 'Alice', value: 10 },
        { name: 'Bob', value: 20 },
      ]
      expect(buildCsv(headers, rows)).toBe('Name,Value\nAlice,10\nBob,20')
    })
  })

  describe('exportToCsv', () => {
    it('creates a download link and clicks it', () => {
      const mockAnchor = document.createElement('a')
      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation(() => mockAnchor as never)
      const clickSpy = vi.spyOn(mockAnchor, 'click').mockImplementation(() => {})
      const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

      exportToCsv('test.csv', [{ key: 'name', label: 'Name' }], [{ name: 'Alice' }])

      expect(clickSpy).toHaveBeenCalled()
      expect(revokeSpy).toHaveBeenCalled()

      createElementSpy.mockRestore()
      clickSpy.mockRestore()
      revokeSpy.mockRestore()
    })

    it('does nothing when rows are empty', () => {
      const mockAnchor = document.createElement('a')
      const clickSpy = vi.spyOn(mockAnchor, 'click').mockImplementation(() => {})
      vi.spyOn(document, 'createElement').mockImplementation(() => mockAnchor as never)
      exportToCsv('empty.csv', [{ key: 'name', label: 'Name' }], [])
      expect(clickSpy).not.toHaveBeenCalled()
      clickSpy.mockRestore()
    })
  })
})
