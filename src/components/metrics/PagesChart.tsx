import { getPages, useStatsComparison } from '../../api/metrica'
import { transformMetricaData } from '../../lib/chartData'
import { exportToCsv } from '../../lib/csvExport'
import { getMetricName } from '../../lib/metrics'
import { DashboardWidget } from '../ui/DashboardWidget'
import { DataTable } from '../ui/DataTable'
import { MobileListCard } from '../mobile/MobileListCard'

interface PagesChartProps {
  counterId: number
  dateFrom: string
  dateTo: string
}

export function PagesChart({ counterId, dateFrom, dateTo }: PagesChartProps) {
  const { current } = useStatsComparison(
    counterId,
    { from: dateFrom, to: dateTo },
    getPages,
    'pages'
  )

  const data = transformMetricaData(current.data, 'name').slice(0, 20)

  function handleExport() {
    if (!data.length) return
    exportToCsv(
      `pages-${dateFrom}-${dateTo}.csv`,
      [
        { key: 'name', label: 'Страница' },
        { key: 'ym:pv:pageviews', label: getMetricName('ym:pv:pageviews') },
        { key: 'ym:pv:users', label: getMetricName('ym:pv:users') },
      ],
      data
    )
  }

  return (
    <DashboardWidget
      title="Популярные страницы"
      subtitle="Топ-20 страниц по просмотрам"
      isLoading={current.isLoading && !current.data}
      error={current.error as Error | null}
      onRetry={() => current.refetch()}
      onExport={handleExport}
    >
      <div className="hidden md:block">
        <DataTable
          columns={[
            { key: 'name', label: 'Страница', align: 'left' },
            { key: 'ym:pv:pageviews', label: getMetricName('ym:pv:pageviews'), align: 'right', sortable: true },
            { key: 'ym:pv:users', label: getMetricName('ym:pv:users'), align: 'right', sortable: true },
          ]}
          rows={data}
          maxRows={20}
        />
      </div>
      <MobileListCard
        columns={[
          { key: 'name', label: 'Страница', align: 'left' },
          { key: 'ym:pv:pageviews', label: getMetricName('ym:pv:pageviews'), align: 'right', sortable: true },
          { key: 'ym:pv:users', label: getMetricName('ym:pv:users'), align: 'right', sortable: true },
        ]}
        rows={data}
        maxRows={20}
      />
    </DashboardWidget>
  )
}
