import { useCallback, useState } from 'react'

import { AppContext, type AppProviderProps } from './app'

export function AppProvider({ children }: AppProviderProps) {
  const [activeTab, setActiveTab] = useState('token')
  const [selectedCounter, setSelectedCounter] = useState<import('../types').Counter | null>(null)
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  const selectCounter = useCallback((counter: import('../types').Counter) => {
    setSelectedCounter(counter)
    setActiveTab('metrics')
  }, [])

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedCounter,
        setSelectedCounter,
        selectCounter,
        isDrawerOpen,
        setDrawerOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
