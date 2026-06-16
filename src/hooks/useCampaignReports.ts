import { useQuery } from '@tanstack/react-query'

import { getAdReport, getCampaignReport, getSearchTermsReport } from '../api/direct'
import { getPreviousPeriod } from '../lib/dateRanges'
import type { DateRange } from '../types'

import { useAuth } from './useAuth'

export function useCampaignPerformanceReport(
  campaignId: number | null | undefined,
  dates: DateRange,
  sandbox = false
) {
  const { token, clientLogin } = useAuth()
  return useQuery({
    queryKey: ['campaignPerformanceReport', campaignId, dates.from, dates.to, sandbox, clientLogin],
    queryFn: () => getCampaignReport(token!, clientLogin, campaignId!, dates.from, dates.to, sandbox),
    enabled: !!token && !!campaignId && !!dates.from && !!dates.to,
  })
}

export function useAdReport(campaignId: number | null | undefined, dates: DateRange, sandbox = false) {
  const { token, clientLogin } = useAuth()
  return useQuery({
    queryKey: ['adReport', campaignId, dates.from, dates.to, sandbox, clientLogin],
    queryFn: () => getAdReport(token!, clientLogin, campaignId!, dates.from, dates.to, sandbox),
    enabled: !!token && !!campaignId && !!dates.from && !!dates.to,
  })
}

export function useSearchTermsReport(
  campaignId: number | null | undefined,
  dates: DateRange,
  sandbox = false
) {
  const { token, clientLogin } = useAuth()
  return useQuery({
    queryKey: ['searchTermsReport', campaignId, dates.from, dates.to, sandbox, clientLogin],
    queryFn: () => getSearchTermsReport(token!, clientLogin, campaignId!, dates.from, dates.to, sandbox),
    enabled: !!token && !!campaignId && !!dates.from && !!dates.to,
  })
}

export function useCampaignPerformanceComparison(
  campaignId: number | null | undefined,
  dates: DateRange,
  sandbox = false
) {
  const previousDates = getPreviousPeriod(dates)
  const current = useCampaignPerformanceReport(campaignId, dates, sandbox)
  const previous = useCampaignPerformanceReport(campaignId, previousDates, sandbox)
  return { current, previous }
}
