import { AlertTriangle, RefreshCw } from 'lucide-react'

import { cn } from '../../lib/utils'

interface ErrorAlertProps {
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorAlert({ message, onRetry, className }: ErrorAlertProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-danger/20 bg-danger/10 p-4 flex items-center gap-3 text-danger',
        className,
      )}
    >
      <AlertTriangle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
      <span className="flex-1 text-body-md">{message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-label-sm rounded-sm bg-danger text-on-primary hover:bg-danger/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          Повторить
        </button>
      )}
    </div>
  )
}
