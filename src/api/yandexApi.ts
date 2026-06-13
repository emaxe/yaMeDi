import { AccountInfo, Counter, MetricaData, Campaign, TokenCheckResult, DirectReportRow } from '../types'

const METRIKA_BASE_URL = 'https://api-metrika.yandex.net'
const DIRECT_BASE_URL = 'https://api.direct.yandex.com/json/v5'
const DIRECT_SANDBOX_URL = 'https://api-sandbox.direct.yandex.com/json/v5'
const LOGIN_BASE_URL = 'https://login.yandex.ru'

let globalToken = localStorage.getItem('yandex_token') || ''

function getMetricaHeaders(): Record<string, string> {
  return {
    Authorization: `OAuth ${globalToken}`,
    'Content-Type': 'application/x-yametrika+json',
  }
}

function getDirectHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${globalToken}`,
    'Content-Type': 'application/json',
    returnMoneyInMicros: 'false',
    skipReportHeader: 'true',
    skipReportSummary: 'true',
    skipColumnHeader: 'false',
  }
}

export function setToken(token: string) {
  globalToken = token.trim().replace(/^["']|["']$/g, '')
  localStorage.setItem('yandex_token', globalToken)
}

export function getToken(): string {
  return globalToken
}

export function hasToken(): boolean {
  return !!globalToken
}

function handleError(resp: Response, context: string): never {
  if (resp.status === 401) {
    throw new Error(`${context}: Токен невалиден или просрочен (401)`)
  }
  if (resp.status === 403) {
    throw new Error(`${context}: Нет прав доступа (403)`)
  }
  throw new Error(`${context}: HTTP ${resp.status}`)
}

async function checkJson(resp: Response, context: string) {
  if (!resp.ok) {
    const body = await resp.text().catch(() => '')
    console.error(`[API error] ${context}: ${resp.status}`, body)
    if (resp.status === 401) {
      throw new Error(`${context}: Токен невалиден или просрочен (401)`)
    }
    if (resp.status === 403) {
      throw new Error(`${context}: Нет прав доступа (403)`)
    }
    throw new Error(`${context}: HTTP ${resp.status}${body ? ` — ${body.slice(0, 200)}` : ''}`)
  }
  return resp.json()
}

// --- Token Diagnostics ---

export async function getAccountInfo(): Promise<AccountInfo> {
  const url = `${LOGIN_BASE_URL}/info?format=json`
  const headers = { Authorization: `OAuth ${globalToken}` }
  try {
    const resp = await fetch(url, { headers, signal: AbortSignal.timeout(10000) })
    if (resp.status === 200) {
      const data = await resp.json()
      return { ...data, valid: true }
    }
    if (resp.status === 401) {
      return { valid: false, error: 'Токен недействителен или просрочен (401)' }
    }
    return { valid: false, error: `HTTP ${resp.status}` }
  } catch (e) {
    return { valid: false, error: (e as Error).message }
  }
}

export async function checkMetricaScope(): Promise<boolean> {
  const url = `${METRIKA_BASE_URL}/management/v1/counters`
  try {
    const resp = await fetch(url, { headers: getMetricaHeaders(), signal: AbortSignal.timeout(10000) })
    return resp.status === 200
  } catch {
    return false
  }
}

export async function checkDirectScope(): Promise<{ ok: boolean; reason: string }> {
  const url = `${DIRECT_BASE_URL}/campaigns`
  const body = {
    method: 'get',
    params: {
      SelectionCriteria: {},
      FieldNames: ['Id', 'Name'],
    },
  }
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: getDirectHeaders(),
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    })
    if (resp.status === 200) {
      const data = await resp.json()
      if (data.error) {
        return { ok: false, reason: `Ошибка в ответе: ${data.error.error_string || data.error.error_code}` }
      }
      return { ok: true, reason: 'OK' }
    }
    return { ok: false, reason: `HTTP ${resp.status}` }
  } catch (e) {
    return { ok: false, reason: (e as Error).message }
  }
}

export async function checkDirectReadScope(): Promise<{ ok: boolean; reason: string }> {
  const now = new Date()
  const yesterday = new Date(now.getTime() - 86400000)
  const fmt = (d: Date) => d.toISOString().split('T')[0]

  const url = `${DIRECT_BASE_URL}/reports`
  const body = {
    params: {
      SelectionCriteria: { DateFrom: fmt(yesterday), DateTo: fmt(now) },
      FieldNames: ['CampaignName', 'Impressions'],
      ReportName: 'ScopeCheck',
      ReportType: 'CAMPAIGN_PERFORMANCE_REPORT',
      Format: 'TSV',
      IncludeVAT: 'YES',
      IncludeDiscount: 'NO',
    },
  }
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: getDirectHeaders(),
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    })
    if (resp.status === 200) {
      const text = await resp.text()
      if (text.includes('Invalid OAuth token')) return { ok: false, reason: 'Invalid OAuth token' }
      if (text.toLowerCase().startsWith('error')) return { ok: false, reason: 'Error in response' }
      return { ok: true, reason: 'OK' }
    }
    return { ok: false, reason: `HTTP ${resp.status}` }
  } catch (e) {
    return { ok: false, reason: (e as Error).message }
  }
}

export async function runFullDiagnostics(): Promise<TokenCheckResult> {
  const info = await getAccountInfo()
  if (!info.valid) {
    return { valid: false, metrica: false, directFull: false, directRead: false, account: info }
  }

  const [metrica, direct, directRead] = await Promise.all([
    checkMetricaScope(),
    checkDirectScope(),
    checkDirectReadScope(),
  ])

  return {
    valid: true,
    metrica,
    directFull: direct.ok,
    directRead: directRead.ok,
    account: info,
  }
}

// --- Metrica API ---

export async function getCounters(): Promise<Counter[]> {
  const url = `${METRIKA_BASE_URL}/management/v1/counters`
  const data = await checkJson(await fetch(url, { headers: getMetricaHeaders() }), 'Список счётчиков')
  return (data.counters || []).map((c: { id: number; name?: string; site?: string; status?: string; type?: string }) => ({
    id: c.id,
    name: c.name || 'Без названия',
    site: c.site || '',
    status: c.status || '',
    type: c.type || '',
  }))
}

export async function getStats(
  counterId: number,
  dateFrom: string,
  dateTo: string,
  metrics: string,
  dimensions: string,
  limit = 1000
): Promise<MetricaData> {
  const url = new URL(`${METRIKA_BASE_URL}/stat/v1/data`)
  url.searchParams.set('id', String(counterId))
  url.searchParams.set('date1', dateFrom)
  url.searchParams.set('date2', dateTo)
  url.searchParams.set('limit', String(limit))
  url.searchParams.set('metrics', metrics)
  url.searchParams.set('dimensions', dimensions)

  const data = await checkJson(await fetch(url.toString(), { headers: getMetricaHeaders() }), 'Статистика Метрики')
  return data
}

export function getTrafficSummary(counterId: number, dateFrom: string, dateTo: string): Promise<MetricaData> {
  return getStats(
    counterId,
    dateFrom,
    dateTo,
    'ym:s:visits,ym:s:pageviews,ym:s:users,ym:s:bounceRate',
    'ym:s:date',
    1000
  )
}

export function getSources(counterId: number, dateFrom: string, dateTo: string): Promise<MetricaData> {
  return getStats(
    counterId,
    dateFrom,
    dateTo,
    'ym:s:visits,ym:s:users,ym:s:pageviews',
    'ym:s:trafficSource',
    1000
  )
}

export function getDevices(counterId: number, dateFrom: string, dateTo: string): Promise<MetricaData> {
  return getStats(counterId, dateFrom, dateTo, 'ym:s:visits,ym:s:users', 'ym:s:deviceCategory', 100)
}

// --- Direct API ---

export async function getCampaigns(sandbox = false): Promise<Campaign[]> {
  const base = sandbox ? DIRECT_SANDBOX_URL : DIRECT_BASE_URL
  const url = `${base}/campaigns`
  const body = {
    method: 'get',
    params: {
      SelectionCriteria: {},
      FieldNames: ['Id', 'Name', 'Status', 'Type', 'State', 'Currency'],
    },
  }
  const data = await checkJson(
    await fetch(url, { method: 'POST', headers: getDirectHeaders(), body: JSON.stringify(body) }),
    'Кампании Директа'
  )
  return (data.result?.Campaigns || []) as Campaign[]
}

export async function getCampaignReport(
  dateFrom: string,
  dateTo: string,
  sandbox = false
): Promise<DirectReportRow[]> {
  const base = sandbox ? DIRECT_SANDBOX_URL : DIRECT_BASE_URL
  const url = `${base}/reports`
  const body = {
    params: {
      SelectionCriteria: { DateFrom: dateFrom, DateTo: dateTo },
      FieldNames: [
        'CampaignName',
        'CampaignId',
        'Impressions',
        'Clicks',
        'Cost',
        'Ctr',
        'AvgCpc',
        'Conversions',
      ],
      ReportName: `CampaignReport_${dateFrom}_${dateTo}`,
      ReportType: 'CAMPAIGN_PERFORMANCE_REPORT',
      Format: 'TSV',
      IncludeVAT: 'YES',
      IncludeDiscount: 'NO',
    },
  }

  const resp = await fetch(url, {
    method: 'POST',
    headers: getDirectHeaders(),
    body: JSON.stringify(body),
  })
  if (!resp.ok) handleError(resp, 'Отчёт Директа')

  const text = await resp.text()
  if (text.startsWith('In progress')) {
    throw new Error('Отчёт готовится. Повторите запрос через несколько секунд.')
  }

  return parseTsv(text)
}

export async function getAdReport(dateFrom: string, dateTo: string, sandbox = false): Promise<string> {
  const base = sandbox ? DIRECT_SANDBOX_URL : DIRECT_BASE_URL
  const url = `${base}/reports`
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

  const resp = await fetch(url, { method: 'POST', headers: getDirectHeaders(), body: JSON.stringify(body) })
  if (!resp.ok) handleError(resp, 'Отчёт по объявлениям')

  const text = await resp.text()
  if (text.startsWith('In progress')) {
    throw new Error('Отчёт готовится. Повторите запрос через несколько секунд.')
  }
  return text
}

export async function getSearchTermsReport(dateFrom: string, dateTo: string, sandbox = false): Promise<string> {
  const base = sandbox ? DIRECT_SANDBOX_URL : DIRECT_BASE_URL
  const url = `${base}/reports`
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

  const resp = await fetch(url, { method: 'POST', headers: getDirectHeaders(), body: JSON.stringify(body) })
  if (!resp.ok) handleError(resp, 'Отчёт по поисковым запросам')

  const text = await resp.text()
  if (text.startsWith('In progress')) {
    throw new Error('Отчёт готовится. Повторите запрос через несколько секунд.')
  }
  return text
}

// --- TSV parser ---

function parseTsv(text: string): DirectReportRow[] {
  const lines = text.trim().split('\n').filter(Boolean)
  if (lines.length < 2) return []
  const headers = lines[0].split('\t')
  const rows: DirectReportRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split('\t')
    const row: Record<string, string | number> = {}
    headers.forEach((h, idx) => {
      const v = vals[idx] ?? ''
      const num = parseFloat(v)
      row[h] = isNaN(num) || v === '' ? v : num
    })
    rows.push(row as unknown as DirectReportRow)
  }
  return rows
}
