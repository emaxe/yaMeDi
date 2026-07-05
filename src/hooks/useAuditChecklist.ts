import { useCallback, useEffect, useState } from 'react'

import { DEFAULT_AUDIT_ITEMS, markAsChecked } from '../lib/auditChecklist'
import type { AuditChecklistItem, AuditStatus } from '../types'

export function useAuditChecklist() {
  const [items, setItems] = useState<AuditChecklistItem[]>(DEFAULT_AUDIT_ITEMS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!window.electronAPI) {
      setIsLoading(false)
      return
    }

    let cancelled = false

    window.electronAPI
      .getAuditChecklist()
      .then((saved) => {
        if (cancelled) return
        if (saved && saved.length > 0) {
          setItems(saved)
        }
      })
      .catch((err) => {
        console.error('[useAuditChecklist] Failed to load:', err)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const updateItem = useCallback(
    (itemId: string, date: string, status: AuditStatus = 'ok') => {
      setItems((prev) => {
        const next = markAsChecked(prev, itemId, date, status)
        window.electronAPI?.setAuditChecklist(next).catch((err) => {
          console.error('[useAuditChecklist] Failed to save:', err)
        })
        return next
      })
    },
    []
  )

  return { items, isLoading, updateItem }
}
