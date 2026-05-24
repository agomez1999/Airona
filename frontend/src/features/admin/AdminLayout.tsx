import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { AdminLanguageSwitcher } from './AdminLanguageSwitcher'
import {
  IconDashboard, IconProducts, IconOrders, IconVouchers,
  IconValidate, IconPromotions, IconBlog, IconUsers, IconMenu,
} from '@/components/ui/icons'
import type { LucideIcon } from 'lucide-react'

export function AdminLayout() {
  const { user, logout } = useAuthStore()
  const { adminLang } = useUiStore()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation('admin')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Sync i18n language with the admin's persisted preference on mount
  useEffect(() => {
    if (i18n.language !== adminLang) {
      void i18n.changeLanguage(adminLang)
    }
  }, [adminLang, i18n])

  const isSuperAdmin = user?.role === 'superadmin'

  async function handleLogout() {
    await logout()
    navigate('/admin/login')
  }

  const NAV_ITEMS: { to: string; label: string; icon: LucideIcon; exact?: boolean }[] = [
    { to: '/admin', label: t('nav.dashboard'), icon: IconDashboard, exact: true },
    { to: '/admin/products', label: t('nav.products'), icon: IconProducts },
    { to: '/admin/orders', label: t('nav.orders'), icon: IconOrders },
    { to: '/admin/vouchers', label: t('nav.vouchers'), icon: IconVouchers },
    { to: '/admin/vouchers/validate', label: t('nav.validate'), icon: IconValidate },
    { to: '/admin/promotions', label: t('nav.promotions'), icon: IconPromotions },
    { to: '/admin/blog', label: t('nav.blog'), icon: IconBlog },
  ]

  const SUPERADMIN_ITEMS: { to: string; label: string; icon: LucideIcon }[] = [
    { to: '/admin/users', label: t('nav.users'), icon: IconUsers },
  ]

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={[
        'fixed lg:static inset-y-0 left-0 z-30 w-60 bg-brand-dusk text-white flex flex-col transition-transform duration-200',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ].join(' ')}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <Link to="/admin" className="font-display font-bold text-xl">
            Airona<span className="text-brand-gold">.</span>
            <span className="ml-2 text-xs font-body text-white/40 font-normal">admin</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) => [
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-gold text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white',
              ].join(' ')}
            >
              <Icon size={16} className="flex-shrink-0" />
              {label}
            </NavLink>
          ))}

          {isSuperAdmin && (
            <>
              <div className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                {t('nav.superadmin')}
              </div>
              {SUPERADMIN_ITEMS.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => [
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-gold text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white',
                  ].join(' ')}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  {label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Language switcher + user info */}
        <div className="px-4 py-4 border-t border-white/10 space-y-3">
          <AdminLanguageSwitcher />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-white/40 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-xs text-white/40 hover:text-white transition-colors py-1"
          >
            {t('common.signOut')}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
            aria-label="Open menu"
          >
            <IconMenu size={20} />
          </button>
          <span className="font-display font-bold text-brand-dusk">Airona Admin</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
