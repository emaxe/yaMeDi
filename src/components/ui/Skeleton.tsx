import { cn } from '../../lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('animate-pulse rounded-lg bg-surface-soft', className)} />
}

interface SkeletonCardProps {
  className?: string
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn('bg-surface-elevated rounded-lg border border-outline p-4', className)}>
      <div className="space-y-3">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}

interface SkeletonChartProps {
  className?: string
}

export function SkeletonChart({ className }: SkeletonChartProps) {
  return (
    <div className={cn('bg-surface-elevated rounded-lg border border-outline p-6', className)}>
      <Skeleton className="h-6 w-1/4 mb-4" />
      <Skeleton className="h-[300px] w-full" />
    </div>
  )
}
