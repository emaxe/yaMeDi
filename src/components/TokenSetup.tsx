import { Check, ExternalLink, Eye, EyeOff, Key, Trash2 } from 'lucide-react'
import { useState, useCallback } from 'react'

import { useAuth } from '../hooks/useAuth'

import { Card } from './ui/Card'
import { ErrorAlert } from './ui/ErrorAlert'
import { LoadingButton } from './ui/LoadingButton'

function isValidTokenFormat(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return 'Введите токен'
  if (trimmed.length < 10) return 'Токен слишком короткий'
  if (/\s/.test(trimmed)) return 'Токен не должен содержать пробелов'
  if (!/^[A-Za-z0-9_.~+/-]+$/.test(trimmed)) {
    return 'Токен содержит недопустимые символы'
  }
  return null
}

export default function TokenSetup() {
  const { token, hasToken, setToken, deleteToken } = useAuth()
  const [clientId, setClientId] = useState('')
  const [tokenInput, setTokenInput] = useState(token ?? '')
  const [showToken, setShowToken] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const authUrl = `https://oauth.yandex.ru/authorize?response_type=token&client_id=${encodeURIComponent(clientId || 'your_client_id')}`

  const openAuth = useCallback(async () => {
    if (window.electronAPI) {
      await window.electronAPI.openExternal(authUrl)
    } else {
      window.open(authUrl, '_blank')
    }
  }, [authUrl])

  const handleSave = async () => {
    const validationError = isValidTokenFormat(tokenInput)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setSaving(true)
    try {
      await setToken(tokenInput)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    await deleteToken()
    setTokenInput('')
    setError(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Key className="w-6 h-6 text-yandex-yellow" aria-hidden="true" />
        <h2 className="text-2xl font-bold">Настройка OAuth-токена</h2>
      </div>

      <Card className="p-6 space-y-4">
        <div>
          <label htmlFor="client-id" className="block text-sm font-medium text-gray-400 mb-2">
            Client ID приложения
          </label>
          <input
            id="client-id"
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="Введите Client ID"
            className="w-full bg-yandex-dark border border-yandex-border rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-yandex-yellow"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={openAuth}
            className="flex items-center gap-2 px-4 py-2 bg-yandex-yellow text-black rounded-lg font-medium hover:brightness-110 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yandex-yellow/50"
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
            Открыть страницу авторизации
          </button>
        </div>

        <div className="bg-yandex-dark/50 rounded-lg p-4 text-sm text-gray-400">
          <p>После авторизации Яндекс перенаправит на:</p>
          <code className="block mt-2 text-xs text-yandex-yellow break-all">
            https://oauth.yandex.ru/verification_code#access_token=AQAAAA...
          </code>
          <p className="mt-2">Скопируйте значение токена и вставьте ниже.</p>
        </div>

        <div>
          <label htmlFor="oauth-token" className="block text-sm font-medium text-gray-400 mb-2">
            OAuth-токен
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="oauth-token"
                type={showToken ? 'text' : 'password'}
                value={tokenInput}
                onChange={(e) => {
                  setTokenInput(e.target.value)
                  setSaved(false)
                  if (error) setError(null)
                }}
                placeholder="Вставьте токен сюда"
                className="w-full bg-yandex-dark border border-yandex-border rounded-lg px-4 py-2 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-yandex-yellow"
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'token-error' : undefined}
              />
              <button
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yandex-yellow/50 rounded p-1"
                aria-label={showToken ? 'Скрыть токен' : 'Показать токен'}
                type="button"
              >
                {showToken ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
              </button>
            </div>
            <LoadingButton
              onClick={handleSave}
              loading={saving}
              loadingText="Сохранение..."
              className={saved ? 'bg-green-600 text-white hover:brightness-110' : undefined}
              aria-label="Сохранить токен"
            >
              {saved ? <Check className="w-4 h-4" aria-hidden="true" /> : null}
              {saved ? 'Сохранено' : 'Сохранить'}
            </LoadingButton>
            {hasToken && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-300 border border-red-700 rounded-lg font-medium hover:bg-red-600/30 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
                aria-label="Удалить сохранённый токен"
                type="button"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                Удалить
              </button>
            )}
          </div>
          {error && (
            <div id="token-error" className="mt-2">
              <ErrorAlert message={error} />
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
