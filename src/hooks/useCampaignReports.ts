import { useQuery } from '@tanstack/react-query'

import {
  getAdReport,
  getCampaignReport,
  getOverallAdReport,
  getOverallCampaignReport,
  getOverallSearchTermsReport,
  getSearchTermsReport,
} from '../api/direct'
import { getPreviousPeriod } from '../lib/dateRanges'
import type { DateRange } from '../types'

import { useAuth } from './useAuth'

export function useCampaignPerformanceReport(
  campaignId: number | 'all' | null | undefined,
  dates: DateRange,
  sandbox = false
) {
  const { token, clientLogin } = useAuth()
  return useQuery({
    queryKey: ['campaignPerformanceReport', campaignId, dates.from, dates.to, sandbox, clientLogin],
    queryFn: () =>
      campaignId === 'all'
        ? getOverallCampaignReport(token!, clientLogin, dates.from, dates.to, sandbox)
        : getCampaignReport(token!, clientLogin, campaignId!, dates.from, dates.to, sandbox),
    enabled: !!token && campaignId !== null && campaignId !== undefined && !!dates.from && !!dates.to,
  })
}

export function useAdReport(campaignId: number | 'all' | null | undefined, dates: DateRange, sandbox = false) {
  const { token, clientLogin } = useAuth()
  return useQuery({
    queryKey: ['adReport', campaignId, dates.from, dates.to, sandbox, clientLogin],
    queryFn: () =>
      campaignId === 'all'
        ? getOverallAdReport(token!, clientLogin, dates.from, dates.to, sandbox)
        : getAdReport(token!, clientLogin, campaignId!, dates.from, dates.to, sandbox),
    enabled: !!token && campaignId !== null && campaignId !== undefined && !!dates.from && !!dates.to,
  })
}

export function useSearchTermsReport(
  campaignId: number | 'all' | null | undefined,
  dates: DateRange,
  sandbox = false
) {
  const { token, clientLogin } = useAuth()
  return useQuery({
    queryKey: ['searchTermsReport', campaignId, dates.from, dates.to, sandbox, clientLogin],
    queryFn: () =>
      campaignId === 'all'
        ? getOverallSearchTermsReport(token!, clientLogin, dates.from, dates.to, sandbox)
        : getSearchTermsReport(token!, clientLogin, campaignId!, dates.from, dates.to, sandbox),
    enabled: !!token && campaignId !== null && campaignId !== undefined && !!dates.from && !!dates.to,
  })
}

export function useCampaignPerformanceComparison(
  campaignId: number | 'all' | null | undefined,
  dates: DateRange,
  sandbox = false
) {
  const previousDates = getPreviousPeriod(dates)
  const current = useCampaignPerformanceReport(campaignId, dates, sandbox)
  const previous = useCampaignPerformanceReport(campaignId, previousDates, sandbox)
  return { current, previous }
}
