import { render, screen, waitFor } from '@testing-library/react'

import type { AppState } from '../../context/app'
import {
  createMockAppState,
  createMockAuthState,
  MockAppProvider,
  MockAuthProvider,
  TestQueryProvider,
} from '../../test/mocks'

import { SearchTermsReport } from './SearchTermsReport'

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

function mockSearchTermsResponse(body: string) {
  Object.assign(window, { electronAPI: { directFetch: vi.fn().mockResolvedValue({ status: 200, body }) } })
}

beforeEach(() => {
  Object.assign(window, { electronAPI: undefined })
})

describe('SearchTermsReport', () => {
  it('renders search terms report title', async () => {
    const tsv = 'SearchTerm\tImpressions\tClicks\tCost\tCtr\nquery\t1000\t50\t5000\t5'
    mockSearchTermsResponse(tsv)

    render(<SearchTermsReport campaignId={123} dateFrom="2024-01-15" dateTo="2024-01-31" />, { wrapper: createWrapper() })

    await waitFor(() => expect(screen.getByText('Поисковые запросы')).toBeInTheDocument())
  })

  it('shows campaign column for overall report', async () => {
    const tsv = 'CampaignId\tCampaignName\tQuery\tImpressions\tClicks\tCost\tCtr\n1\tCampaign 1\tquery\t100\t5\t500\t5'
    mockSearchTermsResponse(tsv)

    render(<SearchTermsReport campaignId="all" dateFrom="2024-01-01" dateTo="2024-01-01" />, { wrapper: createWrapper() })

    await waitFor(() => expect(screen.getAllByText('Campaign 1 (ID: 1)').length).toBeGreaterThan(0))
  })
})
