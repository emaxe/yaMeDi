import { clsx, type ClassValue } from 'clsx'
import { Key, Activity, BarChart3, LineChart, Target } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface SidebarProps {
  active: string
  onNavigate: (id: string) => void
  hasSelectedCounter: boolean
}

const items = [
  { id: 'token', label: 'Токен', icon: Key },
  { id: 'diagnostics', label: 'Диагностика', icon: Activity },
  { id: 'counters', label: 'Счётчики', icon: BarChart3 },
  { id: 'metrics', label: 'Графики', icon: LineChart, requiresCounter: true },
  { id: 'campaigns', label: 'Кампании', icon: Target },
]

export default function Sidebar({ active, onNavigate, hasSelectedCounter }: SidebarProps) {
  return (
    <aside className="w-64 bg-yandex-card border-r border-yandex-border flex flex-col">
      <div className="p-6 border-b border-yandex-border">
        <h1 className="text-xl font-bold text-white">Yandex Dashboard</h1>
        <p className="text-xs text-gray-400 mt-1">Метрика & Директ</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const Icon = item.icon
          const disabled = item.requiresCounter && !hasSelectedCounter
          return (
            <button
              key={item.id}
              onClick={() => !disabled && onNavigate(item.id)}
              disabled={disabled}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition',
                active === item.id
                  ? 'bg-yandex-yellow/10 text-yandex-yellow'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white',
                disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-gray-400'
              )}
              title={disabled ? 'Сначала выберите счётчик' : undefined}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-yandex-border text-xs text-gray-500">
        Desktop App v1.0.0
      </div>
    </aside>
  )
}
