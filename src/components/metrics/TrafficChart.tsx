import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

import { getTrafficSummary, useStatsComparison } from '../../api/metrica'
import { alignByIndex, transformMetricaData } from '../../lib/chartData'
import { getTotalsByMetric } from '../../lib/chartData'
import { CHART_COLORS, gridStyle, labelStyle, tooltipStyle, axisStroke, tickStyle, previousPeriodColor, legendStyle } from '../../lib/chartTheme'
import { exportToCsv } from '../../lib/csvExport'
import { getMetricName } from '../../lib/metrics'
import { MobileChartContainer } from '../mobile/MobileChartContainer'
import { DashboardWidget } from '../ui/DashboardWidget'
import { MetricDelta } from '../ui/MetricDelta'

interface TrafficChartProps {
  counterId: number
  dateFrom: string
  dateTo: string
}

const METRICS = ['ym:s:visits', 'ym:s:pageviews', 'ym:s:users']
const COLORS = [CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.success]

export function TrafficChart({ counterId, dateFrom, dateTo }: TrafficChartProps) {
  const { current, previous } = useStatsComparison(
    counterId,
    { from: dateFrom, to: dateTo },
    getTrafficSummary,
    'traffic'
  )

  const currentData = transformMetricaData(current.data, 'date')
  const previousData = transformMetricaData(previous.data, 'date')
  const data = alignByIndex(currentData, previousData, METRICS, 'date')

  function handleExport() {
    if (!currentData.length) return
    exportToCsv(
      `traffic-${dateFrom}-${dateTo}.csv`,
      [{ key: 'date', label: 'Дата' }, ...METRICS.map((m) => ({ key: m, label: getMetricName(m) }))],
      currentData
    )
  }

  const subtitle = (
    <div className="flex flex-wrap gap-3">
      {METRICS.map((metric, index) => {
        const currentValue = getTotalsByMetric(current.data, metric)
        const previousValue = getTotalsByMetric(previous.data, metric)
        return (
          <span key={metric} className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
            <span className="text-body-sm text-on-surface">{getMetricName(metric)}</span>
            <MetricDelta current={currentValue} previous={previousValue} />
          </span>
        )
      })}
    </div>
  )

  return (
    <DashboardWidget
      title="Трафик по дням"
      subtitle={subtitle}
      isLoading={current.isLoading && !current.data}
      error={current.error as Error | null}
      onRetry={() => current.refetch()}
      onExport={handleExport}
    >
      <MobileChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="date" {...axisStroke} tick={tickStyle} />
            <YAxis {...axisStroke} tick={tickStyle} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} itemStyle={labelStyle} />
            <Legend {...legendStyle} />
            {METRICS.map((metric, index) => (
              <Line
                key={metric}
                type="monotone"
                dataKey={metric}
                stroke={COLORS[index]}
                name={getMetricName(metric)}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
            {METRICS.map((metric, index) => (
              <Line
                key={`prev:${metric}`}
                type="monotone"
                dataKey={`prev:${metric}`}
                stroke={previousPeriodColor(COLORS[index])}
                strokeDasharray="5 5"
                name={`${getMetricName(metric)} (прошлый период)`}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </MobileChartContainer>
    </DashboardWidget>
  )
}
