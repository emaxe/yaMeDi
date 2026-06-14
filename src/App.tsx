import { Suspense, lazy, useEffect } from 'react'

import { ErrorBoundary } from './components/ErrorBoundary'
import Sidebar from './components/Sidebar'
import { SkeletonCard } from './components/ui/Skeleton'
import { useApp } from './hooks/useApp'

const TokenSetup = lazy(() => import('./components/TokenSetup'))
const Diagnostics = lazy(() => import('./components/Diagnostics'))
const CountersList = lazy(() => import('./components/CountersList'))
const MetricsDashboard = lazy(() => import('./components/MetricsDashboard'))
const Campaigns = lazy(() => import('./components/Campaigns'))

function TabLoader() {
  return (
    <div className="space-y-6 py-4">
      <SkeletonCard className="h-16" />
      <div className="grid gap-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}

export default function App() {
  const { activeTab, selectedCounter } = useApp()

  useEffect(() => {
    if (!window.electronAPI) return

    const unsubscribe = window.electronAPI.onMainProcessMessage((message) => {
      console.log('[main-process-message]', message)
    })

    return unsubscribe
  }, [])

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-yandex-dark">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          <ErrorBoundary>
            {activeTab === 'token' && (
              <Suspense fallback={<TabLoader />}>
                <TokenSetup />
              </Suspense>
            )}
          </ErrorBoundary>
          <ErrorBoundary>
            {activeTab === 'diagnostics' && (
              <Suspense fallback={<TabLoader />}>
                <Diagnostics />
              </Suspense>
            )}
          </ErrorBoundary>
          <ErrorBoundary>
            {activeTab === 'counters' && (
              <Suspense fallback={<TabLoader />}>
                <CountersList />
              </Suspense>
            )}
          </ErrorBoundary>
          <ErrorBoundary>
            {activeTab === 'metrics' && selectedCounter && (
              <Suspense fallback={<TabLoader />}>
                <MetricsDashboard />
              </Suspense>
            )}
            {activeTab === 'metrics' && !selectedCounter && (
              <div className="text-gray-400 text-center py-12">
                Сначала выберите счётчик в разделе «Счётчики»
              </div>
            )}
          </ErrorBoundary>
          <ErrorBoundary>
            {activeTab === 'campaigns' && (
              <Suspense fallback={<TabLoader />}>
                <Campaigns />
              </Suspense>
            )}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}
