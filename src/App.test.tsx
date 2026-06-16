import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { AppState } from './context/app'
import {
  createMockAppState,
  createMockAuthState,
  MockAppProvider,
  MockAuthProvider,
  TestQueryProvider,
} from './test/mocks'

import App from './App'

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

describe('App', () => {
  it('renders campaign analytics dashboard', async () => {
    render(<App />, { wrapper: createWrapper(createMockAppState({ activeTab: 'company-analytics' })) })
    expect(await screen.findByRole('heading', { name: 'Аналитика кампании' })).toBeInTheDocument()
  })

  it('navigates to campaigns tab from sidebar', async () => {
    const setActiveTab = vi.fn()
    render(<App />, { wrapper: createWrapper(createMockAppState({ setActiveTab })) })
    const campaignsNav = screen.getAllByRole('button', { name: 'Кампании' })[0]
    await userEvent.click(campaignsNav)
    expect(setActiveTab).toHaveBeenCalledWith('campaigns')
  })
})
