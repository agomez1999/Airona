import { describe, it, expect, beforeEach } from 'vitest'
import { useUiStore } from '@/stores/uiStore'

beforeEach(() => {
  useUiStore.setState({ cookieConsent: null })
})

describe('uiStore — cookie consent', () => {
  it('starts with null consent', () => {
    expect(useUiStore.getState().cookieConsent).toBeNull()
  })

  it('sets consent to "accepted"', () => {
    useUiStore.getState().setCookieConsent('accepted')
    expect(useUiStore.getState().cookieConsent).toBe('accepted')
  })

  it('sets consent to "essential"', () => {
    useUiStore.getState().setCookieConsent('essential')
    expect(useUiStore.getState().cookieConsent).toBe('essential')
  })

  it('allows changing consent from accepted to essential', () => {
    useUiStore.getState().setCookieConsent('accepted')
    useUiStore.getState().setCookieConsent('essential')
    expect(useUiStore.getState().cookieConsent).toBe('essential')
  })
})
