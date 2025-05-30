// src/__tests__/App.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../test/utils'
import App from '../App'

// Mock the Dashboard component
vi.mock('../components/Dashboard', () => ({
  default: () => <div data-testid="dashboard-component">Dashboard Component</div>
}))

// Mock dayjs and its plugins
vi.mock('dayjs', () => {
  const mockDayjs: any = vi.fn(() => ({
    calendar: vi.fn(() => 'Today at 10:00 AM'),
    to: vi.fn(() => 'in 2 hours'),
  }))

  mockDayjs.extend = vi.fn()

  return { default: mockDayjs }
})

vi.mock('dayjs/plugin/calendar', () => ({
  default: vi.fn()
}))

vi.mock('dayjs/plugin/relativeTime', () => ({
  default: vi.fn()
}))

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    expect(() => render(<App />)).not.toThrow()
  })

  it('renders the Dashboard component', () => {
    render(<App />)

    expect(screen.getByTestId('dashboard-component')).toBeInTheDocument()
    expect(screen.getByText('Dashboard Component')).toBeInTheDocument()
  })

  it('only renders Dashboard component as main content', () => {
    const { container } = render(<App />)

    // Should only have one child component (Dashboard)
    const dashboardElement = screen.getByTestId('dashboard-component')
    expect(container.firstChild).toBe(dashboardElement)
  })

  it('imports and applies CSS correctly', () => {
    // This test ensures the CSS import doesn't cause issues
    expect(() => render(<App />)).not.toThrow()
  })
})
