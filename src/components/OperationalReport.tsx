import { BarChart3 } from 'lucide-react'
import { useMemo, useState } from 'react'

import { OPERATIONAL_PROJECTS } from '../config/operationalProjects'
import { useOperationalReport } from '../hooks/useOperationalReport'
import { exportToCsv } from '../lib/csvExport'
import { getDefaultDates, isValidDateRange } from '../lib/dateRanges'
import type { DateRange } from '../types'

import { MobileListCard } from './mobile/MobileListCard'
import { DashboardWidget } from './ui/DashboardWidget'
import { DataTable, type DataTableColumn, type DataTableRow } from './ui/DataTable'
import { DateRangePicker } from './ui/DateRangePicker'
import { EmptyState } from './ui/EmptyState'

function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return value.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 2 })
}

function formatPercentage(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return `${value.toFixed(2)}%`
}

// Спецификация строк-показателей транспонированной таблицы.
// Каждая метрика становится строкой; её `format` применяется заранее,
// чтобы переиспользуемые DataTable/MobileListCard/exportToCsv выводили
// уже отформатированные значения без правок этих компонентов.
const METRIC_ROWS: { key: string; label: string; format?: (value: number) => string }[] = [
  { key: 'revenue', label: 'Выручка', format: formatCurrency },
  { key: 'orders', label: 'Заказы' },
  { key: 'visits', label: 'Визиты' },
  { key: 'directRevenue', label: 'Direct выручка', format: formatCurrency },
  { key: 'directOrders', label: 'Direct заказы' },
  { key: 'directCost', label: 'Direct расход', format: formatCurrency },
  { key: 'seoRevenue', label: 'SEO выручка', format: formatCurrency },
  { key: 'seoOrders', label: 'SEO заказы' },
  { key: 'seoVisits', label: 'SEO трафик' },
  { key: 'totalCost', label: 'Бюджет', format: formatCurrency },
  { key: 'cpa', label: 'CPA', format: formatCurrency },
  { key: 'drr', label: 'ДРР', format: formatPercentage },
  { key: 'romi', label: 'ROMI', format: formatPercentage },
  { key: 'averageCheck', label: 'Ср. чек', format: formatCurrency },
  { key: 'c1', label: 'C1', format: formatPercentage },
  { key: 'c2', label: 'C2', format: formatPercentage },
  { key: 'c3', label: 'C3', format: formatPercentage },
  { key: 'leads', label: 'Лиды' },
]

export default function OperationalReport() {
  const [projectId, setProjectId] = useState<string>(OPERATIONAL_PROJECTS[0].id)
  const [dates, setDates] = useState<DateRange>(getDefaultDates())
  const datesValid = isValidDateRange(dates)

  const { data, isLoading, error, refetch } = useOperationalReport(projectId, dates)

  const project = OPERATIONAL_PROJECTS.find((p) => p.id === projectId)

  // Периоды становятся столбцами: недели хронологически, затем «Итого».
  const periods = useMemo(() => (data ? [...data.rows, data.total] : []), [data])

  // Колонки транспонированной таблицы: «Показатель» + по одной на каждый период.
  const displayColumns = useMemo<DataTableColumn[]>(() => {
    const columns: DataTableColumn[] = [{ key: 'name', label: 'Показатель', align: 'left' }]
    periods.forEach((period, index) => {
      columns.push({ key: `col${index}`, label: period.weekLabel, align: 'right' })
    })
    return columns
  }, [periods])

  // Строки транспонированной таблицы: по одной на метрику, значения отформатированы заранее.
  const transposedRows = useMemo<DataTableRow[]>(() => {
    if (periods.length === 0) return []
    return METRIC_ROWS.map((metric) => {
      const row: DataTableRow = { name: metric.label }
      periods.forEach((period, index) => {
        const raw = period[metric.key as keyof typeof period]
        const numeric = Number(raw ?? 0)
        row[`col${index}`] = metric.format ? metric.format(numeric) : String(raw ?? '—')
      })
      return row
    })
  }, [periods])

  const handleExport = () => {
    if (!data || transposedRows.length === 0) return
    const headers = displayColumns.map((column) => ({ key: column.key, label: column.label }))
    const filename = `operational-report-${projectId}-${dates.from}-${dates.to}.csv`
    exportToCsv(filename, headers, transposedRows)
  }

  return (
    <div className="space-y-6" data-testid="operational-report-page">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-primary" aria-hidden="true" />
          <h2 className="text-headline-lg text-on-background">Операционный отчёт</h2>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <select
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
            className="h-9 rounded-sm bg-surface-elevated border border-outline px-3 text-body-md text-on-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus"
            aria-label="Проект"
          >
            {OPERATIONAL_PROJECTS.map((projectOption) => (
              <option key={projectOption.id} value={projectOption.id}>
                {projectOption.name}
              </option>
            ))}
          </select>
          <DateRangePicker value={dates} onChange={setDates} />
        </div>
      </div>

      {!datesValid && (
        <EmptyState
          message="Выберите период"
          hint="Укажите дату начала и конца периода, чтобы сформировать отчёт."
        />
      )}

      {datesValid && (
        <DashboardWidget
          title="Операционные показатели"
          subtitle={
            project ? `${project.name} · ${dates.from} – ${dates.to}` : `${dates.from} – ${dates.to}`
          }
          isLoading={isLoading && !data}
          error={error as Error | null}
          onRetry={() => refetch()}
          onExport={handleExport}
        >
          <div data-testid="operational-report-table" className="hidden md:block">
            <DataTable columns={displayColumns} rows={transposedRows} />
          </div>
          <MobileListCard columns={displayColumns} rows={transposedRows} />
        </DashboardWidget>
      )}
    </div>
  )
}
