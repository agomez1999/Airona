export interface CartItem {
  productId: number
  quantity: number
  name: string
  priceCents: number
  slug: string
}

export interface PromoResult {
  valid: boolean
  discount_cents: number
  promo_code?: string
  discount_type?: string
  discount_value?: number
  message?: string
}

export interface CheckoutSessionResponse {
  order_id: string
  order_number: string
  checkout_url: string
}

export interface Voucher {
  code: string
  status: string
  expires_at: string | null
  pdf_ready: boolean
}

export interface Order {
  id: string
  order_number: string
  customer_email: string
  status: 'pending_payment' | 'paid' | 'failed' | 'refunded' | 'cancelled'
  total_cents: number
  currency: string
  locale: string
  vouchers: Voucher[]
  created_at: string
}
