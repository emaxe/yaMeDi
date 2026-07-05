import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

import { getOS, useStatsComparison } from '../../api/metrica'
import { transformMetricaData } from '../../lib/chartData'
import { PIE_COLORS, tooltipStyle, labelStyle, pieLabel } from '../../lib/chartTheme'
import { exportData, type ExportFormat } from '../../lib/dataExport'
import { getMetricName } from '../../lib/metrics'
import { MobileChartContainer } from '../mobile/MobileChartContainer'
import { MobileListCard } from '../mobile/MobileListCard'
import { DashboardWidget } from '../ui/DashboardWidget'
import { DataTable } from '../ui/DataTable'

interface OSChartProps {
  counterId: number
  dateFrom: string
  dateTo: string
}

const METRIC = 'ym:s:visits'

export function OSChart({ counterId, dateFrom, dateTo }: OSChartProps) {
  const { current } = useStatsComparison(
    counterId,
    { from: dateFrom, to: dateTo },
    getOS,
    'os'
  )

  const data = transformMetricaData(current.data, 'name').slice(0, 8)

  function handleExport(format: ExportFormat) {
    if (!data.length) return
    exportData(
      `os-${dateFrom}-${dateTo}.csv`,
      [
        { key: 'name', label: 'ОС' },
        { key: 'ym:s:visits', label: getMetricName('ym:s:visits') },
        { key: 'ym:s:users', label: getMetricName('ym:s:users') },
      ],
      data,
      format
    )
  }

  return (
    <DashboardWidget
      title="Операционные системы"
      subtitle="Топ-8 ОС"
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
                label={pieLabel}
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
              { key: 'name', label: 'ОС', align: 'left' },
              { key: 'ym:s:visits', label: getMetricName('ym:s:visits'), align: 'right', sortable: true },
              { key: 'ym:s:users', label: getMetricName('ym:s:users'), align: 'right', sortable: true },
            ]}
            rows={data}
            maxRows={8}
          />
        </div>
        <MobileListCard
          columns={[
            { key: 'name', label: 'ОС', align: 'left' },
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
