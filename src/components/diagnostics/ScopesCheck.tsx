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
      <h3 className="text-lg font-semibold mb-4">Проверка прав доступа</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-yandex-border/50">
          <span className="font-medium">Метрика (metrika:read)</span>
          {metrica ? (
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
          {directFull ? (
            <span className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              Полный доступ
            </span>
          ) : directRead ? (
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
          {directRead ? (
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
    </Card>
  )
}
