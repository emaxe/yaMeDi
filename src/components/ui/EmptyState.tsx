import { Inbox } from 'lucide-react'

import { cn } from '../../lib/utils'

interface EmptyStateProps {
  message: string
  hint?: string
  className?: string
}

export function EmptyState({ message, hint, className }: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12 px-4', className)}>
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-soft border border-outline mb-4">
        <Inbox className="w-6 h-6 text-on-surface-muted" aria-hidden="true" />
      </div>
      <p className="text-body-md font-medium text-on-surface">{message}</p>
      {hint && <p className="text-body-sm text-on-surface-muted mt-2 max-w-md mx-auto">{hint}</p>}
    </div>
  )
}
