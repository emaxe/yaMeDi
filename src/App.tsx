import { useState } from 'react'

import Campaigns from './components/Campaigns'
import CountersList from './components/CountersList'
import Diagnostics from './components/Diagnostics'
import MetricsDashboard from './components/MetricsDashboard'
import Sidebar from './components/Sidebar'
import TokenSetup from './components/TokenSetup'
import { Counter } from './types'

export default function App() {
  const [activeTab, setActiveTab] = useState('token')
  const [selectedCounter, setSelectedCounter] = useState<Counter | null>(null)

  const handleNavigate = (id: string) => {
    setActiveTab(id)
  }

  const handleSelectCounter = (counter: Counter) => {
    setSelectedCounter(counter)
    setActiveTab('metrics')
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-yandex-dark">
      <Sidebar
        active={activeTab}
        onNavigate={handleNavigate}
        hasSelectedCounter={!!selectedCounter}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'token' && <TokenSetup />}
          {activeTab === 'diagnostics' && <Diagnostics />}
          {activeTab === 'counters' && (
            <CountersList
              onSelectCounter={handleSelectCounter}
              selectedCounterId={selectedCounter?.id}
            />
          )}
          {activeTab === 'metrics' && selectedCounter && (
            <MetricsDashboard counter={selectedCounter} />
          )}
          {activeTab === 'metrics' && !selectedCounter && (
            <div className="text-gray-400 text-center py-12">
              Сначала выберите счётчик в разделе «Счётчики»
            </div>
          )}
          {activeTab === 'campaigns' && <Campaigns />}
        </div>
      </main>
    </div>
  )
}
