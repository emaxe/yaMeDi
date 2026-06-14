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
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yandex-card border border-yandex-border mb-4">
        <Inbox className="w-6 h-6 text-gray-400" aria-hidden="true" />
      </div>
      <p className="text-gray-300 font-medium">{message}</p>
      {hint && <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">{hint}</p>}
    </div>
  )
}
