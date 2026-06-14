import { ArrowDown, ArrowUp } from 'lucide-react'
import { useMemo, useState } from 'react'

import { formatMetricValue } from '../../lib/metrics'
import { cn } from '../../lib/utils'

export type DataTableColumn = {
  key: string
  label: string
  metric?: string
  align?: 'left' | 'right'
  sortable?: boolean
}

export type DataTableRow = {
  name?: string
  [key: string]: string | number | undefined
}

interface DataTableProps {
  columns: DataTableColumn[]
  rows: DataTableRow[]
  maxRows?: number
  className?: string
}

export function DataTable({ columns, rows, maxRows, className }: DataTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows
    return [...rows].sort((a, b) => {
      const aValue = a[sortKey] ?? 0
      const bValue = b[sortKey] ?? 0
      const aNum = typeof aValue === 'string' ? parseFloat(aValue) : aValue
      const bNum = typeof bValue === 'string' ? parseFloat(bValue) : bValue
      const direction = sortDirection === 'asc' ? 1 : -1
      if (aNum < bNum) return -1 * direction
      if (aNum > bNum) return 1 * direction
      return 0
    })
  }, [rows, sortKey, sortDirection])

  const displayRows = maxRows ? sortedRows.slice(0, maxRows) : sortedRows

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDirection('desc')
    }
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-body-md">
        <thead>
          <tr className="border-b border-outline">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'py-2 px-3 text-left text-label-sm uppercase text-on-surface-muted font-medium',
                  column.align === 'right' && 'text-right',
                  column.sortable && 'cursor-pointer select-none hover:text-on-background'
                )}
                onClick={column.sortable ? () => handleSort(column.key) : undefined}
              >
                <span className="inline-flex items-center gap-1">
                  {column.label}
                  {column.sortable && sortKey === column.key && (
                    <span className="text-primary">
                      {sortDirection === 'asc' ? (
                        <ArrowUp className="w-3 h-3" aria-hidden="true" />
                      ) : (
                        <ArrowDown className="w-3 h-3" aria-hidden="true" />
                      )}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row, index) => (
            <tr key={row.name || index} className="border-b border-outline last:border-0">
              {columns.map((column) => {
                const value = row[column.key]
                const isFirst = column.key === 'name'
                return (
                  <td
                    key={column.key}
                    className={cn(
                      'py-2 px-3',
                      column.align === 'right' && 'text-right',
                      isFirst ? 'text-on-background' : 'text-on-surface'
                    )}
                  >
                    {isFirst
                      ? String(value ?? '—')
                      : formatMetricValue(Number(value ?? 0), column.metric)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
