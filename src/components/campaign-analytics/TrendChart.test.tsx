import { render, screen, waitFor } from '@testing-library/react'

import type { AppState } from '../../context/app'
import {
  createMockAppState,
  createMockAuthState,
  MockAppProvider,
  MockAuthProvider,
  TestQueryProvider,
} from '../../test/mocks'

import { TrendChart } from './TrendChart'

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

describe('TrendChart', () => {
  it('renders chart title for single campaign', async () => {
    const tsv = 'Date\tImpressions\tClicks\tCost\tCtr\tAvgCpc\tConversions\n2024-01-15\t1000\t50\t5000\t5\t100\t2'
    mockPerformanceResponse(tsv)

    render(<TrendChart campaignId={123} dateFrom="2024-01-15" dateTo="2024-01-31" />, { wrapper: createWrapper() })

    await waitFor(() => expect(screen.getByText('Динамика кампании')).toBeInTheDocument())
  })

  it('aggregates data by date when campaignId is all', async () => {
    Object.assign(window, {
      electronAPI: {
        directFetch: vi.fn().mockResolvedValue({
          status: 200,
          body: 'CampaignId\tCampaignName\tDate\tImpressions\tClicks\tCost\tCtr\tAvgCpc\tConversions\n1\tA\t2024-01-01\t1000\t10\t100\t1\t10\t1\n2\tB\t2024-01-01\t1000\t20\t200\t2\t10\t1',
        }),
      },
    })

    render(<TrendChart campaignId="all" dateFrom="2024-01-01" dateTo="2024-01-01" />, { wrapper: createWrapper() })

    await waitFor(() => expect(screen.getByText('Динамика кампании')).toBeInTheDocument())
  })
})
