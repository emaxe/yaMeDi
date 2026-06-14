import { Card } from './Card'

interface StatCardProps {
  label: string
  value: string | number
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="text-label-sm uppercase text-on-surface-muted mb-1">{label}</div>
      <div className="text-headline-lg text-on-background">{value}</div>
    </Card>
  )
}
