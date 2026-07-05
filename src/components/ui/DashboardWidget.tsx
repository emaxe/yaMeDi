import { Download, FileSpreadsheet, FileText, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { type ExportFormat } from '../../lib/dataExport'
import { cn } from '../../lib/utils'

import { Card } from './Card'
import { SkeletonChart } from './Skeleton'

interface DashboardWidgetProps {
  title: string
  subtitle?: ReactNode
  isLoading: boolean
  error?: Error | null
  onRetry?: () => void
  onExport?: (format: ExportFormat) => void
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
  const [exportOpen, setExportOpen] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!exportOpen) return
    function handleClickOutside(event: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setExportOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [exportOpen])

  function handleSelectFormat(format: ExportFormat) {
    setExportOpen(false)
    onExport?.(format)
  }

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
            <div ref={exportRef} className="relative">
              <button
                onClick={() => setExportOpen((v) => !v)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-md text-on-surface-muted hover:text-on-background hover:bg-surface-soft transition"
                title="Скачать данные"
                type="button"
                aria-label="Скачать данные"
                aria-haspopup="menu"
                aria-expanded={exportOpen}
              >
                <Download className="w-4 h-4" aria-hidden="true" />
              </button>
              {exportOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-9 z-10 min-w-[120px] rounded-md border border-outline bg-surface-elevated shadow-raised py-1"
                >
                  <button
                    onClick={() => handleSelectFormat('csv')}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-body-md text-on-surface hover:bg-surface-soft transition text-left"
                    role="menuitem"
                    type="button"
                  >
                    <FileText className="w-4 h-4 text-on-surface-muted" aria-hidden="true" />
                    CSV
                  </button>
                  <button
                    onClick={() => handleSelectFormat('xlsx')}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-body-md text-on-surface hover:bg-surface-soft transition text-left"
                    role="menuitem"
                    type="button"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-on-surface-muted" aria-hidden="true" />
                    XLSX
                  </button>
                  <button
                    onClick={() => handleSelectFormat('pdf')}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-body-md text-on-surface hover:bg-surface-soft transition text-left"
                    role="menuitem"
                    type="button"
                  >
                    <FileText className="w-4 h-4 text-on-surface-muted" aria-hidden="true" />
                    PDF
                  </button>
                </div>
              )}
            </div>
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
