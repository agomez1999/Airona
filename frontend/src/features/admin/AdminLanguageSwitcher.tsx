import { useTranslation } from 'react-i18next'
import { useUiStore } from '@/stores/uiStore'
import { LOCALES, type Locale } from '@/config/routes'

const LABELS: Record<Locale, string> = { es: 'ES', ca: 'CA', fr: 'FR', en: 'EN' }

export function AdminLanguageSwitcher() {
  const { i18n } = useTranslation()
  const { adminLang, setAdminLang } = useUiStore()

  function switchLang(lang: Locale) {
    if (lang === adminLang) return
    setAdminLang(lang)
    void i18n.changeLanguage(lang)
  }

  return (
    <div className="flex items-center gap-0.5" aria-label="Admin language">
      {LOCALES.map((locale, i) => (
        <span key={locale} className="flex items-center">
          <button
            onClick={() => switchLang(locale)}
            aria-pressed={locale === adminLang}
            className={[
              'cursor-pointer text-xs font-medium px-1.5 py-0.5 rounded transition-colors',
              locale === adminLang
                ? 'text-brand-gold'
                : 'text-white/40 hover:text-white/80',
            ].join(' ')}
          >
            {LABELS[locale]}
          </button>
          {i < LOCALES.length - 1 && (
            <span className="text-white/20 text-[10px] select-none">·</span>
          )}
        </span>
      ))}
    </div>
  )
}
