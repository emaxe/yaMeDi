import { useSearchTermsReport } from '../../hooks/useCampaignReports'
import type { SearchTermReportRow } from '../../types'
import { exportToCsv } from '../../lib/csvExport'
import { MobileListCard } from '../mobile/MobileListCard'
import { DashboardWidget } from '../ui/DashboardWidget'
import { DataTable, type DataTableColumn, type DataTableRow } from '../ui/DataTable'

interface SearchTermsReportProps {
  campaignId: number | 'all'
  dateFrom: string
  dateTo: string
  sandbox?: boolean
}

function getColumns(showCampaign: boolean): DataTableColumn[] {
  const columns: DataTableColumn[] = [{ key: 'name', label: 'Поисковый запрос', align: 'left' }]
  if (showCampaign) {
    columns.push({ key: 'campaign', label: 'Кампания', align: 'left' })
  }
  columns.push(
    { key: 'Impressions', label: 'Показы', align: 'right', sortable: true },
    { key: 'Clicks', label: 'Клики', align: 'right', sortable: true },
    { key: 'Cost', label: 'Расход', align: 'right', sortable: true },
    { key: 'Ctr', label: 'CTR', align: 'right', sortable: true }
  )
  return columns
}

function transformRows(rows: SearchTermReportRow[] | undefined, showCampaign: boolean): DataTableRow[] {
  if (!rows) return []
  return rows.map((row) => ({
    name: row.Query,
    campaign: showCampaign
      ? `${row.CampaignName ?? '—'} (ID: ${row.CampaignId ?? '—'})`
      : undefined,
    Impressions: row.Impressions,
    Clicks: row.Clicks,
    Cost: row.Cost,
    Ctr: row.Ctr,
  }))
}

export function SearchTermsReport({ campaignId, dateFrom, dateTo, sandbox = false }: SearchTermsReportProps) {
  const { data, isLoading, error, refetch } = useSearchTermsReport(
    campaignId,
    { from: dateFrom, to: dateTo },
    sandbox
  )

  const showCampaign = campaignId === 'all'
  const columns = getColumns(showCampaign)
  const tableRows = transformRows(data, showCampaign)

  function handleExport() {
    if (!tableRows.length) return
    const filename = campaignId === 'all'
      ? `overall-search-terms-report-${dateFrom}-${dateTo}.csv`
      : `search-terms-report-${campaignId}-${dateFrom}-${dateTo}.csv`
    exportToCsv(
      filename,
      columns.map((c) => ({ key: c.key, label: c.label })),
      tableRows
    )
  }

  return (
    <DashboardWidget
      title="Поисковые запросы"
      subtitle="Отчёт по поисковым запросам"
      isLoading={isLoading && !data}
      error={error as Error | null}
      onRetry={() => refetch()}
      onExport={handleExport}
    >
      <div className="hidden md:block">
        <DataTable columns={columns} rows={tableRows} />
      </div>
      <MobileListCard columns={columns} rows={tableRows} />
    </DashboardWidget>
  )
}
