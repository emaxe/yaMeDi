import { useCallback, useState } from 'react'

import { getDefaultDates } from '../lib/dateRanges'
import type { Counter, DateRange } from '../types'

import { AppContext, type AppProviderProps } from './app'

export function AppProvider({ children }: AppProviderProps) {
  const [activeTab, setActiveTab] = useState('token')
  const [selectedCounter, setSelectedCounter] = useState<Counter | null>(null)
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null)
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDates)
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  const selectCounter = useCallback((counter: Counter) => {
    setSelectedCounter(counter)
    setActiveTab('metrics')
  }, [])

  const selectCampaign = useCallback((id: number) => {
    setSelectedCampaignId(id)
    setActiveTab('company-analytics')
  }, [])

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedCounter,
        setSelectedCounter,
        selectCounter,
        selectedCampaignId,
        setSelectedCampaignId,
        selectCampaign,
        dateRange,
        setDateRange,
        isDrawerOpen,
        setDrawerOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
