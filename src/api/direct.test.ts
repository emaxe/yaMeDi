import type { Campaign, CampaignPerformanceReportRow, AdReportRow, SearchTermReportRow } from '../types'

import { ApiError } from './client'
import { getAdReport, getCampaignReport, getCampaigns, getOverallCampaignReport, getSearchTermsReport, parseTsv } from './direct'

const TOKEN = 'test-token'
const LOGIN = 'test-user'

function mockDirectFetch(response: { status: number; body: string }) {
  vi.stubGlobal('window', { electronAPI: { directFetch: vi.fn().mockResolvedValue(response) } })
}

function jsonResponse(body: unknown, status = 200) {
  return { status, body: JSON.stringify(body) }
}

function textResponse(body: string, status = 200) {
  return { status, body }
}

function getLastRequestBody(): unknown {
  const calls = vi.mocked(window.electronAPI!.directFetch).mock.calls
  return (calls[calls.length - 1][1] as { body: unknown }).body
}

beforeEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('parseTsv', () => {
  it('returns empty array for empty text', () => {
    expect(parseTsv('')).toEqual([])
  })

  it('returns empty array when only header is present', () => {
    expect(parseTsv('CampaignName\tImpressions')).toEqual([])
  })

  it('parses tab separated rows and converts numbers', () => {
    const text = 'CampaignName\tImpressions\tClicks\nTest Campaign\t1000\t50'
    expect(parseTsv(text)).toEqual([
      {
        CampaignName: 'Test Campaign',
        Impressions: 1000,
        Clicks: 50,
      },
    ])
  })

  it('keeps empty strings as strings', () => {
    const text = 'CampaignName\tImpressions\n\t1000'
    expect(parseTsv(text)).toEqual([{ CampaignName: '', Impressions: 1000 }])
  })

  it('handles multiple rows', () => {
    const text = 'A\tB\n1\t2\n3\t4'
    expect(parseTsv(text)).toEqual([
      { A: 1, B: 2 },
      { A: 3, B: 4 },
    ])
  })
})

describe('getCampaigns', () => {
  it('returns parsed campaigns', async () => {
    const body = {
      result: {
        Campaigns: [
          { Id: 1, Name: 'Campaign 1', Status: 'ACCEPTED', Type: 'TEXT', State: 'ON', Currency: 'RUB' },
        ],
      },
    }
    mockDirectFetch(jsonResponse(body))

    const campaigns = await getCampaigns(TOKEN, LOGIN)
    expect(campaigns).toHaveLength(1)
    expect(campaigns[0]).toMatchObject<Campaign>({
      Id: 1,
      Name: 'Campaign 1',
      Status: 'ACCEPTED',
      Type: 'TEXT',
      State: 'ON',
      Currency: 'RUB',
    })
  })

  it('returns empty array when result is missing', async () => {
    mockDirectFetch(jsonResponse({}))
    const campaigns = await getCampaigns(TOKEN, LOGIN)
    expect(campaigns).toEqual([])
  })

  it('throws ApiError on non-ok response', async () => {
    mockDirectFetch(jsonResponse({ error: { error_code: 1, error_string: 'Auth error' } }, 401))
    await expect(getCampaigns(TOKEN, LOGIN)).rejects.toBeInstanceOf(ApiError)
  })

  it('sends Client-Login header when clientLogin is provided', async () => {
    mockDirectFetch(jsonResponse({ result: { Campaigns: [] } }))
    await getCampaigns(TOKEN, LOGIN)
    const call = vi.mocked(window.electronAPI!.directFetch).mock.calls[0]
    expect(call?.[1]?.headers?.['Client-Login']).toBe(LOGIN)
  })

  it('does not send Client-Login header when clientLogin is null', async () => {
    mockDirectFetch(jsonResponse({ result: { Campaigns: [] } }))
    await getCampaigns(TOKEN, null)
    const call = vi.mocked(window.electronAPI!.directFetch).mock.calls[0]
    expect(call?.[1]?.headers?.['Client-Login']).toBeUndefined()
  })
})

describe('getCampaignReport', () => {
  it('returns parsed report rows', async () => {
    const tsv = 'Date\tImpressions\tClicks\tCost\tCtr\tAvgCpc\tConversions\n2024-01-01\t1000\t50\t5000\t5\t100\t2'
    mockDirectFetch(textResponse(tsv))

    const rows = await getCampaignReport(TOKEN, LOGIN, 123, '2024-01-01', '2024-01-31')
    expect(rows).toHaveLength(1)
    expect(getLastRequestBody()).toMatchObject({
      params: {
        SelectionCriteria: {
          DateFrom: '2024-01-01',
          DateTo: '2024-01-31',
          Filter: [{ Field: 'CampaignId', Operator: 'IN', Values: ['123'] }],
        },
        DateRangeType: 'CUSTOM_DATE',
      },
    })
    expect(rows[0]).toMatchObject<CampaignPerformanceReportRow>({
      Date: '2024-01-01',
      Impressions: 1000,
      Clicks: 50,
      Cost: 5000,
      Ctr: 5,
      AvgCpc: 100,
      Conversions: 2,
    })
  })

  it('throws when report is in progress', async () => {
    mockDirectFetch(textResponse('In progress'))
    await expect(getCampaignReport(TOKEN, LOGIN, 123, '2024-01-01', '2024-01-31')).rejects.toBeInstanceOf(ApiError)
  })

  it('polls until report is ready on 202', async () => {
    vi.useFakeTimers()
    const tsv = 'Date\tImpressions\tClicks\tCost\tCtr\tAvgCpc\tConversions\n2024-01-01\t1000\t50\t5000\t5\t100\t2'
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ status: 202, body: '' })
      .mockResolvedValueOnce({ status: 202, body: '' })
      .mockResolvedValueOnce({ status: 200, body: tsv })
    vi.stubGlobal('window', { electronAPI: { directFetch: fetchMock } })

    const promise = getCampaignReport(TOKEN, LOGIN, 123, '2024-01-01', '2024-01-31')
    await vi.runAllTimersAsync()
    const rows = await promise
    expect(rows).toHaveLength(1)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })
})

describe('getAdReport', () => {
  it('returns parsed ad rows', async () => {
    const tsv = 'AdId\tImpressions\tClicks\tCost\tCtr\n123\t1000\t50\t5000\t5'
    mockDirectFetch(textResponse(tsv))

    const rows = await getAdReport(TOKEN, LOGIN, 123, '2024-01-01', '2024-01-31')
    expect(rows).toHaveLength(1)
    expect(getLastRequestBody()).toMatchObject({
      params: {
        SelectionCriteria: {
          DateFrom: '2024-01-01',
          DateTo: '2024-01-31',
          Filter: [{ Field: 'CampaignId', Operator: 'IN', Values: ['123'] }],
        },
        DateRangeType: 'CUSTOM_DATE',
      },
    })
    expect(rows[0]).toMatchObject<AdReportRow>({
      AdId: 123,
      Impressions: 1000,
      Clicks: 50,
      Cost: 5000,
      Ctr: 5,
    })
  })
})

describe('getOverallCampaignReport', () => {
  it('returns parsed overall campaign rows without CampaignIds filter', async () => {
    const tsv = 'CampaignId\tCampaignName\tDate\tImpressions\tClicks\tCost\tCtr\tAvgCpc\tConversions\n1\tCampaign A\t2024-01-01\t1000\t50\t5000\t5\t100\t2'
    mockDirectFetch(textResponse(tsv))

    const rows = await getOverallCampaignReport(TOKEN, LOGIN, '2024-01-01', '2024-01-31')
    expect(rows).toHaveLength(1)
    expect(getLastRequestBody()).toMatchObject({
      params: {
        SelectionCriteria: {
          DateFrom: '2024-01-01',
          DateTo: '2024-01-31',
        },
        FieldNames: ['CampaignId', 'CampaignName', 'Date', 'Impressions', 'Clicks', 'Cost', 'Ctr', 'AvgCpc', 'Conversions'],
        ReportType: 'CAMPAIGN_PERFORMANCE_REPORT',
        DateRangeType: 'CUSTOM_DATE',
      },
    })
    expect(getLastRequestBody()).not.toMatchObject({
      params: {
        SelectionCriteria: {
          CampaignIds: expect.anything(),
        },
      },
    })
    expect(rows[0]).toMatchObject<CampaignPerformanceReportRow>({
      CampaignId: 1,
      CampaignName: 'Campaign A',
      Date: '2024-01-01',
      Impressions: 1000,
      Clicks: 50,
      Cost: 5000,
      Ctr: 5,
      AvgCpc: 100,
      Conversions: 2,
    })
  })
})

describe('getSearchTermsReport', () => {
  it('returns parsed search term rows', async () => {
    const tsv = 'Query\tImpressions\tClicks\tCost\tCtr\nquery\t1000\t50\t5000\t5'
    mockDirectFetch(textResponse(tsv))

    const rows = await getSearchTermsReport(TOKEN, LOGIN, 123, '2024-01-01', '2024-01-31')
    expect(rows).toHaveLength(1)
    expect(getLastRequestBody()).toMatchObject({
      params: {
        SelectionCriteria: {
          DateFrom: '2024-01-01',
          DateTo: '2024-01-31',
          Filter: [{ Field: 'CampaignId', Operator: 'IN', Values: ['123'] }],
        },
        DateRangeType: 'CUSTOM_DATE',
      },
    })
    expect(rows[0]).toMatchObject<SearchTermReportRow>({
      Query: 'query',
      Impressions: 1000,
      Clicks: 50,
      Cost: 5000,
      Ctr: 5,
    })
  })
})
