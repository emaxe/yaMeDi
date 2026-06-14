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
  return !(error instanceof ApiError)
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

export async function fetchJson<T>(url: string, options: RequestOptions = {}, context: string): Promise<T> {
  return executeWithRetry(async () => {
    const timeout = options.timeout ?? DEFAULT_TIMEOUT
    const signal = AbortSignal.timeout(timeout)

    const response = await fetch(url, {
      method: options.method ?? 'GET',
      headers: options.headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal,
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      console.error(`[API error] ${context}: ${response.status}`, body)
      throw new ApiError(response.status, context, buildErrorMessage(response.status, body, context))
    }

    return response.json() as Promise<T>
  }, context)
}

export async function fetchText(url: string, options: RequestOptions = {}, context: string): Promise<string> {
  return executeWithRetry(async () => {
    const timeout = options.timeout ?? DEFAULT_TIMEOUT
    const signal = AbortSignal.timeout(timeout)

    const response = await fetch(url, {
      method: options.method ?? 'GET',
      headers: options.headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal,
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      console.error(`[API error] ${context}: ${response.status}`, body)
      throw new ApiError(response.status, context, buildErrorMessage(response.status, body, context))
    }

    return response.text()
  }, context)
}
