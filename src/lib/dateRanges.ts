import { format, isAfter, parseISO, startOfDay, startOfMonth, endOfMonth, subMonths, subDays } from 'date-fns'

import { type DateRange } from '../types'

export type DatePreset = {
  id: string
  label: string
  getRange: () => DateRange
}

export const DATE_PRESETS: DatePreset[] = [
  {
    id: 'today',
    label: 'Сегодня',
    getRange: () => {
      const today = format(new Date(), 'yyyy-MM-dd')
      return { from: today, to: today }
    },
  },
  {
    id: 'yesterday',
    label: 'Вчера',
    getRange: () => {
      const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
      return { from: yesterday, to: yesterday }
    },
  },
  {
    id: 'last7days',
    label: 'Последние 7 дней',
    getRange: () => {
      const to = format(new Date(), 'yyyy-MM-dd')
      const from = format(subDays(new Date(), 6), 'yyyy-MM-dd')
      return { from, to }
    },
  },
  {
    id: 'last30days',
    label: 'Последние 30 дней',
    getRange: () => {
      const to = format(new Date(), 'yyyy-MM-dd')
      const from = format(subDays(new Date(), 29), 'yyyy-MM-dd')
      return { from, to }
    },
  },
  {
    id: 'thisMonth',
    label: 'Этот месяц',
    getRange: () => {
      const now = new Date()
      return {
        from: format(startOfMonth(now), 'yyyy-MM-dd'),
        to: format(new Date(), 'yyyy-MM-dd'),
      }
    },
  },
  {
    id: 'lastMonth',
    label: 'Прошлый месяц',
    getRange: () => {
      const now = new Date()
      const start = startOfMonth(subMonths(now, 1))
      const end = endOfMonth(subMonths(now, 1))
      return {
        from: format(start, 'yyyy-MM-dd'),
        to: format(end, 'yyyy-MM-dd'),
      }
    },
  },
]

export function getDefaultDates(): DateRange {
  return DATE_PRESETS.find((p) => p.id === 'last7days')!.getRange()
}

export function getPreviousPeriod(dates: DateRange): DateRange {
  if (!dates.from || !dates.to) return dates
  const fromDate = parseISO(dates.from)
  const toDate = parseISO(dates.to)
  const diffMs = toDate.getTime() - fromDate.getTime()
  const prevTo = new Date(fromDate.getTime() - 1)
  const prevFrom = new Date(prevTo.getTime() - diffMs)
  return {
    from: format(prevFrom, 'yyyy-MM-dd'),
    to: format(prevTo, 'yyyy-MM-dd'),
  }
}

export function formatDate(value: string | Date): string {
  return typeof value === 'string' ? value : format(value, 'yyyy-MM-dd')
}

export function isValidDateRange(dates: DateRange): boolean {
  if (!dates.from || !dates.to) return false
  const fromDate = parseISO(dates.from)
  const toDate = parseISO(dates.to)
  const today = startOfDay(new Date())
  return !isAfter(fromDate, toDate) && !isAfter(toDate, today)
}

