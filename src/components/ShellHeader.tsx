import { Search, Settings } from 'lucide-react'

import { cn } from '../lib/utils'

export function ShellHeader() {
  return (
    <header
      className={cn(
        'h-16 shrink-0 flex items-center gap-4 px-4',
        'bg-shell-base/70 backdrop-blur-shell border-b border-white/10',
      )}
    >
      <div className="flex items-center gap-2 text-on-shell">
        <span className="text-title-md">Yandex Dashboard</span>
      </div>

      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-shell/50"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Поиск..."
            className={cn(
              'w-full h-9 pl-9 pr-3 rounded-sm',
              'bg-white/10 text-on-shell placeholder:text-on-shell/50',
              'text-body-md',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus',
            )}
          />
        </div>
      </div>

      <button
        type="button"
        className={cn(
          'w-10 h-10 rounded-md flex items-center justify-center',
          'text-on-shell/70 hover:bg-white/10 hover:text-on-shell',
          'transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus',
        )}
        aria-label="Настройки"
      >
        <Settings className="w-5 h-5" aria-hidden="true" />
      </button>
    </header>
  )
}
