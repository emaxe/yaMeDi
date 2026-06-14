import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MetricDelta } from './MetricDelta'

describe('MetricDelta', () => {
  it('renders positive delta with up arrow', () => {
    render(<MetricDelta current={120} previous={100} />)
    expect(screen.getByText('20.0%')).toBeInTheDocument()
  })

  it('renders negative delta with down arrow', () => {
    render(<MetricDelta current={80} previous={100} />)
    expect(screen.getByText('-20.0%')).toBeInTheDocument()
  })

  it('renders dash when both values are zero', () => {
    render(<MetricDelta current={0} previous={0} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('inverts color logic when inverse is true', () => {
    const { container } = render(<MetricDelta current={80} previous={100} inverse />)
    expect(container.querySelector('.text-success')).toBeInTheDocument()
  })
})
