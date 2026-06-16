import { ChevronDown } from 'lucide-react'

import { useCampaigns } from '../../api/direct'
import { useApp } from '../../hooks/useApp'

export function CampaignSelector() {
  const { selectedCampaignId, setSelectedCampaignId, directSandbox } = useApp()
  const { data: campaigns, isLoading, isError, error } = useCampaigns(directSandbox)

  if (isLoading) {
    return (
      <div className="h-10 bg-surface-soft rounded animate-pulse w-full sm:w-72" />
    )
  }

  if (isError) {
    return (
      <div className="text-body-sm text-danger">
        {error?.message ?? 'Ошибка загрузки кампаний'}
      </div>
    )
  }

  if (!campaigns?.length) {
    return (
      <div className="text-body-sm text-on-surface-muted">Нет доступных кампаний</div>
    )
  }

  return (
    <div className="relative w-full sm:w-72">
      <select
        id="campaign-selector"
        value={selectedCampaignId ?? ''}
        onChange={(e) => setSelectedCampaignId(Number(e.target.value))}
        className="w-full appearance-none h-10 pl-3 pr-10 rounded bg-surface-elevated border border-outline text-body-sm text-on-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus"
      >
        <option value="" disabled>
          Выберите кампанию
        </option>
        {campaigns.map((c) => (
          <option key={c.Id} value={c.Id}>
            {c.Name} (ID: {c.Id})
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-muted pointer-events-none" aria-hidden="true" />
    </div>
  )
}
