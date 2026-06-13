import { Key, ExternalLink, Eye, EyeOff, Save, Check } from 'lucide-react'
import { useState, useCallback } from 'react'

import { setToken, getToken } from '../api/yandexApi'

declare global {
  interface Window {
    electronAPI?: {
      openExternal: (url: string) => Promise<void>
    }
  }
}

export default function TokenSetup() {
  const [clientId, setClientId] = useState('')
  const [token, setTokenInput] = useState(getToken())
  const [showToken, setShowToken] = useState(false)
  const [saved, setSaved] = useState(false)

  const authUrl = `https://oauth.yandex.ru/authorize?response_type=token&client_id=${encodeURIComponent(clientId || 'your_client_id')}`

  const openAuth = useCallback(async () => {
    if (window.electronAPI) {
      await window.electronAPI.openExternal(authUrl)
    } else {
      window.open(authUrl, '_blank')
    }
  }, [authUrl])

  const handleSave = () => {
    setToken(token)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Key className="w-6 h-6 text-yandex-yellow" />
        <h2 className="text-2xl font-bold">Настройка OAuth-токена</h2>
      </div>

      <div className="bg-yandex-card rounded-xl p-6 border border-yandex-border space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Client ID приложения</label>
          <input
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
            className="flex items-center gap-2 px-4 py-2 bg-yandex-yellow text-black rounded-lg font-medium hover:brightness-110 transition"
          >
            <ExternalLink className="w-4 h-4" />
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
          <label className="block text-sm font-medium text-gray-400 mb-2">OAuth-токен</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showToken ? 'text' : 'password'}
                value={token}
                onChange={(e) => {
                  setTokenInput(e.target.value)
                  setSaved(false)
                }}
                placeholder="Вставьте токен сюда"
                className="w-full bg-yandex-dark border border-yandex-border rounded-lg px-4 py-2 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-yandex-yellow"
              />
              <button
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                saved
                  ? 'bg-green-600 text-white'
                  : 'bg-yandex-yellow text-black hover:brightness-110'
              }`}
            >
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Сохранено' : 'Сохранить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
