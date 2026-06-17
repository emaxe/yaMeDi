import { formatMetricValue } from '../../lib/metrics'
import { cn } from '../../lib/utils'
import type { DataTableColumn, DataTableRow } from '../ui/DataTable'

interface MobileListCardProps {
  columns: DataTableColumn[]
  rows: DataTableRow[]
  maxRows?: number
  className?: string
}

export function MobileListCard({ columns, rows, maxRows, className }: MobileListCardProps) {
  const displayRows = maxRows ? rows.slice(0, maxRows) : rows
  const primaryColumn = columns[0]
  const secondaryColumns = columns.slice(1)

  if (!primaryColumn) return null

  return (
    <div className={cn('space-y-3 md:hidden', className)}>
      {displayRows.map((row, index) => (
        <div
          key={row.name || index}
          className="bg-surface-elevated rounded-lg border border-outline shadow-subtle p-4"
        >
          <div className="font-medium text-on-background text-body-md mb-2">
            {String(row[primaryColumn.key] ?? '—')}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {secondaryColumns.map((column) => (
              <div key={column.key} className="text-body-sm">
                <span className="text-on-surface-muted">{column.label}: </span>
                <span className={cn('font-medium', column.align === 'right' && 'ml-auto')}>
                  {typeof row[column.key] === 'string'
                    ? row[column.key]
                    : formatMetricValue(Number(row[column.key] ?? 0), column.metric)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
