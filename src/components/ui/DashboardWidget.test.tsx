import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { DashboardWidget } from './DashboardWidget'

describe('DashboardWidget', () => {
  it('renders title and children', () => {
    render(
      <DashboardWidget title="Test Widget" isLoading={false}>
        <div>Content</div>
      </DashboardWidget>
    )
    expect(screen.getByText('Test Widget')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('renders skeleton when loading', () => {
    render(
      <DashboardWidget title="Test Widget" isLoading={true}>
        <div>Content</div>
      </DashboardWidget>
    )
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })

  it('renders error and retry button', async () => {
    const user = userEvent.setup()
    const retry = vi.fn()
    render(
      <DashboardWidget title="Test Widget" isLoading={false} error={new Error('Load failed')} onRetry={retry}>
        <div>Content</div>
      </DashboardWidget>
    )
    expect(screen.getByText('Load failed')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /повторить загрузку/i }))
    expect(retry).toHaveBeenCalled()
  })

  it('calls export handler when export button is clicked', async () => {
    const user = userEvent.setup()
    const exportFn = vi.fn()
    render(
      <DashboardWidget title="Test Widget" isLoading={false} onExport={exportFn}>
        <div>Content</div>
      </DashboardWidget>
    )
    await user.click(screen.getByRole('button', { name: /скачать csv/i }))
    expect(exportFn).toHaveBeenCalled()
  })
})
