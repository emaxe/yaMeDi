import { Activity, BarChart3, Key, LineChart, Target, TrendingUp, type LucideIcon } from 'lucide-react'

export type NavItem = {
  id: string
  label: string
  icon: LucideIcon
  requiresCounter?: boolean
  section: 'frequent' | 'rare'
}

export const navigationItems: NavItem[] = [
  { id: 'metrics', label: 'Графики', icon: LineChart, requiresCounter: true, section: 'frequent' },
  { id: 'counters', label: 'Счётчики', icon: BarChart3, section: 'frequent' },
  { id: 'campaigns', label: 'Кампании', icon: Target, section: 'frequent' },
  { id: 'company-analytics', label: 'Аналитика кампании', icon: TrendingUp, section: 'frequent' },
  { id: 'overall-analytics', label: 'Общая аналитика', icon: TrendingUp, section: 'frequent' },
  { id: 'operational-report', label: 'Операционный отчёт', icon: BarChart3, section: 'frequent' },
  { id: 'token', label: 'Токен', icon: Key, section: 'rare' },
  { id: 'diagnostics', label: 'Диагностика', icon: Activity, section: 'rare' },
]

export const frequentNavItems = navigationItems.filter((item) => item.section === 'frequent')
export const rareNavItems = navigationItems.filter((item) => item.section === 'rare')
