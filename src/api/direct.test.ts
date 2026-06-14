import { type Campaign, type DirectReportRow } from '../types'

import { ApiError } from './client'
import { getAdReport, getCampaignReport, getCampaigns, getSearchTermsReport, parseTsv } from './direct'

const TOKEN = 'test-token'

function mockFetch(response: Response) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status })
}

function textResponse(body: string, status = 200) {
  return new Response(body, { status })
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
    mockFetch(jsonResponse(body))

    const campaigns = await getCampaigns(TOKEN)
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
    mockFetch(jsonResponse({}))
    const campaigns = await getCampaigns(TOKEN)
    expect(campaigns).toEqual([])
  })

  it('throws ApiError on non-ok response', async () => {
    mockFetch(jsonResponse({ error: { error_code: 1, error_string: 'Auth error' } }, 401))
    await expect(getCampaigns(TOKEN)).rejects.toBeInstanceOf(ApiError)
  })
})

describe('getCampaignReport', () => {
  it('returns parsed report rows', async () => {
    const tsv = 'CampaignName\tCampaignId\tImpressions\tClicks\tCost\tCtr\tAvgCpc\tConversions\nTest\t123\t1000\t50\t5000\t5\t100\t2'
    mockFetch(textResponse(tsv))

    const rows = await getCampaignReport(TOKEN, '2024-01-01', '2024-01-31')
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject<DirectReportRow>({
      CampaignName: 'Test',
      CampaignId: 123,
      Impressions: 1000,
      Clicks: 50,
      Cost: 5000,
      Ctr: 5,
      AvgCpc: 100,
      Conversions: 2,
    })
  })

  it('throws when report is in progress', async () => {
    mockFetch(textResponse('In progress'))
    await expect(getCampaignReport(TOKEN, '2024-01-01', '2024-01-31')).rejects.toBeInstanceOf(ApiError)
  })
})

describe('getAdReport', () => {
  it('returns report text', async () => {
    mockFetch(textResponse('Ad report content'))
    const text = await getAdReport(TOKEN, '2024-01-01', '2024-01-31')
    expect(text).toBe('Ad report content')
  })
})

describe('getSearchTermsReport', () => {
  it('returns report text', async () => {
    mockFetch(textResponse('Search terms report'))
    const text = await getSearchTermsReport(TOKEN, '2024-01-01', '2024-01-31')
    expect(text).toBe('Search terms report')
  })
})
