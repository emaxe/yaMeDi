import { type ChartDataPoint, type MetricaData } from '../types'

export function transformMetricaData(
  data: MetricaData | undefined,
  dimensionKey: 'date' | 'name'
): ChartDataPoint[] {
  if (!data?.data) return []
  const metrics = data.query.metrics
  return data.data.map((row) => {
    const value = row.dimensions[0]?.name || ''
    const point: ChartDataPoint = { [dimensionKey]: value }
    row.metrics.forEach((v, i) => {
      point[metrics[i]] = v
    })
    return point
  })
}

export function buildComparisonData(
  current: ChartDataPoint[],
  previous: ChartDataPoint[],
  dimensionKey: 'date' | 'name',
  metricKeys: string[]
): ChartDataPoint[] {
  const previousByKey = new Map(previous.map((p) => [String(p[dimensionKey]), p]))
  return current.map((point) => {
    const key = String(point[dimensionKey])
    const prev = previousByKey.get(key)
    const merged: ChartDataPoint = { ...point }
    for (const metric of metricKeys) {
      merged[`prev:${metric}`] = prev?.[metric]
    }
    return merged
  })
}

export function getTotalsByMetric(data: MetricaData | undefined, metricKey: string): number {
  if (!data) return 0
  const index = data.query.metrics.indexOf(metricKey)
  if (index === -1) return 0
  return data.totals[index] ?? 0
}

export function alignByIndex(
  current: ChartDataPoint[],
  previous: ChartDataPoint[],
  metricKeys: string[],
  dimensionKey: 'date' | 'name'
): ChartDataPoint[] {
  return current.map((point, index) => {
    const prev = previous[index]
    const merged: ChartDataPoint = { [dimensionKey]: point[dimensionKey] }
    for (const metric of metricKeys) {
      merged[metric] = point[metric]
      merged[`prev:${metric}`] = prev?.[metric]
    }
    return merged
  })
}

export function getMetricIndex(data: MetricaData | undefined, metricKey: string): number {
  if (!data) return -1
  return data.query.metrics.indexOf(metricKey)
}
