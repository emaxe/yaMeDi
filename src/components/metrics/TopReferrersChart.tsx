import { getReferrers, useStatsComparison } from '../../api/metrica'
import { transformMetricaData } from '../../lib/chartData'
import { exportData, type ExportFormat } from '../../lib/dataExport'
import { getMetricName } from '../../lib/metrics'
import { MobileListCard } from '../mobile/MobileListCard'
import { DashboardWidget } from '../ui/DashboardWidget'
import { DataTable } from '../ui/DataTable'

interface TopReferrersChartProps {
  counterId: number
  dateFrom: string
  dateTo: string
}

export function TopReferrersChart({ counterId, dateFrom, dateTo }: TopReferrersChartProps) {
  const { current } = useStatsComparison(
    counterId,
    { from: dateFrom, to: dateTo },
    getReferrers,
    'referrers'
  )

  const data = transformMetricaData(current.data, 'name').slice(0, 20)

  function handleExport(format: ExportFormat) {
    if (!data.length) return
    exportData(
      `referrers-${dateFrom}-${dateTo}.csv`,
      [
        { key: 'name', label: 'Реферер' },
        { key: 'ym:s:visits', label: getMetricName('ym:s:visits') },
        { key: 'ym:s:users', label: getMetricName('ym:s:users') },
      ],
      data,
      format
    )
  }

  return (
    <DashboardWidget
      title="Рефереры"
      subtitle="Топ-20 рефереров"
      isLoading={current.isLoading && !current.data}
      error={current.error as Error | null}
      onRetry={() => current.refetch()}
      onExport={handleExport}
    >
      <div className="hidden md:block">
        <DataTable
          columns={[
            { key: 'name', label: 'Реферер', align: 'left' },
            { key: 'ym:s:visits', label: getMetricName('ym:s:visits'), align: 'right', sortable: true },
            { key: 'ym:s:users', label: getMetricName('ym:s:users'), align: 'right', sortable: true },
          ]}
          rows={data}
          maxRows={20}
        />
      </div>
      <MobileListCard
        columns={[
          { key: 'name', label: 'Реферер', align: 'left' },
          { key: 'ym:s:visits', label: getMetricName('ym:s:visits'), align: 'right', sortable: true },
          { key: 'ym:s:users', label: getMetricName('ym:s:users'), align: 'right', sortable: true },
        ]}
        rows={data}
        maxRows={20}
      />
    </DashboardWidget>
  )
}
