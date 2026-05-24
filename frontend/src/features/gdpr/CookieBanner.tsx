import { useEffect, useState } from 'react'
import { useUiStore } from '@/stores/uiStore'

type Locale = 'es' | 'ca' | 'fr' | 'en'

const COPY: Record<Locale, { text: string; accept: string; essential: string }> = {
  es: {
    text: 'Usamos cookies esenciales para el funcionamiento del sitio y, con tu consentimiento, cookies analíticas para mejorar tu experiencia.',
    accept: 'Aceptar todas',
    essential: 'Solo esenciales',
  },
  ca: {
    text: 'Fem servir galetes essencials per al funcionament del lloc i, amb el teu consentiment, galetes analítiques per millorar la teva experiència.',
    accept: 'Acceptar-les totes',
    essential: 'Només essencials',
  },
  fr: {
    text: 'Nous utilisons des cookies essentiels au fonctionnement du site et, avec votre consentement, des cookies analytiques pour améliorer votre expérience.',
    accept: 'Accepter tout',
    essential: 'Essentiels uniquement',
  },
  en: {
    text: 'We use essential cookies for site functionality and, with your consent, analytics cookies to improve your experience.',
    accept: 'Accept all',
    essential: 'Essential only',
  },
}

function detectLocale(): Locale {
  const match = window.location.pathname.match(/^\/(es|ca|fr|en)/)
  return (match?.[1] as Locale) ?? 'es'
}

export function CookieBanner() {
  const { cookieConsent, setCookieConsent } = useUiStore()
  const [visible, setVisible] = useState(false)
  const [locale, setLocale] = useState<Locale>('es')

  useEffect(() => {
    setLocale(detectLocale())
    if (cookieConsent === null) {
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
  }, [cookieConsent])

  if (!visible || cookieConsent !== null) return null

  const copy = COPY[locale]

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
      style={{ animation: 'slideUp 0.35s ease-out' }}
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="max-w-4xl mx-auto bg-brand-dusk text-white rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="flex-1 text-sm leading-relaxed text-white/80">{copy.text}</p>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setCookieConsent('essential')}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white border border-white/20 hover:border-white/40 transition-colors"
          >
            {copy.essential}
          </button>
          <button
            onClick={() => setCookieConsent('accepted')}
            className="px-5 py-2 rounded-lg bg-brand-gold text-white text-sm font-semibold hover:bg-brand-gold/90 transition-colors"
          >
            {copy.accept}
          </button>
        </div>
      </div>
    </div>
  )
}
