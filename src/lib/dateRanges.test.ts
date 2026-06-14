import { describe, expect, it } from 'vitest'

import { DATE_PRESETS, getDefaultDates, getPreviousPeriod, isValidDateRange } from './dateRanges'

describe('dateRanges', () => {
  describe('DATE_PRESETS', () => {
    it('contains expected presets', () => {
      const ids = DATE_PRESETS.map((p) => p.id)
      expect(ids).toEqual(['today', 'yesterday', 'last7days', 'last30days', 'thisMonth', 'lastMonth'])
    })

    it('last7days preset returns a valid 7-day range ending today', () => {
      const preset = DATE_PRESETS.find((p) => p.id === 'last7days')!
      const range = preset.getRange()
      const from = new Date(range.from)
      const to = new Date(range.to)
      const diffDays = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)
      expect(diffDays).toBe(6)
      expect(isValidDateRange(range)).toBe(true)
    })
  })

  describe('getDefaultDates', () => {
    it('returns last7days preset', () => {
      const defaults = getDefaultDates()
      const preset = DATE_PRESETS.find((p) => p.id === 'last7days')!.getRange()
      expect(defaults).toEqual(preset)
    })
  })

  describe('getPreviousPeriod', () => {
    it('returns the previous period of the same length', () => {
      const current = { from: '2026-06-08', to: '2026-06-14' }
      const previous = getPreviousPeriod(current)
      expect(previous).toEqual({ from: '2026-06-01', to: '2026-06-07' })
    })

    it('returns the same range if dates are empty', () => {
      const range = { from: '', to: '' }
      expect(getPreviousPeriod(range)).toEqual(range)
    })
  })

  describe('isValidDateRange', () => {
    it('returns true for valid range', () => {
      expect(isValidDateRange({ from: '2026-06-01', to: '2026-06-14' })).toBe(true)
    })

    it('returns false when from is after to', () => {
      expect(isValidDateRange({ from: '2026-06-14', to: '2026-06-01' })).toBe(false)
    })

    it('returns false when to is in the future', () => {
      expect(isValidDateRange({ from: '2099-01-01', to: '2099-01-31' })).toBe(false)
    })

    it('returns false when dates are missing', () => {
      expect(isValidDateRange({ from: '', to: '' })).toBe(false)
    })
  })
})
