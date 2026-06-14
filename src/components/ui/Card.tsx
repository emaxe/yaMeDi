import { cn } from '../../lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface-elevated rounded-lg border border-outline shadow-subtle',
        className,
      )}
    >
      {children}
    </div>
  )
}
