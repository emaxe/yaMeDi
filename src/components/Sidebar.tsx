import { Activity, BarChart3, Key, LineChart, Target } from 'lucide-react'

import { useApp } from '../hooks/useApp'
import { cn } from '../lib/utils'

const items = [
  { id: 'token', label: 'Токен', icon: Key },
  { id: 'diagnostics', label: 'Диагностика', icon: Activity },
  { id: 'counters', label: 'Счётчики', icon: BarChart3 },
  { id: 'metrics', label: 'Графики', icon: LineChart, requiresCounter: true },
  { id: 'campaigns', label: 'Кампании', icon: Target },
]

export default function Sidebar() {
  const { activeTab, setActiveTab, selectedCounter } = useApp()

  return (
    <aside
      className={cn(
        'w-64 shrink-0 flex flex-col',
        'bg-shell-base/70 backdrop-blur-shell border-r border-white/10',
      )}
    >
      <div className="p-4">
        <p className="text-body-sm text-on-shell/50">Метрика & Директ</p>
      </div>

      <nav className="flex-1 p-3 space-y-1" aria-label="Основная навигация">
        {items.map((item) => {
          const Icon = item.icon
          const disabled = item.requiresCounter && !selectedCounter
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => !disabled && setActiveTab(item.id)}
              disabled={disabled}
              aria-current={isActive ? 'page' : undefined}
              aria-disabled={disabled ? 'true' : undefined}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-body-sm transition',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus',
                isActive
                  ? 'bg-primary text-on-primary'
                  : 'text-on-shell/70 hover:bg-white/10 hover:text-on-shell',
                disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-on-shell/70'
              )}
              title={disabled ? 'Сначала выберите счётчик' : undefined}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="p-4 text-body-sm text-on-shell/50">
        Desktop App v1.0.0
      </div>
    </aside>
  )
}
