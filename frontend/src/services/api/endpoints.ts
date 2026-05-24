import client from './client'
import type { AdminUser, AdminProduct, ApiResponse, PaginatedResponse, Product } from './types/experience.types'
import type { CheckoutSessionResponse, Order, PromoResult } from './types/order.types'

// Re-export AdminProduct so admin pages can import from one place
export type { AdminProduct }

// ── Auth ──────────────────────────────────────────────────────────────────────

export const getCsrfCookie = () => client.get('/sanctum/csrf-cookie', { baseURL: '' })

export const login = (email: string, password: string) =>
  client.post<ApiResponse<AdminUser>>('/auth/login', { email, password })

export const logout = () => client.post<{ message: string }>('/auth/logout')

export const getMe = () => client.get<ApiResponse<AdminUser>>('/auth/me')

// ── Public products ───────────────────────────────────────────────────────────

export const getProducts = (lang: string) =>
  client.get<{ data: Product[]; meta: { locale: string; total: number } }>('/v1/products', {
    headers: { 'Accept-Language': lang },
  })

export const getProductBySlug = (slug: string, lang: string) =>
  client.get<ApiResponse<Product>>(`/v1/products/${slug}`, {
    headers: { 'Accept-Language': lang },
  })

// ── Admin products ────────────────────────────────────────────────────────────

export const adminGetProducts = (page = 1) =>
  client.get<PaginatedResponse<AdminProduct>>('/v1/admin/products', { params: { page } })

export const adminGetProduct = (id: number) =>
  client.get<ApiResponse<AdminProduct>>(`/v1/admin/products/${id}`)

export const adminCreateProduct = (data: unknown) =>
  client.post<ApiResponse<AdminProduct>>('/v1/admin/products', data)

export const adminUpdateProduct = (id: number, data: unknown) =>
  client.put<ApiResponse<AdminProduct>>(`/v1/admin/products/${id}`, data)

export const adminDeleteProduct = (id: number) =>
  client.delete<{ message: string }>(`/v1/admin/products/${id}`)

// ── Promotions ────────────────────────────────────────────────────────────────

export const validatePromoCode = (code: string, subtotalCents: number) =>
  client.get<PromoResult>('/v1/promotions/validate', {
    params: { code, subtotal_cents: subtotalCents },
  })

// ── Checkout ──────────────────────────────────────────────────────────────────

export interface CheckoutPayload {
  items: { product_id: number; quantity: number }[]
  customer_email: string
  customer_name: string
  locale: string
  success_url: string
  cancel_url: string
  promo_code?: string
}

export const createCheckoutSession = (payload: CheckoutPayload) =>
  client.post<ApiResponse<CheckoutSessionResponse>>('/v1/checkout/sessions', payload)

// ── Orders ────────────────────────────────────────────────────────────────────

export const getOrderBySession = (sessionId: string) =>
  client.get<ApiResponse<Order>>(`/v1/orders/by-session/${sessionId}`)

// ── Admin Stats ───────────────────────────────────────────────────────────────

export const adminGetStats = () => client.get<ApiResponse<AdminStats>>('/v1/admin/stats/overview')

// ── Admin Orders ──────────────────────────────────────────────────────────────

export const adminGetOrders = (params?: AdminOrderFilters) =>
  client.get<PaginatedResponse<AdminOrder>>('/v1/admin/orders', { params })

export const adminGetOrder = (id: string) =>
  client.get<ApiResponse<AdminOrder>>(`/v1/admin/orders/${id}`)

export const adminRefundOrder = (id: string) =>
  client.post<ApiResponse<AdminOrder>>(`/v1/admin/orders/${id}/refund`)

// ── Admin Vouchers ────────────────────────────────────────────────────────────

export const adminGetVouchers = (params?: AdminVoucherFilters) =>
  client.get<PaginatedResponse<AdminVoucher>>('/v1/admin/vouchers', { params })

export const adminGetVoucher = (code: string) =>
  client.get<ApiResponse<AdminVoucher>>(`/v1/admin/vouchers/${code}`)

export const adminValidateVoucher = (code: string) =>
  client.get<ApiResponse<AdminVoucher>>(`/v1/admin/vouchers/validate?code=${encodeURIComponent(code)}`)

export const adminRedeemVoucher = (code: string) =>
  client.post<ApiResponse<AdminVoucher>>(`/v1/admin/vouchers/${code}/redeem`)

export const adminCancelVoucher = (code: string) =>
  client.post<ApiResponse<AdminVoucher>>(`/v1/admin/vouchers/${code}/cancel`)

export const adminResendVoucherEmail = (code: string) =>
  client.post<{ message: string }>(`/v1/admin/vouchers/${code}/resend-email`)

export const adminGetVoucherAuditLog = (code: string) =>
  client.get<ApiResponse<VoucherAuditEntry[]>>(`/v1/admin/vouchers/${code}/audit-log`)

// ── Admin Promotions ──────────────────────────────────────────────────────────

export const adminGetPromotions = (params?: { page?: number }) =>
  client.get<PaginatedResponse<AdminPromotion>>('/v1/admin/promotions', { params })

export const adminCreatePromotion = (data: CreatePromotionPayload) =>
  client.post<ApiResponse<AdminPromotion>>('/v1/admin/promotions', data)

export const adminUpdatePromotion = (id: number, data: Partial<CreatePromotionPayload>) =>
  client.put<ApiResponse<AdminPromotion>>(`/v1/admin/promotions/${id}`, data)

export const adminDeletePromotion = (id: number) =>
  client.delete<{ message: string }>(`/v1/admin/promotions/${id}`)

// ── Admin Blog ────────────────────────────────────────────────────────────────

export const adminGetBlogPosts = (params?: { page?: number }) =>
  client.get<PaginatedResponse<AdminBlogPost>>('/v1/admin/blog/posts', { params })

export const adminGetBlogPost = (id: number) =>
  client.get<ApiResponse<AdminBlogPost>>(`/v1/admin/blog/posts/${id}`)

export const adminCreateBlogPost = (data: BlogPostPayload) =>
  client.post<ApiResponse<AdminBlogPost>>('/v1/admin/blog/posts', data)

export const adminUpdateBlogPost = (id: number, data: Partial<BlogPostPayload>) =>
  client.put<ApiResponse<AdminBlogPost>>(`/v1/admin/blog/posts/${id}`, data)

export const adminDeleteBlogPost = (id: number) =>
  client.delete<{ message: string }>(`/v1/admin/blog/posts/${id}`)

// ── Admin Users ───────────────────────────────────────────────────────────────

export const adminGetUsers = () =>
  client.get<ApiResponse<AdminUser[]>>('/v1/admin/users')

export const adminCreateUser = (data: { name: string; email: string; password: string; role: AdminUser['role'] }) =>
  client.post<ApiResponse<AdminUser>>('/v1/admin/users', data)

export const adminUpdateUser = (id: number, data: Partial<{ name: string; email: string; role: AdminUser['role'] }>) =>
  client.put<ApiResponse<AdminUser>>(`/v1/admin/users/${id}`, data)

export const adminDeleteUser = (id: number) =>
  client.delete<{ message: string }>(`/v1/admin/users/${id}`)

// ── Admin types ───────────────────────────────────────────────────────────────

export interface AdminStats {
  vouchers_sold_month: number
  revenue_month_cents: number
  vouchers_sold_year: number
  revenue_year_cents: number
  active_vouchers: number
  expiring_30_days: number
  pending_refunds: number
  monthly_revenue: { month: string; revenue_cents: number }[]
  voucher_status_distribution: { status: string; count: number }[]
  recent_orders: AdminOrder[]
  total_products: number
  total_orders: number
  active_promotions: number
  orders_this_month: number
}

export interface AdminOrder {
  id: string
  order_number: string
  customer_email: string
  customer_name: string
  status: 'pending_payment' | 'paid' | 'failed' | 'refunded' | 'cancelled'
  total_cents: number
  locale: string
  created_at: string
  paid_at: string | null
  vouchers?: AdminVoucher[]
  items?: AdminOrderItem[]
}

export interface AdminOrderItem {
  id: number
  product_name: string
  product_sku: string
  unit_price_cents: number
  quantity: number
  subtotal_cents: number
}

export interface AdminOrderFilters {
  page?: number
  per_page?: number
  status?: string
  search?: string
  from?: string
  to?: string
}

export interface AdminVoucher {
  id: string
  code: string
  status: 'pending_payment' | 'active' | 'redeemed' | 'expired' | 'refunded' | 'cancelled'
  expires_at: string | null
  redeemed_at: string | null
  email_sent_at: string | null
  pdf_path: string | null
  locale: string
  order_id: string
  order_number?: string
  customer_email?: string
  product_name?: string
  audit_logs?: VoucherAuditEntry[]
}

export interface VoucherAuditEntry {
  id: number
  actor_type: 'system' | 'admin' | 'customer'
  actor_name: string | null
  action: string
  metadata: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

export interface AdminVoucherFilters {
  page?: number
  per_page?: number
  status?: string
  search?: string
  from?: string
  to?: string
}

export interface AdminPromotion {
  id: number
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_cents: number | null
  valid_from: string | null
  valid_until: string | null
  max_uses: number | null
  used_count: number
  is_active: boolean
  created_at: string
}

export interface CreatePromotionPayload {
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_cents?: number
  valid_from?: string
  valid_until?: string
  max_uses?: number
  is_active: boolean
}

export interface AdminBlogPost {
  id: number
  slug: string
  title: string
  content: string
  excerpt: string | null
  cover_image: string | null
  meta_title: string | null
  meta_description: string | null
  is_published: boolean
  published_at: string | null
  reading_time_minutes: number | null
  locale: string
  created_at: string
  updated_at: string
}

export interface BlogPostPayload {
  title: string
  content: string
  excerpt?: string
  cover_image?: string
  meta_title?: string
  meta_description?: string
  is_published: boolean
  locale: string
}
