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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-yandex-yellow" aria-hidden="true" />
          <h2 className="text-2xl font-bold">Счётчики Метрики</h2>
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
            className={`text-left bg-yandex-card rounded-xl p-4 border transition hover:border-yandex-yellow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yandex-yellow/50 ${
              selectedCounter?.id === c.id
                ? 'border-yandex-yellow ring-1 ring-yandex-yellow/30'
                : 'border-yandex-border'
            }`}
            aria-label={`Выбрать счётчик ${c.name}`}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-semibold">{c.name}</div>
                <div className="text-sm text-gray-400">
                  ID: {c.id} · {c.site} · {c.status}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500" aria-hidden="true" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
