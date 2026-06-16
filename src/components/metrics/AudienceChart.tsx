import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

import { getAudience, useStatsComparison } from '../../api/metrica'
import { alignByIndex, transformMetricaData } from '../../lib/chartData'
import { CHART_COLORS, gridStyle, labelStyle, tooltipStyle, axisStroke, tickStyle, legendStyle } from '../../lib/chartTheme'
import { exportToCsv } from '../../lib/csvExport'
import { formatMetricValue } from '../../lib/metrics'
import { type ChartDataPoint } from '../../types'
import { MobileChartContainer } from '../mobile/MobileChartContainer'
import { DashboardWidget } from '../ui/DashboardWidget'

interface AudienceChartProps {
  counterId: number
  dateFrom: string
  dateTo: string
}

const NEW_USERS_KEY = 'ym:s:newUsers'
const USERS_KEY = 'ym:s:users'
const RETURNING_USERS_KEY = 'returningUsers'

export function AudienceChart({ counterId, dateFrom, dateTo }: AudienceChartProps) {
  const { current, previous } = useStatsComparison(
    counterId,
    { from: dateFrom, to: dateTo },
    getAudience,
    'audience'
  )

  const enrich = (points: ChartDataPoint[]) =>
    points.map((p) => ({
      ...p,
      [RETURNING_USERS_KEY]: Number(p[USERS_KEY] ?? 0) - Number(p[NEW_USERS_KEY] ?? 0),
    }))

  const currentData = enrich(transformMetricaData(current.data, 'date'))
  const previousData = enrich(transformMetricaData(previous.data, 'date'))
  const data = alignByIndex(currentData, previousData, [NEW_USERS_KEY, RETURNING_USERS_KEY], 'date')

  function handleExport() {
    if (!currentData.length) return
    exportToCsv(
      `audience-${dateFrom}-${dateTo}.csv`,
      [
        { key: 'date', label: 'Дата' },
        { key: NEW_USERS_KEY, label: 'Новые пользователи' },
        { key: RETURNING_USERS_KEY, label: 'Вернувшиеся пользователи' },
      ],
      currentData
    )
  }

  return (
    <DashboardWidget
      title="Аудитория"
      subtitle="Новые и вернувшиеся пользователи"
      isLoading={current.isLoading && !current.data}
      error={current.error as Error | null}
      onRetry={() => current.refetch()}
      onExport={handleExport}
    >
      <MobileChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="date" {...axisStroke} tick={tickStyle} />
            <YAxis {...axisStroke} tick={tickStyle} />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={labelStyle}
              itemStyle={labelStyle}
              formatter={(value: number) => formatMetricValue(value)}
            />
            <Legend {...legendStyle} />
            <Area
              type="monotone"
              dataKey={NEW_USERS_KEY}
              stackId="1"
              stroke={CHART_COLORS.primary}
              fill={CHART_COLORS.primarySoft}
              name="Новые пользователи"
            />
            <Area
              type="monotone"
              dataKey={RETURNING_USERS_KEY}
              stackId="1"
              stroke={CHART_COLORS.secondary}
              fill={CHART_COLORS.secondarySoft}
              name="Вернувшиеся пользователи"
            />
          </AreaChart>
        </ResponsiveContainer>
      </MobileChartContainer>
    </DashboardWidget>
  )
}
