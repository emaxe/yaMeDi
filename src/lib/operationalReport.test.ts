import { describe, expect, it } from 'vitest'

import type { CampaignPerformanceReportRow, DateRange, MetricaData, OperationalProjectConfig } from '../types'

import {
  aggregateDirectCost,
  aggregateDirectFromSource,
  aggregateOrganicFromTrafficSource,
  buildOperationalReportData,
  isDirectSource,
  isOrganicSource,
  splitDateRangeIntoWeeks,
} from './operationalReport'

const mockProject: OperationalProjectConfig = {
  id: 'kuroort26',
  name: 'Курорт 26',
  counterId: 10849417,
  directClientLogin: 'kurort26-direct',
  purchasesMetric: 'ym:s:purchases',
  addToCartMetric: 'ym:s:goal249520697reaches',
  cartGoalId: 249520697,
  orderGoalId: 3010849417,
  contactGoalId: 269264518,
}

function mockMetricaData(overrides: Partial<MetricaData> = {}): MetricaData {
  return {
    query: { metrics: [], dimensions: [] },
    data: [],
    totals: [],
    ...overrides,
  }
}

function createEcommerceData(): MetricaData {
  return mockMetricaData({
    query: { metrics: ['ym:s:ecommerceRevenue', 'ym:s:ecommercePurchases'], dimensions: ['ym:s:date'] },
    data: [
      { dimensions: [{ name: '2024-01-01' }], metrics: [1000, 10] },
      { dimensions: [{ name: '2024-01-02' }], metrics: [2000, 20] },
      { dimensions: [{ name: '2024-01-08' }], metrics: [3000, 30] },
    ],
  })
}

function createTrafficData(): MetricaData {
  return mockMetricaData({
    query: { metrics: ['ym:s:visits'], dimensions: ['ym:s:date'] },
    data: [
      { dimensions: [{ name: '2024-01-01' }], metrics: [100] },
      { dimensions: [{ name: '2024-01-02' }], metrics: [200] },
      { dimensions: [{ name: '2024-01-08' }], metrics: [300] },
    ],
  })
}

function createFunnelData(): MetricaData {
  return mockMetricaData({
    query: {
      metrics: ['ym:s:visits', 'ym:s:goal249520697reaches', 'ym:s:goal3010849417reaches'],
      dimensions: ['ym:s:date'],
    },
    data: [
      { dimensions: [{ name: '2024-01-01' }], metrics: [100, 5, 2] },
      { dimensions: [{ name: '2024-01-02' }], metrics: [200, 10, 4] },
      { dimensions: [{ name: '2024-01-08' }], metrics: [300, 15, 6] },
    ],
  })
}

function createLeadsData(): MetricaData {
  return mockMetricaData({
    query: { metrics: ['ym:s:goal269264518reaches'], dimensions: ['ym:s:date'] },
    data: [
      { dimensions: [{ name: '2024-01-01' }], metrics: [3] },
      { dimensions: [{ name: '2024-01-02' }], metrics: [7] },
      { dimensions: [{ name: '2024-01-08' }], metrics: [10] },
    ],
  })
}

function createSourceEcommerceData(): MetricaData {
  return mockMetricaData({
    query: {
      metrics: ['ym:s:ecommerceRevenue', 'ym:s:ecommercePurchases'],
      dimensions: ['ym:s:date', 'ym:s:sourceEngine'],
    },
    data: [
      { dimensions: [{ name: '2024-01-01' }, { name: 'Yandex Direct' }], metrics: [500, 5] },
      { dimensions: [{ name: '2024-01-01' }, { name: 'Google Ads' }], metrics: [100, 1] },
      { dimensions: [{ name: '2024-01-02' }, { name: 'Yandex Direct' }], metrics: [600, 6] },
      { dimensions: [{ name: '2024-01-08' }, { name: 'Yandex Direct' }], metrics: [700, 7] },
    ],
  })
}

function createOrganicData(): MetricaData {
  return mockMetricaData({
    query: {
      metrics: ['ym:s:ecommerceRevenue', 'ym:s:ecommercePurchases', 'ym:s:visits'],
      dimensions: ['ym:s:date', 'ym:s:trafficSource'],
    },
    data: [
      { dimensions: [{ name: '2024-01-01' }, { name: 'Organic' }], metrics: [300, 3, 50] },
      { dimensions: [{ name: '2024-01-02' }, { name: 'Organic' }], metrics: [400, 4, 60] },
      { dimensions: [{ name: '2024-01-08' }, { name: 'Organic' }], metrics: [500, 5, 70] },
      { dimensions: [{ name: '2024-01-08' }, { name: 'Direct' }], metrics: [999, 9, 99] },
    ],
  })
}

function createDirectRows(): CampaignPerformanceReportRow[] {
  return [
    { Date: '2024-01-01', Impressions: 1000, Clicks: 100, Cost: 50, Ctr: 0.1, AvgCpc: 0.5, Conversions: 5 },
    { Date: '2024-01-02', Impressions: 2000, Clicks: 200, Cost: 100, Ctr: 0.1, AvgCpc: 0.5, Conversions: 10 },
    { Date: '2024-01-08', Impressions: 3000, Clicks: 300, Cost: 150, Ctr: 0.1, AvgCpc: 0.5, Conversions: 15 },
  ]
}

describe('operationalReport', () => {
  describe('splitDateRangeIntoWeeks', () => {
    it('splits a range spanning two ISO weeks into two buckets with days in range', () => {
      const range: DateRange = { from: '2024-01-01', to: '2024-01-14' }
      const weeks = splitDateRangeIntoWeeks(range)
      expect(weeks).toHaveLength(2)
      expect(weeks[0].days).toEqual([
        '2024-01-01',
        '2024-01-02',
        '2024-01-03',
        '2024-01-04',
        '2024-01-05',
        '2024-01-06',
        '2024-01-07',
      ])
      expect(weeks[1].days).toEqual([
        '2024-01-08',
        '2024-01-09',
        '2024-01-10',
        '2024-01-11',
        '2024-01-12',
        '2024-01-13',
        '2024-01-14',
      ])
    })
  })

  describe('source matchers', () => {
    it('identifies Direct sources', () => {
      expect(isDirectSource('Yandex Direct')).toBe(true)
      expect(isDirectSource('Яндекс.Директ')).toBe(true)
      expect(isDirectSource('Google Ads')).toBe(true)
      expect(isDirectSource('AdWords')).toBe(true)
      expect(isDirectSource('Organic')).toBe(false)
      expect(isDirectSource('Yandex')).toBe(false)
    })

    it('identifies organic sources and excludes Direct', () => {
      expect(isOrganicSource('Organic')).toBe(true)
      expect(isOrganicSource('Поисковые системы')).toBe(true)
      expect(isOrganicSource('Google organic')).toBe(true)
      expect(isOrganicSource('Yandex Direct')).toBe(false)
      expect(isDirectSource('Direct')).toBe(false)
      expect(isOrganicSource('Direct')).toBe(false)
    })
  })

  describe('aggregators', () => {
    it('aggregates Direct revenue and orders from source engine data', () => {
      const result = aggregateDirectFromSource(createSourceEcommerceData())
      expect(result.get('2024-01-01')).toEqual({ revenue: 600, orders: 6 })
      expect(result.get('2024-01-02')).toEqual({ revenue: 600, orders: 6 })
      expect(result.get('2024-01-08')).toEqual({ revenue: 700, orders: 7 })
    })

    it('aggregates organic revenue, orders and visits from traffic source data', () => {
      const result = aggregateOrganicFromTrafficSource(createOrganicData())
      expect(result.get('2024-01-01')).toEqual({ revenue: 300, orders: 3, visits: 50 })
      expect(result.get('2024-01-02')).toEqual({ revenue: 400, orders: 4, visits: 60 })
      expect(result.get('2024-01-08')).toEqual({ revenue: 500, orders: 5, visits: 70 })
    })

    it('aggregates Direct cost and conversions by date', () => {
      const result = aggregateDirectCost(createDirectRows())
      expect(result.get('2024-01-01')).toEqual({ cost: 50, conversions: 5 })
      expect(result.get('2024-01-02')).toEqual({ cost: 100, conversions: 10 })
      expect(result.get('2024-01-08')).toEqual({ cost: 150, conversions: 15 })
    })
  })

  describe('buildOperationalReportData', () => {
    it('builds weekly rows and a total from all API responses', () => {
      const range: DateRange = { from: '2024-01-01', to: '2024-01-08' }
      const data = buildOperationalReportData(
        range,
        mockProject,
        createEcommerceData(),
        createTrafficData(),
        createFunnelData(),
        createLeadsData(),
        createSourceEcommerceData(),
        createOrganicData(),
        createDirectRows()
      )

      expect(data.rows).toHaveLength(2)

      const week1 = data.rows[0]
      expect(week1.name).toMatch(/^W1/)
      expect(week1.revenue).toBe(3000)
      expect(week1.orders).toBe(30)
      expect(week1.visits).toBe(300)
      expect(week1.directRevenue).toBe(1200)
      expect(week1.directOrders).toBe(12)
      expect(week1.directCost).toBe(150)
      expect(week1.directConversions).toBe(15)
      expect(week1.seoRevenue).toBe(700)
      expect(week1.seoOrders).toBe(7)
      expect(week1.seoVisits).toBe(110)
      expect(week1.cartEvents).toBe(15)
      expect(week1.leads).toBe(10)
      expect(week1.averageCheck).toBe(100)
      expect(week1.c2).toBe(0.1)

      const week2 = data.rows[1]
      expect(week2.name).toMatch(/^W2/)
      expect(week2.revenue).toBe(3000)
      expect(week2.orders).toBe(30)
      expect(week2.visits).toBe(300)
      expect(week2.directRevenue).toBe(700)
      expect(week2.directOrders).toBe(7)
      expect(week2.directCost).toBe(150)
      expect(week2.directConversions).toBe(15)
      expect(week2.seoRevenue).toBe(500)
      expect(week2.seoOrders).toBe(5)
      expect(week2.seoVisits).toBe(70)
      expect(week2.cartEvents).toBe(15)
      expect(week2.leads).toBe(10)

      expect(data.total.name).toBe('Итого')
      expect(data.total.revenue).toBe(6000)
      expect(data.total.orders).toBe(60)
      expect(data.total.visits).toBe(600)
      expect(data.total.directRevenue).toBe(1900)
      expect(data.total.directOrders).toBe(19)
      expect(data.total.directCost).toBe(300)
      expect(data.total.directConversions).toBe(30)
      expect(data.total.seoRevenue).toBe(1200)
      expect(data.total.seoOrders).toBe(12)
      expect(data.total.seoVisits).toBe(180)
      expect(data.total.cartEvents).toBe(30)
      expect(data.total.leads).toBe(20)
      expect(data.total.drr).toBe(0.05)
      expect(data.total.romi).toBe(19)
    })
  })
})
