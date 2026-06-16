import { Activity } from 'lucide-react'

import { useRunDiagnostics } from '../api/diagnostics'
import { useAuth } from '../hooks/useAuth'

import { DiagnosticsAccountInfo } from './diagnostics/AccountInfo'
import { DiagnosticsScopesCheck } from './diagnostics/ScopesCheck'
import { ErrorAlert } from './ui/ErrorAlert'
import { LoadingButton } from './ui/LoadingButton'

export default function Diagnostics() {
  const { hasToken } = useAuth()
  const { mutate, isPending, data: result, error } = useRunDiagnostics()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-primary" aria-hidden="true" />
          <h2 className="text-headline-lg text-on-background">Диагностика токена</h2>
        </div>
        <LoadingButton
          onClick={() => mutate()}
          loading={isPending}
          loadingText="Проверка..."
          disabled={!hasToken}
          className="w-full sm:w-auto"
        >
          Запустить диагностику
        </LoadingButton>
      </div>

      {error && <ErrorAlert message={error.message} onRetry={() => mutate()} />}

      {result && (
        <div className="space-y-4">
          {result.account && <DiagnosticsAccountInfo account={result.account} />}
          <DiagnosticsScopesCheck
            metrica={result.metrica}
            directFull={result.directFull}
            directFullReason={result.directFullReason}
            directRead={result.directRead}
            directReadReason={result.directReadReason}
          />
        </div>
      )}
    </div>
  )
}
