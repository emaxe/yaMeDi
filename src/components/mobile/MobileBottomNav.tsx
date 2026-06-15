import { useApp } from '../../hooks/useApp'
import { frequentNavItems } from '../../lib/navigation'
import { cn } from '../../lib/utils'

export function MobileBottomNav() {
  const { activeTab, setActiveTab, selectedCounter } = useApp()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-shell-base/70 backdrop-blur-shell border-t border-white/10 pb-safe">
      <div className="flex h-16 items-center justify-around">
        {frequentNavItems.map((item) => {
          const Icon = item.icon
          const disabled = item.requiresCounter && !selectedCounter
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => !disabled && setActiveTab(item.id)}
              disabled={disabled}
              className={cn(
                'flex flex-col items-center justify-center gap-1 min-w-[4rem] py-2 px-3 rounded-md transition',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus',
                isActive ? 'text-primary' : 'text-on-shell/70 hover:text-on-shell',
                disabled && 'opacity-40 cursor-not-allowed'
              )}
              aria-current={isActive ? 'page' : undefined}
              aria-disabled={disabled ? 'true' : undefined}
              title={disabled ? 'Сначала выберите счётчик' : undefined}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span className="text-[0.6875rem] leading-3 font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
