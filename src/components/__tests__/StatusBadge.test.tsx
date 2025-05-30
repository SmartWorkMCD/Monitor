// src/components/__tests__/StatusBadge.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test/utils'
import StatusBadge from '../StatusBadge'
import type { SystemStatus } from '../../types'

describe('StatusBadge', () => {
  it('renders operational status correctly', () => {
    render(<StatusBadge status="Operational" />)

    const badge = screen.getByTestId('status-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('Operational')
    expect(badge).toHaveAttribute('data-status', 'operational')
    expect(badge).toHaveClass('bg-green-100', 'text-green-800', 'border-green-200')
  })

  it('renders warning status correctly', () => {
    render(<StatusBadge status="Warning" />)

    const badge = screen.getByTestId('status-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('Warning')
    expect(badge).toHaveAttribute('data-status', 'warning')
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800', 'border-yellow-200')
  })

  it('renders critical status correctly', () => {
    render(<StatusBadge status="Critical" />)

    const badge = screen.getByTestId('status-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('Critical')
    expect(badge).toHaveAttribute('data-status', 'critical')
    expect(badge).toHaveClass('bg-red-100', 'text-red-800', 'border-red-200')
  })

  it('applies correct size classes for small size', () => {
    render(<StatusBadge status="Operational" size="sm" />)

    const badge = screen.getByTestId('status-badge')
    expect(badge).toHaveAttribute('data-size', 'sm')
    expect(badge).toHaveClass('px-2', 'py-0.5', 'text-xs')
  })

  it('applies correct size classes for medium size (default)', () => {
    render(<StatusBadge status="Operational" size="md" />)

    const badge = screen.getByTestId('status-badge')
    expect(badge).toHaveAttribute('data-size', 'md')
    expect(badge).toHaveClass('px-2', 'py-1', 'text-xs')
  })

  it('uses medium size by default when size prop is not provided', () => {
    render(<StatusBadge status="Operational" />)

    const badge = screen.getByTestId('status-badge')
    expect(badge).toHaveAttribute('data-size', 'md')
    expect(badge).toHaveClass('px-2', 'py-1', 'text-xs')
  })

  it('has proper accessibility attributes', () => {
    render(<StatusBadge status="Critical" />)

    const badge = screen.getByTestId('status-badge')
    expect(badge).toBeVisible()
    expect(badge.tagName).toBe('SPAN')
  })

  it('applies common styling classes to all badges', () => {
    render(<StatusBadge status="Warning" />)

    const badge = screen.getByTestId('status-badge')
    expect(badge).toHaveClass(
      'border',
      'rounded-full',
      'font-medium',
      'inline-flex',
      'items-center'
    )
  })

  it('can be selected by status using data attribute', () => {
    const { container } = render(
      <div>
        <StatusBadge status="Operational" />
        <StatusBadge status="Warning" />
        <StatusBadge status="Critical" />
      </div>
    )

    // Can select specific status badges using data attributes
    const operationalBadge = container.querySelector('[data-status="operational"]')
    const warningBadge = container.querySelector('[data-status="warning"]')
    const criticalBadge = container.querySelector('[data-status="critical"]')

    expect(operationalBadge).toHaveTextContent('Operational')
    expect(warningBadge).toHaveTextContent('Warning')
    expect(criticalBadge).toHaveTextContent('Critical')
  })

  it('can be selected by size using data attribute', () => {
    const { container } = render(
      <div>
        <StatusBadge status="Operational" size="sm" />
        <StatusBadge status="Warning" size="md" />
      </div>
    )

    const smallBadge = container.querySelector('[data-size="sm"]')
    const mediumBadge = container.querySelector('[data-size="md"]')

    expect(smallBadge).toHaveClass('py-0.5')
    expect(mediumBadge).toHaveClass('py-1')
  })

  it.each([
    ['Operational' as SystemStatus, 'operational', 'bg-green-100 text-green-800 border-green-200'],
    ['Warning' as SystemStatus, 'warning', 'bg-yellow-100 text-yellow-800 border-yellow-200'],
    ['Critical' as SystemStatus, 'critical', 'bg-red-100 text-red-800 border-red-200'],
  ])('renders %s status with correct styling and data attributes', (status, dataStatus, expectedClasses) => {
    render(<StatusBadge status={status} />)

    const badge = screen.getByTestId('status-badge')
    expect(badge).toHaveAttribute('data-status', dataStatus)

    const classes = expectedClasses.split(' ')
    classes.forEach(className => {
      expect(badge).toHaveClass(className)
    })
  })

  it.each([
    ['sm', 'px-2 py-0.5 text-xs'],
    ['md', 'px-2 py-1 text-xs'],
  ])('applies correct size classes for %s size', (size, expectedClasses) => {
    render(<StatusBadge status="Operational" size={size as 'sm' | 'md'} />)

    const badge = screen.getByTestId('status-badge')
    expect(badge).toHaveAttribute('data-size', size)

    const classes = expectedClasses.split(' ')
    classes.forEach(className => {
      expect(badge).toHaveClass(className)
    })
  })

  it('maintains consistent structure across different configurations', () => {
    const statuses: SystemStatus[] = ['Operational', 'Warning', 'Critical']
    const sizes: ('sm' | 'md')[] = ['sm', 'md']

    statuses.forEach(status => {
      sizes.forEach(size => {
        const { unmount } = render(<StatusBadge status={status} size={size} />)

        const badge = screen.getByTestId('status-badge')

        // All badges should have these common properties
        expect(badge).toBeVisible()
        expect(badge).toHaveAttribute('data-testid', 'status-badge')
        expect(badge).toHaveAttribute('data-status')
        expect(badge).toHaveAttribute('data-size')
        expect(badge.tagName).toBe('SPAN')

        unmount()
      })
    })
  })

  it('has proper text content and no extra whitespace', () => {
    render(<StatusBadge status="Warning" />)

    const badge = screen.getByTestId('status-badge')
    expect(badge.textContent).toBe('Warning')
    expect(badge.textContent?.trim()).toBe('Warning')
  })

  it('can be easily identified in component trees', () => {
    render(
      <div>
        <div>Some other content</div>
        <StatusBadge status="Critical" />
        <div>More content</div>
      </div>
    )

    // Should be easy to find the status badge specifically
    const badge = screen.getByTestId('status-badge')
    expect(badge).toHaveTextContent('Critical')
    expect(badge).toHaveAttribute('data-status', 'critical')
  })
})
