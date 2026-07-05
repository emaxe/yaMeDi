import { format } from 'date-fns'
import { ClipboardCheck, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react'

import { useAuditChecklist } from '../hooks/useAuditChecklist'
import { getDaysSinceLastCheck, isOverdue } from '../lib/auditChecklist'
import type { AuditChecklistItem, AuditStatus } from '../types'

import { Card } from './ui/Card'

const STATUS_CONFIG: Record<
  AuditStatus,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  ok: { label: 'OK', icon: CheckCircle2, className: 'text-status-production-fg' },
  missing: { label: 'Нет', icon: XCircle, className: 'text-danger' },
  pending: { label: 'Выяснить', icon: Clock, className: 'text-status-development-fg' },
}

function AuditRow({
  item,
  onCheck,
}: {
  item: AuditChecklistItem
  onCheck: (itemId: string, date: string, status: AuditStatus) => void
}) {
  const overdue = isOverdue(item)
  const daysSince = getDaysSinceLastCheck(item)
  const statusConfig = STATUS_CONFIG[item.status]
  const StatusIcon = statusConfig.icon

  return (
    <div data-testid={`audit-item-${item.id}`}>
      <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <StatusIcon className={`w-5 h-5 mt-0.5 shrink-0 ${statusConfig.className}`} aria-hidden="true" />
          <div className="min-w-0">
            <div className="text-body-md text-on-background font-medium">{item.label}</div>
            <div className="text-body-sm text-on-surface-muted mt-1">
              {item.lastCheckedDate ? (
                <>
                  Последняя проверка: {format(new Date(item.lastCheckedDate), 'dd.MM.yyyy')}
                  {daysSince !== null && (
                    <span className="ml-2">
                      ({daysSince} дн. назад)
                    </span>
                  )}
                </>
              ) : (
                'Не проверялось'
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {overdue && (
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded-pill text-label-sm bg-warning/15 text-warning"
              title="Проверка просрочена"
            >
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
              Просрочено
            </span>
          )}
          <button
            type="button"
            onClick={() => onCheck(item.id, format(new Date(), 'yyyy-MM-dd'), 'ok')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-label-md bg-primary text-on-primary hover:bg-primary-focus transition"
          >
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            Проверено
          </button>
        </div>
      </div>
    </Card>
    </div>
  )
}

export default function AuditChecklist() {
  const { items, isLoading, updateItem } = useAuditChecklist()

  const overdueCount = items.filter((item) => isOverdue(item)).length

  return (
    <div className="space-y-6" data-testid="audit-checklist-page">
      <div className="flex items-center gap-3">
        <ClipboardCheck className="w-6 h-6 text-primary" aria-hidden="true" />
        <h2 className="text-headline-lg text-on-background">Аудит аналитики</h2>
      </div>

      {overdueCount > 0 && (
        <Card className="p-4 border-warning/30">
          <div className="flex items-center gap-2 text-warning">
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            <span className="text-body-md">
              {overdueCount} {overdueCount === 1 ? 'проверка просрочена' : 'проверок просрочено'}
            </span>
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="text-body-md text-on-surface-muted">Загрузка…</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <AuditRow key={item.id} item={item} onCheck={updateItem} />
          ))}
        </div>
      )}
    </div>
  )
}
