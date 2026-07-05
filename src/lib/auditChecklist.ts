import { differenceInCalendarDays, parseISO } from 'date-fns'

import type { AuditChecklistItem, AuditChecklistState } from '../types'

export const DEFAULT_AUDIT_INTERVAL_DAYS = 60

export const DEFAULT_AUDIT_ITEMS: AuditChecklistItem[] = [
  {
    id: 'metrica-webvisor',
    label: 'Метрика (вебвизор, тепловые карты)',
    lastCheckedDate: '2026-04-01',
    status: 'ok',
    intervalDays: DEFAULT_AUDIT_INTERVAL_DAYS,
  },
  {
    id: 'goals',
    label: 'Цели (текущие и новые)',
    lastCheckedDate: '2026-04-01',
    status: 'ok',
    intervalDays: DEFAULT_AUDIT_INTERVAL_DAYS,
  },
  {
    id: 'calltracking',
    label: 'Calltracking',
    lastCheckedDate: null,
    status: 'missing',
    intervalDays: DEFAULT_AUDIT_INTERVAL_DAYS,
  },
  {
    id: 'crm-data',
    label: 'CRM (аналитика — передача данных)',
    lastCheckedDate: '2026-05-01',
    status: 'missing',
    intervalDays: DEFAULT_AUDIT_INTERVAL_DAYS,
  },
  {
    id: 'offline-conversions',
    label: 'Офлайн-конверсии',
    lastCheckedDate: '2026-06-01',
    status: 'missing',
    intervalDays: DEFAULT_AUDIT_INTERVAL_DAYS,
  },
  {
    id: 'marquiz-crm',
    label: 'Марквиз (проверка интеграции с CRM)',
    lastCheckedDate: '2026-04-01',
    status: 'ok',
    intervalDays: DEFAULT_AUDIT_INTERVAL_DAYS,
  },
]

export const DEFAULT_AUDIT_STATE: AuditChecklistState = {
  items: DEFAULT_AUDIT_ITEMS,
}

export function getDaysSinceLastCheck(item: AuditChecklistItem, today = new Date()): number | null {
  if (!item.lastCheckedDate) return null
  try {
    const lastDate = parseISO(item.lastCheckedDate)
    return differenceInCalendarDays(today, lastDate)
  } catch {
    return null
  }
}

export function isOverdue(item: AuditChecklistItem, today = new Date()): boolean {
  const days = getDaysSinceLastCheck(item, today)
  if (days === null) return true
  return days > item.intervalDays
}

export function markAsChecked(
  items: AuditChecklistItem[],
  itemId: string,
  date: string,
  status: AuditChecklistItem['status'] = 'ok'
): AuditChecklistItem[] {
  return items.map((item) =>
    item.id === itemId
      ? { ...item, lastCheckedDate: date, status }
      : item
  )
}
