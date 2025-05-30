// src/components/__tests__/Dashboard.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../../test/utils'
import Dashboard from '../Dashboard'

// Mock the child components
vi.mock('../Tasks', () => ({
  default: ({ tasks }: { tasks: any[] }) => (
    <div data-testid="tasks-component">
      Tasks Component - {tasks.length} tasks
    </div>
  )
}))

vi.mock('../Warnings', () => ({
  default: ({ warnings }: { warnings: any[] }) => (
    <div data-testid="warnings-component">
      Warnings Component - {warnings.length} warnings
    </div>
  )
}))

vi.mock('../Sensors', () => ({
  default: ({ sensorData }: { sensorData: any }) => (
    <div data-testid="sensors-component">
      Sensors Component - {sensorData.status}
    </div>
  )
}))

// Mock JSON imports
vi.mock('../../mocks/sensorData.json', () => ({
  default: {
    temperature: 32.4,
    temperatureChange: -1.2,
    humidity: 45,
    humidityChange: 2.5,
    pressure: 760,
    powerUsage: 4.2,
    powerUsageChange: 0.1,
    status: 'Operational',
    maintenanceDate: 1757401797000
  }
}))

vi.mock('../../mocks/warnings.json', () => ({
  default: [
    {
      id: 1,
      severity: 'high',
      message: 'Test warning',
      timestamp: 1747401716000
    }
  ]
}))

vi.mock('../../mocks/tasks.json', () => ({
  default: [
    {
      id: 1,
      title: 'Test task',
      status: 'pending',
      deadline: 1747501529000
    }
  ]
}))

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders dashboard container with correct styling', () => {
    render(<Dashboard />)

    const dashboardContainer = screen.getByTestId('dashboard-container')
    expect(dashboardContainer).toBeInTheDocument()
    expect(dashboardContainer).toHaveClass('h-screen', 'bg-gray-100', 'p-4')
  })

  it('renders dashboard grid with correct layout classes', () => {
    render(<Dashboard />)

    const dashboardGrid = screen.getByTestId('dashboard-grid')
    expect(dashboardGrid).toBeInTheDocument()
    expect(dashboardGrid).toHaveClass(
      'grid',
      'grid-cols-1',
      'lg:grid-cols-3',
      'grid-rows-1',
      'lg:grid-rows-3',
      'gap-4',
      'h-full'
    )
  })

  it('renders all three main sections', () => {
    render(<Dashboard />)

    expect(screen.getByTestId('tasks-section')).toBeInTheDocument()
    expect(screen.getByTestId('sensors-section')).toBeInTheDocument()
    expect(screen.getByTestId('warnings-section')).toBeInTheDocument()
  })

  it('renders all three main components', () => {
    render(<Dashboard />)

    expect(screen.getByTestId('tasks-component')).toBeInTheDocument()
    expect(screen.getByTestId('warnings-component')).toBeInTheDocument()
    expect(screen.getByTestId('sensors-component')).toBeInTheDocument()
  })

  it('applies correct responsive layout classes to sections', () => {
    render(<Dashboard />)

    const tasksSection = screen.getByTestId('tasks-section')
    const sensorsSection = screen.getByTestId('sensors-section')
    const warningsSection = screen.getByTestId('warnings-section')

    expect(tasksSection).toHaveClass('lg:col-span-2', 'lg:row-span-3')
    expect(sensorsSection).toHaveClass('lg:row-span-1')
    expect(warningsSection).toHaveClass('lg:row-span-2')
  })

  it('passes correct props to Tasks component', () => {
    render(<Dashboard />)

    const tasksComponent = screen.getByTestId('tasks-component')
    expect(tasksComponent).toHaveTextContent('Tasks Component - 1 tasks')
  })

  it('passes correct props to Warnings component', () => {
    render(<Dashboard />)

    const warningsComponent = screen.getByTestId('warnings-component')
    expect(warningsComponent).toHaveTextContent('Warnings Component - 1 warnings')
  })

  it('passes correct props to Sensors component', () => {
    render(<Dashboard />)

    const sensorsComponent = screen.getByTestId('sensors-component')
    expect(sensorsComponent).toHaveTextContent('Sensors Component - Operational')
  })

  it('maintains proper component hierarchy', () => {
    render(<Dashboard />)

    const dashboardContainer = screen.getByTestId('dashboard-container')
    const dashboardGrid = screen.getByTestId('dashboard-grid')
    const tasksSection = screen.getByTestId('tasks-section')
    const sensorsSection = screen.getByTestId('sensors-section')
    const warningsSection = screen.getByTestId('warnings-section')

    // Grid should be inside container
    expect(dashboardContainer).toContainElement(dashboardGrid)

    // Sections should be inside grid
    expect(dashboardGrid).toContainElement(tasksSection)
    expect(dashboardGrid).toContainElement(sensorsSection)
    expect(dashboardGrid).toContainElement(warningsSection)

    // Components should be inside their respective sections
    expect(tasksSection).toContainElement(screen.getByTestId('tasks-component'))
    expect(sensorsSection).toContainElement(screen.getByTestId('sensors-component'))
    expect(warningsSection).toContainElement(screen.getByTestId('warnings-component'))
  })

  it('renders without errors when all data is present', () => {
    expect(() => render(<Dashboard />)).not.toThrow()
  })

  it('has correct section positioning in grid layout', () => {
    render(<Dashboard />)

    // Tasks section should span most of the grid
    const tasksSection = screen.getByTestId('tasks-section')
    expect(tasksSection).toHaveClass('lg:col-span-2', 'lg:row-span-3')

    // Sensors should be in top-right (single row)
    const sensorsSection = screen.getByTestId('sensors-section')
    expect(sensorsSection).toHaveClass('lg:row-span-1')

    // Warnings should be in bottom-right (two rows)
    const warningsSection = screen.getByTestId('warnings-section')
    expect(warningsSection).toHaveClass('lg:row-span-2')
  })

  it('uses proper semantic structure', () => {
    render(<Dashboard />)

    // All main elements should be present and accessible
    const container = screen.getByTestId('dashboard-container')
    const grid = screen.getByTestId('dashboard-grid')
    const sections = [
      screen.getByTestId('tasks-section'),
      screen.getByTestId('sensors-section'),
      screen.getByTestId('warnings-section')
    ]

    expect(container).toBeVisible()
    expect(grid).toBeVisible()
    sections.forEach(section => {
      expect(section).toBeVisible()
    })
  })

  it('loads and processes mock data correctly', () => {
    render(<Dashboard />)

    // Verify that mock data is being passed to components correctly
    expect(screen.getByTestId('tasks-component')).toHaveTextContent('1 tasks')
    expect(screen.getByTestId('warnings-component')).toHaveTextContent('1 warnings')
    expect(screen.getByTestId('sensors-component')).toHaveTextContent('Operational')
  })

  it('maintains responsive design classes', () => {
    render(<Dashboard />)

    const grid = screen.getByTestId('dashboard-grid')

    // Should have mobile-first responsive classes
    expect(grid).toHaveClass('grid-cols-1') // Mobile: single column
    expect(grid).toHaveClass('lg:grid-cols-3') // Desktop: three columns
    expect(grid).toHaveClass('grid-rows-1') // Mobile: single row
    expect(grid).toHaveClass('lg:grid-rows-3') // Desktop: three rows
  })
})
