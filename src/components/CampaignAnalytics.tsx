import { TrendingUp, Download } from 'lucide-react'
import { exportElementToPdf } from '../lib/pdfExport'

import { useApp } from '../hooks/useApp'
import { isValidDateRange } from '../lib/dateRanges'

import { AdsReport } from './campaign-analytics/AdsReport'
import { KpiCards } from './campaign-analytics/KpiCards'
import { CampaignSelector } from './campaign-analytics/CampaignSelector'
import { SearchTermsReport } from './campaign-analytics/SearchTermsReport'
import { TrendChart } from './campaign-analytics/TrendChart'
import { DateRangePicker } from './ui/DateRangePicker'
import { EmptyState } from './ui/EmptyState'
import { ErrorAlert } from './ui/ErrorAlert'

export default function CampaignAnalytics() {
  const { selectedCampaignId, dateRange, setDateRange, directSandbox } = useApp()
  const datesValid = isValidDateRange(dateRange)

  const handleExportPdf = () => {
    exportElementToPdf('campaign-analytics', `Аналитика_кампании_${selectedCampaignId}.pdf`)
  }

  if (!selectedCampaignId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-primary" aria-hidden="true" />
          <h2 className="text-headline-lg text-on-background">Аналитика кампании</h2>
        </div>
        <EmptyState
          message="Кампания не выбрана"
          hint="Перейдите в раздел «Кампании» и выберите кампанию, чтобы увидеть аналитику."
        />
      </div>
    )
  }

  return (
    <div id="campaign-analytics" className="space-y-6 bg-background pb-8">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 shrink-0">
          <TrendingUp className="w-6 h-6 text-primary" aria-hidden="true" />
          <h2 className="text-headline-lg text-on-background">Аналитика кампании</h2>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 no-export flex-wrap xl:justify-end">
          <CampaignSelector />
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <button
            onClick={handleExportPdf}
            className="flex items-center justify-center gap-2 h-10 px-4 text-sm font-semibold text-primary bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition w-full sm:w-auto whitespace-nowrap"
          >
            <Download className="w-4 h-4 shrink-0" />
            Получить отчет
          </button>
        </div>
      </div>

      {!datesValid && (
        <ErrorAlert message="Выберите корректный период: начало не позже конца, даты не в будущем" />
      )}

      <KpiCards
        campaignId={selectedCampaignId}
        dateFrom={dateRange.from}
        dateTo={dateRange.to}
        sandbox={directSandbox}
      />

      <TrendChart
        campaignId={selectedCampaignId}
        dateFrom={dateRange.from}
        dateTo={dateRange.to}
        sandbox={directSandbox}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdsReport
          campaignId={selectedCampaignId}
          dateFrom={dateRange.from}
          dateTo={dateRange.to}
          sandbox={directSandbox}
        />
        <SearchTermsReport
          campaignId={selectedCampaignId}
          dateFrom={dateRange.from}
          dateTo={dateRange.to}
          sandbox={directSandbox}
        />
      </div>
    </div>
  )
}
