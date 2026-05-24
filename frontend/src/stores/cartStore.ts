import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import type { CartItem, PromoResult } from '@/services/api/types/order.types'

interface CartState {
  items: CartItem[]
  promoCode: string | null
  promoResult: PromoResult | null
  isDrawerOpen: boolean

  addItem: (item: CartItem) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  applyPromo: (code: string, result: PromoResult) => void
  clearPromo: () => void
  clearCart: () => void
  openDrawer: () => void
  closeDrawer: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      promoCode: null,
      promoResult: null,
      isDrawerOpen: false,

      addItem: (item) => {
        const existing = get().items.find((i) => i.productId === item.productId)
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i,
            ),
          })
        } else {
          set({ items: [...get().items, item] })
        }
        set({ isDrawerOpen: true })
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) })
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId)
          return
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i,
          ),
        })
      },

      applyPromo: (code, result) => {
        set({ promoCode: code, promoResult: result })
      },

      clearPromo: () => {
        set({ promoCode: null, promoResult: null })
      },

      clearCart: () => {
        set({ items: [], promoCode: null, promoResult: null })
      },

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
    }),
    {
      name: 'airona_cart_v1',
      partialize: (state) => ({
        items: state.items,
        promoCode: state.promoCode,
        promoResult: state.promoResult,
      }),
    },
  ),
)

// Derived helpers
export const useCartTotal = () =>
  useCartStore(
    useShallow((state) => {
      const subtotal = state.items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0)
      const discount = state.promoResult?.valid ? (state.promoResult.discount_cents ?? 0) : 0
      return { subtotal, discount, total: subtotal - discount }
    }),
  )

export const useCartCount = () =>
  useCartStore((state) => state.items.reduce((sum, i) => sum + i.quantity, 0))
