import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { AppState } from '../../context/app'
import {
  createMockAppState,
  createMockAuthState,
  MockAppProvider,
  MockAuthProvider,
  TestQueryProvider,
} from '../../test/mocks'

import { CampaignSelector } from './CampaignSelector'

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

function mockCampaignsResponse(body: string) {
  Object.assign(window, { electronAPI: { directFetch: vi.fn().mockResolvedValue({ status: 200, body }) } })
}

beforeEach(() => {
  Object.assign(window, { electronAPI: undefined })
})

describe('CampaignSelector', () => {
  it('renders campaigns and selects one', async () => {
    const body = JSON.stringify({
      result: {
        Campaigns: [
          { Id: 1, Name: 'Campaign 1', Status: 'ACCEPTED', Type: 'TEXT', State: 'ON', Currency: 'RUB' },
        ],
      },
    })
    mockCampaignsResponse(body)

    const setSelectedCampaignId = vi.fn()
    render(<CampaignSelector />, { wrapper: createWrapper(createMockAppState({ setSelectedCampaignId })) })

    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument())
    await userEvent.selectOptions(screen.getByRole('combobox'), '1')
    expect(setSelectedCampaignId).toHaveBeenCalledWith(1)
  })

  it('shows empty state when no campaigns', async () => {
    const body = JSON.stringify({ result: { Campaigns: [] } })
    mockCampaignsResponse(body)

    render(<CampaignSelector />, { wrapper: createWrapper() })
    await waitFor(() => expect(screen.getByText('Нет доступных кампаний')).toBeInTheDocument())
  })
})
