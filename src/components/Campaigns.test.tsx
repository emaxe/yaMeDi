import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { AppState } from '../context/app'
import type { AuthState } from '../context/auth'
import {
  createMockAppState,
  createMockAuthState,
  MockAppProvider,
  MockAuthProvider,
  TestQueryProvider,
} from '../test/mocks'

import Campaigns from './Campaigns'

function createWrapper(
  authState: AuthState = createMockAuthState({ token: 'token', clientLogin: 'login', hasToken: true }),
  appState: AppState = createMockAppState()
) {
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

function mockDirectFetch(campaignsBody: string, clientsBody?: string) {
  const clients = clientsBody ?? JSON.stringify({ result: { Clients: [] } })
  Object.assign(window, {
    electronAPI: {
      directFetch: vi.fn((url: string) => {
        if (url.includes('/agencyclients')) {
          return Promise.resolve({ status: 200, body: clients })
        }
        return Promise.resolve({ status: 200, body: campaignsBody })
      }),
    },
  })
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
    mockDirectFetch(body)

    const selectCampaign = vi.fn()
    render(<Campaigns />, { wrapper: createWrapper(undefined, createMockAppState({ selectCampaign })) })

    await waitFor(() => expect(screen.getByText('Campaign 1')).toBeInTheDocument())
    await userEvent.click(screen.getByText('Campaign 1'))
    expect(selectCampaign).toHaveBeenCalledWith(1)
  })

  it('renders agency clients in select dropdown', async () => {
    const campaignsBody = JSON.stringify({ result: { Campaigns: [] } })
    const clientsBody = JSON.stringify({
      result: {
        Clients: [
          { Login: 'kurort26-direct', Type: 'SUBCLIENT', Archived: 'No' },
          { Login: 'sanatoryistok', Type: 'SUBCLIENT', Archived: 'No' },
          { Login: 'archived-client', Type: 'SUBCLIENT', Archived: 'Yes' },
        ],
      },
    })
    mockDirectFetch(campaignsBody, clientsBody)

    render(<Campaigns />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'kurort26-direct' })).toBeInTheDocument()
    })
    expect(screen.getByRole('option', { name: 'sanatoryistok' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'archived-client' })).not.toBeInTheDocument()
  })

  it('calls setClientLogin when a client is selected', async () => {
    const campaignsBody = JSON.stringify({ result: { Campaigns: [] } })
    const clientsBody = JSON.stringify({
      result: { Clients: [{ Login: 'kurort26-direct', Type: 'SUBCLIENT', Archived: 'No' }] },
    })
    const setClientLogin = vi.fn().mockResolvedValue(undefined)
    mockDirectFetch(campaignsBody, clientsBody)

    render(<Campaigns />, {
      wrapper: createWrapper(createMockAuthState({ token: 'token', clientLogin: null, hasToken: true, setClientLogin })),
    })

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'kurort26-direct' })).toBeInTheDocument()
    })

    const select = screen.getByRole('combobox') as HTMLSelectElement
    await userEvent.setup().selectOptions(select, 'kurort26-direct')

    expect(setClientLogin).toHaveBeenCalledWith('kurort26-direct')
  })

  it('calls deleteClientLogin when the empty option is selected', async () => {
    const campaignsBody = JSON.stringify({ result: { Campaigns: [] } })
    const clientsBody = JSON.stringify({
      result: { Clients: [{ Login: 'kurort26-direct', Type: 'SUBCLIENT', Archived: 'No' }] },
    })
    const deleteClientLogin = vi.fn().mockResolvedValue(undefined)
    mockDirectFetch(campaignsBody, clientsBody)

    render(<Campaigns />, {
      wrapper: createWrapper(
        createMockAuthState({ token: 'token', clientLogin: 'kurort26-direct', hasToken: true, deleteClientLogin })
      ),
    })

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'kurort26-direct' })).toBeInTheDocument()
    })

    const select = screen.getByRole('combobox') as HTMLSelectElement
    await userEvent.setup().selectOptions(select, '')

    expect(deleteClientLogin).toHaveBeenCalled()
  })
})
