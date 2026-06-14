import { useQuery } from '@tanstack/react-query'

import { useAuth } from '../hooks/useAuth'
import { countersResponseSchema, metricaDataSchema, type Counter, type MetricaData } from '../types'

import { fetchJson } from './client'
import { API_CONFIG, API_ENDPOINTS } from './config'

function getMetricaHeaders(token: string): Record<string, string> {
  return {
    Authorization: `OAuth ${token}`,
    'Content-Type': API_CONFIG.metrika.contentType,
  }
}

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
  const url = new URL(API_ENDPOINTS.metrika.stats)
  url.searchParams.set('id', String(counterId))
  url.searchParams.set('date1', dateFrom)
  url.searchParams.set('date2', dateTo)
  url.searchParams.set('limit', String(limit))
  url.searchParams.set('metrics', metrics)
  url.searchParams.set('dimensions', dimensions)

  const data = await fetchJson<unknown>(url.toString(), { headers: getMetricaHeaders(token) }, 'Статистика Метрики')
  return metricaDataSchema.parse(data)
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

export function useTrafficSummary(counterId: number | undefined, dateFrom: string, dateTo: string) {
  const { token } = useAuth()
  return useQuery({
    queryKey: ['trafficSummary', counterId, dateFrom, dateTo],
    queryFn: () => getTrafficSummary(token!, counterId!, dateFrom, dateTo),
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
