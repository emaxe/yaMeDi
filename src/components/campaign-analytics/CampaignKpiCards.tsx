import { useCampaignPerformanceComparison } from '../../hooks/useCampaignReports'
import { formatMetricValue } from '../../lib/metrics'
import { MetricDelta } from '../ui/MetricDelta'
import { SkeletonCard } from '../ui/Skeleton'
import { StatCard } from '../ui/StatCard'

interface CampaignKpiCardsProps {
  campaignId: number
  dateFrom: string
  dateTo: string
  sandbox?: boolean
}

type KpiKey = 'Impressions' | 'Clicks' | 'Cost' | 'Ctr' | 'AvgCpc' | 'Conversions'

interface KpiDefinition {
  key: KpiKey
  label: string
  metric?: string
  inverse?: boolean
  format: (value: number) => string
}

function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return value.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 2 })
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return `${value.toFixed(2)}%`
}

const KPI_DEFINITIONS: KpiDefinition[] = [
  { key: 'Impressions', label: 'Показы', format: (v) => formatMetricValue(v) },
  { key: 'Clicks', label: 'Клики', format: (v) => formatMetricValue(v) },
  { key: 'Cost', label: 'Расход', format: formatCurrency },
  { key: 'Ctr', label: 'CTR', format: formatPercent },
  { key: 'AvgCpc', label: 'Средняя цена клика', format: formatCurrency },
  { key: 'Conversions', label: 'Конверсии', format: (v) => formatMetricValue(v) },
]

type KpiTotals = Record<KpiKey, number>

function calculateKpiTotals(rows: Array<Record<KpiKey, number>> | undefined): KpiTotals {
  const totals: KpiTotals = {
    Impressions: 0,
    Clicks: 0,
    Cost: 0,
    Ctr: 0,
    AvgCpc: 0,
    Conversions: 0,
  }
  if (!rows) return totals
  for (const row of rows) {
    totals.Impressions += row.Impressions ?? 0
    totals.Clicks += row.Clicks ?? 0
    totals.Cost += row.Cost ?? 0
    totals.Conversions += row.Conversions ?? 0
  }
  totals.Ctr = totals.Impressions > 0 ? (totals.Clicks / totals.Impressions) * 100 : 0
  totals.AvgCpc = totals.Clicks > 0 ? totals.Cost / totals.Clicks : 0
  return totals
}

export function CampaignKpiCards({ campaignId, dateFrom, dateTo, sandbox = false }: CampaignKpiCardsProps) {
  const { current, previous } = useCampaignPerformanceComparison(
    campaignId,
    { from: dateFrom, to: dateTo },
    sandbox
  )

  const isLoading = current.isLoading && !current.data

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  const currentTotals = calculateKpiTotals(current.data as Array<Record<KpiKey, number>> | undefined)
  const previousTotals = calculateKpiTotals(previous.data as Array<Record<KpiKey, number>> | undefined)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {KPI_DEFINITIONS.map((kpi) => {
        const currentValue = currentTotals[kpi.key]
        const previousValue = previousTotals[kpi.key]
        return (
          <StatCard
            key={kpi.key}
            label={kpi.label}
            value={kpi.format(currentValue)}
            subtitle={<MetricDelta current={currentValue} previous={previousValue} inverse={kpi.inverse} />}
          />
        )
      })}
    </div>
  )
}
