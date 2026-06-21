import type { MetricaData } from '../types'

import {
  getContactLeads,
  getDailyOrganicSummary,
  getDailySourceEcommerceSummary,
  getEcommerceSummary,
  getFunnelSummary,
  getSourceEcommerceSummary,
} from './metrica'

const TOKEN = 'test-token'
const COUNTER_ID = 12345
const DATE_FROM = '2024-01-01'
const DATE_TO = '2024-01-31'

function mockMetricaResponse(query: { metrics: string[]; dimensions: string[] }): MetricaData {
  return {
    query,
    data: [],
    totals: [],
  }
}

function mockFetch(response: MetricaData) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      status: 200,
      text: () => Promise.resolve(JSON.stringify(response)),
    })
  )
}

function getLastFetchUrl(): string {
  const calls = vi.mocked(fetch).mock.calls
  return calls[calls.length - 1][0] as string
}

describe('metrica ecommerce functions', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('getEcommerceSummary requests revenue and default purchases metric', async () => {
    mockFetch(mockMetricaResponse({ metrics: ['ym:s:ecommerceRevenue', 'ym:s:ecommercePurchases'], dimensions: ['ym:s:date'] }))

    await getEcommerceSummary(TOKEN, COUNTER_ID, DATE_FROM, DATE_TO)

    const url = getLastFetchUrl()
    expect(url).toContain(`id=${COUNTER_ID}`)
    expect(url).toContain('metrics=ym%3As%3AecommerceRevenue%2Cym%3As%3AecommercePurchases')
    expect(url).toContain('dimensions=ym%3As%3Adate')
  })

  it('getEcommerceSummary uses custom purchases metric', async () => {
    mockFetch(mockMetricaResponse({ metrics: ['ym:s:ecommerceRevenue', 'ym:s:purchases'], dimensions: ['ym:s:date'] }))

    await getEcommerceSummary(TOKEN, COUNTER_ID, DATE_FROM, DATE_TO, 'ym:s:purchases')

    const url = getLastFetchUrl()
    expect(url).toContain('metrics=ym%3As%3AecommerceRevenue%2Cym%3As%3Apurchases')
  })

  it('getSourceEcommerceSummary requests revenue and purchases by source engine', async () => {
    mockFetch(mockMetricaResponse({ metrics: ['ym:s:ecommerceRevenue', 'ym:s:ecommercePurchases'], dimensions: ['ym:s:sourceEngine'] }))

    await getSourceEcommerceSummary(TOKEN, COUNTER_ID, DATE_FROM, DATE_TO)

    const url = getLastFetchUrl()
    expect(url).toContain('metrics=ym%3As%3AecommerceRevenue%2Cym%3As%3AecommercePurchases')
    expect(url).toContain('dimensions=ym%3As%3AsourceEngine')
  })

  it('getFunnelSummary requests visits, addToCart and purchases via ecommerce metrics', async () => {
    mockFetch(
      mockMetricaResponse({
        metrics: ['ym:s:visits', 'ym:s:ecommerceAddToCart', 'ym:s:ecommercePurchases'],
        dimensions: ['ym:s:date'],
      })
    )

    await getFunnelSummary(TOKEN, COUNTER_ID, DATE_FROM, DATE_TO, {
      purchasesMetric: 'ym:s:ecommercePurchases',
      addToCartMetric: 'ym:s:ecommerceAddToCart',
    })

    const url = getLastFetchUrl()
    expect(url).toContain('metrics=ym%3As%3Avisits%2Cym%3As%3AecommerceAddToCart%2Cym%3As%3AecommercePurchases')
  })

  it('getFunnelSummary uses goal ids when provided', async () => {
    mockFetch(
      mockMetricaResponse({
        metrics: ['ym:s:visits', 'ym:s:goal111reaches', 'ym:s:goal222reaches'],
        dimensions: ['ym:s:date'],
      })
    )

    await getFunnelSummary(TOKEN, COUNTER_ID, DATE_FROM, DATE_TO, {
      purchasesMetric: 'ym:s:ecommercePurchases',
      addToCartMetric: 'ym:s:ecommerceAddToCart',
      cartGoalId: 111,
      orderGoalId: 222,
    })

    const url = getLastFetchUrl()
    expect(url).toContain('metrics=ym%3As%3Avisits%2Cym%3As%3Agoal111reaches%2Cym%3As%3Agoal222reaches')
  })

  it('getContactLeads requests goal reaches for the given contact goal id', async () => {
    mockFetch(mockMetricaResponse({ metrics: ['ym:s:goal333reaches'], dimensions: ['ym:s:date'] }))

    await getContactLeads(TOKEN, COUNTER_ID, DATE_FROM, DATE_TO, 333)

    const url = getLastFetchUrl()
    expect(url).toContain('metrics=ym%3As%3Agoal333reaches')
  })

  it('getDailySourceEcommerceSummary requests revenue and purchases by date and source engine', async () => {
    mockFetch(
      mockMetricaResponse({
        metrics: ['ym:s:ecommerceRevenue', 'ym:s:ecommercePurchases'],
        dimensions: ['ym:s:date', 'ym:s:sourceEngine'],
      })
    )

    await getDailySourceEcommerceSummary(TOKEN, COUNTER_ID, DATE_FROM, DATE_TO)

    const url = getLastFetchUrl()
    expect(url).toContain('metrics=ym%3As%3AecommerceRevenue%2Cym%3As%3AecommercePurchases')
    expect(url).toContain('dimensions=ym%3As%3Adate%2Cym%3As%3AsourceEngine')
  })

  it('getDailyOrganicSummary requests revenue, purchases and visits by date and traffic source', async () => {
    mockFetch(
      mockMetricaResponse({
        metrics: ['ym:s:ecommerceRevenue', 'ym:s:ecommercePurchases', 'ym:s:visits'],
        dimensions: ['ym:s:date', 'ym:s:trafficSource'],
      })
    )

    await getDailyOrganicSummary(TOKEN, COUNTER_ID, DATE_FROM, DATE_TO)

    const url = getLastFetchUrl()
    expect(url).toContain('metrics=ym%3As%3AecommerceRevenue%2Cym%3As%3AecommercePurchases%2Cym%3As%3Avisits')
    expect(url).toContain('dimensions=ym%3As%3Adate%2Cym%3As%3AtrafficSource')
  })

  it('parses rows with null dimension names returned by Metrika', async () => {
    mockFetch({
      query: {
        metrics: ['ym:s:ecommerceRevenue', 'ym:s:ecommercePurchases'],
        dimensions: ['ym:s:date', 'ym:s:sourceEngine'],
      },
      data: [
        {
          dimensions: [{ name: '2024-01-01' }, { name: null, id: null }],
          metrics: [100, 1],
        },
      ],
      totals: [],
    } as unknown as MetricaData)

    const result = await getDailySourceEcommerceSummary(TOKEN, COUNTER_ID, DATE_FROM, DATE_TO)

    expect(result.data).toHaveLength(1)
    expect(result.data[0].dimensions[0].name).toBe('2024-01-01')
    expect(result.data[0].dimensions[1].name).toBeNull()
  })
})
