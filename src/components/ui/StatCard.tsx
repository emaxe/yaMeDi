import type { ReactNode } from 'react'

import { Card } from './Card'

interface StatCardProps {
  label: string
  value: string | number
  subtitle?: ReactNode
}

export function StatCard({ label, value, subtitle }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="text-label-sm uppercase text-on-surface-muted mb-1">{label}</div>
      <div className="text-headline-lg text-on-background">{value}</div>
      {subtitle && <div className="mt-1">{subtitle}</div>}
    </Card>
  )
}
