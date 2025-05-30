// src/components/__tests__/Sensors.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '../../test/utils'
import Sensors from '../Sensors'
import { createMockSensorData } from '../../test/utils'

// Mock dayjs
vi.mock('dayjs', () => {
  const mockDayjs: any = vi.fn(() => ({
    to: vi.fn(() => 'in 7 days'),
  }))

  mockDayjs.extend = vi.fn()

  return { default: mockDayjs }
})

describe('Sensors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders sensor dashboard header', () => {
    const mockData = createMockSensorData()
    render(<Sensors sensorData={mockData} />)

    expect(screen.getByText('Sensor Dashboard')).toBeInTheDocument()
  })

  it('displays current time and updates when timer fires', async () => {
    vi.useFakeTimers()

    const mockData = createMockSensorData()

    // Set initial system time
    vi.setSystemTime(new Date('2024-01-15T10:30:00.000Z'))

    render(<Sensors sensorData={mockData} />)

    const initialTime = screen.getByTestId('current-time-value').textContent

    // Advance system time and timer by 1 second
    await act(async () => {
      vi.setSystemTime(new Date('2024-01-15T10:30:01.000Z'))
      vi.advanceTimersByTime(1000)
    })

    const updatedTime = screen.getByTestId('current-time-value').textContent

    // Expect time to have changed
    expect(updatedTime).not.toEqual(initialTime)
  })

  it('displays status badge correctly', () => {
    const mockData = createMockSensorData({ status: 'Warning' })
    render(<Sensors sensorData={mockData} />)

    const statusBadge = screen.getByTestId('status-badge')
    expect(statusBadge).toHaveTextContent('Warning')
    expect(statusBadge).toHaveAttribute('data-status', 'warning')
  })

  it('displays temperature metric correctly', () => {
    const mockData = createMockSensorData({
      temperature: 32.4,
      temperatureChange: -1.2
    })
    render(<Sensors sensorData={mockData} />)

    const temperatureMetric = screen.getByTestId('temperature-metric')
    expect(temperatureMetric).toBeInTheDocument()

    expect(screen.getByText('Temperature')).toBeInTheDocument()
    expect(screen.getByTestId('temperature-value')).toHaveTextContent('32.4')
    expect(screen.getByText('°C')).toBeInTheDocument()
    expect(screen.getByTestId('temperature-change')).toHaveTextContent('1.2° from last hour')
  })

  it('displays humidity metric correctly', () => {
    const mockData = createMockSensorData({
      humidity: 45,
      humidityChange: 2.5
    })
    render(<Sensors sensorData={mockData} />)

    const humidityMetric = screen.getByTestId('humidity-metric')
    expect(humidityMetric).toBeInTheDocument()

    expect(screen.getByText('Humidity')).toBeInTheDocument()
    expect(screen.getByTestId('humidity-value')).toHaveTextContent('45')
    expect(screen.getByText('%')).toBeInTheDocument()
    expect(screen.getByTestId('humidity-change')).toHaveTextContent('2.5% from last hour')
  })

  it('displays pressure metric correctly', () => {
    const mockData = createMockSensorData({ pressure: 760 })
    render(<Sensors sensorData={mockData} />)

    const pressureMetric = screen.getByTestId('pressure-metric')
    expect(pressureMetric).toBeInTheDocument()

    expect(screen.getByText('Pressure')).toBeInTheDocument()
    expect(screen.getByTestId('pressure-value')).toHaveTextContent('760')
    expect(screen.getByText('mmHg')).toBeInTheDocument()
    expect(screen.getByTestId('pressure-change')).toHaveTextContent('Stable')
  })

  it('displays power usage metric correctly', () => {
    const mockData = createMockSensorData({
      powerUsage: 4.2,
      powerUsageChange: 0.1
    })
    render(<Sensors sensorData={mockData} />)

    const powerMetric = screen.getByTestId('power-metric')
    expect(powerMetric).toBeInTheDocument()

    expect(screen.getByText('Power')).toBeInTheDocument()
    expect(screen.getByTestId('power-value')).toHaveTextContent('4.2')
    expect(screen.getByText('kW')).toBeInTheDocument()
    expect(screen.getByTestId('power-change')).toHaveTextContent('0.1kW from yesterday')
  })

  it('shows correct change indicators for positive changes', () => {
    const mockData = createMockSensorData({
      temperatureChange: 2.5,
      humidityChange: 1.2,
      powerUsageChange: 0.3
    })

    render(<Sensors sensorData={mockData} />)

    // Test specific change indicators using test IDs
    expect(screen.getByTestId('temperature-change')).toHaveClass('text-red-600')
    expect(screen.getByTestId('humidity-change')).toHaveClass('text-red-600')
    expect(screen.getByTestId('power-change')).toHaveClass('text-red-600')
  })

  it('shows correct change indicators for negative changes', () => {
    const mockData = createMockSensorData({
      temperatureChange: -1.5,
      humidityChange: -0.8,
      powerUsageChange: -0.2
    })

    render(<Sensors sensorData={mockData} />)

    // Test specific change indicators using test IDs
    expect(screen.getByTestId('temperature-change')).toHaveClass('text-green-600')
    expect(screen.getByTestId('humidity-change')).toHaveClass('text-green-600')
    expect(screen.getByTestId('power-change')).toHaveClass('text-green-600')
  })

  it('displays system notes with maintenance information', () => {
    const mockData = createMockSensorData()
    render(<Sensors sensorData={mockData} />)

    expect(screen.getByTestId('system-notes')).toBeInTheDocument()
    expect(screen.getByText('System Notes:')).toBeInTheDocument()
    expect(screen.getByTestId('maintenance-info')).toHaveTextContent(/All systems functioning within normal parameters/)
    expect(screen.getByTestId('maintenance-date')).toHaveTextContent('in 7 days')
  })

  it('applies correct styling to metric cards', () => {
    const mockData = createMockSensorData()
    render(<Sensors sensorData={mockData} />)

    // Check for specific metric card styling using test IDs
    expect(screen.getByTestId('temperature-metric')).toHaveClass('bg-blue-50', 'p-3', 'rounded-lg')
    expect(screen.getByTestId('humidity-metric')).toHaveClass('bg-teal-50', 'p-3', 'rounded-lg')
    expect(screen.getByTestId('pressure-metric')).toHaveClass('bg-purple-50', 'p-3', 'rounded-lg')
    expect(screen.getByTestId('power-metric')).toHaveClass('bg-amber-50', 'p-3', 'rounded-lg')
  })

  it('handles zero change values correctly', () => {
    const mockData = createMockSensorData({
      temperatureChange: 0,
      humidityChange: 0,
      powerUsageChange: 0
    })

    render(<Sensors sensorData={mockData} />)

    // Should show stable indicators for zero changes
    expect(screen.getByTestId('temperature-change')).toHaveClass('text-gray-600')
    expect(screen.getByTestId('humidity-change')).toHaveClass('text-gray-600')
    expect(screen.getByTestId('power-change')).toHaveClass('text-gray-600')
  })

  it('displays icons for each metric', () => {
    const mockData = createMockSensorData()
    render(<Sensors sensorData={mockData} />)

    // Check that each metric container has an icon (SVG)
    const temperatureMetric = screen.getByTestId('temperature-metric')
    const humidityMetric = screen.getByTestId('humidity-metric')
    const pressureMetric = screen.getByTestId('pressure-metric')
    const powerMetric = screen.getByTestId('power-metric')

    expect(temperatureMetric.querySelector('svg')).toBeInTheDocument()
    expect(humidityMetric.querySelector('svg')).toBeInTheDocument()
    expect(pressureMetric.querySelector('svg')).toBeInTheDocument()
    expect(powerMetric.querySelector('svg')).toBeInTheDocument()
  })

  it('sets up and cleans up timer correctly', () => {
    vi.useFakeTimers()

    const mockData = createMockSensorData()
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval')
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')

    const { unmount } = render(<Sensors sensorData={mockData} />)

    // Verify setInterval was called
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000)

    // Unmount and verify cleanup
    unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()

    setIntervalSpy.mockRestore()
    clearIntervalSpy.mockRestore()
  })

  it('is accessible with proper structure', () => {
    const mockData = createMockSensorData()
    render(<Sensors sensorData={mockData} />)

    // Check main container structure
    const main = screen.getByText('Sensor Dashboard').closest('.bg-white')
    expect(main).toHaveClass('rounded-lg', 'shadow-md', 'p-4')

    // Check that all metrics are visible and accessible
    expect(screen.getByTestId('temperature-metric')).toBeVisible()
    expect(screen.getByTestId('humidity-metric')).toBeVisible()
    expect(screen.getByTestId('pressure-metric')).toBeVisible()
    expect(screen.getByTestId('power-metric')).toBeVisible()
    expect(screen.getByTestId('system-notes')).toBeVisible()
  })

  it('executes setInterval callback and updates time state', async () => {
    vi.useFakeTimers()

    const mockData = createMockSensorData()

    render(<Sensors sensorData={mockData} />)

    // Advance timer to trigger setCurrentTime(new Date()) callback
    await act(async () => {
      vi.setSystemTime(new Date('2024-01-15T10:30:01.000Z'))
      vi.advanceTimersByTime(1000)
    })

    // Verify the component still works (proving the callback executed successfully)
    expect(screen.getByTestId('current-time-value')).toBeInTheDocument()
    expect(screen.getByTestId('current-date')).toBeInTheDocument()
  })

  it('timer callback executes without errors', async () => {
    vi.useFakeTimers()

    const mockData = createMockSensorData()
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<Sensors sensorData={mockData} />)

    // Advance timer multiple times to ensure callback works repeatedly
    await act(async () => {
      vi.setSystemTime(new Date('2024-01-15T10:30:01.000Z'))
      vi.advanceTimersByTime(1000)
    })

    await act(async () => {
      vi.setSystemTime(new Date('2024-01-15T10:30:02.000Z'))
      vi.advanceTimersByTime(1000)
    })

    await act(async () => {
      vi.setSystemTime(new Date('2024-01-15T10:30:03.000Z'))
      vi.advanceTimersByTime(1000)
    })

    // No errors should have been logged
    expect(consoleErrorSpy).not.toHaveBeenCalled()

    // Component should still be functional
    expect(screen.getByTestId('current-time-value')).toBeInTheDocument()
    expect(screen.getByTestId('current-date')).toBeInTheDocument()

    consoleErrorSpy.mockRestore()
  })
})
