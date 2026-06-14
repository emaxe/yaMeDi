import { ArrowDown, ArrowUp, Minus } from 'lucide-react'

import { calculateDelta, formatDelta } from '../../lib/metrics'
import { cn } from '../../lib/utils'

interface MetricDeltaProps {
  current: number
  previous: number
  inverse?: boolean
  className?: string
}

export function MetricDelta({ current, previous, inverse, className }: MetricDeltaProps) {
  if (previous === 0 && current === 0) {
    return (
      <span className={cn('inline-flex items-center gap-1 text-body-sm text-on-surface-muted', className)}>
        <Minus className="w-3 h-3" aria-hidden="true" />
        <span>—</span>
      </span>
    )
  }

  const { value, isPositive } = calculateDelta(current, previous)
  const isGood = inverse ? !isPositive : isPositive

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-body-sm font-medium',
        isGood ? 'text-success' : 'text-danger',
        className
      )}
    >
      {isPositive ? (
        <ArrowUp className="w-3 h-3" aria-hidden="true" />
      ) : (
        <ArrowDown className="w-3 h-3" aria-hidden="true" />
      )}
      <span>{formatDelta(value)}</span>
    </span>
  )
}
