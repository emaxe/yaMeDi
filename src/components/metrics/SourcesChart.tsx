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
          <CartesianGrid strokeDasharray="3 3" stroke="#e3e0dd" />
          <XAxis dataKey="name" stroke="#797067" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
          <YAxis stroke="#797067" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e3e0dd', borderRadius: '8px' }}
            labelStyle={{ color: '#423d38' }}
            itemStyle={{ color: '#423d38' }}
          />
          <Legend />
          <Bar dataKey="ym:s:visits" fill="rgba(254, 110, 0, 0.60)" name="Визиты" radius={[4, 4, 0, 0]} />
          <Bar dataKey="ym:s:users" fill="rgba(48, 128, 255, 0.60)" name="Посетители" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
