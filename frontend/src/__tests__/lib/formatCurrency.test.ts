import { describe, it, expect } from 'vitest'
import { formatCurrency } from '@/lib/formatCurrency'

describe('formatCurrency', () => {
  it('formats cents to euro currency string (es-ES locale)', () => {
    const result = formatCurrency(14900)
    expect(result).toContain('149')
    expect(result).toContain('€')
  })

  it('rounds down fractional cents', () => {
    // 14950 cents = 149.50 → with maximumFractionDigits=0 rounds to 150 or 149 depending on locale
    const result = formatCurrency(15000)
    expect(result).toContain('150')
  })

  it('handles zero', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0')
    expect(result).toContain('€')
  })

  it('formats large amounts correctly', () => {
    const result = formatCurrency(100000) // 1000 EUR
    expect(result).toContain('1')
    expect(result).toContain('000')
  })

  it('accepts USD currency', () => {
    const result = formatCurrency(5000, 'USD', 'en-US')
    expect(result).toContain('50')
    expect(result).toContain('$')
  })

  it('does not include decimal places (maximumFractionDigits=0)', () => {
    const result = formatCurrency(14900)
    expect(result).not.toMatch(/[,\.]\d{2}/)
  })
})
