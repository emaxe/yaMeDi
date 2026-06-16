import { DEFAULT_TIMEOUT, MAX_RETRIES } from './config'

export interface RequestOptions {
  method?: 'GET' | 'POST'
  body?: unknown
  headers?: Record<string, string>
  timeout?: number
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public context: string,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function isRetryableError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return true
  // Retry on rate limiting (429) and transient server errors (5xx)
  return error.status === 429 || error.status >= 500
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function executeWithRetry<T>(fn: () => Promise<T>, context: string): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (!isRetryableError(error) || attempt === MAX_RETRIES - 1) {
        throw lastError
      }

      await delay(1000 * (attempt + 1))
    }
  }

  throw lastError ?? new ApiError(0, context, 'Неизвестная ошибка сети')
}

function buildErrorMessage(status: number, body: string, context: string): string {
  if (status === 401) {
    return `${context}: Токен невалиден или просрочен (401)`
  }
  if (status === 403) {
    return `${context}: Нет прав доступа (403)`
  }
  const suffix = body ? ` — ${body.slice(0, 200)}` : ''
  return `${context}: HTTP ${status}${suffix}`
}

const DIRECT_API_HOSTS = new Set(['api.direct.yandex.com', 'api-sandbox.direct.yandex.com'])

function isDirectUrl(url: string): boolean {
  try {
    return DIRECT_API_HOSTS.has(new URL(url).hostname)
  } catch {
    return false
  }
}

interface DirectApiErrorBody {
  error: {
    error_code: number | string
    error_string?: string
    error_detail?: string
  }
}

function isDirectApiError(body: unknown): body is DirectApiErrorBody {
  return (
    typeof body === 'object' &&
    body !== null &&
    'error' in body &&
    typeof (body as Record<string, unknown>).error === 'object' &&
    (body as { error: Record<string, unknown> }).error !== null &&
    'error_code' in (body as { error: Record<string, unknown> }).error
  )
}

function buildDirectApiErrorMessage(body: DirectApiErrorBody, context: string): string {
  const { error_code, error_string, error_detail } = body.error
  const code = error_code ?? 'unknown'
  let message = error_string ?? 'Ошибка API Яндекс Директа'
  // Код 58 — нужно подать заявку на доступ к API в интерфейсе Директа
  if (code === 58) {
    message = 'Нужно заполнить заявку на доступ к API Яндекс Директа в интерфейсе и дождаться подтверждения'
  }
  const detail = error_detail ? `: ${error_detail}` : ''
  return `${context}: ${message} (код ${code})${detail}`
}

async function performFetch(url: string, options: RequestOptions): Promise<{ status: number; body: string }> {
  const electronAPI = window.electronAPI
  const viaMain = isDirectUrl(url) && electronAPI?.directFetch
  console.log(
    `[performFetch] url=${url} isDirect=${isDirectUrl(url)} electronAPI=${typeof electronAPI} directFetch=${typeof electronAPI?.directFetch}`
  )

  if (viaMain) {
    try {
      console.log('[performFetch] directFetch options', options)
      const result = await electronAPI.directFetch(url, options)
      console.log(`[performFetch] main result status=${result.status} body=${result.body.slice(0, 200)}`)
      return result
    } catch (err) {
      console.error(`[performFetch] main error`, err)
      throw err
    }
  }

  const timeout = options.timeout ?? DEFAULT_TIMEOUT
  const signal = AbortSignal.timeout(timeout)

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers: options.headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal,
  })

  const body = await response.text().catch(() => '')
  console.log(`[performFetch] fetch status=${response.status} body=${body.slice(0, 200)}`)
  return { status: response.status, body }
}

export async function fetchJson<T>(url: string, options: RequestOptions = {}, context: string): Promise<T> {
  return executeWithRetry(async () => {
    const { status, body } = await performFetch(url, options)

    if (status < 200 || status >= 300) {
      console.error(`[API error] ${context}: ${status}`, body)
      throw new ApiError(status, context, buildErrorMessage(status, body, context))
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(body)
    } catch {
      throw new ApiError(status, context, `${context}: Невалидный JSON в ответе`)
    }

    // Яндекс Direct API возвращает HTTP 200 с ошибкой в теле
    if (isDirectApiError(parsed)) {
      console.error(`[API error] ${context}: Direct API error`, parsed.error)
      throw new ApiError(status, context, buildDirectApiErrorMessage(parsed, context))
    }

    return parsed as T
  }, context)
}

export async function fetchText(url: string, options: RequestOptions = {}, context: string): Promise<string> {
  return executeWithRetry(async () => {
    const { status, body } = await performFetch(url, options)

    if (status < 200 || status >= 300) {
      console.error(`[API error] ${context}: ${status}`, body)
      throw new ApiError(status, context, buildErrorMessage(status, body, context))
    }

    return body
  }, context)
}
