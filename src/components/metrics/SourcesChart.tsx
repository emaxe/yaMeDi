import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

import { type ChartDataPoint } from '../../types'
import { ChartCard } from '../ui/ChartCard'

interface SourcesChartProps {
  data: ChartDataPoint[]
}

export function SourcesChart({ data }: SourcesChartProps) {
  return (
    <ChartCard title="Источники трафика">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data.slice(0, 10)}>
          <CartesianGrid strokeDasharray="3 3" stroke="#0f3460" />
          <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
          <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#16213e', border: '1px solid #0f3460', borderRadius: '8px' }}
            labelStyle={{ color: '#fff' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend />
          <Bar dataKey="ym:s:visits" fill="#FFCC00" name="Визиты" radius={[4, 4, 0, 0]} />
          <Bar dataKey="ym:s:users" fill="#4ECDC4" name="Посетители" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
