import { BarChart3, RefreshCw, AlertTriangle, ChevronRight } from 'lucide-react'
import { useState, useCallback } from 'react'

import { getCounters } from '../api/yandexApi'
import { Counter } from '../types'

interface CountersListProps {
  onSelectCounter: (counter: Counter) => void
  selectedCounterId?: number
}

export default function CountersList({ onSelectCounter, selectedCounterId }: CountersListProps) {
  const [counters, setCounters] = useState<Counter[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getCounters()
      setCounters(data)
      setLoaded(true)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-yandex-yellow" />
          <h2 className="text-2xl font-bold">Счётчики Метрики</h2>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-yandex-yellow text-black rounded-lg font-medium hover:brightness-110 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Загрузка...' : loaded ? 'Обновить' : 'Загрузить'}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 flex items-center gap-3 text-red-200">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {counters.length === 0 && loaded && !error && (
        <div className="text-gray-400 text-center py-12">Нет доступных счётчиков</div>
      )}

      <div className="grid gap-3">
        {counters.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelectCounter(c)}
            className={`text-left bg-yandex-card rounded-xl p-4 border transition hover:border-yandex-yellow ${
              selectedCounterId === c.id ? 'border-yandex-yellow ring-1 ring-yandex-yellow/30' : 'border-yandex-border'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-semibold">{c.name}</div>
                <div className="text-sm text-gray-400">
                  ID: {c.id} · {c.site} · {c.status}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
