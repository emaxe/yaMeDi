import { renderHook, waitFor } from '@testing-library/react'

import { createMockAuthState, MockAuthProvider, TestQueryProvider } from '../test/mocks'

import { useCampaignPerformanceReport, useAdReport, useSearchTermsReport, useCampaignPerformanceComparison } from './useCampaignReports'

const TOKEN = 'test-token'
const LOGIN = 'test-user'

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <TestQueryProvider>
      <MockAuthProvider state={createMockAuthState({ token: TOKEN, clientLogin: LOGIN, hasToken: true })}>
        {children}
      </MockAuthProvider>
    </TestQueryProvider>
  )
}

function mockDirectFetch(response: { status: number; body: string }) {
  Object.assign(window, { electronAPI: { directFetch: vi.fn().mockResolvedValue(response) } })
}

beforeEach(() => {
  Object.assign(window, { electronAPI: undefined })
})

describe('useCampaignPerformanceReport', () => {
  it('returns parsed report rows', async () => {
    const tsv = 'Date\tImpressions\tClicks\tCost\tCtr\tAvgCpc\tConversions\n2024-01-01\t1000\t50\t5000\t5\t100\t2'
    mockDirectFetch({ status: 200, body: tsv })

    const { result } = renderHook(
      () => useCampaignPerformanceReport(123, { from: '2024-01-01', to: '2024-01-31' }),
      { wrapper }
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0]).toMatchObject({
      Date: '2024-01-01',
      Impressions: 1000,
      Clicks: 50,
    })
  })

  it('is disabled when campaignId is null', () => {
    mockDirectFetch({ status: 200, body: '' })
    const { result } = renderHook(
      () => useCampaignPerformanceReport(null, { from: '2024-01-01', to: '2024-01-31' }),
      { wrapper }
    )
    expect(result.current.isFetching).toBe(false)
  })
})

describe('useAdReport', () => {
  it('returns parsed ad rows', async () => {
    const tsv = 'AdId\tImpressions\tClicks\tCost\tCtr\n123\t1000\t50\t5000\t5'
    mockDirectFetch({ status: 200, body: tsv })

    const { result } = renderHook(
      () => useAdReport(123, { from: '2024-01-01', to: '2024-01-31' }),
      { wrapper }
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0]).toMatchObject({ AdId: 123, Clicks: 50 })
  })
})

describe('useSearchTermsReport', () => {
  it('returns parsed search term rows', async () => {
    const tsv = 'Query\tImpressions\tClicks\tCost\tCtr\nquery\t1000\t50\t5000\t5'
    mockDirectFetch({ status: 200, body: tsv })

    const { result } = renderHook(
      () => useSearchTermsReport(123, { from: '2024-01-01', to: '2024-01-31' }),
      { wrapper }
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0]).toMatchObject({ Query: 'query', Clicks: 50 })
  })
})

describe('useCampaignPerformanceComparison', () => {
  it('fetches current and previous periods', async () => {
    const tsv = 'Date\tImpressions\tClicks\tCost\tCtr\tAvgCpc\tConversions\n2024-01-01\t1000\t50\t5000\t5\t100\t2'
    mockDirectFetch({ status: 200, body: tsv })

    const { result } = renderHook(
      () => useCampaignPerformanceComparison(123, { from: '2024-01-15', to: '2024-01-31' }),
      { wrapper }
    )
    await waitFor(() => expect(result.current.current.isSuccess).toBe(true))
    await waitFor(() => expect(result.current.previous.isSuccess).toBe(true))
    expect(result.current.current.data).toHaveLength(1)
    expect(result.current.previous.data).toHaveLength(1)
  })
})
