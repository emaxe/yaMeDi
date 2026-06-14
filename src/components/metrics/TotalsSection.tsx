import { StatCard } from '../ui/StatCard'

interface TotalsSectionProps {
  metrics: string[]
  totals: number[]
}

export function TotalsSection({ metrics, totals }: TotalsSectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, i) => (
        <StatCard
          key={m}
          label={m.replace('ym:s:', '')}
          value={Number(totals[i]).toLocaleString('ru-RU', { maximumFractionDigits: 2 })}
        />
      ))}
    </div>
  )
}
