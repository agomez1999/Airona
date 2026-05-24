import { vi, afterEach } from 'vitest'

// Minimal localStorage mock for Zustand persist middleware
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
    get length() { return Object.keys(store).length },
    key: (index: number) => Object.keys(store)[index] ?? null,
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true })

// Reset localStorage between tests so Zustand persist doesn't bleed across tests
afterEach(() => {
  localStorageMock.clear()
  vi.clearAllMocks()
})
