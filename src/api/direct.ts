import { useQuery } from '@tanstack/react-query'

import { useAuth } from '../hooks/useAuth'
import {
  adReportRowSchema,
  campaignsResponseSchema,
  campaignPerformanceReportRowSchema,
  searchTermReportRowSchema,
  type AdReportRow,
  type Campaign,
  type CampaignPerformanceReportRow,
  type SearchTermReportRow,
} from '../types'

import { ApiError, fetchJson, fetchText } from './client'
import { API_CONFIG, API_ENDPOINTS } from './config'

function getDirectHeaders(token: string, clientLogin?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': API_CONFIG.direct.contentType,
    returnMoneyInMicros: 'false',
    skipReportHeader: 'true',
    skipReportSummary: 'true',
    skipColumnHeader: 'false',
  }
  if (clientLogin) {
    headers['Client-Login'] = clientLogin
  }
  console.log('[direct] getDirectHeaders', headers)
  return headers
}

function getDirectBaseUrl(sandbox: boolean): string {
  return sandbox ? API_CONFIG.direct.sandboxUrl : API_CONFIG.direct.baseUrl
}

export async function getCampaigns(token: string, clientLogin: string | null, sandbox = false): Promise<Campaign[]> {
  const url = `${getDirectBaseUrl(sandbox)}${API_ENDPOINTS.direct.campaigns}`
  const body = {
    method: 'get',
    params: {
      SelectionCriteria: {},
      FieldNames: ['Id', 'Name', 'Status', 'Type', 'State', 'Currency'],
    },
  }

  const data = await fetchJson<unknown>(
    url,
    { method: 'POST', headers: getDirectHeaders(token, clientLogin), body },
    'Кампании Директа'
  )
  const parsed = campaignsResponseSchema.parse(data)
  return parsed.result?.Campaigns ?? []
}

export function useCampaigns(sandbox: boolean) {
  const { token, clientLogin } = useAuth()
  console.log('[useCampaigns] token=', token ? 'set' : 'null', 'clientLogin=', clientLogin)
  return useQuery({
    queryKey: ['campaigns', sandbox, clientLogin],
    queryFn: () => getCampaigns(token!, clientLogin, sandbox),
    enabled: !!token,
  })
}

export type TsvValue = string | number

const NUMERIC_TSV_VALUE = /^-?\d+(\.\d+)?$/

export function parseTsv(text: string): Record<string, TsvValue>[] {
  const lines = text.trim().split('\n').filter(Boolean)
  if (lines.length < 2) return []
  const headers = lines[0].split('\t')
  const rows: Record<string, TsvValue>[] = []
  for (let i = 1; i < lines.length; i += 1) {
    const vals = lines[i].split('\t')
    const row: Record<string, TsvValue> = {}
    headers.forEach((h, idx) => {
      const v = vals[idx] ?? ''
      const num = NUMERIC_TSV_VALUE.test(v) ? parseFloat(v) : Number.NaN
      row[h] = Number.isNaN(num) ? v : num
    })
    rows.push(row)
  }
  return rows
}

function assertReportReady(text: string, context: string): string {
  if (text.startsWith('In progress')) {
    throw new ApiError(0, context, 'Отчёт готовится. Повторите запрос через несколько секунд.')
  }
  return text
}

function pollDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchReportWithPoll(
  token: string,
  clientLogin: string | null,
  url: string,
  body: unknown,
  context: string,
  maxAttempts = 10
): Promise<string> {
  let attempt = 0
  while (attempt < maxAttempts) {
    try {
      const text = await fetchText(
        url,
        { method: 'POST', headers: getDirectHeaders(token, clientLogin), body },
        context
      )
      return assertReportReady(text, context)
    } catch (error) {
      if (error instanceof ApiError && error.status === 202) {
        attempt += 1
        if (attempt >= maxAttempts) {
          throw new ApiError(202, context, 'Отчёт не готов после максимального числа попыток')
        }
        await pollDelay(1000 * 2 ** attempt)
        continue
      }
      throw error
    }
  }
  throw new ApiError(202, context, 'Отчёт не готов после максимального числа попыток')
}

export async function getCampaignReport(
  token: string,
  clientLogin: string | null,
  campaignId: number,
  dateFrom: string,
  dateTo: string,
  sandbox = false
): Promise<CampaignPerformanceReportRow[]> {
  const url = `${getDirectBaseUrl(sandbox)}${API_ENDPOINTS.direct.reports}`
  const body = {
    params: {
      SelectionCriteria: { DateFrom: dateFrom, DateTo: dateTo, CampaignIds: [campaignId] },
      FieldNames: ['Date', 'Impressions', 'Clicks', 'Cost', 'Ctr', 'AvgCpc', 'Conversions'],
      ReportName: `CampaignPerformance_${campaignId}_${dateFrom}_${dateTo}`,
      ReportType: 'CAMPAIGN_PERFORMANCE_REPORT',
      Format: 'TSV',
      IncludeVAT: 'YES',
      IncludeDiscount: 'NO',
    },
  }

  const ready = await fetchReportWithPoll(token, clientLogin, url, body, 'Отчёт Директа')
  const rows = parseTsv(ready)
  return rows.map((row) => campaignPerformanceReportRowSchema.parse(row))
}

export async function getAdReport(
  token: string,
  clientLogin: string | null,
  campaignId: number,
  dateFrom: string,
  dateTo: string,
  sandbox = false
): Promise<AdReportRow[]> {
  const url = `${getDirectBaseUrl(sandbox)}${API_ENDPOINTS.direct.reports}`
  const body = {
    params: {
      SelectionCriteria: { DateFrom: dateFrom, DateTo: dateTo, CampaignIds: [campaignId] },
      FieldNames: ['AdName', 'Impressions', 'Clicks', 'Cost', 'Ctr'],
      ReportName: `AdReport_${campaignId}_${dateFrom}_${dateTo}`,
      ReportType: 'AD_PERFORMANCE_REPORT',
      Format: 'TSV',
      IncludeVAT: 'YES',
    },
  }

  const ready = await fetchReportWithPoll(token, clientLogin, url, body, 'Отчёт по объявлениям')
  const rows = parseTsv(ready)
  return rows.map((row) => adReportRowSchema.parse(row))
}

export async function getSearchTermsReport(
  token: string,
  clientLogin: string | null,
  campaignId: number,
  dateFrom: string,
  dateTo: string,
  sandbox = false
): Promise<SearchTermReportRow[]> {
  const url = `${getDirectBaseUrl(sandbox)}${API_ENDPOINTS.direct.reports}`
  const body = {
    params: {
      SelectionCriteria: { DateFrom: dateFrom, DateTo: dateTo, CampaignIds: [campaignId] },
      FieldNames: ['SearchTerm', 'Impressions', 'Clicks', 'Cost', 'Ctr'],
      ReportName: `SearchTerms_${campaignId}_${dateFrom}_${dateTo}`,
      ReportType: 'SEARCH_QUERY_PERFORMANCE_REPORT',
      Format: 'TSV',
      IncludeVAT: 'YES',
    },
  }

  const ready = await fetchReportWithPoll(token, clientLogin, url, body, 'Отчёт по поисковым запросам')
  const rows = parseTsv(ready)
  return rows.map((row) => searchTermReportRowSchema.parse(row))
}
