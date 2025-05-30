// src/test/vitest.d.ts
/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

declare module '*.json' {
  const value: any
  export default value
}

declare global {
  namespace Vi {
    interface JestAssertion<T = any>
      extends jest.Matchers<void, T>,
        TestingLibraryMatchers<T, void> {}
  }
}

export {}
