import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { createMockAuthState, MockAuthProvider } from '../test/mocks'

import TokenSetup from './TokenSetup'

const mockOpenExternal = vi.fn()

beforeAll(() => {
  window.electronAPI = {
    openExternal: mockOpenExternal,
    getToken: vi.fn(),
    setToken: vi.fn(),
    deleteToken: vi.fn(),
    onMainProcessMessage: vi.fn(() => vi.fn()),
  }
})

afterEach(() => {
  vi.clearAllMocks()
})

function renderTokenSetup(state = createMockAuthState()) {
  return render(
    <MockAuthProvider state={state}>
      <TokenSetup />
    </MockAuthProvider>
  )
}

describe('TokenSetup', () => {
  it('renders token input and save button', () => {
    renderTokenSetup()
    expect(screen.getByLabelText(/oauth-токен/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /сохранить/i })).toBeInTheDocument()
  })

  it('toggles token visibility', async () => {
    const user = userEvent.setup()
    renderTokenSetup()
    const input = screen.getByLabelText(/oauth-токен/i) as HTMLInputElement
    const toggle = screen.getByRole('button', { name: /показать токен/i })

    expect(input.type).toBe('password')
    await user.click(toggle)
    expect(input.type).toBe('text')
  })

  it('calls setToken when save is clicked with valid token', async () => {
    const user = userEvent.setup()
    const setToken = vi.fn().mockResolvedValue(undefined)
    renderTokenSetup(createMockAuthState({ setToken, hasToken: true }))

    const input = screen.getByLabelText(/oauth-токен/i)
    await user.type(input, 'my-valid-token-123')
    await user.click(screen.getByRole('button', { name: /сохранить/i }))

    expect(setToken).toHaveBeenCalledWith('my-valid-token-123')
  })

  it('shows validation error for short token', async () => {
    const user = userEvent.setup()
    const setToken = vi.fn().mockResolvedValue(undefined)
    renderTokenSetup(createMockAuthState({ setToken, hasToken: true }))

    const input = screen.getByLabelText(/oauth-токен/i)
    await user.type(input, 'short')
    await user.click(screen.getByRole('button', { name: /сохранить/i }))

    expect(screen.getByText(/токен слишком короткий/i)).toBeInTheDocument()
    expect(setToken).not.toHaveBeenCalled()
  })

  it('calls deleteToken when delete is clicked', async () => {
    const user = userEvent.setup()
    const deleteToken = vi.fn().mockResolvedValue(undefined)
    renderTokenSetup(createMockAuthState({ deleteToken, hasToken: true }))

    await user.click(screen.getByRole('button', { name: /удалить/i }))
    expect(deleteToken).toHaveBeenCalled()
  })

  it('opens auth page in electron', async () => {
    const user = userEvent.setup()
    renderTokenSetup()

    await user.click(screen.getByRole('button', { name: /открыть страницу авторизации/i }))
    expect(mockOpenExternal).toHaveBeenCalled()
  })
})
