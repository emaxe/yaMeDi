import { describe, expect, it } from 'vitest'

import { calculateDelta, formatDelta, formatDuration, formatMetricValue, getMetricName } from './metrics'

describe('metrics', () => {
  describe('getMetricName', () => {
    it('returns human-readable name for known metrics', () => {
      expect(getMetricName('ym:s:visits')).toBe('Визиты')
      expect(getMetricName('ym:s:users')).toBe('Посетители')
    })

    it('returns stripped name for unknown metrics', () => {
      expect(getMetricName('ym:s:custom')).toBe('custom')
    })
  })

  describe('formatMetricValue', () => {
    it('formats numbers with ru-RU locale', () => {
      const formatted = formatMetricValue(1234567, 'ym:s:visits').replace(/\s/g, ' ')
      expect(formatted).toBe('1 234 567')
    })

    it('formats bounce rate as percent', () => {
      expect(formatMetricValue(0.255, 'ym:s:bounceRate')).toBe('25.50%')
    })

    it('formats duration as mm:ss', () => {
      expect(formatMetricValue(125, 'ym:s:avgVisitDurationSeconds')).toBe('2:05')
    })

    it('returns dash for non-finite values', () => {
      expect(formatMetricValue(NaN)).toBe('—')
    })
  })

  describe('formatDuration', () => {
    it('formats less than an hour as mm:ss', () => {
      expect(formatDuration(125)).toBe('2:05')
    })

    it('formats more than an hour as h:mm:ss', () => {
      expect(formatDuration(3665)).toBe('1:01:05')
    })

    it('returns dash for negative values', () => {
      expect(formatDuration(-1)).toBe('—')
    })
  })

  describe('calculateDelta', () => {
    it('calculates positive delta', () => {
      expect(calculateDelta(120, 100)).toEqual({ value: 0.2, isPositive: true })
    })

    it('calculates negative delta', () => {
      expect(calculateDelta(80, 100)).toEqual({ value: -0.2, isPositive: false })
    })

    it('returns infinity when previous is zero and current is positive', () => {
      const result = calculateDelta(100, 0)
      expect(result.value).toBe(Infinity)
      expect(result.isPositive).toBe(true)
    })
  })

  describe('formatDelta', () => {
    it('formats positive delta', () => {
      expect(formatDelta(0.2)).toBe('20.0%')
    })

    it('formats infinity', () => {
      expect(formatDelta(Infinity)).toBe('∞')
    })
  })
})
