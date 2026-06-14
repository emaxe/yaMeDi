import { cn } from '../../lib/utils'

type StatusVariant =
  | 'mock'
  | 'planned'
  | 'development'
  | 'integrated'
  | 'production'

interface StatusBadgeProps {
  variant: StatusVariant
  children: React.ReactNode
  className?: string
}

const styles: Record<StatusVariant, string> = {
  mock: 'bg-status-mock-bg text-status-mock-fg',
  planned: 'bg-status-planned-bg text-status-planned-fg',
  development: 'bg-status-development-bg text-status-development-fg',
  integrated: 'bg-status-integrated-bg text-status-integrated-fg',
  production: 'bg-status-production-bg text-status-production-fg',
}

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-pill text-label-sm',
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
