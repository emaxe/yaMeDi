import { eachDayOfInterval, format, getISOWeek, getISOWeekYear, parseISO, startOfISOWeek, endOfISOWeek } from 'date-fns'

import type { CampaignPerformanceReportRow, DateRange, MetricaData, OperationalProjectConfig, UonLead } from '../types'

import { calculateOperationalMetrics, type OperationalRawData } from './operationalMetrics'

export interface OperationalReportWeek {
  weekLabel: string
  weekStart: string
  weekEnd: string
  days: string[]
}

export interface OperationalReportRow extends OperationalReportWeek {
  name: string
  revenue: number
  orders: number
  visits: number
  totalCost: number
  totalConversions: number
  directRevenue: number
  directOrders: number
  directCost: number
  directConversions: number
  seoRevenue: number
  seoOrders: number
  seoVisits: number
  cartEvents: number
  leads: number
  leadRequests: number
  averageCheck: number
  cpa: number
  drr: number
  romi: number
  directAverageCheck: number
  directCpa: number
  seoAverageCheck: number
  seoTraffic: number
  c1: number
  c2: number
  c3: number
  cplRequest: number
  cplQualified: number
}

export interface OperationalReportData {
  rows: OperationalReportRow[]
  total: OperationalReportRow
  uonError?: string
}

const DIRECT_SOURCE_NAMES = ['yandex direct', 'яндекс.директ', 'директ', 'adwords', 'google ads']
const ORGANIC_SOURCE_NAMES = ['organic', 'поиск', 'search', 'яндекс', 'yandex', 'google', 'bing', 'yahoo']

export function isDirectSource(name: string): boolean {
  const lower = name.toLowerCase()
  return DIRECT_SOURCE_NAMES.some((term) => lower.includes(term))
}

export function isOrganicSource(name: string): boolean {
  const lower = name.toLowerCase()
  return ORGANIC_SOURCE_NAMES.some((term) => lower.includes(term)) && !isDirectSource(name)
}

export function splitDateRangeIntoWeeks(range: DateRange): OperationalReportWeek[] {
  const start = parseISO(range.from)
  const end = parseISO(range.to)
  const days = eachDayOfInterval({ start, end })

  const weekBuckets = new Map<string, { isoWeek: number; weekStart: Date; weekEnd: Date; days: Date[] }>()
  for (const day of days) {
    const isoWeekYear = getISOWeekYear(day)
    const isoWeek = getISOWeek(day)
    const key = `${isoWeekYear}-${isoWeek}`
    const existing = weekBuckets.get(key)
    if (existing) {
      existing.days.push(day)
    } else {
      weekBuckets.set(key, {
        isoWeek,
        weekStart: startOfISOWeek(day),
        weekEnd: endOfISOWeek(day),
        days: [day],
      })
    }
  }

  return Array.from(weekBuckets.values()).map((week) => ({
    weekLabel: `W${week.isoWeek} (${format(week.weekStart, 'dd.MM')}–${format(week.weekEnd, 'dd.MM')})`,
    weekStart: format(week.weekStart, 'yyyy-MM-dd'),
    weekEnd: format(week.weekEnd, 'yyyy-MM-dd'),
    days: week.days.map((day) => format(day, 'yyyy-MM-dd')),
  }))
}

export function aggregateDirectFromSource(
  data: MetricaData
): Map<string, { revenue: number; orders: number }> {
  const revenueIndex = data.query.metrics.indexOf('ym:s:ecommerceRevenue')
  const ordersIndex = data.query.metrics.findIndex((m) => m.includes('purchases') || m.includes('Purchases'))
  const result = new Map<string, { revenue: number; orders: number }>()

  for (const row of data.data) {
    const date = row.dimensions[0]?.name
    const source = row.dimensions[1]?.name
    if (!date || !source || !isDirectSource(source)) continue
    if (revenueIndex === -1 || ordersIndex === -1) continue

    const revenue = row.metrics[revenueIndex] ?? 0
    const orders = row.metrics[ordersIndex] ?? 0
    const current = result.get(date) ?? { revenue: 0, orders: 0 }
    current.revenue += revenue
    current.orders += orders
    result.set(date, current)
  }

  return result
}

export function aggregateOrganicFromTrafficSource(
  data: MetricaData
): Map<string, { revenue: number; orders: number; visits: number }> {
  const revenueIndex = data.query.metrics.indexOf('ym:s:ecommerceRevenue')
  const ordersIndex = data.query.metrics.findIndex((m) => m.includes('purchases') || m.includes('Purchases'))
  const visitsIndex = data.query.metrics.indexOf('ym:s:visits')
  const result = new Map<string, { revenue: number; orders: number; visits: number }>()

  for (const row of data.data) {
    const date = row.dimensions[0]?.name
    const source = row.dimensions[1]?.name
    if (!date || !source || !isOrganicSource(source)) continue
    if (revenueIndex === -1 || ordersIndex === -1 || visitsIndex === -1) continue

    const revenue = row.metrics[revenueIndex] ?? 0
    const orders = row.metrics[ordersIndex] ?? 0
    const visits = row.metrics[visitsIndex] ?? 0
    const current = result.get(date) ?? { revenue: 0, orders: 0, visits: 0 }
    current.revenue += revenue
    current.orders += orders
    current.visits += visits
    result.set(date, current)
  }

  return result
}

export function aggregateDirectCost(
  rows: CampaignPerformanceReportRow[]
): Map<string, { cost: number; conversions: number }> {
  const result = new Map<string, { cost: number; conversions: number }>()
  for (const row of rows) {
    const current = result.get(row.Date) ?? { cost: 0, conversions: 0 }
    current.cost += row.Cost
    current.conversions += row.Conversions
    result.set(row.Date, current)
  }
  return result
}

export function aggregateUonLeadsByDate(leads: UonLead[]): Map<string, number> {
  const result = new Map<string, number>()
  for (const lead of leads) {
    const date = lead.dat.slice(0, 10)
    result.set(date, (result.get(date) ?? 0) + 1)
  }
  return result
}

function createEmptyRaw(): OperationalRawData {
  return {
    revenue: 0,
    orders: 0,
    visits: 0,
    totalCost: 0,
    totalConversions: 0,
    directRevenue: 0,
    directOrders: 0,
    directCost: 0,
    directConversions: 0,
    seoRevenue: 0,
    seoOrders: 0,
    seoVisits: 0,
    cartEvents: 0,
    leads: 0,
    leadRequests: 0,
  }
}

function addRaw(target: OperationalRawData, source: OperationalRawData): void {
  target.revenue += source.revenue
  target.orders += source.orders
  target.visits += source.visits
  target.totalCost += source.totalCost
  target.totalConversions += source.totalConversions
  target.directRevenue += source.directRevenue
  target.directOrders += source.directOrders
  target.directCost += source.directCost
  target.directConversions += source.directConversions
  target.seoRevenue += source.seoRevenue
  target.seoOrders += source.seoOrders
  target.seoVisits += source.seoVisits
  target.cartEvents += source.cartEvents
  target.leads += source.leads
  target.leadRequests += source.leadRequests
}

function extractDailyTotals(data: MetricaData): Map<string, number[]> {
  const result = new Map<string, number[]>()
  for (const row of data.data) {
    const date = row.dimensions[0]?.name
    if (!date) continue
    result.set(date, [...row.metrics])
  }
  return result
}

export function buildOperationalReportData(
  dates: DateRange,
  project: OperationalProjectConfig,
  ecommerce: MetricaData,
  traffic: MetricaData,
  funnel: MetricaData,
  leads: MetricaData,
  sourceEcommerce: MetricaData,
  organic: MetricaData,
  directRows: CampaignPerformanceReportRow[],
  leadRequests?: MetricaData,
  qualifiedUonLeads?: UonLead[],
  uonError?: string
): OperationalReportData {
  const weeks = splitDateRangeIntoWeeks(dates)
  const ecommerceTotals = extractDailyTotals(ecommerce)
  const trafficTotals = extractDailyTotals(traffic)
  const funnelTotals = extractDailyTotals(funnel)
  const leadsTotals = extractDailyTotals(leads)
  const leadRequestsTotals = leadRequests ? extractDailyTotals(leadRequests) : null
  const uonLeadsTotals = qualifiedUonLeads ? aggregateUonLeadsByDate(qualifiedUonLeads) : null
  const directSourceTotals = aggregateDirectFromSource(sourceEcommerce)
  const organicTotals = aggregateOrganicFromTrafficSource(organic)
  const directCostTotals = aggregateDirectCost(directRows)

  const revenueIndex = ecommerce.query.metrics.indexOf('ym:s:ecommerceRevenue')
  const ordersIndex = ecommerce.query.metrics.findIndex((m) => m.includes('purchases') || m.includes('Purchases'))
  const visitsIndex = traffic.query.metrics.indexOf('ym:s:visits')
  const cartMetricName = project.cartGoalId ? `ym:s:goal${project.cartGoalId}reaches` : project.addToCartMetric
  const cartIndex = funnel.query.metrics.indexOf(cartMetricName)
  const leadsIndex = 0
  const leadRequestsMetricCount = leadRequests?.query.metrics.length ?? 0

  const totalRaw = createEmptyRaw()

  const rows = weeks.map((week) => {
    const raw = createEmptyRaw()
    for (const dateStr of week.days) {
      const ecom = ecommerceTotals.get(dateStr)
      if (ecom && revenueIndex !== -1 && ordersIndex !== -1) {
        raw.revenue += ecom[revenueIndex] ?? 0
        raw.orders += ecom[ordersIndex] ?? 0
      }
      const tr = trafficTotals.get(dateStr)
      if (tr && visitsIndex !== -1) {
        raw.visits += tr[visitsIndex] ?? 0
      }
      const fun = funnelTotals.get(dateStr)
      if (fun && cartIndex !== -1) {
        raw.cartEvents += fun[cartIndex] ?? 0
      }
      if (uonLeadsTotals) {
        const uonLd = uonLeadsTotals.get(dateStr)
        if (uonLd !== undefined) {
          raw.leads += uonLd
        }
      } else {
        const ld = leadsTotals.get(dateStr)
        if (ld) {
          raw.leads += ld[leadsIndex] ?? 0
        }
      }
      const lr = leadRequestsTotals?.get(dateStr)
      if (lr && leadRequestsMetricCount > 0) {
        for (let i = 0; i < leadRequestsMetricCount; i++) {
          raw.leadRequests += lr[i] ?? 0
        }
      }
      const dir = directSourceTotals.get(dateStr)
      if (dir) {
        raw.directRevenue += dir.revenue
        raw.directOrders += dir.orders
      }
      const org = organicTotals.get(dateStr)
      if (org) {
        raw.seoRevenue += org.revenue
        raw.seoOrders += org.orders
        raw.seoVisits += org.visits
      }
      const cost = directCostTotals.get(dateStr)
      if (cost) {
        raw.directCost += cost.cost
        raw.directConversions += cost.conversions
        raw.totalCost += cost.cost
        raw.totalConversions += cost.conversions
      }
    }
    addRaw(totalRaw, raw)
    const metrics = calculateOperationalMetrics(raw)
    return { ...metrics, ...week, name: week.weekLabel }
  })

  const totalMetrics = calculateOperationalMetrics(totalRaw)
  const total: OperationalReportRow = {
    ...totalMetrics,
    name: 'Итого',
    weekLabel: 'Итого',
    weekStart: '',
    weekEnd: '',
    days: [],
  }

  return { rows, total, uonError }
}
