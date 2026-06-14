import { getKpiSummary, useStatsComparison } from '../../api/metrica'
import { formatMetricValue, getMetricName } from '../../lib/metrics'
import { MetricDelta } from '../ui/MetricDelta'
import { StatCard } from '../ui/StatCard'

interface TotalsSectionProps {
  counterId: number
  dateFrom: string
  dateTo: string
}

const KPI_METRICS = [
  'ym:s:visits',
  'ym:s:pageviews',
  'ym:s:users',
  'ym:s:bounceRate',
  'ym:s:avgVisitDurationSeconds',
  'ym:s:pageDepth',
]

export function TotalsSection({ counterId, dateFrom, dateTo }: TotalsSectionProps) {
  const { current, previous } = useStatsComparison(
    counterId,
    { from: dateFrom, to: dateTo },
    getKpiSummary,
    'kpi'
  )

  if (current.isLoading && !current.data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface-elevated rounded-lg border border-outline p-6 h-24">
            <div className="h-4 w-1/3 bg-surface-soft rounded animate-pulse mb-2" />
            <div className="h-8 w-2/3 bg-surface-soft rounded animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  const currentTotals = current.data?.totals
  const previousTotals = previous.data?.totals

  if (!currentTotals) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {KPI_METRICS.map((metric, index) => {
        const currentValue = currentTotals[index] ?? 0
        const previousValue = previousTotals?.[index] ?? 0
        const isInverse = metric.includes('bounceRate') || metric.includes('Duration')
        return (
          <StatCard
            key={metric}
            label={getMetricName(metric)}
            value={formatMetricValue(currentValue, metric)}
            subtitle={
              <MetricDelta current={currentValue} previous={previousValue} inverse={isInverse} />
            }
          />
        )
      })}
    </div>
  )
}
