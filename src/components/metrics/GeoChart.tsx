import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

import { getRegions, useStatsComparison } from '../../api/metrica'
import { buildComparisonData, transformMetricaData } from '../../lib/chartData'
import { CHART_COLORS, gridStyle, labelStyle, tooltipStyle, axisStroke, tickStyle } from '../../lib/chartTheme'
import { exportData, type ExportFormat } from '../../lib/dataExport'
import { formatMetricValue, getMetricName } from '../../lib/metrics'
import { MobileChartContainer } from '../mobile/MobileChartContainer'
import { MobileListCard } from '../mobile/MobileListCard'
import { DashboardWidget } from '../ui/DashboardWidget'
import { DataTable } from '../ui/DataTable'

interface GeoChartProps {
  counterId: number
  dateFrom: string
  dateTo: string
}

const METRIC = 'ym:s:visits'

export function GeoChart({ counterId, dateFrom, dateTo }: GeoChartProps) {
  const { current, previous } = useStatsComparison(
    counterId,
    { from: dateFrom, to: dateTo },
    getRegions,
    'regions'
  )

  const currentData = transformMetricaData(current.data, 'name').slice(0, 10)
  const previousData = transformMetricaData(previous.data, 'name').slice(0, 10)
  const data = buildComparisonData(currentData, previousData, 'name', [METRIC])

  function handleExport(format: ExportFormat) {
    if (!currentData.length) return
    exportData(
      `regions-${dateFrom}-${dateTo}.csv`,
      [
        { key: 'name', label: 'Регион' },
        { key: 'ym:s:visits', label: getMetricName('ym:s:visits') },
        { key: 'ym:s:users', label: getMetricName('ym:s:users') },
      ],
      currentData,
      format
    )
  }

  return (
    <DashboardWidget
      title="География"
      subtitle="Топ-10 регионов"
      isLoading={current.isLoading && !current.data}
      error={current.error as Error | null}
      onRetry={() => current.refetch()}
      onExport={handleExport}
    >
      <div className="space-y-4">
        <MobileChartContainer>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid {...gridStyle} horizontal={false} />
              <XAxis type="number" {...axisStroke} tick={tickStyle} />
              <YAxis dataKey="name" type="category" width={80} {...axisStroke} tick={tickStyle} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={labelStyle}
                itemStyle={labelStyle}
                formatter={(value: number) => formatMetricValue(value)}
              />
              <Bar dataKey={METRIC} name={getMetricName(METRIC)} radius={[0, 4, 4, 0]}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS.primarySoft} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </MobileChartContainer>

        <div className="hidden md:block">
          <DataTable
            columns={[
              { key: 'name', label: 'Регион', align: 'left' },
              { key: 'ym:s:visits', label: getMetricName('ym:s:visits'), align: 'right', sortable: true },
              { key: 'ym:s:users', label: getMetricName('ym:s:users'), align: 'right', sortable: true },
            ]}
            rows={currentData}
            maxRows={10}
          />
        </div>
        <MobileListCard
          columns={[
            { key: 'name', label: 'Регион', align: 'left' },
            { key: 'ym:s:visits', label: getMetricName('ym:s:visits'), align: 'right', sortable: true },
            { key: 'ym:s:users', label: getMetricName('ym:s:users'), align: 'right', sortable: true },
          ]}
          rows={currentData}
          maxRows={10}
        />
      </div>
    </DashboardWidget>
  )
}
