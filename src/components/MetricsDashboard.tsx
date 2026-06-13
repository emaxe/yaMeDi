import { format } from 'date-fns'
import { LineChart as LineChartIcon, RefreshCw, AlertTriangle, Calendar } from 'lucide-react'
import { useState, useCallback, useMemo } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

import { getTrafficSummary, getSources, getDevices } from '../api/yandexApi'
import { MetricaData, Counter } from '../types'


interface MetricsDashboardProps {
  counter: Counter
}

function getDefaultDates() {
  const to = new Date()
  const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000)
  return {
    from: format(from, 'yyyy-MM-dd'),
    to: format(to, 'yyyy-MM-dd'),
  }
}

const COLORS = ['#FFCC00', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']

export default function MetricsDashboard({ counter }: MetricsDashboardProps) {
  const [dates, setDates] = useState(getDefaultDates())
  const [traffic, setTraffic] = useState<MetricaData | null>(null)
  const [sources, setSources] = useState<MetricaData | null>(null)
  const [devices, setDevices] = useState<MetricaData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [t, s, d] = await Promise.all([
        getTrafficSummary(counter.id, dates.from, dates.to),
        getSources(counter.id, dates.from, dates.to),
        getDevices(counter.id, dates.from, dates.to),
      ])
      setTraffic(t)
      setSources(s)
      setDevices(d)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [counter.id, dates])

  const trafficData = useMemo(() => {
    if (!traffic?.data) return []
    const metrics = traffic.query.metrics
    return traffic.data.map((row) => {
      const date = row.dimensions[0]?.name || ''
      const obj: Record<string, string | number> = { date }
      row.metrics.forEach((v, i) => {
        obj[metrics[i]] = v
      })
      return obj
    })
  }, [traffic])

  const sourcesData = useMemo(() => {
    if (!sources?.data) return []
    const metrics = sources.query.metrics
    return sources.data.map((row) => {
      const source = row.dimensions[0]?.name || ''
      const obj: Record<string, string | number> = { name: source }
      row.metrics.forEach((v, i) => {
        obj[metrics[i]] = v
      })
      return obj
    })
  }, [sources])

  const devicesData = useMemo(() => {
    if (!devices?.data) return []
    const metrics = devices.query.metrics
    return devices.data.map((row) => {
      const category = row.dimensions[0]?.name || ''
      const obj: Record<string, string | number> = { name: category }
      row.metrics.forEach((v, i) => {
        obj[metrics[i]] = v
      })
      return obj
    })
  }, [devices])

  const totals = traffic?.totals

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <LineChartIcon className="w-6 h-6 text-yandex-yellow" />
          <div>
            <h2 className="text-2xl font-bold">Графики Метрики</h2>
            <p className="text-sm text-gray-400">
              Счётчик: {counter.name} (ID: {counter.id})
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-yandex-card rounded-lg px-3 py-2 border border-yandex-border">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={dates.from}
              onChange={(e) => setDates((d) => ({ ...d, from: e.target.value }))}
              className="bg-transparent text-sm text-white outline-none"
            />
            <span className="text-gray-500">—</span>
            <input
              type="date"
              value={dates.to}
              onChange={(e) => setDates((d) => ({ ...d, to: e.target.value }))}
              className="bg-transparent text-sm text-white outline-none"
            />
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-yandex-yellow text-black rounded-lg font-medium hover:brightness-110 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Загрузка...' : 'Загрузить'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 flex items-center gap-3 text-red-200">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Totals */}
      {totals && traffic && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {traffic.query.metrics.map((m, i) => (
            <div key={m} className="bg-yandex-card rounded-xl p-4 border border-yandex-border">
              <div className="text-sm text-gray-400 mb-1">{m.replace('ym:s:', '')}</div>
              <div className="text-2xl font-bold text-white">
                {Number(totals[i]).toLocaleString('ru-RU', { maximumFractionDigits: 2 })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Traffic chart */}
      {trafficData.length > 0 && (
        <div className="bg-yandex-card rounded-xl p-6 border border-yandex-border">
          <h3 className="text-lg font-semibold mb-4">Трафик по дням</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0f3460" />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#16213e', border: '1px solid #0f3460', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="ym:s:visits" stroke="#FFCC00" name="Визиты" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="ym:s:pageviews" stroke="#4ECDC4" name="Просмотры" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="ym:s:users" stroke="#FF6B6B" name="Посетители" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Sources chart */}
      {sourcesData.length > 0 && (
        <div className="bg-yandex-card rounded-xl p-6 border border-yandex-border">
          <h3 className="text-lg font-semibold mb-4">Источники трафика</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sourcesData.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0f3460" />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#16213e', border: '1px solid #0f3460', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="ym:s:visits" fill="#FFCC00" name="Визиты" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ym:s:users" fill="#4ECDC4" name="Посетители" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Devices pie chart */}
      {devicesData.length > 0 && (
        <div className="bg-yandex-card rounded-xl p-6 border border-yandex-border">
          <h3 className="text-lg font-semibold mb-4">Устройства</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={devicesData}
                  dataKey="ym:s:visits"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {devicesData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#16213e', border: '1px solid #0f3460', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex items-center">
              <div className="space-y-3 w-full">
                {devicesData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span className="text-sm">{d.name}</span>
                    </div>
                    <div className="text-sm font-medium">
                      {Number(d['ym:s:visits']).toLocaleString('ru-RU')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {!traffic && !loading && !error && (
        <div className="text-gray-400 text-center py-12">Выберите период и нажмите «Загрузить»</div>
      )}
    </div>
  )
}
