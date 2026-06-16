import { useApp } from '../hooks/useApp'

export default function CampaignAnalytics() {
  const { selectedCampaignId } = useApp()

  if (!selectedCampaignId) {
    return (
      <div className="space-y-6">
        <h2 className="text-headline-lg text-on-background">Аналитика кампании</h2>
        <div className="text-on-surface-muted text-center py-12">
          Сначала выберите кампанию в разделе «Кампании»
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-headline-lg text-on-background">Аналитика кампании</h2>
      <div className="text-on-surface-muted text-center py-12">
        ID кампании: {selectedCampaignId}
      </div>
    </div>
  )
}
