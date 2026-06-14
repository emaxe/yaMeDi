import { format, isAfter, parseISO, startOfDay } from 'date-fns'
import { LineChart as LineChartIcon, RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { useDevices, useSources, useTrafficSummary } from '../api/metrica'
import { useApp } from '../hooks/useApp'
import { type ChartDataPoint } from '../types'

import { DevicesChart } from './metrics/DevicesChart'
import { SourcesChart } from './metrics/SourcesChart'
import { TotalsSection } from './metrics/TotalsSection'
import { TrafficChart } from './metrics/TrafficChart'
import { DateRangePicker, type DateRange } from './ui/DateRangePicker'
import { EmptyState } from './ui/EmptyState'
import { ErrorAlert } from './ui/ErrorAlert'
import { LoadingButton } from './ui/LoadingButton'
import { SkeletonCard, SkeletonChart } from './ui/Skeleton'

function getDefaultDates() {
  const to = new Date()
  const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000)
  return {
    from: format(from, 'yyyy-MM-dd'),
    to: format(to, 'yyyy-MM-dd'),
  }
}

function isValidDateRange(dates: DateRange): boolean {
  if (!dates.from || !dates.to) return false
  const fromDate = parseISO(dates.from)
  const toDate = parseISO(dates.to)
  const today = startOfDay(new Date())
  return !isAfter(fromDate, toDate) && !isAfter(toDate, today)
}

export default function MetricsDashboard() {
  const { selectedCounter } = useApp()
  const counterId = selectedCounter?.id
  const [dates, setDates] = useState(getDefaultDates)

  const {
    data: traffic,
    isLoading: trafficLoading,
    isError: trafficError,
    error: trafficErrorMessage,
    refetch: refetchTraffic,
  } = useTrafficSummary(counterId, dates.from, dates.to)
  const {
    data: sources,
    isLoading: sourcesLoading,
    isError: sourcesError,
    error: sourcesErrorMessage,
    refetch: refetchSources,
  } = useSources(counterId, dates.from, dates.to)
  const {
    data: devices,
    isLoading: devicesLoading,
    isError: devicesError,
    error: devicesErrorMessage,
    refetch: refetchDevices,
  } = useDevices(counterId, dates.from, dates.to)

  const loading = trafficLoading || sourcesLoading || devicesLoading
  const errorMessage = trafficErrorMessage || sourcesErrorMessage || devicesErrorMessage
  const hasError = trafficError || sourcesError || devicesError

  const refetchAll = () => {
    refetchTraffic()
    refetchSources()
    refetchDevices()
  }

  useEffect(() => {
    if (!counterId || !isValidDateRange(dates)) return
    if (traffic === undefined && sources === undefined && devices === undefined && !loading && !hasError) {
      refetchAll()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counterId, dates, traffic, sources, devices, loading, hasError])

  const trafficData = useMemo<ChartDataPoint[]>(() => {
    if (!traffic?.data) return []
    const metrics = traffic.query.metrics
    return traffic.data.map((row) => {
      const date = row.dimensions[0]?.name || ''
      const point: ChartDataPoint = { date }
      row.metrics.forEach((v, i) => {
        point[metrics[i]] = v
      })
      return point
    })
  }, [traffic])

  const sourcesData = useMemo<ChartDataPoint[]>(() => {
    if (!sources?.data) return []
    const metrics = sources.query.metrics
    return sources.data.map((row) => {
      const name = row.dimensions[0]?.name || ''
      const point: ChartDataPoint = { name }
      row.metrics.forEach((v, i) => {
        point[metrics[i]] = v
      })
      return point
    })
  }, [sources])

  const devicesData = useMemo<ChartDataPoint[]>(() => {
    if (!devices?.data) return []
    const metrics = devices.query.metrics
    return devices.data.map((row) => {
      const name = row.dimensions[0]?.name || ''
      const point: ChartDataPoint = { name }
      row.metrics.forEach((v, i) => {
        point[metrics[i]] = v
      })
      return point
    })
  }, [devices])

  const totals = traffic?.totals
  const isFirstLoad = loading && traffic === undefined && sources === undefined && devices === undefined
  const datesValid = isValidDateRange(dates)

  if (!selectedCounter) {
    return (
      <EmptyState
        message="Сначала выберите счётчик"
        hint="Перейдите в раздел «Счётчики» и выберите один из доступных счётчиков, чтобы увидеть графики."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <LineChartIcon className="w-6 h-6 text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-headline-lg text-on-background">Графики Метрики</h2>
            <p className="text-body-sm text-on-surface-muted">
              Счётчик: {selectedCounter.name} (ID: {selectedCounter.id})
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker value={dates} onChange={setDates} />
          <LoadingButton
            onClick={refetchAll}
            loading={loading}
            loadingText="Загрузка..."
            disabled={!datesValid}
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Загрузить
          </LoadingButton>
        </div>
      </div>

      {hasError && (
        <ErrorAlert
          message={errorMessage?.message ?? 'Неизвестная ошибка'}
          onRetry={refetchAll}
        />
      )}

      {!datesValid && !hasError && (
        <ErrorAlert message="Выберите корректный период: начало не позже конца, даты не в будущем" />
      )}

      {isFirstLoad && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} className="h-24" />
            ))}
          </div>
          <SkeletonChart />
          <SkeletonChart />
          <SkeletonChart />
        </div>
      )}

      {totals && traffic && !loading && <TotalsSection metrics={traffic.query.metrics} totals={totals} />}

      {trafficData.length > 0 && !loading && <TrafficChart data={trafficData} />}

      {sourcesData.length > 0 && !loading && <SourcesChart data={sourcesData} />}

      {devicesData.length > 0 && !loading && <DevicesChart data={devicesData} />}

      {!traffic && !loading && !hasError && datesValid && (
        <EmptyState
          message="Выберите период и нажмите «Загрузить»"
          hint="Данные за выбранный период появятся здесь после загрузки."
        />
      )}
    </div>
  )
}
