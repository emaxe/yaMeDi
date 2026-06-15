import { X } from 'lucide-react'
import { useEffect } from 'react'

import { useApp } from '../../hooks/useApp'
import { navigationItems } from '../../lib/navigation'
import { cn } from '../../lib/utils'

export function MobileDrawer() {
  const { activeTab, setActiveTab, selectedCounter, isDrawerOpen, setDrawerOpen } = useApp()

  useEffect(() => {
    if (!isDrawerOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setDrawerOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDrawerOpen, setDrawerOpen])

  return (
    <>
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}
      <div
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-[280px] sm:w-[320px]',
          'bg-shell-base/95 backdrop-blur-shell border-r border-white/10 lg:hidden',
          'transition-transform duration-300 ease-standard',
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-hidden={!isDrawerOpen}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-white/10">
          <span className="text-title-md text-on-shell">Yandex Dashboard</span>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="p-2 text-on-shell/70 hover:text-on-shell rounded-md hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus"
            aria-label="Закрыть меню"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="p-3 space-y-1" aria-label="Мобильная навигация">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const disabled = item.requiresCounter && !selectedCounter
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (disabled) return
                  setActiveTab(item.id)
                  setDrawerOpen(false)
                }}
                disabled={disabled}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-body-sm transition',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus',
                  isActive
                    ? 'bg-primary text-on-primary'
                    : 'text-on-shell/70 hover:bg-white/10 hover:text-on-shell',
                  disabled && 'opacity-40 cursor-not-allowed'
                )}
                aria-current={isActive ? 'page' : undefined}
                aria-disabled={disabled ? 'true' : undefined}
                title={disabled ? 'Сначала выберите счётчик' : undefined}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>
    </>
  )
}
