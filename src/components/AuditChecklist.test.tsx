import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useAuditChecklist } from '../hooks/useAuditChecklist'
import type { AuditChecklistItem } from '../types'

import AuditChecklist from './AuditChecklist'

vi.mock('../hooks/useAuditChecklist', () => ({
  useAuditChecklist: vi.fn(),
}))

const mockItems: AuditChecklistItem[] = [
  {
    id: 'metrica-webvisor',
    label: 'Метрика (вебвизор, тепловые карты)',
    lastCheckedDate: '2026-04-01',
    status: 'ok',
    intervalDays: 60,
  },
  {
    id: 'calltracking',
    label: 'Calltracking',
    lastCheckedDate: null,
    status: 'missing',
    intervalDays: 60,
  },
]

describe('AuditChecklist', () => {
  it('renders heading and audit items', () => {
    vi.mocked(useAuditChecklist).mockReturnValue({
      items: mockItems,
      isLoading: false,
      updateItem: vi.fn(),
    })

    render(<AuditChecklist />)

    expect(screen.getByRole('heading', { name: 'Аудит аналитики' })).toBeInTheDocument()
    expect(screen.getByTestId('audit-item-metrica-webvisor')).toBeInTheDocument()
    expect(screen.getByTestId('audit-item-calltracking')).toBeInTheDocument()
  })

  it('shows overdue badge for items without a check date', () => {
    vi.mocked(useAuditChecklist).mockReturnValue({
      items: mockItems,
      isLoading: false,
      updateItem: vi.fn(),
    })

    render(<AuditChecklist />)

    const calltrackingItem = screen.getByTestId('audit-item-calltracking')
    expect(calltrackingItem).toHaveTextContent('Просрочено')
    expect(calltrackingItem).toHaveTextContent('Не проверялось')
  })

  it('shows last check date for checked items', () => {
    vi.mocked(useAuditChecklist).mockReturnValue({
      items: [mockItems[0]],
      isLoading: false,
      updateItem: vi.fn(),
    })

    render(<AuditChecklist />)

    const metricaItem = screen.getByTestId('audit-item-metrica-webvisor')
    expect(metricaItem).toHaveTextContent('01.04.2026')
  })

  it('calls updateItem when "Проверено" button is clicked', () => {
    const updateItem = vi.fn()
    vi.mocked(useAuditChecklist).mockReturnValue({
      items: mockItems,
      isLoading: false,
      updateItem,
    })

    render(<AuditChecklist />)

    const buttons = screen.getAllByRole('button', { name: /Проверено/i })
    fireEvent.click(buttons[0])
    expect(updateItem).toHaveBeenCalledWith(
      'metrica-webvisor',
      expect.any(String),
      'ok'
    )
  })

  it('shows overdue count banner when items are overdue', () => {
    vi.mocked(useAuditChecklist).mockReturnValue({
      items: mockItems,
      isLoading: false,
      updateItem: vi.fn(),
    })

    render(<AuditChecklist />)

    expect(screen.getByText(/проверок просрочено/i)).toBeInTheDocument()
  })

  it('does not show overdue banner when all items are current', () => {
    vi.mocked(useAuditChecklist).mockReturnValue({
      items: [
        {
          id: 'fresh',
          label: 'Fresh item',
          lastCheckedDate: new Date().toISOString().slice(0, 10),
          status: 'ok',
          intervalDays: 60,
        },
      ],
      isLoading: false,
      updateItem: vi.fn(),
    })

    render(<AuditChecklist />)

    expect(screen.queryByText(/просрочено/i)).not.toBeInTheDocument()
  })

  it('shows loading state', () => {
    vi.mocked(useAuditChecklist).mockReturnValue({
      items: [],
      isLoading: true,
      updateItem: vi.fn(),
    })

    render(<AuditChecklist />)

    expect(screen.getByText('Загрузка…')).toBeInTheDocument()
  })
})
