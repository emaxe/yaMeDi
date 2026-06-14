import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

import { getSources, useStatsComparison } from '../../api/metrica'
import { buildComparisonData, transformMetricaData } from '../../lib/chartData'
import { CHART_COLORS, gridStyle, labelStyle, tooltipStyle, axisStroke, tickStyle, previousPeriodColor } from '../../lib/chartTheme'
import { exportToCsv } from '../../lib/csvExport'
import { formatMetricValue, getMetricName } from '../../lib/metrics'
import { DashboardWidget } from '../ui/DashboardWidget'

interface SourcesChartProps {
  counterId: number
  dateFrom: string
  dateTo: string
}

const METRICS = ['ym:s:visits', 'ym:s:users']
const COLORS = [CHART_COLORS.primarySoft, CHART_COLORS.secondarySoft]
const PREV_COLORS = [previousPeriodColor(CHART_COLORS.primarySoft), previousPeriodColor(CHART_COLORS.secondarySoft)]

export function SourcesChart({ counterId, dateFrom, dateTo }: SourcesChartProps) {
  const { current, previous } = useStatsComparison(
    counterId,
    { from: dateFrom, to: dateTo },
    getSources,
    'sources'
  )

  const currentData = transformMetricaData(current.data, 'name').slice(0, 10)
  const previousData = transformMetricaData(previous.data, 'name').slice(0, 10)
  const data = buildComparisonData(currentData, previousData, 'name', METRICS)

  function handleExport() {
    if (!currentData.length) return
    exportToCsv(
      `sources-${dateFrom}-${dateTo}.csv`,
      [{ key: 'name', label: 'Источник' }, ...METRICS.map((m) => ({ key: m, label: getMetricName(m) }))],
      currentData
    )
  }

  return (
    <DashboardWidget
      title="Источники трафика"
      subtitle="Топ-10 источников"
      isLoading={current.isLoading && !current.data}
      error={current.error as Error | null}
      onRetry={() => current.refetch()}
      onExport={handleExport}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid {...gridStyle} />
          <XAxis dataKey="name" {...axisStroke} tick={tickStyle} angle={-45} textAnchor="end" height={80} />
          <YAxis {...axisStroke} tick={tickStyle} />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={labelStyle}
            itemStyle={labelStyle}
            formatter={(value: number, name: string) => [formatMetricValue(value), name]}
          />
          <Legend />
          {METRICS.map((metric, index) => (
            <Bar
              key={metric}
              dataKey={metric}
              fill={COLORS[index]}
              name={getMetricName(metric)}
              radius={[4, 4, 0, 0]}
            />
          ))}
          {METRICS.map((metric, index) => (
            <Bar
              key={`prev:${metric}`}
              dataKey={`prev:${metric}`}
              fill={PREV_COLORS[index]}
              name={`${getMetricName(metric)} (прошлый период)`}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </DashboardWidget>
  )
}
