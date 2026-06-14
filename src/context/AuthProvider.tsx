import { useCallback, useEffect, useState } from 'react'

import { queryClient } from '../lib/queryClient'

import { AuthContext, type AuthProviderProps } from './auth'

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setTokenState] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await window.electronAPI?.getToken()
        setTokenState(stored ?? null)
      } catch (err) {
        console.error('[auth] Failed to load token:', err)
      } finally {
        setIsReady(true)
      }
    }
    load()
  }, [])

  const setToken = useCallback(async (value: string) => {
    const cleaned = value.trim().replace(/^["']|["']$/g, '')
    await window.electronAPI?.setToken(cleaned)
    setTokenState(cleaned)
    queryClient.invalidateQueries()
  }, [])

  const deleteToken = useCallback(async () => {
    await window.electronAPI?.deleteToken()
    setTokenState(null)
    queryClient.clear()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        token,
        isReady,
        hasToken: !!token,
        setToken,
        deleteToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
