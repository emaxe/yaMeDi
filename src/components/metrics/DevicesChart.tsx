import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

import { type ChartDataPoint } from '../../types'
import { ChartCard } from '../ui/ChartCard'

const COLORS = ['#fe6e00', '#ffb74d', '#ff6b00', '#3080ff', '#00c758', '#fb2c36']

interface DevicesChartProps {
  data: ChartDataPoint[]
}

export function DevicesChart({ data }: DevicesChartProps) {
  return (
    <ChartCard title="Устройства">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="ym:s:visits"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e3e0dd', borderRadius: '8px' }}
              itemStyle={{ color: '#423d38' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex items-center">
          <div className="space-y-3 w-full">
            {data.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-body-sm text-on-surface">{d.name}</span>
                </div>
                <div className="text-body-sm font-medium text-on-background">
                  {Number(d['ym:s:visits']).toLocaleString('ru-RU')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ChartCard>
  )
}
