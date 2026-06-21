import { useQuery } from '@tanstack/react-query'

import { useAuth } from '../hooks/useAuth'
import { getPreviousPeriod } from '../lib/dateRanges'
import { PromiseQueue } from '../lib/queue'
import { countersResponseSchema, metricaDataSchema, type Counter, type DateRange, type MetricaData } from '../types'

import { fetchJson } from './client'
import { API_CONFIG, API_ENDPOINTS } from './config'

function getMetricaHeaders(token: string): Record<string, string> {
  return {
    Authorization: `OAuth ${token}`,
    'Content-Type': API_CONFIG.metrika.contentType,
  }
}

// Yandex Metrika API has a strict quota on parallel requests per user.
// Queue limits concurrent stat requests to avoid HTTP 429 errors.
const metricaStatsQueue = new PromiseQueue(3)

export async function getCounters(token: string): Promise<Counter[]> {
  const data = await fetchJson<unknown>(
    API_ENDPOINTS.metrika.counters,
    { headers: getMetricaHeaders(token) },
    'Список счётчиков'
  )
  const parsed = countersResponseSchema.parse(data)
  return parsed.counters.map((c) => ({
    id: c.id,
    name: c.name ?? 'Без названия',
    site: c.site ?? '',
    status: c.status ?? '',
    type: c.type ?? '',
  }))
}

export function useCounters() {
  const { token } = useAuth()
  return useQuery({
    queryKey: ['counters'],
    queryFn: () => getCounters(token!),
    enabled: !!token,
  })
}

export async function getStats(
  token: string,
  counterId: number,
  dateFrom: string,
  dateTo: string,
  metrics: string,
  dimensions: string,
  limit = 1000
): Promise<MetricaData> {
  return metricaStatsQueue.add(async () => {
    const url = new URL(API_ENDPOINTS.metrika.stats)
    url.searchParams.set('id', String(counterId))
    url.searchParams.set('date1', dateFrom)
    url.searchParams.set('date2', dateTo)
    url.searchParams.set('limit', String(limit))
    url.searchParams.set('metrics', metrics)
    url.searchParams.set('dimensions', dimensions)

    const data = await fetchJson<unknown>(url.toString(), { headers: getMetricaHeaders(token) }, 'Статистика Метрики')
    return metricaDataSchema.parse(data)
  })
}

export function getTrafficSummary(
  token: string,
  counterId: number,
  dateFrom: string,
  dateTo: string
): Promise<MetricaData> {
  return getStats(
    token,
    counterId,
    dateFrom,
    dateTo,
    'ym:s:visits,ym:s:pageviews,ym:s:users,ym:s:bounceRate',
    'ym:s:date',
    1000
  )
}

export function getKpiSummary(
  token: string,
  counterId: number,
  dateFrom: string,
  dateTo: string
): Promise<MetricaData> {
  return getStats(
    token,
    counterId,
    dateFrom,
    dateTo,
    'ym:s:visits,ym:s:pageviews,ym:s:users,ym:s:bounceRate,ym:s:avgVisitDurationSeconds,ym:s:pageDepth',
    'ym:s:date',
    1000
  )
}

export function getSources(token: string, counterId: number, dateFrom: string, dateTo: string): Promise<MetricaData> {
  return getStats(
    token,
    counterId,
    dateFrom,
    dateTo,
    'ym:s:visits,ym:s:users,ym:s:pageviews',
    'ym:s:trafficSource',
    1000
  )
}

export function getDevices(token: string, counterId: number, dateFrom: string, dateTo: string): Promise<MetricaData> {
  return getStats(token, counterId, dateFrom, dateTo, 'ym:s:visits,ym:s:users', 'ym:s:deviceCategory', 100)
}

export function getRegions(token: string, counterId: number, dateFrom: string, dateTo: string): Promise<MetricaData> {
  return getStats(token, counterId, dateFrom, dateTo, 'ym:s:visits,ym:s:users', 'ym:s:region', 20)
}

export function getBrowsers(token: string, counterId: number, dateFrom: string, dateTo: string): Promise<MetricaData> {
  return getStats(token, counterId, dateFrom, dateTo, 'ym:s:visits,ym:s:users', 'ym:s:browser', 20)
}

export function getOS(token: string, counterId: number, dateFrom: string, dateTo: string): Promise<MetricaData> {
  return getStats(token, counterId, dateFrom, dateTo, 'ym:s:visits,ym:s:users', 'ym:s:operatingSystem', 20)
}

export function getPages(token: string, counterId: number, dateFrom: string, dateTo: string): Promise<MetricaData> {
  return getStats(token, counterId, dateFrom, dateTo, 'ym:pv:pageviews,ym:pv:users', 'ym:pv:URLPath', 20)
}

export function getAudience(token: string, counterId: number, dateFrom: string, dateTo: string): Promise<MetricaData> {
  return getStats(token, counterId, dateFrom, dateTo, 'ym:s:newUsers,ym:s:users', 'ym:s:date', 1000)
}

export function getSearchPhrases(
  token: string,
  counterId: number,
  dateFrom: string,
  dateTo: string
): Promise<MetricaData> {
  return getStats(token, counterId, dateFrom, dateTo, 'ym:s:visits,ym:s:users', 'ym:s:searchPhrase', 20)
}

export function getReferrers(token: string, counterId: number, dateFrom: string, dateTo: string): Promise<MetricaData> {
  return getStats(token, counterId, dateFrom, dateTo, 'ym:s:visits,ym:s:users', 'ym:s:referer', 20)
}

export function getEcommerceSummary(
  token: string,
  counterId: number,
  dateFrom: string,
  dateTo: string,
  purchasesMetric = 'ym:s:ecommercePurchases'
): Promise<MetricaData> {
  return getStats(token, counterId, dateFrom, dateTo, `ym:s:ecommerceRevenue,${purchasesMetric}`, 'ym:s:date', 1000)
}

export function getSourceEcommerceSummary(
  token: string,
  counterId: number,
  dateFrom: string,
  dateTo: string,
  purchasesMetric = 'ym:s:ecommercePurchases'
): Promise<MetricaData> {
  return getStats(
    token,
    counterId,
    dateFrom,
    dateTo,
    `ym:s:ecommerceRevenue,${purchasesMetric}`,
    'ym:s:sourceEngine',
    1000
  )
}

export function getDailySourceEcommerceSummary(
  token: string,
  counterId: number,
  dateFrom: string,
  dateTo: string,
  purchasesMetric = 'ym:s:ecommercePurchases'
): Promise<MetricaData> {
  return getStats(
    token,
    counterId,
    dateFrom,
    dateTo,
    `ym:s:ecommerceRevenue,${purchasesMetric}`,
    'ym:s:date,ym:s:sourceEngine',
    1000
  )
}

export function getDailyOrganicSummary(
  token: string,
  counterId: number,
  dateFrom: string,
  dateTo: string,
  purchasesMetric = 'ym:s:ecommercePurchases'
): Promise<MetricaData> {
  return getStats(
    token,
    counterId,
    dateFrom,
    dateTo,
    `ym:s:ecommerceRevenue,${purchasesMetric},ym:s:visits`,
    'ym:s:date,ym:s:trafficSource',
    1000
  )
}

export interface FunnelSummaryConfig {
  purchasesMetric: string
  addToCartMetric: string
  cartGoalId?: number
  orderGoalId?: number
}

function goalMetricName(goalId: number): string {
  return `ym:s:goal${goalId}reaches`
}

export function getFunnelSummary(
  token: string,
  counterId: number,
  dateFrom: string,
  dateTo: string,
  config: FunnelSummaryConfig
): Promise<MetricaData> {
  const useGoals = config.cartGoalId && config.orderGoalId
  const cartMetric = useGoals ? goalMetricName(config.cartGoalId!) : config.addToCartMetric
  const orderMetric = useGoals ? goalMetricName(config.orderGoalId!) : config.purchasesMetric
  return getStats(token, counterId, dateFrom, dateTo, `ym:s:visits,${cartMetric},${orderMetric}`, 'ym:s:date', 1000)
}

export function getContactLeads(
  token: string,
  counterId: number,
  dateFrom: string,
  dateTo: string,
  contactGoalId: number
): Promise<MetricaData> {
  return getStats(token, counterId, dateFrom, dateTo, goalMetricName(contactGoalId), 'ym:s:date', 1000)
}

export function useTrafficSummary(counterId: number | undefined, dateFrom: string, dateTo: string) {
  const { token } = useAuth()
  return useQuery({
    queryKey: ['trafficSummary', counterId, dateFrom, dateTo],
    queryFn: () => getTrafficSummary(token!, counterId!, dateFrom, dateTo),
    enabled: !!token && !!counterId,
  })
}

export function useKpiSummary(counterId: number | undefined, dateFrom: string, dateTo: string) {
  const { token } = useAuth()
  return useQuery({
    queryKey: ['kpiSummary', counterId, dateFrom, dateTo],
    queryFn: () => getKpiSummary(token!, counterId!, dateFrom, dateTo),
    enabled: !!token && !!counterId,
  })
}

export function useSources(counterId: number | undefined, dateFrom: string, dateTo: string) {
  const { token } = useAuth()
  return useQuery({
    queryKey: ['sources', counterId, dateFrom, dateTo],
    queryFn: () => getSources(token!, counterId!, dateFrom, dateTo),
    enabled: !!token && !!counterId,
  })
}

export function useDevices(counterId: number | undefined, dateFrom: string, dateTo: string) {
  const { token } = useAuth()
  return useQuery({
    queryKey: ['devices', counterId, dateFrom, dateTo],
    queryFn: () => getDevices(token!, counterId!, dateFrom, dateTo),
    enabled: !!token && !!counterId,
  })
}

export function useRegions(counterId: number | undefined, dateFrom: string, dateTo: string) {
  const { token } = useAuth()
  return useQuery({
    queryKey: ['regions', counterId, dateFrom, dateTo],
    queryFn: () => getRegions(token!, counterId!, dateFrom, dateTo),
    enabled: !!token && !!counterId,
  })
}

export function useBrowsers(counterId: number | undefined, dateFrom: string, dateTo: string) {
  const { token } = useAuth()
  return useQuery({
    queryKey: ['browsers', counterId, dateFrom, dateTo],
    queryFn: () => getBrowsers(token!, counterId!, dateFrom, dateTo),
    enabled: !!token && !!counterId,
  })
}

export function useOS(counterId: number | undefined, dateFrom: string, dateTo: string) {
  const { token } = useAuth()
  return useQuery({
    queryKey: ['os', counterId, dateFrom, dateTo],
    queryFn: () => getOS(token!, counterId!, dateFrom, dateTo),
    enabled: !!token && !!counterId,
  })
}

export function usePages(counterId: number | undefined, dateFrom: string, dateTo: string) {
  const { token } = useAuth()
  return useQuery({
    queryKey: ['pages', counterId, dateFrom, dateTo],
    queryFn: () => getPages(token!, counterId!, dateFrom, dateTo),
    enabled: !!token && !!counterId,
  })
}

export function useAudience(counterId: number | undefined, dateFrom: string, dateTo: string) {
  const { token } = useAuth()
  return useQuery({
    queryKey: ['audience', counterId, dateFrom, dateTo],
    queryFn: () => getAudience(token!, counterId!, dateFrom, dateTo),
    enabled: !!token && !!counterId,
  })
}

export function useSearchPhrases(counterId: number | undefined, dateFrom: string, dateTo: string) {
  const { token } = useAuth()
  return useQuery({
    queryKey: ['searchPhrases', counterId, dateFrom, dateTo],
    queryFn: () => getSearchPhrases(token!, counterId!, dateFrom, dateTo),
    enabled: !!token && !!counterId,
  })
}

export function useReferrers(counterId: number | undefined, dateFrom: string, dateTo: string) {
  const { token } = useAuth()
  return useQuery({
    queryKey: ['referrers', counterId, dateFrom, dateTo],
    queryFn: () => getReferrers(token!, counterId!, dateFrom, dateTo),
    enabled: !!token && !!counterId,
  })
}

type StatsFetcher = (token: string, counterId: number, dateFrom: string, dateTo: string) => Promise<MetricaData>

export function useStatsComparison(
  counterId: number | undefined,
  dates: DateRange,
  fetcher: StatsFetcher,
  queryKeyPrefix: string
) {
  const { token } = useAuth()
  const previousDates = getPreviousPeriod(dates)

  const current = useQuery({
    queryKey: [queryKeyPrefix, 'current', counterId, dates.from, dates.to],
    queryFn: () => fetcher(token!, counterId!, dates.from, dates.to),
    enabled: !!token && !!counterId && !!dates.from && !!dates.to,
  })

  const previous = useQuery({
    queryKey: [queryKeyPrefix, 'previous', counterId, previousDates.from, previousDates.to],
    queryFn: () => fetcher(token!, counterId!, previousDates.from, previousDates.to),
    enabled: !!token && !!counterId && !!previousDates.from && !!previousDates.to,
  })

  return { current, previous }
}
