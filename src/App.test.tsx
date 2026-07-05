import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import App from './App'
import type { AppState } from './context/app'
import {
  createMockAppState,
  createMockAuthState,
  MockAppProvider,
  MockAuthProvider,
  TestQueryProvider,
} from './test/mocks'


vi.mock('./hooks/useOperationalReport', () => ({
  useOperationalReport: vi.fn(() => ({
    data: undefined,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  })),
}))

vi.mock('./hooks/useAuditChecklist', () => ({
  useAuditChecklist: vi.fn(() => ({
    items: [],
    isLoading: false,
    updateItem: vi.fn(),
  })),
}))

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

  it('renders overall analytics dashboard', async () => {
    render(<App />, { wrapper: createWrapper(createMockAppState({ activeTab: 'overall-analytics' })) })
    expect(await screen.findByRole('heading', { name: 'Аналитика всех кампаний' })).toBeInTheDocument()
  })

  it('navigates to overall analytics tab from sidebar', async () => {
    const setActiveTab = vi.fn()
    render(<App />, { wrapper: createWrapper(createMockAppState({ setActiveTab })) })
    const overallAnalyticsNav = screen.getAllByRole('button', { name: 'Общая аналитика' })[0]
    await userEvent.click(overallAnalyticsNav)
    expect(setActiveTab).toHaveBeenCalledWith('overall-analytics')
  })

  it('navigates to campaigns tab from sidebar', async () => {
    const setActiveTab = vi.fn()
    render(<App />, { wrapper: createWrapper(createMockAppState({ setActiveTab })) })
    const campaignsNav = screen.getAllByRole('button', { name: 'Кампании' })[0]
    await userEvent.click(campaignsNav)
    expect(setActiveTab).toHaveBeenCalledWith('campaigns')
  })

  it('renders operational report dashboard', async () => {
    render(<App />, { wrapper: createWrapper(createMockAppState({ activeTab: 'operational-report' })) })
    expect(await screen.findByRole('heading', { name: 'Операционный отчёт' })).toBeInTheDocument()
  })

  it('renders audit checklist page', async () => {
    render(<App />, { wrapper: createWrapper(createMockAppState({ activeTab: 'audit' })) })
    expect(await screen.findByRole('heading', { name: 'Аудит аналитики' })).toBeInTheDocument()
  })

  it('navigates to audit tab from sidebar', async () => {
    const setActiveTab = vi.fn()
    render(<App />, { wrapper: createWrapper(createMockAppState({ setActiveTab })) })
    const auditNav = screen.getAllByRole('button', { name: 'Аудит аналитики' })[0]
    await userEvent.click(auditNav)
    expect(setActiveTab).toHaveBeenCalledWith('audit')
  })

  it('navigates to operational report tab from sidebar', async () => {
    const setActiveTab = vi.fn()
    render(<App />, { wrapper: createWrapper(createMockAppState({ setActiveTab })) })
    const operationalReportNav = screen.getAllByRole('button', { name: 'Операционный отчёт' })[0]
    await userEvent.click(operationalReportNav)
    expect(setActiveTab).toHaveBeenCalledWith('operational-report')
  })
})
