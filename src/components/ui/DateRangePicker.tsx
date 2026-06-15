import { isAfter, parseISO, startOfDay } from 'date-fns'
import { AlertCircle, Calendar, ChevronDown } from 'lucide-react'
import { useMemo, useState } from 'react'

import { DATE_PRESETS } from '../../lib/dateRanges'
import { type DateRange } from '../../types'

import { Card } from './Card'

export type { DateRange }

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

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

  const activePreset = useMemo(() => {
    return DATE_PRESETS.find((preset) => {
      const range = preset.getRange()
      return range.from === value.from && range.to === value.to
    })
  }, [value])

  function applyPreset(presetId: string) {
    const preset = DATE_PRESETS.find((p) => p.id === presetId)
    if (preset) {
      onChange(preset.getRange())
    }
    setIsOpen(false)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <Card
          className={`flex flex-1 items-center gap-2 px-3 py-2 ${error ? 'border-danger ring-1 ring-danger/30' : ''}`}
        >
          <Calendar className="w-4 h-4 text-on-surface-muted shrink-0" aria-hidden="true" />
          <input
            type="date"
            value={value.from}
            max={value.to || undefined}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
            className="bg-transparent text-body-sm text-on-surface outline-none w-full min-w-0"
            aria-label="Начало периода"
            aria-invalid={error ? 'true' : 'false'}
          />
          <span className="text-on-surface-muted shrink-0" aria-hidden="true">
            —
          </span>
          <input
            type="date"
            value={value.to}
            min={value.from || undefined}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
            className="bg-transparent text-body-sm text-on-surface outline-none w-full min-w-0"
            aria-label="Конец периода"
            aria-invalid={error ? 'true' : 'false'}
          />
        </Card>

        <div className="relative">
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="inline-flex items-center justify-center gap-2 h-10 px-3 rounded-lg bg-surface-elevated border border-outline text-body-sm text-on-surface hover:bg-surface-soft transition w-full sm:w-auto"
            type="button"
          >
            <span>{activePreset?.label ?? 'Произвольный'}</span>
            <ChevronDown className="w-4 h-4 text-on-surface-muted" aria-hidden="true" />
          </button>

          {isOpen && (
            <div className="absolute right-0 top-full mt-1 z-10 w-48 rounded-lg bg-surface-elevated border border-outline shadow-raised py-1">
              {DATE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.id)}
                  className={`w-full text-left px-3 py-2 text-body-sm hover:bg-surface-soft transition ${
                    activePreset?.id === preset.id ? 'text-primary font-medium' : 'text-on-surface'
                  }`}
                  type="button"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-1.5 text-body-sm text-danger" role="alert">
          <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
