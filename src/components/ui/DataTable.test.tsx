import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { DataTable } from './DataTable'

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'value', label: 'Value', align: 'right' as const, sortable: true },
]

const rows = [
  { name: 'Alice', value: 30 },
  { name: 'Bob', value: 10 },
  { name: 'Charlie', value: 20 },
]

describe('DataTable', () => {
  it('renders headers and rows', () => {
    render(<DataTable columns={columns} rows={rows} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('limits rows when maxRows is set', () => {
    render(<DataTable columns={columns} rows={rows} maxRows={2} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument()
  })

  it('sorts rows by column on header click', async () => {
    const user = userEvent.setup()
    render(<DataTable columns={columns} rows={rows} />)
    await user.click(screen.getByText('Value'))
    const cells = screen.getAllByRole('cell')
    expect(cells[cells.length - 2]).toHaveTextContent('Bob')
  })
})
