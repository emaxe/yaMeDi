import { useQuery } from '@tanstack/react-query'

import { useAuth } from '../hooks/useAuth'
import {
  campaignsResponseSchema,
  directReportRowSchema,
  type Campaign,
  type DirectReportRow,
} from '../types'

import { ApiError, fetchJson, fetchText } from './client'
import { API_CONFIG, API_ENDPOINTS } from './config'

function getDirectHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': API_CONFIG.direct.contentType,
    returnMoneyInMicros: 'false',
    skipReportHeader: 'true',
    skipReportSummary: 'true',
    skipColumnHeader: 'false',
  }
}

function getDirectBaseUrl(sandbox: boolean): string {
  return sandbox ? API_CONFIG.direct.sandboxUrl : API_CONFIG.direct.baseUrl
}

export async function getCampaigns(token: string, sandbox = false): Promise<Campaign[]> {
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
    { method: 'POST', headers: getDirectHeaders(token), body },
    'Кампании Директа'
  )
  const parsed = campaignsResponseSchema.parse(data)
  return parsed.result?.Campaigns ?? []
}

export function useCampaigns(sandbox: boolean) {
  const { token } = useAuth()
  return useQuery({
    queryKey: ['campaigns', sandbox],
    queryFn: () => getCampaigns(token!, sandbox),
    enabled: !!token,
  })
}

export type TsvValue = string | number

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
      const num = parseFloat(v)
      row[h] = Number.isNaN(num) || v === '' ? v : num
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

export async function getCampaignReport(
  token: string,
  dateFrom: string,
  dateTo: string,
  sandbox = false
): Promise<DirectReportRow[]> {
  const url = `${getDirectBaseUrl(sandbox)}${API_ENDPOINTS.direct.reports}`
  const body = {
    params: {
      SelectionCriteria: { DateFrom: dateFrom, DateTo: dateTo },
      FieldNames: ['CampaignName', 'CampaignId', 'Impressions', 'Clicks', 'Cost', 'Ctr', 'AvgCpc', 'Conversions'],
      ReportName: `CampaignReport_${dateFrom}_${dateTo}`,
      ReportType: 'CAMPAIGN_PERFORMANCE_REPORT',
      Format: 'TSV',
      IncludeVAT: 'YES',
      IncludeDiscount: 'NO',
    },
  }

  const text = await fetchText(
    url,
    { method: 'POST', headers: getDirectHeaders(token), body },
    'Отчёт Директа'
  )
  const ready = assertReportReady(text, 'Отчёт Директа')
  const rows = parseTsv(ready)
  return rows.map((row) => directReportRowSchema.parse(row))
}

export async function getAdReport(
  token: string,
  dateFrom: string,
  dateTo: string,
  sandbox = false
): Promise<string> {
  const url = `${getDirectBaseUrl(sandbox)}${API_ENDPOINTS.direct.reports}`
  const body = {
    params: {
      SelectionCriteria: { DateFrom: dateFrom, DateTo: dateTo },
      FieldNames: ['CampaignName', 'AdGroupName', 'AdId', 'Impressions', 'Clicks', 'Cost'],
      ReportName: `AdReport_${dateFrom}_${dateTo}`,
      ReportType: 'AD_PERFORMANCE_REPORT',
      Format: 'TSV',
      IncludeVAT: 'YES',
    },
  }

  const text = await fetchText(url, { method: 'POST', headers: getDirectHeaders(token), body }, 'Отчёт по объявлениям')
  return assertReportReady(text, 'Отчёт по объявлениям')
}

export async function getSearchTermsReport(
  token: string,
  dateFrom: string,
  dateTo: string,
  sandbox = false
): Promise<string> {
  const url = `${getDirectBaseUrl(sandbox)}${API_ENDPOINTS.direct.reports}`
  const body = {
    params: {
      SelectionCriteria: { DateFrom: dateFrom, DateTo: dateTo },
      FieldNames: ['SearchQuery', 'CampaignName', 'Impressions', 'Clicks', 'Cost', 'Ctr'],
      ReportName: `SearchTerms_${dateFrom}_${dateTo}`,
      ReportType: 'SEARCH_QUERY_PERFORMANCE_REPORT',
      Format: 'TSV',
      IncludeVAT: 'YES',
    },
  }

  const text = await fetchText(
    url,
    { method: 'POST', headers: getDirectHeaders(token), body },
    'Отчёт по поисковым запросам'
  )
  return assertReportReady(text, 'Отчёт по поисковым запросам')
}
