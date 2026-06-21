import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { getOverallCampaignReport } from '../api/direct'
import {
  getContactLeads,
  getDailyOrganicSummary,
  getDailySourceEcommerceSummary,
  getEcommerceSummary,
  getFunnelSummary,
  getTrafficSummary,
} from '../api/metrica'
import { MockAuthProvider, TestQueryProvider, createMockAuthState } from '../test/mocks'

import { useOperationalReport } from './useOperationalReport'

vi.mock('../api/metrica', async () => {
  const actual = await vi.importActual<typeof import('../api/metrica')>('../api/metrica')
  return {
    ...actual,
    getEcommerceSummary: vi.fn(),
    getTrafficSummary: vi.fn(),
    getFunnelSummary: vi.fn(),
    getContactLeads: vi.fn(),
    getDailySourceEcommerceSummary: vi.fn(),
    getDailyOrganicSummary: vi.fn(),
  }
})

vi.mock('../api/direct', async () => {
  const actual = await vi.importActual<typeof import('../api/direct')>('../api/direct')
  return {
    ...actual,
    getOverallCampaignReport: vi.fn(),
  }
})

function createWrapper(token: string | null, clientLogin: string | null) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MockAuthProvider state={createMockAuthState({ token, clientLogin, isReady: true, hasToken: !!token })}>
        <TestQueryProvider>{children}</TestQueryProvider>
      </MockAuthProvider>
    )
  }
}

function mockMetricaData(metrics: string[], dimensions: string[]): import('../types').MetricaData {
  return {
    query: { metrics, dimensions },
    data: [],
    totals: [],
  }
}

describe('useOperationalReport', () => {
  it('returns aggregated report rows after successful fetch', async () => {
    vi.mocked(getEcommerceSummary).mockResolvedValue(
      mockMetricaData(['ym:s:ecommerceRevenue', 'ym:s:ecommercePurchases'], ['ym:s:date'])
    )
    vi.mocked(getTrafficSummary).mockResolvedValue(mockMetricaData(['ym:s:visits'], ['ym:s:date']))
    vi.mocked(getFunnelSummary).mockResolvedValue(
      mockMetricaData(['ym:s:visits', 'ym:s:goal249520697reaches', 'ym:s:goal3010849417reaches'], ['ym:s:date'])
    )
    vi.mocked(getContactLeads).mockResolvedValue(mockMetricaData(['ym:s:goal269264518reaches'], ['ym:s:date']))
    vi.mocked(getDailySourceEcommerceSummary).mockResolvedValue(
      mockMetricaData(['ym:s:ecommerceRevenue', 'ym:s:ecommercePurchases'], ['ym:s:date', 'ym:s:sourceEngine'])
    )
    vi.mocked(getDailyOrganicSummary).mockResolvedValue(
      mockMetricaData(['ym:s:ecommerceRevenue', 'ym:s:ecommercePurchases', 'ym:s:visits'], ['ym:s:date', 'ym:s:trafficSource'])
    )
    vi.mocked(getOverallCampaignReport).mockResolvedValue([])

    const { result } = renderHook(
      () => useOperationalReport('kuroort26', { from: '2024-01-01', to: '2024-01-14' }),
      { wrapper: createWrapper('test-token', 'kurort26-direct') }
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBeNull()
    expect(result.current.data).toBeDefined()
    expect(result.current.data?.rows).toHaveLength(2)
    expect(result.current.data?.total.name).toBe('Итого')

    expect(getEcommerceSummary).toHaveBeenCalledWith(
      'test-token',
      10849417,
      '2024-01-01',
      '2024-01-14',
      'ym:s:ecommercePurchases'
    )
    expect(getDailySourceEcommerceSummary).toHaveBeenCalledWith(
      'test-token',
      10849417,
      '2024-01-01',
      '2024-01-14',
      'ym:s:ecommercePurchases'
    )
    expect(getOverallCampaignReport).toHaveBeenCalledWith(
      'test-token',
      'kurort26-direct',
      '2024-01-01',
      '2024-01-14',
      false
    )
  })

  it('returns an error when any fetch fails', async () => {
    vi.mocked(getEcommerceSummary).mockRejectedValue(new Error('Network error'))
    vi.mocked(getTrafficSummary).mockResolvedValue(mockMetricaData(['ym:s:visits'], ['ym:s:date']))
    vi.mocked(getFunnelSummary).mockResolvedValue(
      mockMetricaData(['ym:s:visits', 'ym:s:goal249520697reaches'], ['ym:s:date'])
    )
    vi.mocked(getContactLeads).mockResolvedValue(mockMetricaData(['ym:s:goal269264518reaches'], ['ym:s:date']))
    vi.mocked(getDailySourceEcommerceSummary).mockResolvedValue(
      mockMetricaData(['ym:s:ecommerceRevenue', 'ym:s:ecommercePurchases'], ['ym:s:date', 'ym:s:sourceEngine'])
    )
    vi.mocked(getDailyOrganicSummary).mockResolvedValue(
      mockMetricaData(['ym:s:ecommerceRevenue', 'ym:s:ecommercePurchases', 'ym:s:visits'], ['ym:s:date', 'ym:s:trafficSource'])
    )
    vi.mocked(getOverallCampaignReport).mockResolvedValue([])

    const { result } = renderHook(
      () => useOperationalReport('kuroort26', { from: '2024-01-01', to: '2024-01-14' }),
      { wrapper: createWrapper('test-token', 'kurort26-direct') }
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.data).toBeUndefined()
  })

  it('falls back to global clientLogin when project has no directClientLogin', async () => {
    vi.mocked(getEcommerceSummary).mockResolvedValue(
      mockMetricaData(['ym:s:ecommerceRevenue', 'ym:s:ecommercePurchases'], ['ym:s:date'])
    )
    vi.mocked(getTrafficSummary).mockResolvedValue(mockMetricaData(['ym:s:visits'], ['ym:s:date']))
    vi.mocked(getFunnelSummary).mockResolvedValue(
      mockMetricaData(['ym:s:visits', 'ym:s:goal306476648reaches'], ['ym:s:date'])
    )
    vi.mocked(getContactLeads).mockResolvedValue(mockMetricaData(['ym:s:goal244850303reaches'], ['ym:s:date']))
    vi.mocked(getDailySourceEcommerceSummary).mockResolvedValue(
      mockMetricaData(['ym:s:ecommerceRevenue', 'ym:s:ecommercePurchases'], ['ym:s:date', 'ym:s:sourceEngine'])
    )
    vi.mocked(getDailyOrganicSummary).mockResolvedValue(
      mockMetricaData(['ym:s:ecommerceRevenue', 'ym:s:ecommercePurchases', 'ym:s:visits'], ['ym:s:date', 'ym:s:trafficSource'])
    )
    vi.mocked(getOverallCampaignReport).mockResolvedValue([])

    renderHook(() => useOperationalReport('istok', { from: '2024-01-01', to: '2024-01-14' }), {
      wrapper: createWrapper('test-token', 'global-client'),
    })

    await waitFor(() => expect(vi.mocked(getOverallCampaignReport)).toHaveBeenCalled())
    expect(getOverallCampaignReport).toHaveBeenCalledWith('test-token', 'global-client', '2024-01-01', '2024-01-14', false)
  })
})
