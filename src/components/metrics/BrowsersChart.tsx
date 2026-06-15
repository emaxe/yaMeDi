import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

import { getBrowsers, useStatsComparison } from '../../api/metrica'
import { transformMetricaData } from '../../lib/chartData'
import { PIE_COLORS, tooltipStyle, labelStyle } from '../../lib/chartTheme'
import { exportToCsv } from '../../lib/csvExport'
import { getMetricName } from '../../lib/metrics'
import { DashboardWidget } from '../ui/DashboardWidget'
import { DataTable } from '../ui/DataTable'
import { MobileChartContainer } from '../mobile/MobileChartContainer'
import { MobileListCard } from '../mobile/MobileListCard'

interface BrowsersChartProps {
  counterId: number
  dateFrom: string
  dateTo: string
}

const METRIC = 'ym:s:visits'

export function BrowsersChart({ counterId, dateFrom, dateTo }: BrowsersChartProps) {
  const { current } = useStatsComparison(
    counterId,
    { from: dateFrom, to: dateTo },
    getBrowsers,
    'browsers'
  )

  const data = transformMetricaData(current.data, 'name').slice(0, 8)

  function handleExport() {
    if (!data.length) return
    exportToCsv(
      `browsers-${dateFrom}-${dateTo}.csv`,
      [
        { key: 'name', label: 'Браузер' },
        { key: 'ym:s:visits', label: getMetricName('ym:s:visits') },
        { key: 'ym:s:users', label: getMetricName('ym:s:users') },
      ],
      data
    )
  }

  return (
    <DashboardWidget
      title="Браузеры"
      subtitle="Топ-8 браузеров"
      isLoading={current.isLoading && !current.data}
      error={current.error as Error | null}
      onRetry={() => current.refetch()}
      onExport={handleExport}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MobileChartContainer>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey={METRIC}
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius="80%"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} itemStyle={labelStyle} />
            </PieChart>
          </ResponsiveContainer>
        </MobileChartContainer>
        <div className="hidden md:flex items-center">
          <DataTable
            columns={[
              { key: 'name', label: 'Браузер', align: 'left' },
              { key: 'ym:s:visits', label: getMetricName('ym:s:visits'), align: 'right', sortable: true },
              { key: 'ym:s:users', label: getMetricName('ym:s:users'), align: 'right', sortable: true },
            ]}
            rows={data}
            maxRows={8}
          />
        </div>
        <MobileListCard
          columns={[
            { key: 'name', label: 'Браузер', align: 'left' },
            { key: 'ym:s:visits', label: getMetricName('ym:s:visits'), align: 'right', sortable: true },
            { key: 'ym:s:users', label: getMetricName('ym:s:users'), align: 'right', sortable: true },
          ]}
          rows={data}
          maxRows={8}
        />
      </div>
    </DashboardWidget>
  )
}
