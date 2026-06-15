import { BarChart3, ChevronRight } from 'lucide-react'
import { useEffect } from 'react'

import { useCounters } from '../api/metrica'
import { useApp } from '../hooks/useApp'

import { EmptyState } from './ui/EmptyState'
import { ErrorAlert } from './ui/ErrorAlert'
import { LoadingButton } from './ui/LoadingButton'
import { SkeletonCard } from './ui/Skeleton'

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-primary" aria-hidden="true" />
          <h2 className="text-headline-lg text-on-background">Счётчики Метрики</h2>
        </div>
        <LoadingButton
          onClick={() => refetch()}
          loading={isLoading}
          loadingText="Загрузка..."
          className="w-full sm:w-auto"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        {counters?.map((c) => (
          <button
            key={c.id}
            onClick={() => selectCounter(c)}
            className={`text-left bg-surface-elevated rounded-lg border shadow-subtle p-4 transition hover:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus ${
              selectedCounter?.id === c.id
                ? 'border-primary ring-1 ring-primary/30'
                : 'border-outline'
            }`}
            aria-label={`Выбрать счётчик ${c.name}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <div className="text-body-md font-semibold text-on-background">{c.name}</div>
                <div className="text-body-sm text-on-surface-muted">
                  ID: {c.id} · {c.site} · {c.status}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-on-surface-muted sm:shrink-0" aria-hidden="true" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
