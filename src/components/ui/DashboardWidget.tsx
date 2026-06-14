import { Download, RotateCcw } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'

import { Card } from './Card'
import { SkeletonChart } from './Skeleton'

interface DashboardWidgetProps {
  title: string
  subtitle?: ReactNode
  isLoading: boolean
  error?: Error | null
  onRetry?: () => void
  onExport?: () => void
  children: ReactNode
  className?: string
}

export function DashboardWidget({
  title,
  subtitle,
  isLoading,
  error,
  onRetry,
  onExport,
  children,
  className,
}: DashboardWidgetProps) {
  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-title-md text-on-background">{title}</h3>
          {subtitle && <div className="text-body-sm text-on-surface-muted mt-1">{subtitle}</div>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onRetry && error && (
            <button
              onClick={onRetry}
              disabled={isLoading}
              className="inline-flex items-center justify-center w-8 h-8 rounded-md text-on-surface-muted hover:text-on-background hover:bg-surface-soft transition disabled:opacity-50"
              title="Повторить загрузку"
              type="button"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
          {onExport && (
            <button
              onClick={onExport}
              className="inline-flex items-center justify-center w-8 h-8 rounded-md text-on-surface-muted hover:text-on-background hover:bg-surface-soft transition"
              title="Скачать CSV"
              type="button"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {isLoading && !error ? (
        <SkeletonChart />
      ) : error ? (
        <div className="text-body-md text-danger">
          {error.message || 'Ошибка загрузки'}
        </div>
      ) : (
        children
      )}
    </Card>
  )
}
