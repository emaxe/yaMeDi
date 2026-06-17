import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'

import {
  createMockAppState,
  createMockAuthState,
  MockAppProvider,
  MockAuthProvider,
  TestQueryProvider,
} from '../test/mocks'

import { OverallAnalytics } from './OverallAnalytics'

const authState = createMockAuthState({ token: 'token', clientLogin: 'login', hasToken: true })

function createWrapper() {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <TestQueryProvider>
        <MockAuthProvider state={authState}>
          <MockAppProvider state={createMockAppState()}>{children}</MockAppProvider>
        </MockAuthProvider>
      </TestQueryProvider>
    )
  }
}

beforeEach(() => {
  Object.assign(window, { electronAPI: undefined })
})

describe('OverallAnalytics', () => {
  it('renders title and all widgets when date range is valid', async () => {
    Object.assign(window, {
      electronAPI: {
        directFetch: vi.fn().mockImplementation((_url: string, options: { body: { params: { ReportType: string } } }) => {
          const reportType = options.body.params.ReportType
          if (reportType === 'CAMPAIGN_PERFORMANCE_REPORT') {
            return {
              status: 200,
              body: 'CampaignId\tCampaignName\tDate\tImpressions\tClicks\tCost\tCtr\tAvgCpc\tConversions\n1\tCampaign 1\t2024-01-15\t1000\t50\t5000\t5\t100\t2',
            }
          }
          if (reportType === 'AD_PERFORMANCE_REPORT') {
            return {
              status: 200,
              body: 'CampaignId\tCampaignName\tAdId\tImpressions\tClicks\tCost\tCtr\n1\tCampaign 1\t10\t100\t5\t500\t5',
            }
          }
          return {
            status: 200,
            body: 'CampaignId\tCampaignName\tQuery\tImpressions\tClicks\tCost\tCtr\n1\tCampaign 1\tquery\t100\t5\t500\t5',
          }
        }),
      },
    })

    render(<OverallAnalytics />, { wrapper: createWrapper() })

    expect(screen.getByText('Аналитика всех кампаний')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Динамика кампании')).toBeInTheDocument()
    }, { timeout: 3000 })

    expect(screen.getByText('Сводка по кампаниям')).toBeInTheDocument()
    expect(screen.getByText('Объявления')).toBeInTheDocument()
    expect(screen.getByText('Поисковые запросы')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getAllByText('Показы').length).toBeGreaterThan(0)
    }, { timeout: 3000 })
  })

  it('shows empty state when date range is invalid', async () => {
    render(<OverallAnalytics />, { wrapper: createWrapper() })

    const fromInput = screen.getByLabelText('Начало периода')
    const toInput = screen.getByLabelText('Конец периода')

    // Set an invalid range: from > to
    fireEvent.change(fromInput, { target: { value: '2025-01-15' } })
    fireEvent.change(toInput, { target: { value: '2024-01-01' } })

    await waitFor(() => {
      expect(screen.getByText('Выберите период')).toBeInTheDocument()
    })
  })
})
