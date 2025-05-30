// src/test/utils.tsx
import { render, type RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { type ReactElement } from 'react'
import type { Task, Warning, SensorData } from '../types'

// Enhanced render function with modern options
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add any providers or wrappers here in the future
  initialProps?: Record<string, any>
}

export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { initialProps, ...renderOptions } = options // eslint-disable-line @typescript-eslint/no-unused-vars

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    // Add any providers here (Router, Context, etc.)
    return <>{children}</>
  }

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...renderOptions })
  }
}

// Enhanced mock data factories with better TypeScript support
export const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: Math.floor(Math.random() * 1000),
  title: 'Test task',
  status: 'pending',
  deadline: Date.now() + 86400000, // 24 hours from now
  ...overrides,
})

export const createMockTasks = (count: number = 3): Task[] => {
  return Array.from({ length: count }, (_, index) => {
    const statuses: Task['status'][] = ['pending', 'in-progress', 'completed']
    return createMockTask({
      id: index + 1,
      title: `Test task ${index + 1}`,
      status: statuses[index % statuses.length],
      deadline: Date.now() + (index * 86400000) // Staggered deadlines
    })
  })
}

export const createMockWarning = (overrides: Partial<Warning> = {}): Warning => ({
  id: Math.floor(Math.random() * 1000),
  severity: 'medium',
  message: 'Test warning message',
  timestamp: Date.now() - 3600000, // 1 hour ago
  ...overrides,
})

export const createMockWarnings = (count: number = 3): Warning[] => {
  return Array.from({ length: count }, (_, index) => {
    const severities: Warning['severity'][] = ['low', 'medium', 'high']
    return createMockWarning({
      id: index + 1,
      message: `Test warning ${index + 1}`,
      severity: severities[index % severities.length],
      timestamp: Date.now() - (index * 3600000) // Staggered timestamps
    })
  })
}

export const createMockSensorData = (overrides: Partial<SensorData> = {}): SensorData => ({
  temperature: 25.5,
  temperatureChange: -1.2,
  humidity: 45,
  humidityChange: 2.5,
  pressure: 760,
  powerUsage: 4.2,
  powerUsageChange: 0.1,
  status: 'Operational',
  maintenanceDate: Date.now() + 86400000 * 7, // 7 days from now
  ...overrides,
})

// Modern test helpers with better TypeScript support
export const expectElementToHaveClasses = (
  element: HTMLElement,
  classes: string | string[]
) => {
  const classArray = Array.isArray(classes) ? classes : [classes]
  classArray.forEach(className => {
    expect(element).toHaveClass(className)
  })
}

export const expectElementToHaveStyles = (
  element: HTMLElement,
  styles: Record<string, string>
) => {
  Object.entries(styles).forEach(([property, value]) => {
    expect(element).toHaveStyle({ [property]: value })
  })
}

// Accessibility testing helpers
export const expectElementToBeAccessible = (element: HTMLElement) => {
  expect(element).toBeVisible()
  expect(element).not.toHaveAttribute('aria-hidden', 'true')
}

export const expectButtonToBeAccessible = (button: HTMLElement) => {
  expectElementToBeAccessible(button)
  expect(button).toHaveAttribute('type', 'button')
  expect(button).not.toHaveAttribute('disabled')
}

// Mock data generators for performance testing
// Fixed: Added 'extends unknown' constraint to prevent JSX interpretation
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export const generateLargeDataset = <T extends unknown>(
  factory: () => T,
  size = 1000
): T[] => {
  return Array.from({ length: size }, factory)
}

// Viewport and responsive testing utilities
export const mockViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  })
  window.dispatchEvent(new Event('resize'))
}

// Modern event simulation helpers
// Fixed: Added 'extends Event' constraint to prevent JSX interpretation
export const createMockEvent = <T extends Event>(
  type: string,
  options: Partial<T> = {}
): T => {
  const event = new Event(type, { bubbles: true, cancelable: true })
  return Object.assign(event, options) as T
}

// Re-export everything from testing library with modern patterns
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react'
// Fixed: Remove duplicate userEvent exports
export { userEvent }

// Re-export render with our enhanced version as default
export { renderWithProviders as render }
