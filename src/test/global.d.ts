// src/test/global.d.ts
export {}

declare global {
  // Extend globalThis with the APIs we need in tests
  var IntersectionObserver: any
  var ResizeObserver: any
  var scrollTo: any
  var fetch: any
  var crypto: {
    randomUUID: `${string}-${string}-${string}-${string}-${string}`
    getRandomValues(array: any): any
  }
}
