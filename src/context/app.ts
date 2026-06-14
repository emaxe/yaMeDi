import { createContext } from 'react'

import type { Counter } from '../types'

export interface AppState {
  activeTab: string
  setActiveTab: (id: string) => void
  selectedCounter: Counter | null
  setSelectedCounter: (counter: Counter | null) => void
  selectCounter: (counter: Counter) => void
}

export const AppContext = createContext<AppState | null>(null)

export interface AppProviderProps {
  children: React.ReactNode
}
