import { isAfter, parseISO, startOfDay } from 'date-fns'
import { AlertCircle, Calendar } from 'lucide-react'
import { useMemo } from 'react'

import { Card } from './Card'

export interface DateRange {
  from: string
  to: string
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const error = useMemo(() => {
    if (!value.from || !value.to) return null

    const fromDate = parseISO(value.from)
    const toDate = parseISO(value.to)
    const today = startOfDay(new Date())

    if (isAfter(fromDate, toDate)) {
      return 'Начало периода не может быть позже конца'
    }

    if (isAfter(toDate, today)) {
      return 'Конец периода не может быть в будущем'
    }

    return null
  }, [value])

  return (
    <div className="flex flex-col gap-2">
      <Card
        className={`flex items-center gap-2 px-3 py-2 ${error ? 'border-red-700/60 ring-1 ring-red-700/30' : ''}`}
      >
        <Calendar className="w-4 h-4 text-gray-400" aria-hidden="true" />
        <input
          type="date"
          value={value.from}
          max={value.to || undefined}
          onChange={(e) => onChange({ ...value, from: e.target.value })}
          className="bg-transparent text-sm text-white outline-none"
          aria-label="Начало периода"
          aria-invalid={error ? 'true' : 'false'}
        />
        <span className="text-gray-500" aria-hidden="true">
          —
        </span>
        <input
          type="date"
          value={value.to}
          min={value.from || undefined}
          onChange={(e) => onChange({ ...value, to: e.target.value })}
          className="bg-transparent text-sm text-white outline-none"
          aria-label="Конец периода"
          aria-invalid={error ? 'true' : 'false'}
        />
      </Card>
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-300" role="alert">
          <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
