import { createContext } from 'react'

export interface AuthState {
  token: string | null
  login: string | null
  clientLogin: string | null
  isReady: boolean
  hasToken: boolean
  setToken: (token: string) => Promise<void>
  deleteToken: () => Promise<void>
  setClientLogin: (clientLogin: string) => Promise<void>
  deleteClientLogin: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)

export interface AuthProviderProps {
  children: React.ReactNode
}
