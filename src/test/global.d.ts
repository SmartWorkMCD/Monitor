// src/test/global.d.ts
export {}

declare global {
  const IntersectionObserver: any
  const ResizeObserver: any
  const scrollTo: any
  const fetch: any
  const crypto: {
    randomUUID: () => `${string}-${string}-${string}-${string}-${string}`
    getRandomValues(array: any): any
  }
}
