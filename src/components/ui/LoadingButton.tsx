import { Loader2 } from 'lucide-react'

import { cn } from '../../lib/utils'

type ButtonVariant = 'primary' | 'ghost-shell'

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingText?: string
  variant?: ButtonVariant
  children: React.ReactNode
}

export function LoadingButton({
  loading = false,
  loadingText = 'Загрузка...',
  variant = 'primary',
  children,
  className,
  disabled,
  ...props
}: LoadingButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 h-10 px-4 text-label-md font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus disabled:opacity-50 disabled:cursor-not-allowed'

  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-primary text-on-primary rounded-sm hover:bg-primary-strong',
    'ghost-shell':
      'bg-transparent text-on-shell/70 rounded-md hover:bg-white/10 hover:text-on-shell',
  }

  return (
    <button
      disabled={disabled || loading}
      className={cn(baseStyles, variants[variant], className)}
      aria-busy={loading ? 'true' : 'false'}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : null}
      {loading ? loadingText : children}
    </button>
  )
}
