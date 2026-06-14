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
          <CartesianGrid strokeDasharray="3 3" stroke="#e3e0dd" />
          <XAxis dataKey="date" stroke="#797067" tick={{ fontSize: 12 }} />
          <YAxis stroke="#797067" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e3e0dd', borderRadius: '8px' }}
            labelStyle={{ color: '#423d38' }}
            itemStyle={{ color: '#423d38' }}
          />
          <Legend />
          <Line type="monotone" dataKey="ym:s:visits" stroke="#fe6e00" name="Визиты" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="ym:s:pageviews" stroke="#3080ff" name="Просмотры" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="ym:s:users" stroke="#00c758" name="Посетители" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
