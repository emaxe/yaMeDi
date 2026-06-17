import { render, screen, waitFor } from '@testing-library/react'

import type { AppState } from '../../context/app'
import {
  createMockAppState,
  createMockAuthState,
  MockAppProvider,
  MockAuthProvider,
  TestQueryProvider,
} from '../../test/mocks'

import { AdsReport } from './AdsReport'

const authState = createMockAuthState({ token: 'token', clientLogin: 'login', hasToken: true })

function createWrapper(appState: AppState = createMockAppState()) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <TestQueryProvider>
        <MockAuthProvider state={authState}>
          <MockAppProvider state={appState}>{children}</MockAppProvider>
        </MockAuthProvider>
      </TestQueryProvider>
    )
  }
}

function mockAdReportResponse(body: string) {
  Object.assign(window, { electronAPI: { directFetch: vi.fn().mockResolvedValue({ status: 200, body }) } })
}

beforeEach(() => {
  Object.assign(window, { electronAPI: undefined })
})

describe('AdsReport', () => {
  it('renders ads report title for numeric campaignId', async () => {
    const tsv = 'AdName\tImpressions\tClicks\tCost\tCtr\nAd 1\t1000\t50\t5000\t5'
    mockAdReportResponse(tsv)

    render(<AdsReport campaignId={123} dateFrom="2024-01-15" dateTo="2024-01-31" />, { wrapper: createWrapper() })

    await waitFor(() => expect(screen.getByText('Объявления')).toBeInTheDocument())
  })

  it('renders campaign column when campaignId is all', async () => {
    const tsv = 'CampaignId\tCampaignName\tAdId\tImpressions\tClicks\tCost\tCtr\n1\tCampaign 1\t10\t100\t5\t500\t5'
    mockAdReportResponse(tsv)

    render(<AdsReport campaignId="all" dateFrom="2024-01-01" dateTo="2024-01-01" />, { wrapper: createWrapper() })

    await waitFor(() => expect(screen.getAllByText('Campaign 1 (ID: 1)').length).toBeGreaterThan(0))
  })
})
