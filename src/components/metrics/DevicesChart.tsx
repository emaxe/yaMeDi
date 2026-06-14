import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

import { getDevices, useStatsComparison } from '../../api/metrica'
import { buildComparisonData, transformMetricaData } from '../../lib/chartData'
import { PIE_COLORS, tooltipStyle, labelStyle } from '../../lib/chartTheme'
import { exportToCsv } from '../../lib/csvExport'
import { formatMetricValue, getMetricName } from '../../lib/metrics'
import { DashboardWidget } from '../ui/DashboardWidget'
import { MetricDelta } from '../ui/MetricDelta'

interface DevicesChartProps {
  counterId: number
  dateFrom: string
  dateTo: string
}

const METRIC = 'ym:s:visits'

export function DevicesChart({ counterId, dateFrom, dateTo }: DevicesChartProps) {
  const { current, previous } = useStatsComparison(
    counterId,
    { from: dateFrom, to: dateTo },
    getDevices,
    'devices'
  )

  const currentData = transformMetricaData(current.data, 'name')
  const previousData = transformMetricaData(previous.data, 'name')
  const data = buildComparisonData(currentData, previousData, 'name', [METRIC])

  function handleExport() {
    if (!currentData.length) return
    exportToCsv(
      `devices-${dateFrom}-${dateTo}.csv`,
      [
        { key: 'name', label: 'Устройство' },
        { key: METRIC, label: getMetricName(METRIC) },
      ],
      currentData
    )
  }

  return (
    <DashboardWidget
      title="Устройства"
      isLoading={current.isLoading && !current.data}
      error={current.error as Error | null}
      onRetry={() => current.refetch()}
      onExport={handleExport}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={currentData}
              dataKey={METRIC}
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {currentData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} itemStyle={labelStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex items-center">
          <div className="space-y-3 w-full">
            {data.map((d, i) => {
              const currentValue = Number(d[METRIC] ?? 0)
              const previousValue = Number(d[`prev:${METRIC}`] ?? 0)
              return (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="text-body-sm text-on-surface">{d.name}</span>
                  </div>
                  <div className="text-body-sm font-medium text-on-background">
                    {formatMetricValue(currentValue)}
                  </div>
                  <MetricDelta current={currentValue} previous={previousValue} />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </DashboardWidget>
  )
}
