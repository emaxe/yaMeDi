import { useQueryClient } from '@tanstack/react-query'
import { LineChart as LineChartIcon, RefreshCw, Download } from 'lucide-react'
import { useState } from 'react'

import { useApp } from '../hooks/useApp'
import { isValidDateRange } from '../lib/dateRanges'
import { exportElementToPdf } from '../lib/pdfExport'

import { AudienceChart } from './metrics/AudienceChart'
import { BrowsersChart } from './metrics/BrowsersChart'
import { DevicesChart } from './metrics/DevicesChart'
import { GeoChart } from './metrics/GeoChart'
import { OSChart } from './metrics/OSChart'
import { PagesChart } from './metrics/PagesChart'
import { SearchPhrasesChart } from './metrics/SearchPhrasesChart'
import { SourcesChart } from './metrics/SourcesChart'
import { TopReferrersChart } from './metrics/TopReferrersChart'
import { TotalsSection } from './metrics/TotalsSection'
import { TrafficChart } from './metrics/TrafficChart'
import { DateRangePicker } from './ui/DateRangePicker'
import { EmptyState } from './ui/EmptyState'
import { ErrorAlert } from './ui/ErrorAlert'
import { LoadingButton } from './ui/LoadingButton'

export default function MetricsDashboard() {
  const { selectedCounter, dateRange, setDateRange } = useApp()
  const counterId = selectedCounter?.id
  const queryClient = useQueryClient()
  const [globalError, setGlobalError] = useState<string | null>(null)

  const datesValid = isValidDateRange(dateRange)

  function refetchAll() {
    if (!counterId || !datesValid) return
    setGlobalError(null)
    queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey
        return Array.isArray(key) && key.includes(counterId)
      },
    })
  }

  const dates = dateRange

  const handleExportPdf = () => {
    exportElementToPdf('metrics-dashboard', `Графики_Метрики_${selectedCounter?.name || 'Отчет'}.pdf`)
  }

  if (!selectedCounter) {
    return (
      <EmptyState
        message="Сначала выберите счётчик"
        hint="Перейдите в раздел «Счётчики» и выберите один из доступных счётчиков, чтобы увидеть графики."
      />
    )
  }

  if (!counterId) {
    return <ErrorAlert message="Не удалось определить идентификатор счётчика" />
  }

  return (
    <div id="metrics-dashboard" className="space-y-6 bg-background pb-8">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 shrink-0">
          <LineChartIcon className="w-6 h-6 text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-headline-lg text-on-background">Графики Метрики</h2>
            <p className="text-body-sm text-on-surface-muted">
              Счётчик: {selectedCounter.name} (ID: {selectedCounter.id})
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 no-export flex-wrap xl:justify-end">
          <DateRangePicker value={dates} onChange={setDateRange} />
          <button
            onClick={handleExportPdf}
            className="flex items-center justify-center gap-2 h-10 px-4 text-sm font-semibold text-primary bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition w-full sm:w-auto whitespace-nowrap"
          >
            <Download className="w-4 h-4 shrink-0" />
            Получить отчет
          </button>
          <LoadingButton
            onClick={refetchAll}
            loading={false}
            loadingText="Загрузка..."
            disabled={!datesValid}
            className="w-full sm:w-auto h-10 px-4 rounded-lg justify-center whitespace-nowrap"
          >
            <RefreshCw className="w-4 h-4 shrink-0" aria-hidden="true" />
            Загрузить
          </LoadingButton>
        </div>
      </div>

      {!datesValid && (
        <ErrorAlert message="Выберите корректный период: начало не позже конца, даты не в будущем" />
      )}

      {globalError && <ErrorAlert message={globalError} onRetry={refetchAll} />}

      <TotalsSection counterId={counterId} dateFrom={dates.from} dateTo={dates.to} />

      <TrafficChart counterId={counterId} dateFrom={dates.from} dateTo={dates.to} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SourcesChart counterId={counterId} dateFrom={dates.from} dateTo={dates.to} />
        <DevicesChart counterId={counterId} dateFrom={dates.from} dateTo={dates.to} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GeoChart counterId={counterId} dateFrom={dates.from} dateTo={dates.to} />
        <AudienceChart counterId={counterId} dateFrom={dates.from} dateTo={dates.to} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BrowsersChart counterId={counterId} dateFrom={dates.from} dateTo={dates.to} />
        <OSChart counterId={counterId} dateFrom={dates.from} dateTo={dates.to} />
      </div>

      <PagesChart counterId={counterId} dateFrom={dates.from} dateTo={dates.to} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SearchPhrasesChart counterId={counterId} dateFrom={dates.from} dateTo={dates.to} />
        <TopReferrersChart counterId={counterId} dateFrom={dates.from} dateTo={dates.to} />
      </div>
    </div>
  )
}
