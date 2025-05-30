// src/test/setup.ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, vi } from 'vitest'

// Modern cleanup after each test
afterEach(() => {
  cleanup()
  // Clear all mocks after each test
  vi.clearAllMocks()
  // Clear all timers after each test
  vi.clearAllTimers()
})

// Global test environment setup
beforeAll(() => {
  // Mock IntersectionObserver for modern components
  globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    unobserve: vi.fn(),
  }))

  // Mock ResizeObserver for responsive components
  globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    unobserve: vi.fn(),
  }))

  // Mock matchMedia for responsive design tests
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  // Mock scrollTo for scroll-related tests
  globalThis.scrollTo = vi.fn()
  Element.prototype.scrollTo = vi.fn()
  Element.prototype.scrollIntoView = vi.fn()

  // Mock fetch for API testing
  globalThis.fetch = vi.fn()

  // Suppress console warnings in tests unless we're specifically testing them
  const originalWarn = console.warn
  console.warn = (...args: any[]) => {
    // Only show warnings we care about in tests
    if (
      typeof args[0] === 'string' &&
      !args[0].includes('React Router') &&
      !args[0].includes('deprecated')
    ) {
      originalWarn(...args)
    }
  }
})

// Mock crypto for UUID generation in tests
globalThis.crypto = {
  randomUUID: vi.fn(() => '550e8400-e29b-41d4-a716-446655440000' as `${string}-${string}-${string}-${string}-${string}`),
  getRandomValues: vi.fn((arr: any) => arr.map(() => Math.floor(Math.random() * 256))),
  subtle: {} as SubtleCrypto,
}
