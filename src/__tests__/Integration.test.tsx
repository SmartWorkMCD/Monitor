// src/__tests__/Integration.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '../test/utils'
import App from '../App'

// Mock dayjs
vi.mock('dayjs', () => {
  const mockDayjs: any = vi.fn((timestamp) => {
    // Different responses based on timestamp value to simulate different dates
    const isTask = timestamp && timestamp > 1747000000000 // Task deadlines are in future
    const isWarning = timestamp && timestamp < 1747000000000 // Warning timestamps are in past

    return {
      calendar: vi.fn(() => {
        if (isTask) {
          return 'Tomorrow at 10:00 AM'
        } else if (isWarning) {
          return 'Yesterday at 2:15 PM'
        }
        return 'Today at 3:30 PM'
      }),
      to: vi.fn(() => 'in 7 days'),
      toLocaleDateString: vi.fn(() => '12/20/2024'),
      toLocaleTimeString: vi.fn(() => '3:30:45 PM'),
    }
  })

  mockDayjs.extend = vi.fn()

  return { default: mockDayjs }
})

// Mock calendar and relativeTime plugins
vi.mock('dayjs/plugin/calendar', () => ({ default: vi.fn() }))
vi.mock('dayjs/plugin/relativeTime', () => ({ default: vi.fn() }))

describe('Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders complete application without errors', () => {
    expect(() => render(<App />)).not.toThrow()
  })

  it('displays all main sections of the dashboard', async () => {
    render(<App />)

    // Check for main section headers
    expect(screen.getByText('Task List')).toBeInTheDocument()
    expect(screen.getByText('Sensor Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Warning Journal')).toBeInTheDocument()
  })

  it('displays task information correctly', () => {
    render(<App />)

    // Should show task titles from mock data
    expect(screen.getByText('Check sugar level in mixing tanks')).toBeInTheDocument()
    expect(screen.getByText('Clean chocolate coating machine')).toBeInTheDocument()
    expect(screen.getByText('Inspect candy cooling conveyor')).toBeInTheDocument()

    // Should show task statistics
    expect(screen.getByText(/\d+ tasks total/)).toBeInTheDocument()
    expect(screen.getByText(/\d+ completed • \d+ in progress • \d+ pending/)).toBeInTheDocument()
  })

  it('displays warning information correctly', () => {
    render(<App />)

    // Should show warning messages from mock data
    expect(screen.getByText('Temperature anomaly in chocolate tempering unit')).toBeInTheDocument()
    expect(screen.getByText('Sugar syrup viscosity outside acceptable range')).toBeInTheDocument()
    expect(screen.getByText('Scheduled maintenance due for wrapping machine')).toBeInTheDocument()

    // Should show "View All Alerts" button
    expect(screen.getByRole('button', { name: 'View All Alerts' })).toBeInTheDocument()
  })

  it('displays sensor metrics correctly', () => {
    render(<App />)

    // Should show all sensor metric labels
    expect(screen.getByText('Temperature')).toBeInTheDocument()
    expect(screen.getByText('Humidity')).toBeInTheDocument()
    expect(screen.getByText('Pressure')).toBeInTheDocument()
    expect(screen.getByText('Power')).toBeInTheDocument()

    // Should show sensor values from mock data
    expect(screen.getByText('32.4')).toBeInTheDocument() // Temperature
    expect(screen.getByText('45')).toBeInTheDocument()   // Humidity
    expect(screen.getByText('760')).toBeInTheDocument()  // Pressure
    expect(screen.getByText('4.2')).toBeInTheDocument()  // Power

    // Should show units
    expect(screen.getByText('°C')).toBeInTheDocument()
    expect(screen.getByText('%')).toBeInTheDocument()
    expect(screen.getByText('mmHg')).toBeInTheDocument()
    expect(screen.getByText('kW')).toBeInTheDocument()
  })

  it('handles warning severity styling correctly', () => {
    const { container } = render(<App />)

    // Should have different colored warning indicators
    expect(container.querySelector('.border-red-500')).toBeInTheDocument()   // High severity
    expect(container.querySelector('.border-yellow-500')).toBeInTheDocument() // Medium severity
    expect(container.querySelector('.border-blue-500')).toBeInTheDocument()   // Low severity
  })

  it('displays change indicators for sensor data', () => {
    render(<App />)

    // Should show change information
    expect(screen.getByText('1.2° from last hour')).toBeInTheDocument()
    expect(screen.getByText('2.5% from last hour')).toBeInTheDocument()
    expect(screen.getByText('0.1kW from yesterday')).toBeInTheDocument()
    expect(screen.getByText('Stable')).toBeInTheDocument() // Pressure is stable
  })

  it('has proper responsive layout structure', () => {
    const { container } = render(<App />)

    // Should have main grid layout
    const gridContainer = container.querySelector('.grid.grid-cols-1.lg\\:grid-cols-3')
    expect(gridContainer).toBeInTheDocument()

    // Should have proper height classes
    const mainContainer = container.querySelector('.h-screen.bg-gray-100')
    expect(mainContainer).toBeInTheDocument()
  })

  it('displays proper task due dates with calendar formatting', () => {
    render(<App />)

    // Check that due date elements exist with "Due:" prefix
    const dueDateElements = screen.getAllByText(/Due:/)
    expect(dueDateElements.length).toBeGreaterThan(0)

    // Check that calendar-formatted dates are displayed (pattern matching for flexibility)
    const calendarPattern = /\w+ at \d{1,2}:\d{2} [AP]M/
    const calendarDates = screen.getAllByText(calendarPattern)
    expect(calendarDates.length).toBeGreaterThan(0)
  })

  it('maintains proper accessibility structure', () => {
    render(<App />)

    // All main sections should be visible
    expect(screen.getByText('Task List')).toBeVisible()
    expect(screen.getByText('Sensor Dashboard')).toBeVisible()
    expect(screen.getByText('Warning Journal')).toBeVisible()

    // Interactive elements should be accessible
    const button = screen.getByRole('button', { name: 'View All Alerts' })
    expect(button).toBeVisible()
    expect(button).not.toHaveAttribute('disabled')
  })

  it('loads and displays mock data correctly', () => {
    render(<App />)

    // Verify that all mock data is loaded and displayed
    // This tests the integration of JSON imports and component rendering

    // Tasks from tasks.json
    expect(screen.getByText('Check sugar level in mixing tanks')).toBeInTheDocument()

    // Warnings from warnings.json
    expect(screen.getByText('Temperature anomaly in chocolate tempering unit')).toBeInTheDocument()

    // Sensor data from sensorData.json
    expect(screen.getByText('32.4')).toBeInTheDocument() // Temperature value
    expect(screen.getByText('Operational')).toBeInTheDocument() // Status
  })

  it('preserves data integrity across re-renders', () => {
    const { rerender } = render(<App />)

    // Initial render should show data
    expect(screen.getByText('32.4')).toBeInTheDocument()
    expect(screen.getByText('Check sugar level in mixing tanks')).toBeInTheDocument()

    // Re-render should preserve the same data
    rerender(<App />)

    expect(screen.getByText('32.4')).toBeInTheDocument()
    expect(screen.getByText('Check sugar level in mixing tanks')).toBeInTheDocument()
  })
})
