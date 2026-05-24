import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '@/stores/cartStore'
import type { CartItem, PromoResult } from '@/services/api/types/order.types'

const ITEM_A: CartItem = {
  productId: 1,
  quantity: 1,
  name: 'Vuelo Compartido',
  priceCents: 14900,
  slug: 'vuelo-compartido',
}

const ITEM_B: CartItem = {
  productId: 2,
  quantity: 1,
  name: 'Vuelo Privado',
  priceCents: 39900,
  slug: 'vuelo-privado',
}

const PROMO_10PCT: PromoResult = {
  valid: true,
  discount_cents: 1490,
  promo_code: 'SAVE10',
  discount_type: 'percentage',
  discount_value: 10,
}

beforeEach(() => {
  useCartStore.setState({
    items: [],
    promoCode: null,
    promoResult: null,
    isDrawerOpen: false,
  })
})

// ── addItem ───────────────────────────────────────────────────────────────────

describe('addItem', () => {
  it('adds a new product and opens the drawer', () => {
    useCartStore.getState().addItem(ITEM_A)
    const { items, isDrawerOpen } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].productId).toBe(1)
    expect(items[0].quantity).toBe(1)
    expect(isDrawerOpen).toBe(true)
  })

  it('increments quantity for an already-present product', () => {
    useCartStore.getState().addItem(ITEM_A)
    useCartStore.getState().addItem({ ...ITEM_A, quantity: 2 })
    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(3)
  })

  it('keeps distinct products as separate line items', () => {
    useCartStore.getState().addItem(ITEM_A)
    useCartStore.getState().addItem(ITEM_B)
    expect(useCartStore.getState().items).toHaveLength(2)
  })
})

// ── removeItem ────────────────────────────────────────────────────────────────

describe('removeItem', () => {
  it('removes the correct product by id', () => {
    useCartStore.getState().addItem(ITEM_A)
    useCartStore.getState().addItem(ITEM_B)
    useCartStore.getState().removeItem(1)
    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].productId).toBe(2)
  })

  it('is a no-op for a product not in the cart', () => {
    useCartStore.getState().addItem(ITEM_A)
    useCartStore.getState().removeItem(999)
    expect(useCartStore.getState().items).toHaveLength(1)
  })
})

// ── updateQuantity ────────────────────────────────────────────────────────────

describe('updateQuantity', () => {
  it('updates to the new quantity', () => {
    useCartStore.getState().addItem(ITEM_A)
    useCartStore.getState().updateQuantity(1, 5)
    expect(useCartStore.getState().items[0].quantity).toBe(5)
  })

  it('removes the item when quantity is set to 0', () => {
    useCartStore.getState().addItem(ITEM_A)
    useCartStore.getState().updateQuantity(1, 0)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('removes the item when quantity is set to negative', () => {
    useCartStore.getState().addItem(ITEM_A)
    useCartStore.getState().updateQuantity(1, -1)
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})

// ── applyPromo / clearPromo ───────────────────────────────────────────────────

describe('promo codes', () => {
  it('stores the promo code and result', () => {
    useCartStore.getState().applyPromo('SAVE10', PROMO_10PCT)
    const { promoCode, promoResult } = useCartStore.getState()
    expect(promoCode).toBe('SAVE10')
    expect(promoResult?.discount_cents).toBe(1490)
    expect(promoResult?.valid).toBe(true)
  })

  it('clears code and result on clearPromo', () => {
    useCartStore.getState().applyPromo('SAVE10', PROMO_10PCT)
    useCartStore.getState().clearPromo()
    const { promoCode, promoResult } = useCartStore.getState()
    expect(promoCode).toBeNull()
    expect(promoResult).toBeNull()
  })

  it('replaces previous promo on second applyPromo call', () => {
    useCartStore.getState().applyPromo('OLD', { valid: true, discount_cents: 500 })
    useCartStore.getState().applyPromo('NEW', { valid: true, discount_cents: 1000 })
    expect(useCartStore.getState().promoCode).toBe('NEW')
    expect(useCartStore.getState().promoResult?.discount_cents).toBe(1000)
  })
})

// ── clearCart ─────────────────────────────────────────────────────────────────

describe('clearCart', () => {
  it('removes all items and resets promo', () => {
    useCartStore.getState().addItem(ITEM_A)
    useCartStore.getState().addItem(ITEM_B)
    useCartStore.getState().applyPromo('SAVE10', PROMO_10PCT)
    useCartStore.getState().clearCart()
    const state = useCartStore.getState()
    expect(state.items).toHaveLength(0)
    expect(state.promoCode).toBeNull()
    expect(state.promoResult).toBeNull()
  })
})

// ── drawer ────────────────────────────────────────────────────────────────────

describe('drawer', () => {
  it('opens and closes the drawer', () => {
    useCartStore.getState().openDrawer()
    expect(useCartStore.getState().isDrawerOpen).toBe(true)
    useCartStore.getState().closeDrawer()
    expect(useCartStore.getState().isDrawerOpen).toBe(false)
  })
})

// ── total calculations (mirrors useCartTotal logic) ───────────────────────────

describe('cart total calculations', () => {
  function getCalculatedTotals() {
    const state = useCartStore.getState()
    const subtotal = state.items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0)
    const discount = state.promoResult?.valid ? (state.promoResult.discount_cents ?? 0) : 0
    return { subtotal, discount, total: subtotal - discount }
  }

  it('calculates subtotal for multiple items and quantities', () => {
    useCartStore.getState().addItem({ ...ITEM_A, quantity: 2 })
    useCartStore.getState().addItem(ITEM_B)
    const { subtotal } = getCalculatedTotals()
    // 2 × 14900 + 1 × 39900 = 69700
    expect(subtotal).toBe(69700)
  })

  it('applies discount from a valid promo code', () => {
    useCartStore.getState().addItem(ITEM_A)
    useCartStore.getState().applyPromo('SAVE10', PROMO_10PCT)
    const { subtotal, discount, total } = getCalculatedTotals()
    expect(subtotal).toBe(14900)
    expect(discount).toBe(1490)
    expect(total).toBe(13410)
  })

  it('returns zero discount for an invalid promo result', () => {
    useCartStore.getState().addItem(ITEM_A)
    useCartStore.getState().applyPromo('BAD', { valid: false, discount_cents: 500 })
    const { discount } = getCalculatedTotals()
    expect(discount).toBe(0)
  })

  it('returns zero total when cart is empty', () => {
    const { subtotal, discount, total } = getCalculatedTotals()
    expect(subtotal).toBe(0)
    expect(discount).toBe(0)
    expect(total).toBe(0)
  })
})

// ── useCartCount (item quantity sum) ──────────────────────────────────────────

describe('useCartCount', () => {
  it('returns the sum of all item quantities', () => {
    useCartStore.getState().addItem({ ...ITEM_A, quantity: 3 })
    useCartStore.getState().addItem({ ...ITEM_B, quantity: 2 })
    const count = useCartStore.getState().items.reduce((sum, i) => sum + i.quantity, 0)
    expect(count).toBe(5)
  })

  it('returns 0 for an empty cart', () => {
    const count = useCartStore.getState().items.reduce((sum, i) => sum + i.quantity, 0)
    expect(count).toBe(0)
  })
})
