import { useState } from 'react'
import { TrendingUp } from 'lucide-react'

import { getDefaultDates, isValidDateRange } from '../lib/dateRanges'
import type { DateRange } from '../types'

import { AdsReport } from './campaign-analytics/AdsReport'
import { CampaignSummaryTable } from './campaign-analytics/CampaignSummaryTable'
import { KpiCards } from './campaign-analytics/KpiCards'
import { SearchTermsReport } from './campaign-analytics/SearchTermsReport'
import { TrendChart } from './campaign-analytics/TrendChart'
import { DateRangePicker } from './ui/DateRangePicker'
import { EmptyState } from './ui/EmptyState'

interface OverallAnalyticsProps {
  sandbox?: boolean
}

export function OverallAnalytics({ sandbox = false }: OverallAnalyticsProps) {
  const [dates, setDates] = useState<DateRange>(getDefaultDates())
  const datesValid = isValidDateRange(dates)

  return (
    <div className="space-y-6" data-testid="overall-analytics-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-primary" aria-hidden="true" />
          <h2 className="text-headline-lg text-on-background">Аналитика всех кампаний</h2>
        </div>
        <DateRangePicker value={dates} onChange={setDates} />
      </div>

      {!datesValid && (
        <EmptyState
          message="Выберите период"
          hint="Выберите дату начала и конца периода, чтобы просмотреть аналитику всех кампаний"
        />
      )}

      {datesValid && (
        <>
          <KpiCards
            campaignId="all"
            dateFrom={dates.from}
            dateTo={dates.to}
            sandbox={sandbox}
          />

          <TrendChart
            campaignId="all"
            dateFrom={dates.from}
            dateTo={dates.to}
            sandbox={sandbox}
          />

          <CampaignSummaryTable
            campaignId="all"
            dateFrom={dates.from}
            dateTo={dates.to}
            sandbox={sandbox}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdsReport
              campaignId="all"
              dateFrom={dates.from}
              dateTo={dates.to}
              sandbox={sandbox}
            />
            <SearchTermsReport
              campaignId="all"
              dateFrom={dates.from}
              dateTo={dates.to}
              sandbox={sandbox}
            />
          </div>
        </>
      )}
    </div>
  )
}
