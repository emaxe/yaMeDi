import { render, screen } from '@testing-library/react'

import type { AppState } from '../context/app'
import {
  createMockAppState,
  createMockAuthState,
  MockAppProvider,
  MockAuthProvider,
  TestQueryProvider,
} from '../test/mocks'

import CampaignAnalytics from './CampaignAnalytics'

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

beforeEach(() => {
  Object.assign(window, { electronAPI: undefined })
})

describe('CampaignAnalytics', () => {
  it('shows empty state when no campaign selected', () => {
    render(<CampaignAnalytics />, { wrapper: createWrapper(createMockAppState({ selectedCampaignId: null })) })
    expect(screen.getByText('Кампания не выбрана')).toBeInTheDocument()
  })

  it('renders analytics for selected campaign', async () => {
    Object.assign(window, {
      electronAPI: {
        directFetch: vi.fn().mockImplementation((_url: string, options: { body: { params: { ReportType: string } } }) => {
          const reportType = options.body.params.ReportType
          if (reportType === 'CAMPAIGN_PERFORMANCE_REPORT') {
            return { status: 200, body: 'Date\tImpressions\tClicks\tCost\tCtr\tAvgCpc\tConversions\n2024-01-15\t1000\t50\t5000\t5\t100\t2' }
          }
          if (reportType === 'AD_PERFORMANCE_REPORT') {
            return { status: 200, body: 'AdName\tImpressions\tClicks\tCost\tCtr\nAd 1\t1000\t50\t5000\t5' }
          }
          return { status: 200, body: 'SearchTerm\tImpressions\tClicks\tCost\tCtr\nquery\t1000\t50\t5000\t5' }
        }),
      },
    })

    render(<CampaignAnalytics />, { wrapper: createWrapper(createMockAppState({ selectedCampaignId: 123 })) })
    expect(screen.getByText('Аналитика кампании')).toBeInTheDocument()
  })
})
