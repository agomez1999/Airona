import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { useCartStore } from '@/stores/cartStore'
import { buildLocalePath, type Locale } from '@/config/routes'
import { LanguageSwitcher } from './LanguageSwitcher'
import { slideDownVariants } from '@/lib/motion'

interface Props {
  locale: Locale
  transparent?: boolean
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

export function Header({ locale, transparent = false }: Props) {
  const { t } = useTranslation()
  const location = useLocation()
  const cartCount = useCartStore(s => s.items.reduce((n, i) => n + i.quantity, 0))
  const openCart = useCartStore(s => s.openDrawer)

  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const isTransparent = transparent && !scrolled && !menuOpen

  const navLinks = [
    { key: 'experiences', label: t('nav.experiences') },
    { key: 'flightZone', label: t('nav.flightZone') },
    { key: 'faq', label: t('nav.faq') },
    { key: 'about', label: t('nav.about') },
    { key: 'contact', label: t('nav.contact') },
  ] as const

  return (
    <header
      className={[
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        isTransparent
          ? 'bg-transparent'
          : 'bg-brand-cream/95 backdrop-blur-sm shadow-sm',
      ].join(' ')}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link
            to={`/${locale}/`}
            className={[
              'font-display font-bold text-xl tracking-tight transition-colors',
              isTransparent ? 'text-white' : 'text-brand-dusk',
            ].join(' ')}
            aria-label="Airona Globus – Inicio"
          >
            Airona<span className="text-brand-gold">.</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6" aria-label="Navegación principal">
            {navLinks.map(({ key, label }) => (
              <NavLink
                key={key}
                to={buildLocalePath(locale, key)}
                className={({ isActive }) => [
                  'text-sm font-medium transition-colors',
                  isTransparent
                    ? isActive
                      ? 'text-white font-semibold underline underline-offset-4 decoration-white/60'
                      : 'text-white/90 hover:text-white'
                    : isActive
                      ? 'text-brand-gold font-semibold'
                      : 'text-brand-dusk/70 hover:text-brand-dusk',
                ].join(' ')}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:block">
              <LanguageSwitcher currentLocale={locale} />
            </div>

            {/* Gift CTA */}
            <Link
              to={buildLocalePath(locale, 'gift')}
              className="hidden sm:inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-brand-gold text-white hover:bg-brand-gold/90 transition-colors"
            >
              {t('nav.gift')}
            </Link>

            {/* Cart button */}
            <button
              onClick={openCart}
              className={[
                'relative p-2 rounded-full transition-colors',
                isTransparent ? 'text-white hover:bg-white/10' : 'text-brand-dusk hover:bg-brand-mist',
              ].join(' ')}
              aria-label={t('cart.title')}
            >
              <CartIcon />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-brand-gold text-white text-[10px] font-bold flex items-center justify-center leading-none">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              className={[
                'lg:hidden p-2 rounded-full transition-colors',
                isTransparent ? 'text-white hover:bg-white/10' : 'text-brand-dusk hover:bg-brand-mist',
              ].join(' ')}
              aria-label="Menú"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence initial={false}>
        {menuOpen && (
          <motion.div
            className="lg:hidden bg-brand-cream border-t border-brand-mist px-4 pb-6 pt-4 space-y-1"
            variants={slideDownVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            {navLinks.map(({ key, label }) => (
              <NavLink
                key={key}
                to={buildLocalePath(locale, key)}
                className={({ isActive }) => [
                  'block py-3 text-base font-medium border-b border-brand-mist/60 last:border-0 transition-colors',
                  isActive ? 'text-brand-gold font-semibold' : 'text-brand-dusk hover:text-brand-gold',
                ].join(' ')}
              >
                {label}
              </NavLink>
            ))}
            <Link
              to={buildLocalePath(locale, 'gift')}
              className="block mt-4 py-3 text-center rounded-full bg-brand-gold text-white font-semibold"
            >
              {t('nav.gift')}
            </Link>
            <div className="flex justify-center pt-4">
              <LanguageSwitcher currentLocale={locale} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
