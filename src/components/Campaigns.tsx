import { Target, RefreshCw, AlertTriangle, ToggleLeft } from 'lucide-react'
import { useState, useCallback } from 'react'

import { getCampaigns } from '../api/yandexApi'
import { Campaign } from '../types'

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [sandbox, setSandbox] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getCampaigns(sandbox)
      setCampaigns(data)
      setLoaded(true)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [sandbox])

  const statusColor = (status: string) => {
    if (status === 'ACCEPTED') return 'text-green-400'
    if (status === 'MODERATION') return 'text-yellow-400'
    return 'text-gray-400'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-yandex-yellow" />
          <h2 className="text-2xl font-bold">Кампании Директа</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSandbox(!sandbox)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              sandbox ? 'bg-yellow-600/20 text-yellow-300 border border-yellow-600/40' : 'bg-yandex-card border border-yandex-border text-gray-400'
            }`}
          >
            <ToggleLeft className="w-4 h-4" />
            Песочница
          </button>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-yandex-yellow text-black rounded-lg font-medium hover:brightness-110 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Загрузка...' : loaded ? 'Обновить' : 'Загрузить'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 flex items-center gap-3 text-red-200">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {campaigns.length === 0 && loaded && !error && (
        <div className="text-gray-400 text-center py-12">Нет кампаний</div>
      )}

      <div className="grid gap-3">
        {campaigns.map((c) => (
          <div
            key={c.Id}
            className="bg-yandex-card rounded-xl p-4 border border-yandex-border hover:border-yandex-yellow transition"
          >
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
          </div>
        ))}
      </div>
    </div>
  )
}
