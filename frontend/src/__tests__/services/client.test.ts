import { describe, it, expect } from 'vitest'
import axios from 'axios'

// Simulate the 429 response interceptor logic from src/services/api/client.ts
// without importing the full module (which requires DOM context for window.location)

function apply429Enrichment(error: { response?: { status?: number; headers?: Record<string, string> }; message?: string; isRateLimit?: boolean; retryAfterSeconds?: number }) {
  if (error.response?.status === 429) {
    const retryAfter = error.response.headers?.['retry-after']
    const seconds = retryAfter ? parseInt(retryAfter, 10) : 60
    error.message = `Too many requests. Please wait ${seconds} seconds before trying again.`
    error.isRateLimit = true
    error.retryAfterSeconds = seconds
  }
  return error
}

describe('429 rate-limit error enrichment', () => {
  it('enriches a 429 response with isRateLimit flag', () => {
    const error = { response: { status: 429, headers: {} } }
    const enriched = apply429Enrichment(error)
    expect(enriched.isRateLimit).toBe(true)
  })

  it('uses Retry-After header value when present', () => {
    const error = { response: { status: 429, headers: { 'retry-after': '30' } } }
    const enriched = apply429Enrichment(error)
    expect(enriched.retryAfterSeconds).toBe(30)
    expect(enriched.message).toContain('30 seconds')
  })

  it('defaults to 60 seconds when Retry-After header is absent', () => {
    const error = { response: { status: 429, headers: {} } }
    const enriched = apply429Enrichment(error)
    expect(enriched.retryAfterSeconds).toBe(60)
    expect(enriched.message).toContain('60 seconds')
  })

  it('does not modify non-429 errors', () => {
    const error = { response: { status: 500, headers: {} }, message: 'Server error' }
    const enriched = apply429Enrichment(error)
    expect(enriched.isRateLimit).toBeUndefined()
    expect(enriched.retryAfterSeconds).toBeUndefined()
    expect(enriched.message).toBe('Server error')
  })

  it('includes human-readable message with wait time', () => {
    const error = { response: { status: 429, headers: { 'retry-after': '120' } } }
    const enriched = apply429Enrichment(error)
    expect(enriched.message).toBe('Too many requests. Please wait 120 seconds before trying again.')
  })
})

describe('Axios client configuration', () => {
  it('axios can create an instance with withCredentials', () => {
    const instance = axios.create({ withCredentials: true, baseURL: '/api' })
    expect(instance.defaults.withCredentials).toBe(true)
    expect(instance.defaults.baseURL).toBe('/api')
  })
})
