# Evreghen Command Center redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Note:** The user explicitly requested **no commits**. Skip all commit steps and do not create git commits during execution.

**Goal:** Apply the Evreghen Command Center design system from `testApp/DESIGN.md` to the existing Yandex Metrics Dashboard, replacing the dark Yandex theme with a warm off-white workspace, a dark frosted-glass shell, and orange telemetry accents.

**Architecture:** The redesign is driven through an extended Tailwind theme and a small UI kit. The shell (`Sidebar`) is restyled as dark frosted glass; the workspace is recolored to warm off-white; analytical components use neutral surfaces (`surface-elevated`, `surface-soft`) and orange (`primary`) accents. No application functionality changes.

**Tech Stack:** React 18, TypeScript, Vite, Electron, Tailwind CSS 3.4, Recharts, React Query, `@testing-library/react`, Vitest.

---

## Plan overview

1. **Task 1:** Replace Tailwind config and global CSS with design tokens.
2. **Task 2:** Update neutral UI primitives (`Card`, `Skeleton`, `StatCard`, `ChartCard`).
3. **Task 3:** Update feedback and action primitives (`ErrorAlert`, `EmptyState`, `LoadingButton`).
4. **Task 4:** Add `Badge` and update `DateRangePicker`.
5. **Task 5:** Restyle the shell (`App.tsx`, `Sidebar.tsx`).
6. **Task 6:** Restyle `TokenSetup`.
7. **Task 7:** Restyle `CountersList`.
8. **Task 8:** Restyle `Diagnostics` and diagnostic sub-components.
9. **Task 9:** Restyle `Campaigns`.
10. **Task 10:** Restyle `MetricsDashboard` and metric charts.
11. **Task 11:** Run quality checks and manual visual verification.

---

### Task 1: Tailwind theme and global CSS

**Files:**
- Modify: `tailwind.config.js`
- Modify: `src/index.css`

- [ ] **Step 1: Replace `tailwind.config.js` with the full design token set.**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#fcfaf7',
        'on-background': '#423d38',
        surface: '#f3f4f6',
        'surface-soft': '#edebe9',
        'surface-elevated': '#ffffff',
        'on-surface': '#423d38',
        'on-surface-muted': '#797067',
        outline: '#e3e0dd',
        'outline-strong': '#d1d5dc',
        primary: '#fe6e00',
        'primary-strong': '#ff6b00',
        'primary-warm': '#ffb74d',
        'primary-focus': '#f97015',
        'on-primary': '#ffffff',
        'shell-base': '#000000',
        'on-shell': '#ffffff',
        'shell-border': '#ffffff',
        success: '#00c758',
        warning: '#edb200',
        danger: '#fb2c36',
        info: '#3080ff',
        'status-mock-bg': '#fef9c2',
        'status-mock-fg': '#874b00',
        'status-planned-bg': '#f3f4f6',
        'status-planned-fg': '#364153',
        'status-development-bg': '#dbeafe',
        'status-development-fg': '#1447e6',
        'status-integrated-bg': '#f3e8ff',
        'status-integrated-fg': '#8200da',
        'status-production-bg': '#dcfce7',
        'status-production-fg': '#016630',
        'dark-background': '#413830',
        'dark-surface': '#4a423a',
        'dark-on-surface': '#fafaf9',
        'dark-on-surface-muted': '#b9b3ac',
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        'display-hero': ['6rem', { lineHeight: '1', letterSpacing: '-0.025em', fontWeight: '600' }],
        'headline-xl': ['2rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em', fontWeight: '700' }],
        'headline-lg': ['1.5rem', { lineHeight: '2rem', fontWeight: '700' }],
        'title-md': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '700' }],
        'body-lg': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        'body-md': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
        'body-sm': ['0.8125rem', { lineHeight: '1rem', fontWeight: '700' }],
        'label-md': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }],
        'label-sm': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.05em', fontWeight: '600' }],
        'code-sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
      },
      spacing: {
        'container-padding': '32px',
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        pill: '9999px',
      },
      maxWidth: {
        container: '1400px',
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(0, 0, 0, 0.10), 0 1px 2px rgba(0, 0, 0, 0.06)',
        raised: '0 4px 12px rgba(0, 0, 0, 0.12)',
        dialog: '0 20px 25px rgba(0, 0, 0, 0.10), 0 8px 10px rgba(0, 0, 0, 0.04)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
        panel: '500ms',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      blur: {
        shell: '12px',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 2: Replace `src/index.css` with the light workspace and warm scrollbars.**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-background text-on-background antialiased;
  font-family: ui-sans-serif, system-ui, sans-serif;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #e3e0dd;
}

::-webkit-scrollbar-thumb {
  background: #d1d5dc;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #b9b3ac;
}
```

- [ ] **Step 3: Verify the Tailwind config compiles.**

Run: `npx tailwindcss -i ./src/index.css -o ./tmp.css --minify`

Expected: command exits with no errors and creates `./tmp.css`.

Clean up: `rm ./tmp.css`

---

### Task 2: Neutral UI primitives

**Files:**
- Modify: `src/components/ui/Card.tsx`
- Modify: `src/components/ui/StatCard.tsx`
- Modify: `src/components/ui/ChartCard.tsx`
- Modify: `src/components/ui/Skeleton.tsx`

- [ ] **Step 1: Update `src/components/ui/Card.tsx`.**

```tsx
import { cn } from '../../lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('bg-surface-elevated rounded-lg border border-outline shadow-subtle', className)}>
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Update `src/components/ui/StatCard.tsx`.**

```tsx
import { Card } from './Card'

interface StatCardProps {
  label: string
  value: string | number
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="text-xs font-semibold uppercase tracking-wide text-on-surface-muted mb-1">{label}</div>
      <div className="text-2xl font-bold text-on-background">{value}</div>
    </Card>
  )
}
```

- [ ] **Step 3: Update `src/components/ui/ChartCard.tsx`.**

```tsx
import { Card } from './Card'

interface ChartCardProps {
  title: string
  children: React.ReactNode
}

export function ChartCard({ title, children }: ChartCardProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-on-background mb-4">{title}</h3>
      {children}
    </Card>
  )
}
```

- [ ] **Step 4: Update `src/components/ui/Skeleton.tsx`.**

```tsx
import { cn } from '../../lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('animate-pulse rounded-lg bg-surface-soft', className)} />
}

interface SkeletonCardProps {
  className?: string
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn('bg-surface-elevated rounded-lg border border-outline p-4', className)}>
      <div className="space-y-3">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}

interface SkeletonChartProps {
  className?: string
}

export function SkeletonChart({ className }: SkeletonChartProps) {
  return (
    <div className={cn('bg-surface-elevated rounded-lg border border-outline p-6', className)}>
      <Skeleton className="h-6 w-1/4 mb-4" />
      <Skeleton className="h-[300px] w-full" />
    </div>
  )
}
```

---

### Task 3: Feedback and action primitives

**Files:**
- Modify: `src/components/ui/ErrorAlert.tsx`
- Modify: `src/components/ui/EmptyState.tsx`
- Modify: `src/components/ui/LoadingButton.tsx`

- [ ] **Step 1: Update `src/components/ui/ErrorAlert.tsx`.**

```tsx
import { AlertTriangle, RefreshCw } from 'lucide-react'

import { cn } from '../../lib/utils'

interface ErrorAlertProps {
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorAlert({ message, onRetry, className }: ErrorAlertProps) {
  return (
    <div className={cn('bg-surface-elevated border border-danger/30 rounded-lg p-4 flex items-center gap-3 text-danger', className)}>
      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-danger/10 hover:bg-danger/20 text-danger rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          Повторить
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Update `src/components/ui/EmptyState.tsx`.**

```tsx
import { Inbox } from 'lucide-react'

import { cn } from '../../lib/utils'

interface EmptyStateProps {
  message: string
  hint?: string
  className?: string
}

export function EmptyState({ message, hint, className }: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12 px-4', className)}>
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-soft border border-outline mb-4">
        <Inbox className="w-6 h-6 text-on-surface-muted" aria-hidden="true" />
      </div>
      <p className="text-on-surface font-medium">{message}</p>
      {hint && <p className="text-sm text-on-surface-muted mt-2 max-w-md mx-auto">{hint}</p>}
    </div>
  )
}
```

- [ ] **Step 3: Update `src/components/ui/LoadingButton.tsx`.**

```tsx
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
        'inline-flex items-center justify-center gap-2 h-10 px-4 rounded-sm font-medium text-on-primary bg-primary hover:bg-primary-strong transition disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus',
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
```

---

### Task 4: Badge and DateRangePicker

**Files:**
- Create: `src/components/ui/Badge.tsx`
- Modify: `src/components/ui/DateRangePicker.tsx`
- Modify: `src/components/ui/index.ts`

- [ ] **Step 1: Create `src/components/ui/Badge.tsx`.**

```tsx
import { cn } from '../../lib/utils'

const variants = {
  mock: 'bg-status-mock-bg text-status-mock-fg',
  planned: 'bg-status-planned-bg text-status-planned-fg',
  development: 'bg-status-development-bg text-status-development-fg',
  integrated: 'bg-status-integrated-bg text-status-integrated-fg',
  production: 'bg-status-production-bg text-status-production-fg',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  info: 'bg-info/10 text-info',
} as const

export type BadgeVariant = keyof typeof variants

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = 'planned', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
```

- [ ] **Step 2: Update `src/components/ui/DateRangePicker.tsx`.**

Replace the inner `Card` and input classes with design tokens. Keep all existing logic and validation.

Key class changes:

```tsx
<Card className={`flex items-center gap-2 px-3 py-2 ${error ? 'border-danger ring-1 ring-danger/30' : ''}`}>
  <Calendar className="w-4 h-4 text-on-surface-muted" aria-hidden="true" />
  <input
    type="date"
    className="bg-transparent text-sm text-on-surface outline-none"
    ...
  />
  <span className="text-on-surface-muted" aria-hidden="true">—</span>
  <input
    type="date"
    className="bg-transparent text-sm text-on-surface outline-none"
    ...
  />
</Card>
{error && (
  <div className="flex items-center gap-1.5 text-xs text-danger" role="alert">
    ...
  </div>
)}
```

The full file after the change:

```tsx
import { isAfter, parseISO, startOfDay } from 'date-fns'
import { AlertCircle, Calendar } from 'lucide-react'
import { useMemo } from 'react'

import { Card } from './Card'

export interface DateRange {
  from: string
  to: string
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const error = useMemo(() => {
    if (!value.from || !value.to) return null

    const fromDate = parseISO(value.from)
    const toDate = parseISO(value.to)
    const today = startOfDay(new Date())

    if (isAfter(fromDate, toDate)) {
      return 'Начало периода не может быть позже конца'
    }

    if (isAfter(toDate, today)) {
      return 'Конец периода не может быть в будущем'
    }

    return null
  }, [value])

  return (
    <div className="flex flex-col gap-2">
      <Card
        className={`flex items-center gap-2 px-3 py-2 ${error ? 'border-danger ring-1 ring-danger/30' : ''}`}
      >
        <Calendar className="w-4 h-4 text-on-surface-muted" aria-hidden="true" />
        <input
          type="date"
          value={value.from}
          max={value.to || undefined}
          onChange={(e) => onChange({ ...value, from: e.target.value })}
          className="bg-transparent text-sm text-on-surface outline-none"
          aria-label="Начало периода"
          aria-invalid={error ? 'true' : 'false'}
        />
        <span className="text-on-surface-muted" aria-hidden="true">
          —
        </span>
        <input
          type="date"
          value={value.to}
          min={value.from || undefined}
          onChange={(e) => onChange({ ...value, to: e.target.value })}
          className="bg-transparent text-sm text-on-surface outline-none"
          aria-label="Конец периода"
          aria-invalid={error ? 'true' : 'false'}
        />
      </Card>
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-danger" role="alert">
          <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Export `Badge` from `src/components/ui/index.ts`.**

```tsx
export { Badge, type BadgeVariant } from './Badge'
export { Card } from './Card'
export { ChartCard } from './ChartCard'
export { DateRangePicker, type DateRange } from './DateRangePicker'
export { EmptyState } from './EmptyState'
export { ErrorAlert } from './ErrorAlert'
export { LoadingButton } from './LoadingButton'
export { Skeleton, SkeletonCard, SkeletonChart } from './Skeleton'
export { StatCard } from './StatCard'
```

---

### Task 5: Shell — App and Sidebar

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/Sidebar.tsx`

- [ ] **Step 1: Update `src/App.tsx`.**

```tsx
import { Suspense, lazy, useEffect } from 'react'

import { ErrorBoundary } from './components/ErrorBoundary'
import Sidebar from './components/Sidebar'
import { SkeletonCard } from './components/ui/Skeleton'
import { useApp } from './hooks/useApp'

const TokenSetup = lazy(() => import('./components/TokenSetup'))
const Diagnostics = lazy(() => import('./components/Diagnostics'))
const CountersList = lazy(() => import('./components/CountersList'))
const MetricsDashboard = lazy(() => import('./components/MetricsDashboard'))
const Campaigns = lazy(() => import('./components/Campaigns'))

function TabLoader() {
  return (
    <div className="space-y-6 py-4">
      <SkeletonCard className="h-16" />
      <div className="grid gap-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}

export default function App() {
  const { activeTab, selectedCounter } = useApp()

  useEffect(() => {
    if (!window.electronAPI) return

    const unsubscribe = window.electronAPI.onMainProcessMessage((message) => {
      console.log('[main-process-message]', message)
    })

    return unsubscribe
  }, [])

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-container mx-auto px-container-padding py-6">
          <ErrorBoundary>
            {activeTab === 'token' && (
              <Suspense fallback={<TabLoader />}>
                <TokenSetup />
              </Suspense>
            )}
          </ErrorBoundary>
          <ErrorBoundary>
            {activeTab === 'diagnostics' && (
              <Suspense fallback={<TabLoader />}>
                <Diagnostics />
              </Suspense>
            )}
          </ErrorBoundary>
          <ErrorBoundary>
            {activeTab === 'counters' && (
              <Suspense fallback={<TabLoader />}>
                <CountersList />
              </Suspense>
            )}
          </ErrorBoundary>
          <ErrorBoundary>
            {activeTab === 'metrics' && selectedCounter && (
              <Suspense fallback={<TabLoader />}>
                <MetricsDashboard />
              </Suspense>
            )}
            {activeTab === 'metrics' && !selectedCounter && (
              <div className="text-on-surface-muted text-center py-12">
                Сначала выберите счётчик в разделе «Счётчики»
              </div>
            )}
          </ErrorBoundary>
          <ErrorBoundary>
            {activeTab === 'campaigns' && (
              <Suspense fallback={<TabLoader />}>
                <Campaigns />
              </Suspense>
            )}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Update `src/components/Sidebar.tsx`.**

```tsx
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
    <aside className="w-64 bg-shell-base/70 backdrop-blur-shell border-r border-white/10 flex flex-col">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold text-white">Yandex Dashboard</h1>
        <p className="text-xs text-white/70 mt-1">Метрика & Директ</p>
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
                'w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus',
                isActive
                  ? 'bg-primary text-on-primary'
                  : 'text-white/70 hover:bg-white/10 hover:text-white',
                disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-white/70'
              )}
              title={disabled ? 'Сначала выберите счётчик' : undefined}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/10 text-xs text-white/50">
        Desktop App v1.0.0
      </div>
    </aside>
  )
}
```

---

### Task 6: Restyle TokenSetup

**Files:**
- Modify: `src/components/TokenSetup.tsx`

- [ ] **Step 1: Replace the full file content.**

```tsx
import { Check, ExternalLink, Eye, EyeOff, Key, Trash2 } from 'lucide-react'
import { useState, useCallback } from 'react'

import { useAuth } from '../hooks/useAuth'

import { Card } from './ui/Card'
import { ErrorAlert } from './ui/ErrorAlert'
import { LoadingButton } from './ui/LoadingButton'

function isValidTokenFormat(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return 'Введите токен'
  if (trimmed.length < 10) return 'Токен слишком короткий'
  if (/\s/.test(trimmed)) return 'Токен не должен содержать пробелов'
  if (!/^[A-Za-z0-9_.~+/-]+$/.test(trimmed)) {
    return 'Токен содержит недопустимые символы'
  }
  return null
}

export default function TokenSetup() {
  const { token, hasToken, setToken, deleteToken } = useAuth()
  const [clientId, setClientId] = useState('')
  const [tokenInput, setTokenInput] = useState(token ?? '')
  const [showToken, setShowToken] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const authUrl = `https://oauth.yandex.ru/authorize?response_type=token&client_id=${encodeURIComponent(clientId || 'your_client_id')}`

  const openAuth = useCallback(async () => {
    if (window.electronAPI) {
      await window.electronAPI.openExternal(authUrl)
    } else {
      window.open(authUrl, '_blank')
    }
  }, [authUrl])

  const handleSave = async () => {
    const validationError = isValidTokenFormat(tokenInput)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setSaving(true)
    try {
      await setToken(tokenInput)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    await deleteToken()
    setTokenInput('')
    setError(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Key className="w-6 h-6 text-primary" aria-hidden="true" />
        <h2 className="text-2xl font-bold text-on-background">Настройка OAuth-токена</h2>
      </div>

      <Card className="p-6 space-y-4">
        <div>
          <label htmlFor="client-id" className="block text-sm font-medium text-on-surface-muted mb-2">
            Client ID приложения
          </label>
          <input
            id="client-id"
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="Введите Client ID"
            className="w-full bg-surface-elevated border border-outline rounded-lg px-4 py-2 text-on-surface placeholder-on-surface-muted focus:outline-none focus:border-primary-focus"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={openAuth}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-sm font-medium text-on-primary bg-primary hover:bg-primary-strong transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus"
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
            Открыть страницу авторизации
          </button>
        </div>

        <div className="bg-surface-soft rounded-lg p-4 text-sm text-on-surface-muted">
          <p>После авторизации Яндекс перенаправит на:</p>
          <code className="block mt-2 text-xs text-primary break-all">
            https://oauth.yandex.ru/verification_code#access_token=AQAAAA...
          </code>
          <p className="mt-2">Скопируйте значение токена и вставьте ниже.</p>
        </div>

        <div>
          <label htmlFor="oauth-token" className="block text-sm font-medium text-on-surface-muted mb-2">
            OAuth-токен
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="oauth-token"
                type={showToken ? 'text' : 'password'}
                value={tokenInput}
                onChange={(e) => {
                  setTokenInput(e.target.value)
                  setSaved(false)
                  if (error) setError(null)
                }}
                placeholder="Вставьте токен сюда"
                className="w-full bg-surface-elevated border border-outline rounded-lg px-4 py-2 pr-10 text-on-surface placeholder-on-surface-muted focus:outline-none focus:border-primary-focus"
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'token-error' : undefined}
              />
              <button
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-muted hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus rounded p-1"
                aria-label={showToken ? 'Скрыть токен' : 'Показать токен'}
                type="button"
              >
                {showToken ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
              </button>
            </div>
            <LoadingButton
              onClick={handleSave}
              loading={saving}
              loadingText="Сохранение..."
              className={saved ? 'bg-success hover:bg-success' : undefined}
              aria-label="Сохранить токен"
            >
              {saved ? <Check className="w-4 h-4" aria-hidden="true" /> : null}
              {saved ? 'Сохранено' : 'Сохранить'}
            </LoadingButton>
            {hasToken && (
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-sm font-medium bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
                aria-label="Удалить сохранённый токен"
                type="button"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                Удалить
              </button>
            )}
          </div>
          {error && (
            <div id="token-error" className="mt-2">
              <ErrorAlert message={error} />
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
```

---

### Task 7: Restyle CountersList

**Files:**
- Modify: `src/components/CountersList.tsx`

- [ ] **Step 1: Replace the full file content.**

```tsx
import { BarChart3, ChevronRight } from 'lucide-react'
import { useEffect } from 'react'

import { useCounters } from '../api/metrica'
import { useApp } from '../hooks/useApp'
import { cn } from '../lib/utils'

import { Badge, type BadgeVariant } from './ui/Badge'
import { EmptyState } from './ui/EmptyState'
import { ErrorAlert } from './ui/ErrorAlert'
import { LoadingButton } from './ui/LoadingButton'
import { SkeletonCard } from './ui/Skeleton'

function statusVariant(status: string): BadgeVariant {
  const lower = status.toLowerCase()
  if (lower === 'active' || lower === 'enabled' || lower === 'ok') return 'production'
  if (lower === 'moderation' || lower === 'pending') return 'mock'
  return 'planned'
}

export default function CountersList() {
  const { selectCounter, selectedCounter } = useApp()
  const { data: counters, isLoading, isError, error, refetch, isSuccess } = useCounters()

  useEffect(() => {
    if (counters === undefined && !isLoading && !isError) {
      refetch()
    }
  }, [counters, isLoading, isError, refetch])

  const isFirstLoad = isLoading && counters === undefined

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-primary" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-on-background">Счётчики Метрики</h2>
        </div>
        <LoadingButton
          onClick={() => refetch()}
          loading={isLoading}
          loadingText="Загрузка..."
        >
          {isSuccess ? 'Обновить' : 'Загрузить'}
        </LoadingButton>
      </div>

      {isError && <ErrorAlert message={error?.message ?? 'Неизвестная ошибка'} onRetry={() => refetch()} />}

      {isSuccess && counters.length === 0 && (
        <EmptyState
          message="Нет доступных счётчиков"
          hint="Убедитесь, что токен имеет доступ к Яндекс Метрике, и попробуйте обновить список."
        />
      )}

      {isFirstLoad && (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      <div className="grid gap-3">
        {counters?.map((c) => (
          <button
            key={c.id}
            onClick={() => selectCounter(c)}
            className={cn(
              'text-left bg-surface-elevated rounded-lg p-4 border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus',
              selectedCounter?.id === c.id
                ? 'border-primary ring-1 ring-primary/30'
                : 'border-outline hover:border-primary'
            )}
            aria-label={`Выбрать счётчик ${c.name}`}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-semibold text-on-background">{c.name}</div>
                <div className="text-sm text-on-surface-muted">
                  ID: {c.id} · {c.site} · <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-on-surface-muted" aria-hidden="true" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
```

---

### Task 8: Restyle Diagnostics and sub-components

**Files:**
- Modify: `src/components/Diagnostics.tsx`
- Modify: `src/components/diagnostics/AccountInfo.tsx`
- Modify: `src/components/diagnostics/ScopesCheck.tsx`

- [ ] **Step 1: Update `src/components/Diagnostics.tsx`.**

```tsx
import { Activity } from 'lucide-react'

import { useRunDiagnostics } from '../api/diagnostics'
import { useAuth } from '../hooks/useAuth'

import { DiagnosticsAccountInfo } from './diagnostics/AccountInfo'
import { DiagnosticsScopesCheck } from './diagnostics/ScopesCheck'
import { ErrorAlert } from './ui/ErrorAlert'
import { LoadingButton } from './ui/LoadingButton'

export default function Diagnostics() {
  const { hasToken } = useAuth()
  const { mutate, isPending, data: result, error } = useRunDiagnostics()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-primary" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-on-background">Диагностика токена</h2>
        </div>
        <LoadingButton
          onClick={() => mutate()}
          loading={isPending}
          loadingText="Проверка..."
          disabled={!hasToken}
        >
          Запустить диагностику
        </LoadingButton>
      </div>

      {error && <ErrorAlert message={error.message} onRetry={() => mutate()} />}

      {result && (
        <div className="space-y-4">
          {result.account && <DiagnosticsAccountInfo account={result.account} />}
          <DiagnosticsScopesCheck
            metrica={result.metrica}
            directFull={result.directFull}
            directRead={result.directRead}
          />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Update `src/components/diagnostics/AccountInfo.tsx`.**

```tsx
import { Shield, XCircle } from 'lucide-react'

import { Card } from '../ui/Card'

interface AccountInfoProps {
  account: {
    valid: boolean
    login?: string
    id?: string
    first_name?: string
    last_name?: string
    default_email?: string
    scope?: string | string[]
    error?: string
  }
}

export function DiagnosticsAccountInfo({ account }: AccountInfoProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-on-background">
        <Shield className="w-5 h-5 text-info" aria-hidden="true" />
        Информация об аккаунте
      </h3>
      {account.valid ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-on-surface-muted">Логин</div>
            <div className="font-medium text-on-background">{account.login || '—'}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-on-surface-muted">ID</div>
            <div className="font-medium text-on-background">{account.id || '—'}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-on-surface-muted">Имя</div>
            <div className="font-medium text-on-background">{account.first_name || '—'}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-on-surface-muted">Фамилия</div>
            <div className="font-medium text-on-background">{account.last_name || '—'}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-on-surface-muted">Email</div>
            <div className="font-medium text-on-background">{account.default_email || '—'}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-on-surface-muted">Scopes</div>
            <div className="font-medium text-xs text-on-background break-all">
              {Array.isArray(account.scope) ? account.scope.join(', ') : account.scope || '—'}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-danger">
          <XCircle className="w-5 h-5" />
          <span>{account.error || 'Токен невалиден'}</span>
        </div>
      )}
    </Card>
  )
}
```

- [ ] **Step 3: Update `src/components/diagnostics/ScopesCheck.tsx`.**

```tsx
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'

interface ScopesCheckProps {
  metrica: boolean
  directFull: boolean
  directRead: boolean
}

export function DiagnosticsScopesCheck({ metrica, directFull, directRead }: ScopesCheckProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-on-background">Проверка прав доступа</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-outline">
          <span className="font-medium text-on-background">Метрика (metrika:read)</span>
          {metrica ? (
            <span className="flex items-center gap-2 text-success">
              <CheckCircle className="w-5 h-5" />
              <Badge variant="success">Есть доступ</Badge>
            </span>
          ) : (
            <span className="flex items-center gap-2 text-danger">
              <XCircle className="w-5 h-5" />
              <Badge variant="danger">Нет доступа</Badge>
            </span>
          )}
        </div>
        <div className="flex items-center justify-between py-2 border-b border-outline">
          <span className="font-medium text-on-background">Директ (direct:api)</span>
          {directFull ? (
            <span className="flex items-center gap-2 text-success">
              <CheckCircle className="w-5 h-5" />
              <Badge variant="success">Полный доступ</Badge>
            </span>
          ) : directRead ? (
            <span className="flex items-center gap-2 text-warning">
              <AlertTriangle className="w-5 h-5" />
              <Badge variant="warning">Только чтение</Badge>
            </span>
          ) : (
            <span className="flex items-center gap-2 text-danger">
              <XCircle className="w-5 h-5" />
              <Badge variant="danger">Нет доступа</Badge>
            </span>
          )}
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="font-medium text-on-background">Директ отчёты (direct:api:read)</span>
          {directRead ? (
            <span className="flex items-center gap-2 text-success">
              <CheckCircle className="w-5 h-5" />
              <Badge variant="success">Есть доступ</Badge>
            </span>
          ) : (
            <span className="flex items-center gap-2 text-danger">
              <XCircle className="w-5 h-5" />
              <Badge variant="danger">Нет доступа</Badge>
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}
```

---

### Task 9: Restyle Campaigns

**Files:**
- Modify: `src/components/Campaigns.tsx`

- [ ] **Step 1: Replace the full file content.**

```tsx
import { Target, ToggleLeft } from 'lucide-react'
import { useEffect, useState } from 'react'

import { useCampaigns } from '../api/direct'
import { useDebounce } from '../hooks/useDebounce'
import { cn } from '../lib/utils'

import { Badge, type BadgeVariant } from './ui/Badge'
import { Card } from './ui/Card'
import { EmptyState } from './ui/EmptyState'
import { ErrorAlert } from './ui/ErrorAlert'
import { LoadingButton } from './ui/LoadingButton'
import { SkeletonCard } from './ui/Skeleton'

function campaignStatusVariant(status: string): BadgeVariant {
  if (status === 'ACCEPTED') return 'production'
  if (status === 'MODERATION') return 'mock'
  return 'planned'
}

export default function Campaigns() {
  const [sandbox, setSandbox] = useState(false)
  const debouncedSandbox = useDebounce(sandbox, 300)
  const { data: campaigns, isLoading, isError, error, refetch, isSuccess } = useCampaigns(debouncedSandbox)

  useEffect(() => {
    if (campaigns === undefined && !isLoading && !isError) {
      refetch()
    }
  }, [campaigns, isLoading, isError, refetch])

  const isFirstLoad = isLoading && campaigns === undefined

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-primary" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-on-background">Кампании Директа</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSandbox(!sandbox)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus',
              sandbox
                ? 'bg-primary/10 text-primary border border-primary/30'
                : 'bg-surface-elevated border border-outline text-on-surface-muted hover:text-on-surface'
            )}
            aria-pressed={sandbox}
            aria-label={sandbox ? 'Отключить песочницу Директа' : 'Включить песочницу Директа'}
          >
            <ToggleLeft className="w-4 h-4" aria-hidden="true" />
            Песочница
          </button>
          <LoadingButton
            onClick={() => refetch()}
            loading={isLoading}
            loadingText="Загрузка..."
          >
            {isSuccess ? 'Обновить' : 'Загрузить'}
          </LoadingButton>
        </div>
      </div>

      {isError && <ErrorAlert message={error?.message ?? 'Неизвестная ошибка'} onRetry={() => refetch()} />}

      {isSuccess && campaigns.length === 0 && (
        <EmptyState
          message="Нет кампаний"
          hint="Убедитесь, что токен имеет доступ к Яндекс Директу. Попробуйте включить песочницу для тестовых данных."
        />
      )}

      {isFirstLoad && (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      <div className="grid gap-3">
        {campaigns?.map((c) => (
          <Card key={c.Id} className="p-4 hover:border-primary transition">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-semibold text-on-background">{c.Name}</div>
                <div className="text-sm text-on-surface-muted">
                  ID: {c.Id} · Тип: {c.Type} · Валюта: {c.Currency}
                </div>
              </div>
              <div className="text-sm font-medium text-right space-y-1">
                <Badge variant={campaignStatusVariant(c.Status)}>{c.Status}</Badge>
                <div className="text-on-surface-muted">{c.State}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

---

### Task 10: Restyle MetricsDashboard and charts

**Files:**
- Modify: `src/components/MetricsDashboard.tsx`
- Modify: `src/components/metrics/TrafficChart.tsx`
- Modify: `src/components/metrics/SourcesChart.tsx`
- Modify: `src/components/metrics/DevicesChart.tsx`

- [ ] **Step 1: Update `src/components/MetricsDashboard.tsx`.**

```tsx
import { format, isAfter, parseISO, startOfDay } from 'date-fns'
import { LineChart as LineChartIcon, RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { useDevices, useSources, useTrafficSummary } from '../api/metrica'
import { useApp } from '../hooks/useApp'
import { type ChartDataPoint } from '../types'

import { DevicesChart } from './metrics/DevicesChart'
import { SourcesChart } from './metrics/SourcesChart'
import { TotalsSection } from './metrics/TotalsSection'
import { TrafficChart } from './metrics/TrafficChart'
import { DateRangePicker, type DateRange } from './ui/DateRangePicker'
import { EmptyState } from './ui/EmptyState'
import { ErrorAlert } from './ui/ErrorAlert'
import { LoadingButton } from './ui/LoadingButton'
import { SkeletonChart } from './ui/Skeleton'

function getDefaultDates() {
  const to = new Date()
  const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000)
  return {
    from: format(from, 'yyyy-MM-dd'),
    to: format(to, 'yyyy-MM-dd'),
  }
}

function isValidDateRange(dates: DateRange): boolean {
  if (!dates.from || !dates.to) return false
  const fromDate = parseISO(dates.from)
  const toDate = parseISO(dates.to)
  const today = startOfDay(new Date())
  return !isAfter(fromDate, toDate) && !isAfter(toDate, today)
}

export default function MetricsDashboard() {
  const { selectedCounter } = useApp()
  const counterId = selectedCounter?.id
  const [dates, setDates] = useState(getDefaultDates)

  const {
    data: traffic,
    isLoading: trafficLoading,
    isError: trafficError,
    error: trafficErrorMessage,
    refetch: refetchTraffic,
  } = useTrafficSummary(counterId, dates.from, dates.to)
  const {
    data: sources,
    isLoading: sourcesLoading,
    isError: sourcesError,
    error: sourcesErrorMessage,
    refetch: refetchSources,
  } = useSources(counterId, dates.from, dates.to)
  const {
    data: devices,
    isLoading: devicesLoading,
    isError: devicesError,
    error: devicesErrorMessage,
    refetch: refetchDevices,
  } = useDevices(counterId, dates.from, dates.to)

  const loading = trafficLoading || sourcesLoading || devicesLoading
  const errorMessage = trafficErrorMessage || sourcesErrorMessage || devicesErrorMessage
  const hasError = trafficError || sourcesError || devicesError

  const refetchAll = () => {
    refetchTraffic()
    refetchSources()
    refetchDevices()
  }

  useEffect(() => {
    if (!counterId || !isValidDateRange(dates)) return
    if (traffic === undefined && sources === undefined && devices === undefined && !loading && !hasError) {
      refetchAll()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counterId, dates, traffic, sources, devices, loading, hasError])

  const trafficData = useMemo<ChartDataPoint[]>(() => {
    if (!traffic?.data) return []
    const metrics = traffic.query.metrics
    return traffic.data.map((row) => {
      const date = row.dimensions[0]?.name || ''
      const point: ChartDataPoint = { date }
      row.metrics.forEach((v, i) => {
        point[metrics[i]] = v
      })
      return point
    })
  }, [traffic])

  const sourcesData = useMemo<ChartDataPoint[]>(() => {
    if (!sources?.data) return []
    const metrics = sources.query.metrics
    return sources.data.map((row) => {
      const name = row.dimensions[0]?.name || ''
      const point: ChartDataPoint = { name }
      row.metrics.forEach((v, i) => {
        point[metrics[i]] = v
      })
      return point
    })
  }, [sources])

  const devicesData = useMemo<ChartDataPoint[]>(() => {
    if (!devices?.data) return []
    const metrics = devices.query.metrics
    return devices.data.map((row) => {
      const name = row.dimensions[0]?.name || ''
      const point: ChartDataPoint = { name }
      row.metrics.forEach((v, i) => {
        point[metrics[i]] = v
      })
      return point
    })
  }, [devices])

  const totals = traffic?.totals
  const isFirstLoad = loading && traffic === undefined && sources === undefined && devices === undefined
  const datesValid = isValidDateRange(dates)

  if (!selectedCounter) {
    return (
      <EmptyState
        message="Сначала выберите счётчик"
        hint="Перейдите в раздел «Счётчики» и выберите один из доступных счётчиков, чтобы увидеть графики."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <LineChartIcon className="w-6 h-6 text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-2xl font-bold text-on-background">Графики Метрики</h2>
            <p className="text-sm text-on-surface-muted">
              Счётчик: {selectedCounter.name} (ID: {selectedCounter.id})
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker value={dates} onChange={setDates} />
          <LoadingButton
            onClick={refetchAll}
            loading={loading}
            loadingText="Загрузка..."
            disabled={!datesValid}
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Загрузить
          </LoadingButton>
        </div>
      </div>

      {hasError && (
        <ErrorAlert
          message={errorMessage?.message ?? 'Неизвестная ошибка'}
          onRetry={refetchAll}
        />
      )}

      {!datesValid && !hasError && (
        <ErrorAlert message="Выберите корректный период: начало не позже конца, даты не в будущем" />
      )}

      {isFirstLoad && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-surface-elevated rounded-lg border border-outline p-4 space-y-3">
                <div className="h-4 w-1/2 rounded bg-surface-soft animate-pulse" />
                <div className="h-8 w-2/3 rounded bg-surface-soft animate-pulse" />
              </div>
            ))}
          </div>
          <SkeletonChart />
          <SkeletonChart />
          <SkeletonChart />
        </div>
      )}

      {totals && traffic && !loading && <TotalsSection metrics={traffic.query.metrics} totals={totals} />}

      {trafficData.length > 0 && !loading && <TrafficChart data={trafficData} />}

      {sourcesData.length > 0 && !loading && <SourcesChart data={sourcesData} />}

      {devicesData.length > 0 && !loading && <DevicesChart data={devicesData} />}

      {!traffic && !loading && !hasError && datesValid && (
        <EmptyState
          message="Выберите период и нажмите «Загрузить»"
          hint="Данные за выбранный период появятся здесь после загрузки."
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Update `src/components/metrics/TrafficChart.tsx`.**

```tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

import { type ChartDataPoint } from '../../types'
import { ChartCard } from '../ui/ChartCard'

interface TrafficChartProps {
  data: ChartDataPoint[]
}

export function TrafficChart({ data }: TrafficChartProps) {
  return (
    <ChartCard title="Трафик по дням">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3e0dd" />
          <XAxis dataKey="date" stroke="#797067" tick={{ fontSize: 12, fill: '#797067' }} />
          <YAxis stroke="#797067" tick={{ fontSize: 12, fill: '#797067' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e3e0dd', borderRadius: '8px' }}
            labelStyle={{ color: '#423d38' }}
            itemStyle={{ color: '#423d38' }}
          />
          <Legend wrapperStyle={{ color: '#423d38' }} />
          <Line type="monotone" dataKey="ym:s:visits" stroke="#fe6e00" name="Визиты" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="ym:s:pageviews" stroke="#3080ff" name="Просмотры" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="ym:s:users" stroke="#00c758" name="Посетители" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
```

- [ ] **Step 3: Update `src/components/metrics/SourcesChart.tsx`.**

```tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

import { type ChartDataPoint } from '../../types'
import { ChartCard } from '../ui/ChartCard'

interface SourcesChartProps {
  data: ChartDataPoint[]
}

export function SourcesChart({ data }: SourcesChartProps) {
  return (
    <ChartCard title="Источники трафика">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data.slice(0, 10)}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3e0dd" />
          <XAxis dataKey="name" stroke="#797067" tick={{ fontSize: 12, fill: '#797067' }} angle={-45} textAnchor="end" height={80} />
          <YAxis stroke="#797067" tick={{ fontSize: 12, fill: '#797067' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e3e0dd', borderRadius: '8px' }}
            labelStyle={{ color: '#423d38' }}
            itemStyle={{ color: '#423d38' }}
          />
          <Legend wrapperStyle={{ color: '#423d38' }} />
          <Bar dataKey="ym:s:visits" fill="rgba(254, 110, 0, 0.6)" name="Визиты" radius={[4, 4, 0, 0]} />
          <Bar dataKey="ym:s:users" fill="#3080ff" name="Посетители" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
```

- [ ] **Step 4: Update `src/components/metrics/DevicesChart.tsx`.**

```tsx
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

import { type ChartDataPoint } from '../../types'
import { ChartCard } from '../ui/ChartCard'

const COLORS = ['#fe6e00', '#ff6b00', '#ffb74d', '#3080ff', '#00c758', '#edb200']

interface DevicesChartProps {
  data: ChartDataPoint[]
}

export function DevicesChart({ data }: DevicesChartProps) {
  return (
    <ChartCard title="Устройства">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="ym:s:visits"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e3e0dd', borderRadius: '8px' }}
              itemStyle={{ color: '#423d38' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex items-center">
          <div className="space-y-3 w-full">
            {data.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-sm text-on-surface">{d.name}</span>
                </div>
                <div className="text-sm font-medium text-on-background">
                  {Number(d['ym:s:visits']).toLocaleString('ru-RU')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ChartCard>
  )
}
```

---

### Task 11: Quality checks and verification

**Files:**
- Run commands in the `testApp/` directory.

- [ ] **Step 1: Search for leftover `yandex-*` Tailwind classes.**

Run: `grep -R "yandex-" src/ --include="*.tsx" --include="*.ts" --include="*.css"`

Expected: No matches. If any remain, update those files before proceeding.

- [ ] **Step 2: Run the linter.**

Run: `npm run lint`

Expected: `0` errors and `0` warnings.

- [ ] **Step 3: Run TypeScript checks.**

Run: `npm run typecheck`

Expected: `0` errors.

- [ ] **Step 4: Run unit tests.**

Run: `npm run test:unit`

Expected: All tests pass. If a test fails because of a changed class name that it was asserting, update the test assertion to match the new design token. Do not change the test behavior.

- [ ] **Step 5: Manual visual verification.**

Run: `npm run dev`

Check in the Electron window:

1. **Sidebar:** dark frosted glass, white text at 70% opacity, active item is orange with white text, hover is translucent white.
2. **Workspace background:** warm off-white (`#fcfaf7`).
3. **Cards:** white surface, thin border, subtle shadow, rounded corners.
4. **Token setup:** white card, orange primary button, neutral inputs, danger delete button.
5. **Counters list:** cards with primary border on selection, status badges.
6. **Diagnostics:** account info and scopes in cards, green/yellow/red badges.
7. **Campaigns:** card list, status badge for `ACCEPTED`/`MODERATION`, sandbox toggle.
8. **Metrics dashboard:** stat cards, date picker, charts with orange/blue/green lines, white tooltip, muted axes.
9. **Loading skeletons:** light gray placeholders on white cards.
10. **Error alerts:** light card with red text and red retry button.

- [ ] **Step 6: Clean up any temporary files.**

Ensure no `tmp.css`, `test-results/`, or `playwright-report/` artifacts were produced by the verification steps. Remove any temporary files that are not part of the project.

---

## Spec coverage checklist

| Spec section | Implemented in task |
|---|---|
| Tailwind theme extension (colors, typography, spacing, shadows, motion) | Task 1 |
| CSS variables and light workspace | Task 1 |
| Removal of old `yandex-*` colors | Tasks 1, 11 |
| Frosted-glass sidebar shell | Task 5 |
| Workspace container (`max-w-container`, `px-container-padding`) | Task 5 |
| Card, StatCard, ChartCard surfaces | Task 2 |
| Button, LoadingButton primary style | Task 3 |
| Input surface style | Tasks 6, 7, 8, 9, 10 (inline inputs) |
| ErrorAlert and EmptyState styling | Task 3 |
| Status badges | Tasks 4, 7, 8, 9 |
| Chart orange/semantic telemetry colors | Task 10 |
| Page-by-page migration (Token, Counters, Diagnostics, Campaigns, Metrics) | Tasks 6–10 |
| Focus rings and accessibility | Tasks 5, 6, 7, 8, 9, 10 |
| Testing and quality checks | Task 11 |

## Out of scope (per spec)

- Top header / global search.
- New features or API endpoints.
- Dark mode toggle.
- Custom animations beyond Tailwind transitions.
- Git commits (user requested no commits).
