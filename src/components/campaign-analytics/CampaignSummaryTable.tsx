import { useMemo } from 'react'
import { BarChart3 } from 'lucide-react'
import { useCampaignPerformanceReport } from '../../hooks/useCampaignReports'
import type { CampaignPerformanceReportRow } from '../../types'
import { DashboardWidget } from '../ui/DashboardWidget'
import { DataTable, type DataTableColumn, type DataTableRow } from '../ui/DataTable'

function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return value.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 2 })
}

function formatPercentage(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return `${value.toFixed(2)}%`
}

interface CampaignSummaryTableProps {
  campaignId: number | 'all'
  dateFrom: string
  dateTo: string
  sandbox?: boolean
}

interface AggregatedCampaign {
  CampaignId: number
  CampaignName: string
  Impressions: number
  Clicks: number
  Cost: number
  Ctr: number
  AvgCpc: number
  Conversions: number
}

function aggregateCampaigns(rows: CampaignPerformanceReportRow[] | undefined): AggregatedCampaign[] {
  if (!rows) return []
  const map = new Map<number, AggregatedCampaign>()
  for (const row of rows) {
    const id = row.CampaignId ?? 0
    const name = row.CampaignName ?? '—'
    const existing = map.get(id)
    if (existing) {
      existing.Impressions += row.Impressions ?? 0
      existing.Clicks += row.Clicks ?? 0
      existing.Cost += row.Cost ?? 0
      existing.Conversions += row.Conversions ?? 0
    } else {
      map.set(id, {
        CampaignId: id,
        CampaignName: name,
        Impressions: row.Impressions ?? 0,
        Clicks: row.Clicks ?? 0,
        Cost: row.Cost ?? 0,
        Ctr: 0,
        AvgCpc: 0,
        Conversions: row.Conversions ?? 0,
      })
    }
  }
  for (const agg of map.values()) {
    agg.Ctr = agg.Impressions > 0 ? (agg.Clicks / agg.Impressions) * 100 : 0
    agg.AvgCpc = agg.Clicks > 0 ? agg.Cost / agg.Clicks : 0
  }
  return Array.from(map.values()).sort((a, b) => b.Cost - a.Cost)
}

function getColumns(): DataTableColumn[] {
  return [
    { key: 'name', label: 'Кампания', align: 'left' },
    { key: 'Impressions', label: 'Показы', align: 'right', sortable: true },
    { key: 'Clicks', label: 'Клики', align: 'right', sortable: true },
    { key: 'Cost', label: 'Расход', align: 'right', sortable: true, format: formatCurrency },
    { key: 'Ctr', label: 'CTR', align: 'right', format: formatPercentage },
    { key: 'AvgCpc', label: 'Avg CPC', align: 'right', format: formatCurrency },
    { key: 'Conversions', label: 'Конверсии', align: 'right', sortable: true },
  ]
}

function transformRows(rows: AggregatedCampaign[]): DataTableRow[] {
  return rows.map((row) => ({
    name: row.CampaignName,
    Impressions: row.Impressions,
    Clicks: row.Clicks,
    Cost: row.Cost,
    Ctr: row.Ctr,
    AvgCpc: row.AvgCpc,
    Conversions: row.Conversions,
  }))
}

export function CampaignSummaryTable({ campaignId, dateFrom, dateTo, sandbox = false }: CampaignSummaryTableProps) {
  if (campaignId !== 'all') {
    return null
  }

  const { data, isLoading, error, refetch } = useCampaignPerformanceReport(
    campaignId,
    { from: dateFrom, to: dateTo },
    sandbox
  )

  const aggregated = useMemo(() => aggregateCampaigns(data), [data])
  const columns = getColumns()
  const tableRows = transformRows(aggregated)

  return (
    <DashboardWidget
      title="Сводка по кампаниям"
      subtitle={
        <span className="inline-flex items-center gap-1">
          <BarChart3 className="w-4 h-4" aria-hidden="true" />
          Агрегированные данные по кампаниям
        </span>
      }
      isLoading={isLoading && !data}
      error={error as Error | null}
      onRetry={() => refetch()}
    >
      <div data-testid="campaign-summary-table" className="hidden md:block">
        <DataTable columns={columns} rows={tableRows} />
      </div>
    </DashboardWidget>
  )
}
