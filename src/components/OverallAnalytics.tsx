import { useState } from 'react'
import { TrendingUp, Download } from 'lucide-react'
import { exportElementToPdf } from '../lib/pdfExport'

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

  const handleExportPdf = () => {
    exportElementToPdf('overall-analytics', 'Аналитика_всех_кампаний.pdf')
  }

  return (
    <div id="overall-analytics" className="space-y-6 bg-background pb-8" data-testid="overall-analytics-page">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 shrink-0">
          <TrendingUp className="w-6 h-6 text-primary" aria-hidden="true" />
          <h2 className="text-headline-lg text-on-background">Аналитика всех кампаний</h2>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 no-export flex-wrap xl:justify-end">
          <DateRangePicker value={dates} onChange={setDates} />
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
