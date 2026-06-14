import { useMutation } from '@tanstack/react-query'

import { useAuth } from '../hooks/useAuth'
import {
  accountInfoSchema,
  directApiErrorSchema,
  type AccountInfo,
  type TokenCheckResult,
} from '../types'

import { ApiError, fetchJson, fetchText } from './client'
import { API_CONFIG, API_ENDPOINTS } from './config'

function getLoginHeaders(token: string): Record<string, string> {
  return { Authorization: `OAuth ${token}` }
}

function getMetricaHeaders(token: string): Record<string, string> {
  return {
    Authorization: `OAuth ${token}`,
    'Content-Type': API_CONFIG.metrika.contentType,
  }
}

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

export async function getAccountInfo(token: string): Promise<AccountInfo> {
  try {
    const data = await fetchJson<unknown>(
      API_ENDPOINTS.login.info,
      { headers: getLoginHeaders(token), timeout: 10000 },
      'Информация об аккаунте'
    )
    const parsed = accountInfoSchema.parse(data)
    return { valid: true, ...parsed }
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return { valid: false, error: 'Токен недействителен или просрочен (401)' }
    }
    return { valid: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export async function checkMetricaScope(token: string): Promise<boolean> {
  try {
    await fetchJson<unknown>(
      API_ENDPOINTS.metrika.counters,
      { headers: getMetricaHeaders(token), timeout: 10000 },
      'Проверка доступа к Метрике'
    )
    return true
  } catch {
    return false
  }
}

export async function checkDirectScope(token: string): Promise<{ ok: boolean; reason: string }> {
  const body = {
    method: 'get',
    params: {
      SelectionCriteria: {},
      FieldNames: ['Id', 'Name'],
    },
  }
  try {
    const data = await fetchJson<unknown>(
      `${API_CONFIG.direct.baseUrl}/campaigns`,
      { method: 'POST', headers: getDirectHeaders(token), body, timeout: 10000 },
      'Проверка доступа к Директу'
    )
    const parsed = directApiErrorSchema.parse(data)
    if (parsed.error) {
      return { ok: false, reason: `Ошибка в ответе: ${parsed.error.error_string || parsed.error.error_code}` }
    }
    return { ok: true, reason: 'OK' }
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : String(error) }
  }
}

export async function checkDirectReadScope(token: string): Promise<{ ok: boolean; reason: string }> {
  const now = new Date()
  const yesterday = new Date(now.getTime() - 86400000)
  const fmt = (d: Date) => d.toISOString().split('T')[0]

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
    const text = await fetchText(
      `${API_CONFIG.direct.baseUrl}/reports`,
      { method: 'POST', headers: getDirectHeaders(token), body, timeout: 10000 },
      'Проверка доступа к отчётам Директа'
    )
    if (text.includes('Invalid OAuth token')) return { ok: false, reason: 'Invalid OAuth token' }
    if (text.toLowerCase().startsWith('error')) return { ok: false, reason: 'Error in response' }
    return { ok: true, reason: 'OK' }
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : String(error) }
  }
}

export async function runFullDiagnostics(token: string): Promise<TokenCheckResult> {
  const info = await getAccountInfo(token)
  if (!info.valid) {
    return { valid: false, metrica: false, directFull: false, directRead: false, account: info }
  }

  const [metrica, direct, directRead] = await Promise.all([
    checkMetricaScope(token),
    checkDirectScope(token),
    checkDirectReadScope(token),
  ])

  return {
    valid: true,
    metrica,
    directFull: direct.ok,
    directRead: directRead.ok,
    account: info,
  }
}

export function useRunDiagnostics() {
  const { token } = useAuth()
  return useMutation({
    mutationFn: () => runFullDiagnostics(token!),
  })
}
