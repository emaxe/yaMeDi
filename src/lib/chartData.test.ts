import { describe, expect, it } from 'vitest'

import { type MetricaData } from '../types'

import { alignByIndex, buildComparisonData, getTotalsByMetric, transformMetricaData } from './chartData'

const mockData: MetricaData = {
  query: {
    metrics: ['ym:s:visits', 'ym:s:users'],
    dimensions: ['ym:s:date'],
  },
  data: [
    { dimensions: [{ name: '2026-06-01' }], metrics: [100, 80] },
    { dimensions: [{ name: '2026-06-02' }], metrics: [120, 90] },
  ],
  totals: [220, 170],
}

describe('chartData', () => {
  describe('transformMetricaData', () => {
    it('transforms MetricaData into ChartDataPoint[]', () => {
      const result = transformMetricaData(mockData, 'date')
      expect(result).toEqual([
        { date: '2026-06-01', 'ym:s:visits': 100, 'ym:s:users': 80 },
        { date: '2026-06-02', 'ym:s:visits': 120, 'ym:s:users': 90 },
      ])
    })

    it('returns empty array for undefined data', () => {
      expect(transformMetricaData(undefined, 'date')).toEqual([])
    })
  })

  describe('buildComparisonData', () => {
    it('merges current and previous by dimension key', () => {
      const current = [
        { name: 'A', 'ym:s:visits': 100 },
        { name: 'B', 'ym:s:visits': 200 },
      ]
      const previous = [
        { name: 'A', 'ym:s:visits': 80 },
        { name: 'B', 'ym:s:visits': 250 },
      ]
      const result = buildComparisonData(current, previous, 'name', ['ym:s:visits'])
      expect(result).toEqual([
        { name: 'A', 'ym:s:visits': 100, 'prev:ym:s:visits': 80 },
        { name: 'B', 'ym:s:visits': 200, 'prev:ym:s:visits': 250 },
      ])
    })
  })

  describe('alignByIndex', () => {
    it('aligns current and previous by index', () => {
      const current = [
        { date: '2026-06-01', 'ym:s:visits': 100 },
        { date: '2026-06-02', 'ym:s:visits': 120 },
      ]
      const previous = [
        { date: '2026-05-25', 'ym:s:visits': 80 },
        { date: '2026-05-26', 'ym:s:visits': 110 },
      ]
      const result = alignByIndex(current, previous, ['ym:s:visits'], 'date')
      expect(result).toEqual([
        { date: '2026-06-01', 'ym:s:visits': 100, 'prev:ym:s:visits': 80 },
        { date: '2026-06-02', 'ym:s:visits': 120, 'prev:ym:s:visits': 110 },
      ])
    })
  })

  describe('getTotalsByMetric', () => {
    it('returns total for a metric by key', () => {
      expect(getTotalsByMetric(mockData, 'ym:s:visits')).toBe(220)
      expect(getTotalsByMetric(mockData, 'ym:s:users')).toBe(170)
    })

    it('returns 0 for unknown metric', () => {
      expect(getTotalsByMetric(mockData, 'ym:s:unknown')).toBe(0)
    })
  })
})
