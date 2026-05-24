export interface ApiResponse<T> {
  data: T
  meta?: Record<string, unknown>
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface AdminUser {
  id: number
  name: string
  email: string
  role: 'admin' | 'superadmin'
}

export type ProductType = 'shared' | 'private' | 'gift' | 'special'

export interface ProductTranslation {
  name: string
  slug: string
  description: string | null
  short_description: string | null
  meta_title: string | null
  meta_description: string | null
  og_title: string | null
  og_description: string | null
}

export interface ProductImage {
  id: number
  url: string
  alt_text: string | null
  sort_order: number
  is_hero: boolean
}

// Public product (single locale, returned by public API)
export interface Product {
  id: number
  sku: string
  type: ProductType
  price_cents: number
  sale_price_cents: number | null
  capacity: number | null
  duration_minutes: number | null
  name: string | null
  slug: string | null
  description: string | null
  short_description: string | null
  meta_title: string | null
  meta_description: string | null
  images: ProductImage[]
}

// Admin product (all translations, returned by admin API)
export interface AdminProduct {
  id: number
  sku: string
  type: ProductType
  price_cents: number
  sale_price_cents: number | null
  capacity: number | null
  duration_minutes: number | null
  is_visible: boolean
  sort_order: number
  created_at: string
  updated_at: string
  translations: Record<string, ProductTranslation>
  images: ProductImage[]
}
