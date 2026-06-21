export const METRIC_NAMES: Record<string, string> = {
  'ym:s:visits': 'Визиты',
  'ym:s:pageviews': 'Просмотры',
  'ym:s:users': 'Посетители',
  'ym:s:newUsers': 'Новые посетители',
  'ym:s:bounceRate': 'Отказы',
  'ym:s:pageDepth': 'Глубина просмотра',
  'ym:s:avgVisitDurationSeconds': 'Среднее время',
  'ym:s:goalReaches': 'Достижения цели',
  'ym:s:conversionRate': 'Конверсия',
  'ym:pv:pageviews': 'Просмотры',
  'ym:pv:users': 'Посетители',
  'ym:s:revenue': 'Выручка',
  'ym:s:ecommerceRevenue': 'Выручка',
  'ym:s:ecommercePurchases': 'Покупки',
  'ym:s:purchases': 'Покупки',
  'ym:s:orders': 'Заказы',
  'ym:s:ecommerceAddToCart': 'Добавления в корзину',
  'ym:s:addToCart': 'Добавления в корзину',
  'ym:s:trafficSource': 'Источник трафика',
}

export function getMetricName(metric: string): string {
  if (METRIC_NAMES[metric]) {
    return METRIC_NAMES[metric]
  }
  if (/^ym:s:goalReaches\d+$/.test(metric) || /^ym:s:goal\d+reaches$/.test(metric)) {
    return METRIC_NAMES['ym:s:goalReaches']
  }
  return metric.replace(/^ym:s:/, '')
}

export function formatMetricValue(value: number, metric?: string): string {
  if (!Number.isFinite(value)) return '—'
  if (metric?.includes('Rate') || metric?.includes('conversion')) {
    return `${(value * 100).toFixed(2)}%`
  }
  if (metric?.includes('Duration') || metric?.includes('Seconds')) {
    return formatDuration(value)
  }
  if (metric === 'ym:s:revenue' || metric === 'ym:s:ecommerceRevenue') {
    return `${value.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽`
  }
  if (
    metric?.includes('Purchases') ||
    metric?.includes('purchases') ||
    metric?.includes('orders') ||
    metric?.includes('AddToCart') ||
    metric?.includes('addToCart') ||
    /^ym:s:goalReaches\d+$/.test(metric ?? '') ||
    /^ym:s:goal\d+reaches$/.test(metric ?? '')
  ) {
    return Math.round(value).toLocaleString('ru-RU')
  }
  return value.toLocaleString('ru-RU', { maximumFractionDigits: 2 })
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export function calculateDelta(current: number, previous: number): { value: number; isPositive: boolean } {
  if (previous === 0) {
    return { value: current > 0 ? Infinity : 0, isPositive: current > 0 }
  }
  const value = (current - previous) / previous
  return { value, isPositive: value >= 0 }
}

export function formatDelta(value: number): string {
  if (!Number.isFinite(value)) return '∞'
  return `${(value * 100).toFixed(1)}%`
}
