import { Activity, Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { useState, useCallback } from 'react'

import { runFullDiagnostics } from '../api/yandexApi'
import { TokenCheckResult } from '../types'

export default function Diagnostics() {
  const [result, setResult] = useState<TokenCheckResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const run = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await runFullDiagnostics()
      setResult(res)
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
          <Activity className="w-6 h-6 text-yandex-yellow" />
          <h2 className="text-2xl font-bold">Диагностика токена</h2>
        </div>
        <button
          onClick={run}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-yandex-yellow text-black rounded-lg font-medium hover:brightness-110 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Проверка...' : 'Запустить диагностику'}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 flex items-center gap-3 text-red-200">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Account info */}
          <div className="bg-yandex-card rounded-xl p-6 border border-yandex-border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              Информация об аккаунте
            </h3>
            {result.account?.valid ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-gray-400">Логин</div>
                  <div className="font-medium">{result.account.login || '—'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-400">ID</div>
                  <div className="font-medium">{result.account.id || '—'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-400">Имя</div>
                  <div className="font-medium">{result.account.first_name || '—'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-400">Фамилия</div>
                  <div className="font-medium">{result.account.last_name || '—'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-400">Email</div>
                  <div className="font-medium">{result.account.default_email || '—'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-400">Scopes</div>
                  <div className="font-medium text-xs break-all">
                    {Array.isArray(result.account.scope)
                      ? result.account.scope.join(', ')
                      : result.account.scope || '—'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-300">
                <XCircle className="w-5 h-5" />
                <span>{result.account?.error || 'Токен невалиден'}</span>
              </div>
            )}
          </div>

          {/* Scopes */}
          <div className="bg-yandex-card rounded-xl p-6 border border-yandex-border">
            <h3 className="text-lg font-semibold mb-4">Проверка прав доступа</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-yandex-border/50">
                <span className="font-medium">Метрика (metrika:read)</span>
                {result.metrica ? (
                  <span className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    Есть доступ
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-red-400">
                    <XCircle className="w-5 h-5" />
                    Нет доступа
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between py-2 border-b border-yandex-border/50">
                <span className="font-medium">Директ (direct:api)</span>
                {result.directFull ? (
                  <span className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    Полный доступ
                  </span>
                ) : result.directRead ? (
                  <span className="flex items-center gap-2 text-yellow-400">
                    <AlertTriangle className="w-5 h-5" />
                    Только чтение
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-red-400">
                    <XCircle className="w-5 h-5" />
                    Нет доступа
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="font-medium">Директ отчёты (direct:api:read)</span>
                {result.directRead ? (
                  <span className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    Есть доступ
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-red-400">
                    <XCircle className="w-5 h-5" />
                    Нет доступа
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
