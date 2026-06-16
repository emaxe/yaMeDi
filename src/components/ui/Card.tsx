import { cn } from '../../lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        'bg-surface-elevated rounded-lg border border-outline shadow-subtle',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  )
}
