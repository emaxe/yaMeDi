import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useCampaignPerformanceReport } from '../../hooks/useCampaignReports'
import { CHART_COLORS, axisStroke, gridStyle, labelStyle, legendStyle, tickStyle, tooltipStyle } from '../../lib/chartTheme'
import { exportData, type ExportFormat } from '../../lib/dataExport'
import type { CampaignPerformanceReportRow, ChartDataPoint } from '../../types'
import { MobileChartContainer } from '../mobile/MobileChartContainer'
import { DashboardWidget } from '../ui/DashboardWidget'

interface TrendChartProps {
  campaignId: number | 'all'
  dateFrom: string
  dateTo: string
  sandbox?: boolean
}

const METRICS = [
  { key: 'Clicks', label: 'Клики', color: CHART_COLORS.primary },
  { key: 'Cost', label: 'Расход', color: CHART_COLORS.secondary },
]

function transformToChartData(
  rows: CampaignPerformanceReportRow[] | undefined
): ChartDataPoint[] {
  if (!rows) return []
  const aggregated = new Map<string, { Clicks: number; Cost: number }>()

  for (const row of rows) {
    const existing = aggregated.get(row.Date)
    if (existing) {
      existing.Clicks += row.Clicks
      existing.Cost += row.Cost
    } else {
      aggregated.set(row.Date, { Clicks: row.Clicks, Cost: row.Cost })
    }
  }

  return Array.from(aggregated.entries()).map(([date, metrics]) => ({
    date,
    Clicks: metrics.Clicks,
    Cost: metrics.Cost,
  }))
}

export function TrendChart({ campaignId, dateFrom, dateTo, sandbox = false }: TrendChartProps) {
  const { data, isLoading, error, refetch } = useCampaignPerformanceReport(
    campaignId,
    { from: dateFrom, to: dateTo },
    sandbox
  )

  const chartData = transformToChartData(data)

  function handleExport(format: ExportFormat) {
    if (!chartData.length) return
    const filename = campaignId === 'all'
      ? `overall-trend-${dateFrom}-${dateTo}.csv`
      : `campaign-trend-${campaignId}-${dateFrom}-${dateTo}.csv`
    exportData(
      filename,
      [{ key: 'date', label: 'Дата' }, ...METRICS.map((m) => ({ key: m.key, label: m.label }))],
      chartData,
      format
    )
  }

  return (
    <DashboardWidget
      title="Динамика кампании"
      subtitle="Клики и расход по дням"
      isLoading={isLoading && !data}
      error={error as Error | null}
      onRetry={() => refetch()}
      onExport={handleExport}
    >
      <MobileChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="date" {...axisStroke} tick={tickStyle} />
            <YAxis {...axisStroke} tick={tickStyle} yAxisId="left" />
            <YAxis {...axisStroke} tick={tickStyle} yAxisId="right" orientation="right" />
            <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} itemStyle={labelStyle} />
            <Legend {...legendStyle} />
            <Area
              type="monotone"
              dataKey="Clicks"
              name={METRICS[0].label}
              stroke={METRICS[0].color}
              fill={CHART_COLORS.primarySoft}
              yAxisId="left"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="Cost"
              name={METRICS[1].label}
              stroke={METRICS[1].color}
              fill={CHART_COLORS.secondarySoft}
              yAxisId="right"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </MobileChartContainer>
    </DashboardWidget>
  )
}
