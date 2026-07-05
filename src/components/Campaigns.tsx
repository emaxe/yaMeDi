import { Target, ToggleLeft } from 'lucide-react'
import { useEffect } from 'react'

import { useAgencyClients, useCampaigns } from '../api/direct'
import { useApp } from '../hooks/useApp'
import { useAuth } from '../hooks/useAuth'
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
  const { directSandbox, setDirectSandbox, selectCampaign } = useApp()
  const { clientLogin, setClientLogin, deleteClientLogin } = useAuth()
  const { data: agencyClients, isLoading: clientsLoading, error: clientsError } = useAgencyClients()
  const debouncedSandbox = useDebounce(directSandbox, 300)
  const { data: campaigns, isLoading, isError, error, refetch, isSuccess } = useCampaigns(debouncedSandbox)

  const handleSelectClientLogin = async (value: string) => {
    if (value) {
      await setClientLogin(value)
    } else {
      await deleteClientLogin()
    }
  }

  useEffect(() => {
    if (campaigns === undefined && !isLoading && !isError) {
      refetch()
    }
  }, [campaigns, isLoading, isError, refetch])

  useEffect(() => {
    if (isError && error) {
      console.error('[Campaigns] useCampaigns error:', error)
    }
  }, [isError, error])

  const isFirstLoad = isLoading && campaigns === undefined

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-primary" aria-hidden="true" />
          <h2 className="text-headline-lg text-on-background">Кампании Директа</h2>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={() => setDirectSandbox(!directSandbox)}
            className={`inline-flex items-center justify-center gap-2 h-9 px-3 rounded-sm text-label-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus ${
              directSandbox
                ? 'bg-warning/10 text-warning border border-warning/20'
                : 'bg-surface-elevated border border-outline text-on-surface-muted hover:text-on-surface'
            }`}
            aria-pressed={directSandbox}
            aria-label={directSandbox ? 'Отключить песочницу Директа' : 'Включить песочницу Директа'}
          >
            <ToggleLeft className="w-4 h-4" aria-hidden="true" />
            Песочница
          </button>
          <LoadingButton
            onClick={() => refetch()}
            loading={isLoading}
            loadingText="Загрузка..."
            className="w-full sm:w-auto"
          >
            {isSuccess ? 'Обновить' : 'Загрузить'}
          </LoadingButton>
        </div>
      </div>

      <Card className="p-4 space-y-3">
        <div>
          <label htmlFor="client-login" className="block text-label-sm text-on-surface-muted mb-2">
            Client-Login (для агентств)
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              id="client-login"
              value={clientLogin ?? ''}
              onChange={(e) => handleSelectClientLogin(e.target.value)}
              disabled={clientsLoading}
              className="w-full h-9 px-3 bg-surface-elevated border border-outline rounded-sm text-body-md text-on-surface focus:outline-none focus:border-primary-focus disabled:opacity-50"
            >
              <option value="">
                {clientsLoading ? 'Загрузка клиентов…' : '— Выберите логин —'}
              </option>
              {agencyClients?.filter((c) => !c.Archived).map((c) => (
                <option key={c.Login} value={c.Login}>
                  {c.Login}
                </option>
              ))}
            </select>
          </div>
          {clientsError && (
            <p className="mt-2 text-body-sm text-danger">
              Не удалось загрузить список клиентов: {clientsError instanceof Error ? clientsError.message : 'ошибка сети'}
            </p>
          )}
          <p className="mt-2 text-body-sm text-on-surface-muted">
            Выберите логин клиентского аккаунта, от имени которого будут запрашиваться данные Директа.
          </p>
        </div>
      </Card>

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
          <Card
            key={c.Id}
            className="p-4 hover:border-primary transition-colors cursor-pointer"
            onClick={() => selectCampaign(c.Id)}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <div className="text-body-md font-semibold text-on-background">{c.Name}</div>
                <div className="text-body-sm text-on-surface-muted">
                  ID: {c.Id} · Тип: {c.Type} · Валюта: {c.Currency}
                </div>
              </div>
              <div className="text-left sm:text-right space-y-1">
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
