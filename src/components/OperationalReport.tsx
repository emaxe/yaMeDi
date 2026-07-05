import { BarChart3, AlertTriangle, Download } from 'lucide-react'
import { useMemo, useState } from 'react'

import { OPERATIONAL_PROJECTS } from '../config/operationalProjects'
import { useOperationalReport } from '../hooks/useOperationalReport'
import { exportData, type ExportFormat } from '../lib/dataExport'
import { exportElementToPdf } from '../lib/pdfExport'
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
//
// C1/C2/C3 временно скрыты — см. docs/plan/plan.md (Фаза 3, задача 3.1).
const METRIC_ROWS: { key: string; label: string; format?: (value: number) => string }[] = [
  { key: 'visits', label: 'Визиты' },
  { key: 'totalCost', label: 'Бюджет', format: formatCurrency },
  { key: 'cpa', label: 'CPA', format: formatCurrency },
  { key: 'drr', label: 'ДРР', format: formatPercentage },
  { key: 'romi', label: 'ROMI', format: formatPercentage },
  { key: 'averageCheck', label: 'Ср. чек', format: formatCurrency },
  { key: 'leads', label: 'Лиды' },
  { key: 'leadRequests', label: 'Заявки' },
  { key: 'cplRequest', label: 'CPL заявки', format: formatCurrency },
  { key: 'cplQualified', label: 'CPL квал. лида', format: formatCurrency },
  { key: 'directRevenue', label: 'Direct выручка', format: formatCurrency },
  { key: 'directOrders', label: 'Direct заказы' },
  { key: 'directCost', label: 'Direct расход', format: formatCurrency },
  { key: 'seoRevenue', label: 'SEO выручка', format: formatCurrency },
  { key: 'seoOrders', label: 'SEO заказы' },
  { key: 'seoVisits', label: 'SEO трафик' },
  { key: 'revenue', label: 'Выручка', format: formatCurrency },
  { key: 'orders', label: 'Заказы' },
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

  const handleExport = (format: ExportFormat) => {
    if (!data || transposedRows.length === 0) return
    const headers = displayColumns.map((column) => ({ key: column.key, label: column.label }))
    const filename = `operational-report-${projectId}-${dates.from}-${dates.to}.csv`
    exportData(filename, headers, transposedRows, format)
  }

  const handleExportPdf = () => {
    exportElementToPdf('operational-report', `Операционный_отчет_${projectId}.pdf`)
  }

  return (
    <div id="operational-report" className="space-y-6 bg-background pb-8" data-testid="operational-report-page">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 shrink-0">
          <BarChart3 className="w-6 h-6 text-primary" aria-hidden="true" />
          <h2 className="text-headline-lg text-on-background">Операционный отчёт</h2>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 no-export flex-wrap xl:justify-end">
          <select
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
            className="h-10 rounded-lg bg-surface-elevated border border-outline px-3 text-body-md text-on-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus"
            aria-label="Проект"
          >
            {OPERATIONAL_PROJECTS.map((projectOption) => (
              <option key={projectOption.id} value={projectOption.id}>
                {projectOption.name}
              </option>
            ))}
          </select>
          <DateRangePicker value={dates} onChange={setDates} />
          <button
            onClick={handleExportPdf}
            className="flex items-center justify-center gap-2 h-10 px-4 text-sm font-semibold text-primary bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition w-full sm:w-auto whitespace-nowrap"
          >
            <Download className="w-4 h-4 shrink-0" />
            Получить отчет
          </button>
        </div>
      </div>

      {!datesValid && (
        <EmptyState
          message="Выберите период"
          hint="Укажите дату начала и конца периода, чтобы сформировать отчёт."
        />
      )}

      {datesValid && data?.uonError && (
        <div
          className="rounded-lg border border-warning/30 bg-warning/10 p-4 flex items-center gap-3 text-on-surface"
          role="alert"
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-warning" aria-hidden="true" />
          <span className="flex-1 text-body-md">
            CRM (U-ON) недоступен — «CPL квал. лида» рассчитан по резервной цели Метрики. {data.uonError}
          </span>
        </div>
      )}

      {datesValid && (
        <DashboardWidget
          title="Операционные показатели"
          subtitle={
            project
              ? `${project.name} · ${dates.from} – ${dates.to}${project.uonApiKey ? ' · квал. лиды: CRM' : ''}`
              : `${dates.from} – ${dates.to}`
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
