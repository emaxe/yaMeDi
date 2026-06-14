import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

import { Card } from '../ui/Card'

interface ScopesCheckProps {
  metrica: boolean
  directFull: boolean
  directRead: boolean
}

export function DiagnosticsScopesCheck({ metrica, directFull, directRead }: ScopesCheckProps) {
  return (
    <Card className="p-6">
      <h3 className="text-title-md text-on-background mb-4">Проверка прав доступа</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-outline">
          <span className="text-body-md font-medium text-on-surface">Метрика (metrika:read)</span>
          {metrica ? (
            <span className="flex items-center gap-2 text-body-md text-success">
              <CheckCircle className="w-5 h-5" aria-hidden="true" />
              Есть доступ
            </span>
          ) : (
            <span className="flex items-center gap-2 text-body-md text-danger">
              <XCircle className="w-5 h-5" aria-hidden="true" />
              Нет доступа
            </span>
          )}
        </div>
        <div className="flex items-center justify-between py-2 border-b border-outline">
          <span className="text-body-md font-medium text-on-surface">Директ (direct:api)</span>
          {directFull ? (
            <span className="flex items-center gap-2 text-body-md text-success">
              <CheckCircle className="w-5 h-5" aria-hidden="true" />
              Полный доступ
            </span>
          ) : directRead ? (
            <span className="flex items-center gap-2 text-body-md text-warning">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
              Только чтение
            </span>
          ) : (
            <span className="flex items-center gap-2 text-body-md text-danger">
              <XCircle className="w-5 h-5" aria-hidden="true" />
              Нет доступа
            </span>
          )}
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-body-md font-medium text-on-surface">Директ отчёты (direct:api:read)</span>
          {directRead ? (
            <span className="flex items-center gap-2 text-body-md text-success">
              <CheckCircle className="w-5 h-5" aria-hidden="true" />
              Есть доступ
            </span>
          ) : (
            <span className="flex items-center gap-2 text-body-md text-danger">
              <XCircle className="w-5 h-5" aria-hidden="true" />
              Нет доступа
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}
