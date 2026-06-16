export const CHART_COLORS = {
  primary: '#fe6e00',
  primarySoft: 'rgba(254, 110, 0, 0.60)',
  primaryLight: '#ffb74d',
  secondary: '#3080ff',
  secondarySoft: 'rgba(48, 128, 255, 0.60)',
  success: '#00c758',
  successSoft: 'rgba(0, 199, 88, 0.60)',
  warning: '#edb200',
  danger: '#fb2c36',
  muted: '#797067',
  grid: '#e3e0dd',
  text: '#423d38',
  background: '#ffffff',
}

export const PIE_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.primaryLight,
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.success,
  CHART_COLORS.danger,
  CHART_COLORS.warning,
]

export const tooltipStyle = {
  backgroundColor: CHART_COLORS.background,
  border: `1px solid ${CHART_COLORS.grid}`,
  borderRadius: '8px',
}

export const labelStyle = { color: CHART_COLORS.text }
export const itemStyle = { color: CHART_COLORS.text }
export const axisStroke = { stroke: CHART_COLORS.muted }
export const tickStyle = { fontSize: 12 }

import type { CSSProperties } from 'react'

export const gridStyle = { strokeDasharray: '3 3', stroke: CHART_COLORS.grid }

export const legendStyle = {
  wrapperStyle: {
    paddingTop: 12,
    fontSize: 12,
    lineHeight: '1.2',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '0 16px',
  } satisfies CSSProperties,
}

export const pieLabel = ({ percent }: { percent: number }) => {
  if (percent < 0.05) return null
  return `${(percent * 100).toFixed(0)}%`
}

export function previousPeriodColor(baseColor: string): string {
  if (baseColor.startsWith('rgba(')) {
    const match = baseColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/)
    if (!match) return baseColor
    return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${Math.max(Number(match[4]) * 0.5, 0.2)})`
  }
  return `${baseColor}80`
}
