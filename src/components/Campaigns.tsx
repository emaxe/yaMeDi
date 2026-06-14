import { Target, ToggleLeft } from 'lucide-react'
import { useEffect, useState } from 'react'

import { useCampaigns } from '../api/direct'
import { useDebounce } from '../hooks/useDebounce'

import { Card } from './ui/Card'
import { EmptyState } from './ui/EmptyState'
import { ErrorAlert } from './ui/ErrorAlert'
import { LoadingButton } from './ui/LoadingButton'
import { SkeletonCard } from './ui/Skeleton'
import { StatusBadge } from './ui/StatusBadge'

type CampaignStatus = 'ACCEPTED' | 'MODERATION' | string

function campaignStatusVariant(status: CampaignStatus) {
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
          <h2 className="text-headline-lg text-on-background">Кампании Директа</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSandbox(!sandbox)}
            className={`inline-flex items-center gap-2 h-9 px-3 rounded-sm text-label-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus ${
              sandbox
                ? 'bg-warning/10 text-warning border border-warning/20'
                : 'bg-surface-elevated border border-outline text-on-surface-muted hover:text-on-surface'
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
          <Card key={c.Id} className="p-4 hover:border-primary transition-colors">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-body-md font-semibold text-on-background">{c.Name}</div>
                <div className="text-body-sm text-on-surface-muted">
                  ID: {c.Id} · Тип: {c.Type} · Валюта: {c.Currency}
                </div>
              </div>
              <div className="text-right space-y-1">
                <StatusBadge variant={campaignStatusVariant(c.Status)}>{c.Status}</StatusBadge>
                <div className="text-body-sm text-on-surface-muted">{c.State}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
