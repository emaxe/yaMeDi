import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

import { type ChartDataPoint } from '../../types'
import { ChartCard } from '../ui/ChartCard'

interface TrafficChartProps {
  data: ChartDataPoint[]
}

export function TrafficChart({ data }: TrafficChartProps) {
  return (
    <ChartCard title="Трафик по дням">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#0f3460" />
          <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
          <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#16213e', border: '1px solid #0f3460', borderRadius: '8px' }}
            labelStyle={{ color: '#fff' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend />
          <Line type="monotone" dataKey="ym:s:visits" stroke="#FFCC00" name="Визиты" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="ym:s:pageviews" stroke="#4ECDC4" name="Просмотры" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="ym:s:users" stroke="#FF6B6B" name="Посетители" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
