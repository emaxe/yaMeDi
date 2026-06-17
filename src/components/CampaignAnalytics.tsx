import { TrendingUp } from 'lucide-react'

import { useApp } from '../hooks/useApp'
import { isValidDateRange } from '../lib/dateRanges'

import { CampaignAdsReport } from './campaign-analytics/CampaignAdsReport'
import { KpiCards } from './campaign-analytics/KpiCards'
import { CampaignSelector } from './campaign-analytics/CampaignSelector'
import { CampaignSearchTermsReport } from './campaign-analytics/CampaignSearchTermsReport'
import { CampaignTrendChart } from './campaign-analytics/CampaignTrendChart'
import { DateRangePicker } from './ui/DateRangePicker'
import { EmptyState } from './ui/EmptyState'
import { ErrorAlert } from './ui/ErrorAlert'

export default function CampaignAnalytics() {
  const { selectedCampaignId, dateRange, setDateRange, directSandbox } = useApp()
  const datesValid = isValidDateRange(dateRange)

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-primary" aria-hidden="true" />
          <h2 className="text-headline-lg text-on-background">Аналитика кампании</h2>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <CampaignSelector />
          <DateRangePicker value={dateRange} onChange={setDateRange} />
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

      <CampaignTrendChart
        campaignId={selectedCampaignId}
        dateFrom={dateRange.from}
        dateTo={dateRange.to}
        sandbox={directSandbox}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CampaignAdsReport
          campaignId={selectedCampaignId}
          dateFrom={dateRange.from}
          dateTo={dateRange.to}
          sandbox={directSandbox}
        />
        <CampaignSearchTermsReport
          campaignId={selectedCampaignId}
          dateFrom={dateRange.from}
          dateTo={dateRange.to}
          sandbox={directSandbox}
        />
      </div>
    </div>
  )
}
