import { Card } from './Card'

interface ChartCardProps {
  title: string
  children: React.ReactNode
}

export function ChartCard({ title, children }: ChartCardProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-on-background mb-4">{title}</h3>
      {children}
    </Card>
  )
}
