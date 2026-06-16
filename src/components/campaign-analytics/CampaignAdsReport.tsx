import { useAdReport } from '../../hooks/useCampaignReports'
import type { AdReportRow } from '../../types'
import { exportToCsv } from '../../lib/csvExport'
import { MobileListCard } from '../mobile/MobileListCard'
import { DashboardWidget } from '../ui/DashboardWidget'
import { DataTable, type DataTableColumn, type DataTableRow } from '../ui/DataTable'

interface CampaignAdsReportProps {
  campaignId: number
  dateFrom: string
  dateTo: string
  sandbox?: boolean
}

const COLUMNS: DataTableColumn[] = [
  { key: 'name', label: 'Объявление', align: 'left' },
  { key: 'Impressions', label: 'Показы', align: 'right', sortable: true },
  { key: 'Clicks', label: 'Клики', align: 'right', sortable: true },
  { key: 'Cost', label: 'Расход', align: 'right', sortable: true },
  { key: 'Ctr', label: 'CTR', align: 'right', sortable: true },
]

function transformRows(rows: AdReportRow[] | undefined): DataTableRow[] {
  if (!rows) return []
  return rows.map((row) => ({
    name: row.AdName,
    Impressions: row.Impressions,
    Clicks: row.Clicks,
    Cost: row.Cost,
    Ctr: row.Ctr,
  }))
}

export function CampaignAdsReport({ campaignId, dateFrom, dateTo, sandbox = false }: CampaignAdsReportProps) {
  const { data, isLoading, error, refetch } = useAdReport(
    campaignId,
    { from: dateFrom, to: dateTo },
    sandbox
  )

  const tableRows = transformRows(data)

  function handleExport() {
    if (!tableRows.length) return
    exportToCsv(
      `ads-report-${campaignId}-${dateFrom}-${dateTo}.csv`,
      COLUMNS.map((c) => ({ key: c.key, label: c.label })),
      tableRows
    )
  }

  return (
    <DashboardWidget
      title="Объявления"
      subtitle="Отчёт по объявлениям"
      isLoading={isLoading && !data}
      error={error as Error | null}
      onRetry={() => refetch()}
      onExport={handleExport}
    >
      <div className="hidden md:block">
        <DataTable columns={COLUMNS} rows={tableRows} />
      </div>
      <MobileListCard columns={COLUMNS} rows={tableRows} />
    </DashboardWidget>
  )
}
