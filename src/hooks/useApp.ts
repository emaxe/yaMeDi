import { useContext } from 'react'

import { AppContext, type AppState } from '../context/app'

export function useApp(): AppState {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
