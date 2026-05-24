import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LOCALES, type Locale, resolveSlug, getSlug } from '@/config/routes'

const LOCALE_LABELS: Record<Locale, string> = {
  es: 'ES',
  ca: 'CA',
  fr: 'FR',
  en: 'EN',
}

interface Props {
  currentLocale: Locale
}

export function LanguageSwitcher({ currentLocale }: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  function switchLocale(target: Locale) {
    if (target === currentLocale) return

    // Parse current path: /:lang/:slug/...
    const parts = location.pathname.replace(/^\//, '').split('/')
    // parts[0] = lang, parts[1] = slug (optional), parts[2..] = rest
    if (parts.length >= 2) {
      const currentSlug = parts[1]
      const key = resolveSlug(currentLocale, currentSlug)
      if (key) {
        const targetSlug = getSlug(target, key)
        const rest = parts.slice(2)
        const newPath = `/${target}/${targetSlug}${rest.length ? '/' + rest.join('/') : '/'}`
        navigate(newPath)
        return
      }
    }
    // Fallback: just switch lang prefix
    navigate(`/${target}/`)
  }

  return (
    <div className="flex items-center gap-1" aria-label={t('language')}>
      {LOCALES.map((locale, i) => (
        <span key={locale} className="flex items-center">
          <button
            onClick={() => switchLocale(locale)}
            aria-current={locale === currentLocale ? 'true' : undefined}
            className={[
              'text-sm font-medium px-1 py-0.5 rounded transition-colors',
              locale === currentLocale
                ? 'text-brand-gold'
                : 'text-brand-dusk/60 hover:text-brand-dusk',
            ].join(' ')}
          >
            {LOCALE_LABELS[locale]}
          </button>
          {i < LOCALES.length - 1 && (
            <span className="text-brand-dusk/30 text-xs select-none">·</span>
          )}
        </span>
      ))}
    </div>
  )
}
