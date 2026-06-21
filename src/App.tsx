import { Suspense, lazy, useEffect } from 'react'

import { ErrorBoundary } from './components/ErrorBoundary'
import { MobileBottomNav } from './components/mobile/MobileBottomNav'
import { MobileDrawer } from './components/mobile/MobileDrawer'
import { ShellHeader } from './components/ShellHeader'
import Sidebar from './components/Sidebar'
import { SkeletonCard } from './components/ui/Skeleton'
import { useApp } from './hooks/useApp'

const TokenSetup = lazy(() => import('./components/TokenSetup'))
const Diagnostics = lazy(() => import('./components/Diagnostics'))
const CountersList = lazy(() => import('./components/CountersList'))
const MetricsDashboard = lazy(() => import('./components/MetricsDashboard'))
const Campaigns = lazy(() => import('./components/Campaigns'))
const CampaignAnalytics = lazy(() => import('./components/CampaignAnalytics'))
const OverallAnalytics = lazy(() => import('./components/OverallAnalytics').then((m) => ({ default: m.OverallAnalytics })))
const OperationalReport = lazy(() => import('./components/OperationalReport'))

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
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background">
      <ShellHeader />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="max-w-container mx-auto px-4 py-4 sm:px-6 lg:px-8 lg:py-6 pb-20 lg:pb-6">
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
                <div className="text-on-surface-muted text-center py-12">
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
            <ErrorBoundary>
              {activeTab === 'overall-analytics' && (
                <Suspense fallback={<TabLoader />}>
                  <OverallAnalytics />
                </Suspense>
              )}
            </ErrorBoundary>
            <ErrorBoundary>
              {activeTab === 'operational-report' && (
                <Suspense fallback={<TabLoader />}>
                  <OperationalReport />
                </Suspense>
              )}
            </ErrorBoundary>
            <ErrorBoundary>
              {activeTab === 'company-analytics' && (
                <Suspense fallback={<TabLoader />}>
                  <CampaignAnalytics />
                </Suspense>
              )}
            </ErrorBoundary>
          </div>
        </main>
      </div>
      <MobileBottomNav />
      <MobileDrawer />
    </div>
  )
}
