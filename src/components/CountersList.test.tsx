import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useCounters } from '../api/metrica'
import { createMockAppState, MockAppProvider } from '../test/mocks'

import CountersList from './CountersList'

vi.mock('../api/metrica', async () => {
  const actual = await vi.importActual<typeof import('../api/metrica')>('../api/metrica')
  return {
    ...actual,
    useCounters: vi.fn(),
  }
})

const mockedUseCounters = vi.mocked(useCounters)

function renderCountersList(state = createMockAppState()) {
  return render(
    <MockAppProvider state={state}>
      <CountersList />
    </MockAppProvider>
  )
}

describe('CountersList', () => {
  it('shows loading state', () => {
    mockedUseCounters.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      isSuccess: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useCounters>)

    renderCountersList()
    expect(screen.getByRole('button', { name: /загрузка/i })).toBeDisabled()
  })

  it('renders counters and selects one on click', async () => {
    const user = userEvent.setup()
    const selectCounter = vi.fn()
    const counters = [
      { id: 1, name: 'Counter 1', site: 'example.com', status: 'Active' },
      { id: 2, name: 'Counter 2', site: 'example.org', status: 'Active' },
    ]

    mockedUseCounters.mockReturnValue({
      data: counters,
      isLoading: false,
      isError: false,
      isSuccess: true,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useCounters>)

    renderCountersList(createMockAppState({ selectCounter }))
    expect(screen.getByText('Counter 1')).toBeInTheDocument()
    expect(screen.getByText('Counter 2')).toBeInTheDocument()

    await user.click(screen.getByText('Counter 1'))
    expect(selectCounter).toHaveBeenCalledWith(counters[0])
  })

  it('shows error alert with retry', async () => {
    const user = userEvent.setup()
    const refetch = vi.fn()
    mockedUseCounters.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      isSuccess: false,
      error: new Error('Network error'),
      refetch,
    } as unknown as ReturnType<typeof useCounters>)

    renderCountersList()
    expect(screen.getByText('Network error')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /повторить/i }))
    expect(refetch).toHaveBeenCalled()
  })

  it('shows empty state when no counters', () => {
    mockedUseCounters.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      isSuccess: true,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useCounters>)

    renderCountersList()
    expect(screen.getByText(/нет доступных счётчиков/i)).toBeInTheDocument()
  })
})
