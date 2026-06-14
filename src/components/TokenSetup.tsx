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
        <Key className="w-6 h-6 text-primary" aria-hidden="true" />
        <h2 className="text-headline-lg text-on-background">Настройка OAuth-токена</h2>
      </div>

      <Card className="p-6 space-y-4">
        <div>
          <label htmlFor="client-id" className="block text-label-sm text-on-surface-muted mb-2">
            Client ID приложения
          </label>
          <input
            id="client-id"
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="Введите Client ID"
            className="w-full h-9 px-3 bg-surface-elevated border border-outline rounded-sm text-body-md text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:border-primary-focus"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={openAuth}
            className="inline-flex items-center gap-2 h-10 px-4 bg-primary text-on-primary rounded-sm text-label-md hover:bg-primary-strong transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus"
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
            Открыть страницу авторизации
          </button>
        </div>

        <div className="bg-surface-soft rounded-lg p-4 text-body-md text-on-surface-muted">
          <p>После авторизации Яндекс перенаправит на:</p>
          <code className="block mt-2 text-code-sm text-primary break-all">
            https://oauth.yandex.ru/verification_code#access_token=AQAAAA...
          </code>
          <p className="mt-2">Скопируйте значение токена и вставьте ниже.</p>
        </div>

        <div>
          <label htmlFor="oauth-token" className="block text-label-sm text-on-surface-muted mb-2">
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
                className="w-full h-9 px-3 pr-10 bg-surface-elevated border border-outline rounded-sm text-body-md text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:border-primary-focus"
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'token-error' : undefined}
              />
              <button
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-muted hover:text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus rounded p-1"
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
              className={saved ? 'bg-success hover:bg-success/90' : undefined}
              aria-label="Сохранить токен"
            >
              {saved ? <Check className="w-4 h-4" aria-hidden="true" /> : null}
              {saved ? 'Сохранено' : 'Сохранить'}
            </LoadingButton>
            {hasToken && (
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 h-10 px-4 bg-danger/10 text-danger border border-danger/20 rounded-sm text-label-md hover:bg-danger/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus"
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
