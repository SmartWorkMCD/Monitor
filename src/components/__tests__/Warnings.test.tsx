// src/components/__tests__/Warnings.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../../test/utils'
import Warnings from '../Warnings'
import { createMockWarnings, createMockWarning } from '../../test/utils'
import type { Warning } from '../../types'

// Mock dayjs
vi.mock('dayjs', () => {
  const mockDayjs: any = vi.fn(() => ({
    calendar: vi.fn(() => 'Yesterday at 3:30 PM'),
    format: vi.fn(() => 'May 1, 2024 10:00 AM'),
    fromNow: vi.fn(() => 'a few seconds ago')
  }))

  mockDayjs.extend = vi.fn()


  return { default: mockDayjs }
})

describe('Warnings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders warnings container with correct structure', () => {
    const mockWarnings = createMockWarnings(3)
    render(<Warnings warnings={mockWarnings} />)

    const container = screen.getByTestId('warnings-container')
    expect(container).toBeInTheDocument()
    expect(container).toHaveClass('bg-white', 'rounded-lg', 'shadow-md', 'p-4', 'flex', 'flex-col', 'h-full')
  })

  it('renders warning journal header', () => {
    const mockWarnings = createMockWarnings(3)
    render(<Warnings warnings={mockWarnings} />)

    const title = screen.getByTestId('warnings-title')
    expect(title).toBeInTheDocument()
    expect(title).toHaveTextContent('Warning Journal')
    expect(title).toHaveClass('text-lg', 'font-bold', 'mb-4', 'text-gray-700')
  })

  it('displays empty state when no warnings provided', () => {
    render(<Warnings warnings={[]} />)

    expect(screen.getByTestId('warnings-empty-state')).toBeInTheDocument()
    expect(screen.getByTestId('warnings-empty-state')).toHaveTextContent('No warnings to display')
    expect(screen.getByTestId('warnings-empty-state')).toHaveClass('text-center', 'text-gray-500', 'py-8')

    // Should not show warning items when empty
    expect(screen.queryByTestId('warning-item')).not.toBeInTheDocument()
  })

  it('renders all provided warnings in the warnings list', () => {
    const mockWarnings = createMockWarnings(3)
    render(<Warnings warnings={mockWarnings} />)

    const warningsList = screen.getByTestId('warnings-list')
    expect(warningsList).toBeInTheDocument()
    expect(warningsList).toHaveClass('overflow-y-auto', 'text-left')

    const warningItems = screen.getAllByTestId('warning-item')
    expect(warningItems).toHaveLength(3)

    // Verify each warning is rendered with correct data attributes
    mockWarnings.forEach((warning, index) => {
      expect(warningItems[index]).toHaveAttribute('data-warning-id', warning.id.toString())
      expect(warningItems[index]).toHaveAttribute('data-warning-severity', warning.severity)
    })
  })

  it('displays warning content correctly for each warning', () => {
    const warning = createMockWarning({
      id: 456,
      message: 'Test Warning Message',
      severity: 'medium'
    })
    render(<Warnings warnings={[warning]} />)

    const warningItem = screen.getByTestId('warning-item')
    expect(warningItem).toHaveAttribute('data-warning-id', '456')
    expect(warningItem).toHaveAttribute('data-warning-severity', 'medium')

    expect(screen.getByTestId('warning-content')).toBeInTheDocument()
    expect(screen.getByTestId('warning-icon')).toBeInTheDocument()
    expect(screen.getByTestId('warning-message')).toHaveTextContent('Test Warning Message')
    expect(screen.getByTestId('warning-timestamp')).toHaveTextContent('Yesterday at 3:30 PM')
  })

  it('displays high severity warnings with correct styling', () => {
    const highWarning = createMockWarning({
      severity: 'high',
      message: 'Critical system error'
    })
    render(<Warnings warnings={[highWarning]} />)

    const warningItem = screen.getByTestId('warning-item')
    expect(warningItem).toHaveAttribute('data-warning-severity', 'high')
    expect(warningItem).toHaveClass('border-red-500', 'bg-red-50')

    const warningIcon = screen.getByTestId('warning-icon')
    expect(warningIcon).toHaveClass('text-red-500')
  })

  it('displays medium severity warnings with correct styling', () => {
    const mediumWarning = createMockWarning({
      severity: 'medium',
      message: 'System performance degraded'
    })
    render(<Warnings warnings={[mediumWarning]} />)

    const warningItem = screen.getByTestId('warning-item')
    expect(warningItem).toHaveAttribute('data-warning-severity', 'medium')
    expect(warningItem).toHaveClass('border-yellow-500', 'bg-yellow-50')

    const warningIcon = screen.getByTestId('warning-icon')
    expect(warningIcon).toHaveClass('text-yellow-500')
  })

  it('displays low severity warnings with correct styling', () => {
    const lowWarning = createMockWarning({
      severity: 'low',
      message: 'Routine maintenance reminder'
    })
    render(<Warnings warnings={[lowWarning]} />)

    const warningItem = screen.getByTestId('warning-item')
    expect(warningItem).toHaveAttribute('data-warning-severity', 'low')
    expect(warningItem).toHaveClass('border-blue-500', 'bg-blue-50')

    const warningIcon = screen.getByTestId('warning-icon')
    expect(warningIcon).toHaveClass('text-blue-500')
  })

  it('displays timestamps for warnings', () => {
    const warning = createMockWarning({ message: 'Test warning' })
    render(<Warnings warnings={[warning]} />)

    const timestamp = screen.getByTestId('warning-timestamp')
    expect(timestamp).toHaveTextContent('Yesterday at 3:30 PM')
    expect(timestamp).toHaveClass('text-xs', 'text-gray-500', 'mt-1', 'text-left')
  })

  it('displays AlertTriangle icons for all warnings', () => {
    const warnings = createMockWarnings(3)
    render(<Warnings warnings={warnings} />)

    const warningIcons = screen.getAllByTestId('warning-icon')
    expect(warningIcons).toHaveLength(3)

    // Each warning should have an AlertTriangle icon (SVG)
    warningIcons.forEach(icon => {
      expect(icon.querySelector('svg')).toBeInTheDocument()
    })
  })

  it('renders view all alerts button in footer', () => {
    const warnings = createMockWarnings(2)
    render(<Warnings warnings={warnings} />)

    const footer = screen.getByTestId('warnings-footer')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveClass('mt-auto', 'pt-4', 'border-t', 'border-gray-100')

    const button = screen.getByTestId('view-all-alerts-button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('View All Alerts')
    expect(button).toHaveClass(
      'w-full',
      'py-2',
      'bg-gray-100',
      'hover:bg-gray-200',
      'text-gray-700',
      'font-medium',
      'rounded-md',
      'transition-colors',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-gray-300'
    )
  })

  it('handles view all alerts button click', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const warnings = createMockWarnings(1)
    const { user } = render(<Warnings warnings={warnings} />)

    const button = screen.getByTestId('view-all-alerts-button')
    await user.click(button)

    expect(consoleSpy).toHaveBeenCalledWith('View all alerts clicked')
    consoleSpy.mockRestore()
  })

  it('can select warnings by specific severity using data attributes', () => {
    const warnings: Warning[] = [
      createMockWarning({ id: 1, severity: 'high', message: 'High severity warning' }),
      createMockWarning({ id: 2, severity: 'medium', message: 'Medium severity warning' }),
      createMockWarning({ id: 3, severity: 'low', message: 'Low severity warning' }),
    ]

    const { container } = render(<Warnings warnings={warnings} />)

    const highWarning = container.querySelector('[data-warning-severity="high"]')
    const mediumWarning = container.querySelector('[data-warning-severity="medium"]')
    const lowWarning = container.querySelector('[data-warning-severity="low"]')

    expect(highWarning).toBeInTheDocument()
    expect(mediumWarning).toBeInTheDocument()
    expect(lowWarning).toBeInTheDocument()

    expect(highWarning).toHaveAttribute('data-warning-id', '1')
    expect(mediumWarning).toHaveAttribute('data-warning-id', '2')
    expect(lowWarning).toHaveAttribute('data-warning-id', '3')
  })

  it('can select specific warnings by ID using data attributes', () => {
    const warnings = createMockWarnings(3)
    const { container } = render(<Warnings warnings={warnings} />)

    warnings.forEach(warning => {
      const warningElement = container.querySelector(`[data-warning-id="${warning.id}"]`)
      expect(warningElement).toBeInTheDocument()
      expect(warningElement).toHaveAttribute('data-warning-severity', warning.severity)
    })
  })

  it('maintains proper component hierarchy', () => {
    const warnings = createMockWarnings(2)
    render(<Warnings warnings={warnings} />)

    const container = screen.getByTestId('warnings-container')
    const title = screen.getByTestId('warnings-title')
    const warningsList = screen.getByTestId('warnings-list')
    const footer = screen.getByTestId('warnings-footer')

    // Check hierarchy
    expect(container).toContainElement(title)
    expect(container).toContainElement(warningsList)
    expect(container).toContainElement(footer)

    // Check that warning items are in the list
    const warningItems = screen.getAllByTestId('warning-item')
    warningItems.forEach(item => {
      expect(warningsList).toContainElement(item)
    })

    // Check that button is in footer
    const button = screen.getByTestId('view-all-alerts-button')
    expect(footer).toContainElement(button)
  })

  it('applies correct border-left styling for severity levels', () => {
    const warnings: Warning[] = [
      createMockWarning({ severity: 'high', message: 'High severity warning' }),
      createMockWarning({ severity: 'medium', message: 'Medium severity warning' }),
      createMockWarning({ severity: 'low', message: 'Low severity warning' }),
    ]

    render(<Warnings warnings={warnings} />)

    const warningItems = screen.getAllByTestId('warning-item')

    expect(warningItems[0]).toHaveClass('border-l-4', 'border-red-500', 'bg-red-50')
    expect(warningItems[1]).toHaveClass('border-l-4', 'border-yellow-500', 'bg-yellow-50')
    expect(warningItems[2]).toHaveClass('border-l-4', 'border-blue-500', 'bg-blue-50')
  })

  it('displays warning messages with proper structure', () => {
    const warning = createMockWarning({ message: 'Test warning message' })
    render(<Warnings warnings={[warning]} />)

    const warningContent = screen.getByTestId('warning-content')
    expect(warningContent).toHaveClass('flex', 'items-start')

    const warningMessage = screen.getByTestId('warning-message')
    expect(warningMessage).toHaveClass('font-medium', 'text-gray-800')
    expect(warningMessage).toHaveTextContent('Test warning message')
  })

  it('maintains accessibility with proper structure', () => {
    const warnings = createMockWarnings(2)
    render(<Warnings warnings={warnings} />)

    // All main elements should be visible
    expect(screen.getByTestId('warnings-container')).toBeVisible()
    expect(screen.getByTestId('warnings-title')).toBeVisible()
    expect(screen.getByTestId('warnings-list')).toBeVisible()
    expect(screen.getByTestId('warnings-footer')).toBeVisible()

    // Warning items should be accessible
    const warningItems = screen.getAllByTestId('warning-item')
    warningItems.forEach(item => {
      expect(item).toBeVisible()
    })

    // Button should be accessible
    const button = screen.getByTestId('view-all-alerts-button')
    expect(button).toBeVisible()
    expect(button).toHaveAttribute('type', 'button')
  })

  it('handles mixed severity warnings correctly', () => {
    const mixedWarnings: Warning[] = [
      createMockWarning({ severity: 'high', message: 'Critical error' }),
      createMockWarning({ severity: 'low', message: 'Minor issue' }),
      createMockWarning({ severity: 'medium', message: 'Moderate concern' }),
    ]

    render(<Warnings warnings={mixedWarnings} />)

    const warningItems = screen.getAllByTestId('warning-item')
    expect(warningItems).toHaveLength(3)

    // Verify different severity styling is applied
    expect(warningItems[0]).toHaveClass('border-red-500', 'bg-red-50')
    expect(warningItems[1]).toHaveClass('border-blue-500', 'bg-blue-50')
    expect(warningItems[2]).toHaveClass('border-yellow-500', 'bg-yellow-50')

    // Verify correct data attributes
    expect(warningItems[0]).toHaveAttribute('data-warning-severity', 'high')
    expect(warningItems[1]).toHaveAttribute('data-warning-severity', 'low')
    expect(warningItems[2]).toHaveAttribute('data-warning-severity', 'medium')
  })

  it('displays warning icons with correct severity colors', () => {
    const warnings: Warning[] = [
      createMockWarning({ severity: 'high' }),
      createMockWarning({ severity: 'medium' }),
      createMockWarning({ severity: 'low' }),
    ]

    render(<Warnings warnings={warnings} />)

    const warningIcons = screen.getAllByTestId('warning-icon')

    expect(warningIcons[0]).toHaveClass('text-red-500')
    expect(warningIcons[1]).toHaveClass('text-yellow-500')
    expect(warningIcons[2]).toHaveClass('text-blue-500')
  })

  it('has proper scrollable content area', () => {
    const manyWarnings = createMockWarnings(10)
    render(<Warnings warnings={manyWarnings} />)

    const warningsList = screen.getByTestId('warnings-list')
    expect(warningsList).toHaveClass('overflow-y-auto', 'text-left')
  })

  it('positions footer button correctly', () => {
    const warnings = createMockWarnings(1)
    render(<Warnings warnings={warnings} />)

    const footer = screen.getByTestId('warnings-footer')
    const button = screen.getByTestId('view-all-alerts-button')

    expect(footer).toHaveClass('mt-auto', 'pt-4', 'border-t', 'border-gray-100')
    expect(button).toHaveClass('w-full')
  })
})
