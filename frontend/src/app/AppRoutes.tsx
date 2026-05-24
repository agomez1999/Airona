import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LocaleLayout } from '@/components/layout/LocaleLayout'
import { CartDrawer } from '@/features/cart/CartDrawer'
import { CookieBanner } from '@/features/gdpr/CookieBanner'
import { SlugRouter } from '@/features/routing/SlugRouter'
import { HomePage } from '@/features/home/HomePage'
import { BlogListPage } from '@/features/blog/BlogListPage'
import { BlogPostPage } from '@/features/blog/BlogPostPage'
import { CheckoutPage } from '@/features/checkout/CheckoutPage'
import { ConfirmationPage } from '@/features/confirmation/ConfirmationPage'
import AdminLoginPage from '@/features/admin/AdminLoginPage'

// Admin panel — separate lazy chunk, never bundled into public JS
const AdminLayout = lazy(() => import('@/features/admin/AdminLayout').then(m => ({ default: m.AdminLayout })))
const AdminGuard = lazy(() => import('@/features/admin/AdminGuard').then(m => ({ default: m.AdminGuard })))
const DashboardPage = lazy(() => import('@/features/admin/DashboardPage').then(m => ({ default: m.DashboardPage })))
const ProductsPage = lazy(() => import('@/features/admin/products/ProductsPage').then(m => ({ default: m.ProductsPage })))
const OrdersPage = lazy(() => import('@/features/admin/orders/OrdersPage').then(m => ({ default: m.OrdersPage })))
const VouchersPage = lazy(() => import('@/features/admin/vouchers/VouchersPage').then(m => ({ default: m.VouchersPage })))
const VoucherValidatePage = lazy(() => import('@/features/admin/vouchers/VoucherValidatePage').then(m => ({ default: m.VoucherValidatePage })))
const PromotionsPage = lazy(() => import('@/features/admin/promotions/PromotionsPage').then(m => ({ default: m.PromotionsPage })))
const BlogPostsPage = lazy(() => import('@/features/admin/blog/BlogPostsPage').then(m => ({ default: m.BlogPostsPage })))
const UsersPage = lazy(() => import('@/features/admin/users/UsersPage').then(m => ({ default: m.UsersPage })))

function AdminFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-gray-400 text-sm">Loading…</div>
    </div>
  )
}

export function AppRoutes() {
  return (
    <>
      <CartDrawer />
      <CookieBanner />
      <Routes>
        {/* Root → default locale */}
        <Route path="/" element={<Navigate to="/es/" replace />} />

        {/* Locale-scoped public routes */}
        <Route path="/:lang/" element={<LocaleLayout />}>
          <Route index element={<HomePage />} />
          <Route path="blog/" element={<BlogListPage />} />
          <Route path="blog/:postSlug/" element={<BlogPostPage />} />
          <Route path="checkout/" element={<CheckoutPage />} />
          <Route path="confirmacion/:sessionId/" element={<ConfirmationPage />} />
          <Route path=":slug/" element={<SlugRouter />} />
        </Route>

        {/* Admin login (no guard) */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin panel — lazy-loaded, guarded */}
        <Route
          path="/admin"
          element={
            <Suspense fallback={<AdminFallback />}>
              <AdminGuard>
                <AdminLayout />
              </AdminGuard>
            </Suspense>
          }
        >
          <Route index element={<Suspense fallback={null}><DashboardPage /></Suspense>} />
          <Route path="products" element={<Suspense fallback={null}><ProductsPage /></Suspense>} />
          <Route path="orders" element={<Suspense fallback={null}><OrdersPage /></Suspense>} />
          <Route path="vouchers" element={<Suspense fallback={null}><VouchersPage /></Suspense>} />
          <Route path="vouchers/validate" element={<Suspense fallback={null}><VoucherValidatePage /></Suspense>} />
          <Route path="promotions" element={<Suspense fallback={null}><PromotionsPage /></Suspense>} />
          <Route path="blog" element={<Suspense fallback={null}><BlogPostsPage /></Suspense>} />
          <Route
            path="users"
            element={
              <Suspense fallback={null}>
                <AdminGuard requireRole="superadmin"><UsersPage /></AdminGuard>
              </Suspense>
            }
          />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/es/" replace />} />
      </Routes>
    </>
  )
}
