import { Shield, XCircle } from 'lucide-react'

import { Card } from '../ui/Card'

interface AccountInfoProps {
  account: {
    valid: boolean
    login?: string
    id?: string
    first_name?: string
    last_name?: string
    default_email?: string
    scope?: string | string[]
    error?: string
  }
}

export function DiagnosticsAccountInfo({ account }: AccountInfoProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5 text-blue-400" />
        Информация об аккаунте
      </h3>
      {account.valid ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-gray-400">Логин</div>
            <div className="font-medium">{account.login || '—'}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-400">ID</div>
            <div className="font-medium">{account.id || '—'}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-400">Имя</div>
            <div className="font-medium">{account.first_name || '—'}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-400">Фамилия</div>
            <div className="font-medium">{account.last_name || '—'}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-400">Email</div>
            <div className="font-medium">{account.default_email || '—'}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-400">Scopes</div>
            <div className="font-medium text-xs break-all">
              {Array.isArray(account.scope) ? account.scope.join(', ') : account.scope || '—'}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-red-300">
          <XCircle className="w-5 h-5" />
          <span>{account.error || 'Токен невалиден'}</span>
        </div>
      )}
    </Card>
  )
}
