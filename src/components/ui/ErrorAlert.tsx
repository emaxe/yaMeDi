import { AlertTriangle, RefreshCw } from 'lucide-react'

import { cn } from '../../lib/utils'

interface ErrorAlertProps {
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorAlert({ message, onRetry, className }: ErrorAlertProps) {
  return (
    <div className={cn('bg-red-900/30 border border-red-700 rounded-xl p-4 flex items-center gap-3 text-red-200', className)}>
      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-700/40 hover:bg-red-700/60 rounded-lg transition"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          Повторить
        </button>
      )}
    </div>
  )
}
