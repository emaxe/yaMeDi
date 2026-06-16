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
import type { CampaignPerformanceReportRow, ChartDataPoint } from '../../types'
import { exportToCsv } from '../../lib/csvExport'
import { CHART_COLORS, axisStroke, gridStyle, labelStyle, legendStyle, tickStyle, tooltipStyle } from '../../lib/chartTheme'
import { MobileChartContainer } from '../mobile/MobileChartContainer'
import { DashboardWidget } from '../ui/DashboardWidget'

interface CampaignTrendChartProps {
  campaignId: number
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
  return rows.map((row) => ({
    date: row.Date,
    Clicks: row.Clicks,
    Cost: row.Cost,
  }))
}

export function CampaignTrendChart({ campaignId, dateFrom, dateTo, sandbox = false }: CampaignTrendChartProps) {
  const { data, isLoading, error, refetch } = useCampaignPerformanceReport(
    campaignId,
    { from: dateFrom, to: dateTo },
    sandbox
  )

  const chartData = transformToChartData(data)

  function handleExport() {
    if (!chartData.length) return
    exportToCsv(
      `campaign-trend-${campaignId}-${dateFrom}-${dateTo}.csv`,
      [{ key: 'date', label: 'Дата' }, ...METRICS.map((m) => ({ key: m.key, label: m.label }))],
      chartData
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
