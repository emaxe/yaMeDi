import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { AppState } from '../context/app'
import {
  createMockAppState,
  createMockAuthState,
  MockAppProvider,
  MockAuthProvider,
  TestQueryProvider,
} from '../test/mocks'

import Campaigns from './Campaigns'

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

describe('Campaigns', () => {
  it('selects campaign and switches tab on click', async () => {
    const body = JSON.stringify({
      result: {
        Campaigns: [
          { Id: 1, Name: 'Campaign 1', Status: 'ACCEPTED', Type: 'TEXT', State: 'ON', Currency: 'RUB' },
        ],
      },
    })
    mockCampaignsResponse(body)

    const selectCampaign = vi.fn()
    render(<Campaigns />, { wrapper: createWrapper(createMockAppState({ selectCampaign })) })

    await waitFor(() => expect(screen.getByText('Campaign 1')).toBeInTheDocument())
    await userEvent.click(screen.getByText('Campaign 1'))
    expect(selectCampaign).toHaveBeenCalledWith(1)
  })
})
