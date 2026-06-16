import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { AppContext, type AppState } from '../context/app'
import { AuthContext, type AuthState } from '../context/auth'
import { getDefaultDates } from '../lib/dateRanges'

export function createMockAuthState(overrides: Partial<AuthState> = {}): AuthState {
  return {
    token: null,
    login: null,
    clientLogin: null,
    isReady: true,
    hasToken: false,
    setToken: vi.fn(),
    deleteToken: vi.fn(),
    setClientLogin: vi.fn(),
    deleteClientLogin: vi.fn(),
    ...overrides,
  }
}

export function createMockAppState(overrides: Partial<AppState> = {}): AppState {
  return {
    activeTab: 'token',
    setActiveTab: vi.fn(),
    selectedCounter: null,
    setSelectedCounter: vi.fn(),
    selectCounter: vi.fn(),
    selectedCampaignId: null,
    setSelectedCampaignId: vi.fn(),
    selectCampaign: vi.fn(),
    dateRange: getDefaultDates(),
    setDateRange: vi.fn(),
    isDrawerOpen: false,
    setDrawerOpen: vi.fn(),
    ...overrides,
  }
}

export function MockAuthProvider({
  children,
  state = createMockAuthState(),
}: {
  children: React.ReactNode
  state?: AuthState
}) {
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export function MockAppProvider({
  children,
  state = createMockAppState(),
}: {
  children: React.ReactNode
  state?: AppState
}) {
  return <AppContext.Provider value={state}>{children}</AppContext.Provider>
}

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

export function TestQueryProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
}
