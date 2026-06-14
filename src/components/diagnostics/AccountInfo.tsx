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
      <h3 className="text-title-md text-on-background mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5 text-info" aria-hidden="true" />
        Информация об аккаунте
      </h3>
      {account.valid ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-body-sm text-on-surface-muted">Логин</div>
            <div className="text-body-md font-medium text-on-surface">{account.login || '—'}</div>
          </div>
          <div className="space-y-1">
            <div className="text-body-sm text-on-surface-muted">ID</div>
            <div className="text-body-md font-medium text-on-surface">{account.id || '—'}</div>
          </div>
          <div className="space-y-1">
            <div className="text-body-sm text-on-surface-muted">Имя</div>
            <div className="text-body-md font-medium text-on-surface">{account.first_name || '—'}</div>
          </div>
          <div className="space-y-1">
            <div className="text-body-sm text-on-surface-muted">Фамилия</div>
            <div className="text-body-md font-medium text-on-surface">{account.last_name || '—'}</div>
          </div>
          <div className="space-y-1">
            <div className="text-body-sm text-on-surface-muted">Email</div>
            <div className="text-body-md font-medium text-on-surface">{account.default_email || '—'}</div>
          </div>
          <div className="space-y-1">
            <div className="text-body-sm text-on-surface-muted">Scopes</div>
            <div className="text-body-sm font-medium text-on-surface break-all">
              {Array.isArray(account.scope) ? account.scope.join(', ') : account.scope || '—'}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-danger">
          <XCircle className="w-5 h-5" aria-hidden="true" />
          <span className="text-body-md">{account.error || 'Токен невалиден'}</span>
        </div>
      )}
    </Card>
  )
}
