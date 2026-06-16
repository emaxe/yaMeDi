import { getSearchPhrases, useStatsComparison } from '../../api/metrica'
import { transformMetricaData } from '../../lib/chartData'
import { exportToCsv } from '../../lib/csvExport'
import { getMetricName } from '../../lib/metrics'
import { MobileListCard } from '../mobile/MobileListCard'
import { DashboardWidget } from '../ui/DashboardWidget'
import { DataTable } from '../ui/DataTable'

interface SearchPhrasesChartProps {
  counterId: number
  dateFrom: string
  dateTo: string
}

export function SearchPhrasesChart({ counterId, dateFrom, dateTo }: SearchPhrasesChartProps) {
  const { current } = useStatsComparison(
    counterId,
    { from: dateFrom, to: dateTo },
    getSearchPhrases,
    'searchPhrases'
  )

  const data = transformMetricaData(current.data, 'name').slice(0, 20)

  function handleExport() {
    if (!data.length) return
    exportToCsv(
      `search-phrases-${dateFrom}-${dateTo}.csv`,
      [
        { key: 'name', label: 'Поисковая фраза' },
        { key: 'ym:s:visits', label: getMetricName('ym:s:visits') },
        { key: 'ym:s:users', label: getMetricName('ym:s:users') },
      ],
      data
    )
  }

  return (
    <DashboardWidget
      title="Поисковые фразы"
      subtitle="Топ-20 поисковых фраз"
      isLoading={current.isLoading && !current.data}
      error={current.error as Error | null}
      onRetry={() => current.refetch()}
      onExport={handleExport}
    >
      <div className="hidden md:block">
        <DataTable
          columns={[
            { key: 'name', label: 'Поисковая фраза', align: 'left' },
            { key: 'ym:s:visits', label: getMetricName('ym:s:visits'), align: 'right', sortable: true },
            { key: 'ym:s:users', label: getMetricName('ym:s:users'), align: 'right', sortable: true },
          ]}
          rows={data}
          maxRows={20}
        />
      </div>
      <MobileListCard
        columns={[
          { key: 'name', label: 'Поисковая фраза', align: 'left' },
          { key: 'ym:s:visits', label: getMetricName('ym:s:visits'), align: 'right', sortable: true },
          { key: 'ym:s:users', label: getMetricName('ym:s:users'), align: 'right', sortable: true },
        ]}
        rows={data}
        maxRows={20}
      />
    </DashboardWidget>
  )
}
