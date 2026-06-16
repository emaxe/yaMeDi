import { useCallback, useEffect, useState } from 'react'

import { getAccountInfo } from '../api/diagnostics'
import { queryClient } from '../lib/queryClient'

import { AuthContext, type AuthProviderProps } from './auth'

async function resolveLogin(token: string | null): Promise<string | null> {
  if (!token) return null
  try {
    const info = await getAccountInfo(token)
    console.log('[auth] Account info resolved:', info)
    return info.login ?? null
  } catch (err) {
    console.error('[auth] Failed to resolve login:', err)
    return null
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setTokenState] = useState<string | null>(null)
  const [login, setLogin] = useState<string | null>(null)
  const [clientLogin, setClientLoginState] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [stored, storedClientLogin] = await Promise.all([
          window.electronAPI?.getToken(),
          window.electronAPI?.getClientLogin(),
        ])
        setTokenState(stored ?? null)
        setClientLoginState(storedClientLogin ?? null)
        if (stored) {
          setLogin(await resolveLogin(stored))
        }
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
    setLogin(await resolveLogin(cleaned))
    queryClient.invalidateQueries()
  }, [])

  const deleteToken = useCallback(async () => {
    await window.electronAPI?.deleteToken()
    setTokenState(null)
    setLogin(null)
    queryClient.clear()
  }, [])

  const setClientLogin = useCallback(async (value: string) => {
    const cleaned = value.trim()
    await window.electronAPI?.setClientLogin(cleaned)
    setClientLoginState(cleaned)
    queryClient.invalidateQueries()
  }, [])

  const deleteClientLogin = useCallback(async () => {
    await window.electronAPI?.deleteClientLogin()
    setClientLoginState(null)
    queryClient.invalidateQueries()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        token,
        login,
        clientLogin,
        isReady,
        hasToken: !!token,
        setToken,
        deleteToken,
        setClientLogin,
        deleteClientLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
