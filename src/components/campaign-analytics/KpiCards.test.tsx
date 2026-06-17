import { render, screen, waitFor } from '@testing-library/react'

import type { AppState } from '../../context/app'
import {
  createMockAppState,
  createMockAuthState,
  MockAppProvider,
  MockAuthProvider,
  TestQueryProvider,
} from '../../test/mocks'

import { KpiCards } from './KpiCards'

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

describe('KpiCards', () => {
  it('renders KPI cards with comparison for a single campaign', async () => {
    const tsv = 'Date\tImpressions\tClicks\tCost\tCtr\tAvgCpc\tConversions\n2024-01-15\t1000\t50\t5000\t5\t100\t2'
    mockPerformanceResponse(tsv)

    render(<KpiCards campaignId={123} dateFrom="2024-01-15" dateTo="2024-01-31" />, { wrapper: createWrapper() })

    await waitFor(() => expect(screen.getByText('Показы')).toBeInTheDocument())
    expect(screen.getByText('Клики')).toBeInTheDocument()
    expect(screen.getByText('Расход')).toBeInTheDocument()
  })

  it('aggregates KPIs for all campaigns', async () => {
    Object.assign(window, {
      electronAPI: {
        directFetch: vi.fn().mockResolvedValue({
          status: 200,
          body: 'CampaignId\tCampaignName\tDate\tImpressions\tClicks\tCost\tCtr\tAvgCpc\tConversions\n1\tCampaign 1\t2024-01-01\t1000\t50\t5000\t5\t100\t2\n2\tCampaign 2\t2024-01-01\t500\t25\t2500\t5\t100\t1',
        }),
      },
    })

    render(<KpiCards campaignId="all" dateFrom="2024-01-01" dateTo="2024-01-01" />, { wrapper: createWrapper() })

    await waitFor(() => expect(screen.getByText('1 500')).toBeInTheDocument())
    expect(screen.getByText('Показы')).toBeInTheDocument()
    expect(screen.getByText('Клики')).toBeInTheDocument()
    expect(screen.getByText('Расход')).toBeInTheDocument()
  })
})
