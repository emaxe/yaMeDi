export const API_CONFIG = {
  metrika: {
    baseUrl: 'https://api-metrika.yandex.net',
    contentType: 'application/x-yametrika+json',
  },
  direct: {
    baseUrl: 'https://api.direct.yandex.com/json/v5',
    sandboxUrl: 'https://api-sandbox.direct.yandex.com/json/v5',
    contentType: 'application/json',
  },
  login: {
    baseUrl: 'https://login.yandex.ru',
  },
} as const

export const API_ENDPOINTS = {
  metrika: {
    counters: `${API_CONFIG.metrika.baseUrl}/management/v1/counters`,
    stats: `${API_CONFIG.metrika.baseUrl}/stat/v1/data`,
  },
  direct: {
    campaigns: '/campaigns',
    reports: '/reports',
  },
  login: {
    info: `${API_CONFIG.login.baseUrl}/info?format=json`,
  },
} as const

export const DEFAULT_TIMEOUT = 10000
export const MAX_RETRIES = 3
