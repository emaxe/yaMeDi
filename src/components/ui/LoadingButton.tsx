import { Loader2 } from 'lucide-react'

import { cn } from '../../lib/utils'

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingText?: string
  children: React.ReactNode
}

export function LoadingButton({
  loading = false,
  loadingText = 'Загрузка...',
  children,
  className,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'flex items-center justify-center gap-2 px-4 py-2 bg-yandex-yellow text-black rounded-lg font-medium hover:brightness-110 transition disabled:opacity-50',
        className
      )}
      aria-busy={loading ? 'true' : 'false'}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : null}
      {loading ? loadingText : children}
    </button>
  )
}
