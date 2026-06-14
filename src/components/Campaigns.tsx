import { Target, ToggleLeft } from 'lucide-react'
import { useEffect, useState } from 'react'

import { useCampaigns } from '../api/direct'
import { useDebounce } from '../hooks/useDebounce'

import { Card } from './ui/Card'
import { EmptyState } from './ui/EmptyState'
import { ErrorAlert } from './ui/ErrorAlert'
import { LoadingButton } from './ui/LoadingButton'
import { SkeletonCard } from './ui/Skeleton'

export default function Campaigns() {
  const [sandbox, setSandbox] = useState(false)
  const debouncedSandbox = useDebounce(sandbox, 300)
  const { data: campaigns, isLoading, isError, error, refetch, isSuccess } = useCampaigns(debouncedSandbox)

  const statusColor = (status: string) => {
    if (status === 'ACCEPTED') return 'text-green-400'
    if (status === 'MODERATION') return 'text-yellow-400'
    return 'text-gray-400'
  }

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
          <Target className="w-6 h-6 text-yandex-yellow" aria-hidden="true" />
          <h2 className="text-2xl font-bold">Кампании Директа</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSandbox(!sandbox)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yandex-yellow/50 ${
              sandbox
                ? 'bg-yellow-600/20 text-yellow-300 border border-yellow-600/40'
                : 'bg-yandex-card border border-yandex-border text-gray-400'
            }`}
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
          <Card key={c.Id} className="p-4 hover:border-yandex-yellow transition">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-semibold">{c.Name}</div>
                <div className="text-sm text-gray-400">
                  ID: {c.Id} · Тип: {c.Type} · Валюта: {c.Currency}
                </div>
              </div>
              <div className="text-sm font-medium text-right space-y-1">
                <div className={statusColor(c.Status)}>{c.Status}</div>
                <div className="text-gray-400">{c.State}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
