import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

import { getSources, useStatsComparison } from '../../api/metrica'
import { useIsMobile } from '../../hooks/useMediaQuery'
import { buildComparisonData, transformMetricaData } from '../../lib/chartData'
import { CHART_COLORS, gridStyle, labelStyle, tooltipStyle, axisStroke, tickStyle, previousPeriodColor, legendStyle } from '../../lib/chartTheme'
import { exportData, type ExportFormat } from '../../lib/dataExport'
import { formatMetricValue, getMetricName } from '../../lib/metrics'
import { MobileChartContainer } from '../mobile/MobileChartContainer'
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
  const isMobile = useIsMobile()

  function handleExport(format: ExportFormat) {
    if (!currentData.length) return
    exportData(
      `sources-${dateFrom}-${dateTo}.csv`,
      [{ key: 'name', label: 'Источник' }, ...METRICS.map((m) => ({ key: m, label: getMetricName(m) }))],
      currentData,
      format
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
      <MobileChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid {...gridStyle} />
            <XAxis
              dataKey="name"
              {...axisStroke}
              tick={tickStyle}
              angle={isMobile ? 0 : -45}
              textAnchor={isMobile ? 'middle' : 'end'}
              height={isMobile ? 40 : 80}
            />
            <YAxis {...axisStroke} tick={tickStyle} />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={labelStyle}
              itemStyle={labelStyle}
              formatter={(value: number, name: string) => [formatMetricValue(value), name]}
            />
            <Legend {...legendStyle} />
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
      </MobileChartContainer>
    </DashboardWidget>
  )
}
