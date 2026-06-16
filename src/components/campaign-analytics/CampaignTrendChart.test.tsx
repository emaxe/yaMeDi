import { render, screen, waitFor } from '@testing-library/react'

import type { AppState } from '../../context/app'
import {
  createMockAppState,
  createMockAuthState,
  MockAppProvider,
  MockAuthProvider,
  TestQueryProvider,
} from '../../test/mocks'

import { CampaignTrendChart } from './CampaignTrendChart'

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

function mockPerformanceResponse(body: string) {
  Object.assign(window, { electronAPI: { directFetch: vi.fn().mockResolvedValue({ status: 200, body }) } })
}

beforeEach(() => {
  Object.assign(window, { electronAPI: undefined })
})

describe('CampaignTrendChart', () => {
  it('renders chart title', async () => {
    const tsv = 'Date\tImpressions\tClicks\tCost\tCtr\tAvgCpc\tConversions\n2024-01-15\t1000\t50\t5000\t5\t100\t2'
    mockPerformanceResponse(tsv)

    render(<CampaignTrendChart campaignId={123} dateFrom="2024-01-15" dateTo="2024-01-31" />, { wrapper: createWrapper() })

    await waitFor(() => expect(screen.getByText('Динамика кампании')).toBeInTheDocument())
  })
})
