import { parseISO } from 'date-fns'
import { describe, expect, it } from 'vitest'

import {
  DEFAULT_AUDIT_ITEMS,
  DEFAULT_AUDIT_STATE,
  getDaysSinceLastCheck,
  isOverdue,
  markAsChecked,
} from './auditChecklist'

describe('auditChecklist', () => {
  describe('DEFAULT_AUDIT_ITEMS', () => {
    it('contains 6 items matching the regulation checklist', () => {
      expect(DEFAULT_AUDIT_ITEMS).toHaveLength(6)
      const ids = DEFAULT_AUDIT_ITEMS.map((item) => item.id)
      expect(ids).toContain('metrica-webvisor')
      expect(ids).toContain('goals')
      expect(ids).toContain('calltracking')
      expect(ids).toContain('crm-data')
      expect(ids).toContain('offline-conversions')
      expect(ids).toContain('marquiz-crm')
    })

    it('calltracking has null date and missing status', () => {
      const calltracking = DEFAULT_AUDIT_ITEMS.find((item) => item.id === 'calltracking')
      expect(calltracking?.lastCheckedDate).toBeNull()
      expect(calltracking?.status).toBe('missing')
    })
  })

  describe('DEFAULT_AUDIT_STATE', () => {
    it('wraps default items', () => {
      expect(DEFAULT_AUDIT_STATE.items).toBe(DEFAULT_AUDIT_ITEMS)
    })
  })

  describe('getDaysSinceLastCheck', () => {
    it('returns days between last check and today', () => {
      const item = { id: 'test', label: 'Test', lastCheckedDate: '2026-06-01', status: 'ok' as const, intervalDays: 60 }
      const today = parseISO('2026-06-21')
      expect(getDaysSinceLastCheck(item, today)).toBe(20)
    })

    it('returns null when lastCheckedDate is null', () => {
      const item = { id: 'test', label: 'Test', lastCheckedDate: null, status: 'missing' as const, intervalDays: 60 }
      expect(getDaysSinceLastCheck(item)).toBeNull()
    })
  })

  describe('isOverdue', () => {
    it('returns true when days exceed interval', () => {
      const item = { id: 'test', label: 'Test', lastCheckedDate: '2026-03-01', status: 'ok' as const, intervalDays: 60 }
      const today = parseISO('2026-06-01')
      expect(isOverdue(item, today)).toBe(true)
    })

    it('returns false when within interval', () => {
      const item = { id: 'test', label: 'Test', lastCheckedDate: '2026-06-01', status: 'ok' as const, intervalDays: 60 }
      const today = parseISO('2026-06-15')
      expect(isOverdue(item, today)).toBe(false)
    })

    it('returns true when lastCheckedDate is null', () => {
      const item = { id: 'test', label: 'Test', lastCheckedDate: null, status: 'missing' as const, intervalDays: 60 }
      expect(isOverdue(item)).toBe(true)
    })
  })

  describe('markAsChecked', () => {
    it('updates the specified item with date and status', () => {
      const items = [
        { id: 'a', label: 'A', lastCheckedDate: '2026-01-01', status: 'ok' as const, intervalDays: 60 },
        { id: 'b', label: 'B', lastCheckedDate: null, status: 'missing' as const, intervalDays: 60 },
      ]
      const result = markAsChecked(items, 'b', '2026-06-21', 'ok')
      expect(result[1].lastCheckedDate).toBe('2026-06-21')
      expect(result[1].status).toBe('ok')
      expect(result[0]).toBe(items[0])
    })

    it('defaults status to ok when not specified', () => {
      const items = [
        { id: 'a', label: 'A', lastCheckedDate: null, status: 'missing' as const, intervalDays: 60 },
      ]
      const result = markAsChecked(items, 'a', '2026-06-21')
      expect(result[0].status).toBe('ok')
    })
  })
})
