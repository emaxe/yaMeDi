import { render, screen, waitFor } from '@testing-library/react'

import type { AppState } from '../../context/app'
import {
  createMockAppState,
  createMockAuthState,
  MockAppProvider,
  MockAuthProvider,
  TestQueryProvider,
} from '../../test/mocks'

import { CampaignSummaryTable } from './CampaignSummaryTable'

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

describe('CampaignSummaryTable', () => {
  it('renders aggregated campaign summary for campaignId="all"', async () => {
    const tsv =
      'CampaignId\tCampaignName\tDate\tImpressions\tClicks\tCost\tCtr\tAvgCpc\tConversions\n' +
      '1\tCampaign A\t2024-01-01\t1000\t50\t5000\t5\t100\t2\n' +
      '2\tCampaign B\t2024-01-01\t500\t25\t2500\t5\t100\t1'
    mockPerformanceResponse(tsv)

    render(<CampaignSummaryTable campaignId="all" dateFrom="2024-01-01" dateTo="2024-01-01" />, {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(screen.getByTestId('campaign-summary-table')).toBeInTheDocument())

    expect(screen.getByText('Campaign A')).toBeInTheDocument()
    expect(screen.getByText('Campaign B')).toBeInTheDocument()

    // Campaign A has higher cost, so it should appear first in the sorted table body
    const rows = screen.getAllByRole('row')
    const campaignRowTexts = rows
      .filter((r) => r.textContent?.includes('Campaign'))
      .map((r) => r.textContent)
    expect(campaignRowTexts[0]).toContain('Campaign A')
    expect(campaignRowTexts[1]).toContain('Campaign B')
  })

  it('returns null for numeric campaignId', async () => {
    mockPerformanceResponse(
      'CampaignId\tCampaignName\tDate\tImpressions\tClicks\tCost\tCtr\tAvgCpc\tConversions\n' +
        '1\tCampaign A\t2024-01-01\t1000\t50\t5000\t5\t100\t2'
    )

    const { container } = render(
      <CampaignSummaryTable campaignId={1} dateFrom="2024-01-01" dateTo="2024-01-01" />,
      { wrapper: createWrapper() }
    )

    // Should not render anything because campaignId is not 'all'
    expect(container.firstChild).toBeNull()
  })
})
