import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useOperationalReport } from '../hooks/useOperationalReport'
import type { OperationalReportData } from '../lib/operationalReport'

import OperationalReport from './OperationalReport'

vi.mock('../hooks/useOperationalReport', () => ({
  useOperationalReport: vi.fn(),
}))

function createMockData(): OperationalReportData {
  return {
    rows: [
      {
        name: 'W1 (01.01–07.01)',
        weekLabel: 'W1 (01.01–07.01)',
        weekStart: '2024-01-01',
        weekEnd: '2024-01-07',
        days: ['2024-01-01', '2024-01-02'],
        revenue: 3000,
        orders: 30,
        visits: 300,
        totalCost: 150,
        totalConversions: 15,
        directRevenue: 1200,
        directOrders: 12,
        directCost: 150,
        directConversions: 15,
        seoRevenue: 700,
        seoOrders: 7,
        seoVisits: 110,
        cartEvents: 15,
        leads: 10,
        leadRequests: 50,
        averageCheck: 100,
        cpa: 10,
        drr: 0.05,
        romi: 19,
        directAverageCheck: 100,
        directCpa: 10,
        seoAverageCheck: 100,
        seoTraffic: 110,
        c1: 0.05,
        c2: 0.1,
        c3: 0.5,
        cplRequest: 3,
        cplQualified: 15,
      },
    ],
    total: {
      name: 'Итого',
      weekLabel: 'Итого',
      weekStart: '',
      weekEnd: '',
      days: [],
      revenue: 3000,
      orders: 30,
      visits: 300,
      totalCost: 150,
      totalConversions: 15,
      directRevenue: 1200,
      directOrders: 12,
      directCost: 150,
      directConversions: 15,
      seoRevenue: 700,
      seoOrders: 7,
      seoVisits: 110,
      cartEvents: 15,
      leads: 10,
      leadRequests: 50,
      averageCheck: 100,
      cpa: 10,
      drr: 0.05,
      romi: 19,
      directAverageCheck: 100,
      directCpa: 10,
      seoAverageCheck: 100,
      seoTraffic: 110,
      c1: 0.05,
      c2: 0.1,
      c3: 0.5,
      cplRequest: 3,
      cplQualified: 15,
    },
  }
}

describe('OperationalReport', () => {
  it('renders header, project selector and date picker', () => {
    vi.mocked(useOperationalReport).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useOperationalReport>)

    render(<OperationalReport />)

    expect(screen.getByRole('heading', { name: 'Операционный отчёт' })).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getAllByLabelText(/начало|конец/i).length).toBeGreaterThanOrEqual(1)
  })

  it('shows loading state while data is loading', () => {
    vi.mocked(useOperationalReport).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useOperationalReport>)

    render(<OperationalReport />)

    expect(screen.getByText('Операционные показатели')).toBeInTheDocument()
  })

  it('renders transposed metrics as rows and periods as columns', () => {
    vi.mocked(useOperationalReport).mockReturnValue({
      data: createMockData(),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useOperationalReport>)

    render(<OperationalReport />)

    const table = screen.getByTestId('operational-report-table')

    // Периоды теперь в шапке (столбцы): неделя W1 и «Итого».
    const headerCells = within(table).getAllByRole('columnheader')
    const headerTexts = headerCells.map((cell) => cell.textContent)
    expect(headerTexts).toContain('Показатель')
    expect(headerTexts).toContain('W1 (01.01–07.01)')
    expect(headerTexts).toContain('Итого')

    // Метрики стали строками: «Выручка» присутствует в теле таблицы.
    expect(within(table).getByRole('cell', { name: 'Выручка' })).toBeInTheDocument()

    // Значение «Выручка» (3 000,00 ₽) присутствует в обоих периодах-столбцах.
    const revenueCells = within(table).getAllByText('3 000,00 ₽')
    expect(revenueCells.length).toBeGreaterThanOrEqual(2)
  })

  it('hides C1, C2, C3 metric rows', () => {
    vi.mocked(useOperationalReport).mockReturnValue({
      data: createMockData(),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useOperationalReport>)

    render(<OperationalReport />)

    const table = screen.getByTestId('operational-report-table')
    expect(within(table).queryByText('C1')).not.toBeInTheDocument()
    expect(within(table).queryByText('C2')).not.toBeInTheDocument()
    expect(within(table).queryByText('C3')).not.toBeInTheDocument()
  })

  it('places source-specific and total rows at the bottom of the table', () => {
    vi.mocked(useOperationalReport).mockReturnValue({
      data: createMockData(),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useOperationalReport>)

    render(<OperationalReport />)

    const table = screen.getByTestId('operational-report-table')
    const bodyRows = within(table).getAllByRole('row').slice(1) // пропустить шапку
    const rowLabels = bodyRows.map((row) => within(row).getAllByRole('cell')[0]?.textContent ?? '')

    // Последние 8 строк — перенесённые вниз.
    const bottomLabels = rowLabels.slice(-8)
    expect(bottomLabels).toEqual([
      'Direct выручка',
      'Direct заказы',
      'Direct расход',
      'SEO выручка',
      'SEO заказы',
      'SEO трафик',
      'Выручка',
      'Заказы',
    ])

    // «Визиты» — первая строка.
    expect(rowLabels[0]).toBe('Визиты')
  })

  it('shows error state and retry button', () => {
    const refetch = vi.fn()
    vi.mocked(useOperationalReport).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Fetch failed'),
      refetch,
    } as unknown as ReturnType<typeof useOperationalReport>)

    render(<OperationalReport />)

    expect(screen.getByText(/Fetch failed/i)).toBeInTheDocument()
    const retryButton = screen.getByRole('button', { name: /повторить/i })
    fireEvent.click(retryButton)
    expect(refetch).toHaveBeenCalled()
  })
})
