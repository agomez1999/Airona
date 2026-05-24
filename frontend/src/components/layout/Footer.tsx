import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { buildLocalePath, type Locale } from '@/config/routes'

interface Props {
  locale: Locale
}

export function Footer({ locale }: Props) {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="bg-brand-dusk text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-16">
          {/* Brand column */}
          <div className="md:col-span-1">
            <Link to={`/${locale}/`} className="font-display font-bold text-2xl">
              Airona<span className="text-brand-gold">.</span>
            </Link>
            <p className="mt-3 text-sm text-white/60 leading-relaxed">
              {locale === 'es' && 'Vuelos en globo sobre el Empordà y la Costa Brava desde hace más de 10 años.'}
              {locale === 'ca' && 'Vols en globus sobre l\'Empordà i la Costa Brava des de fa més de 10 anys.'}
              {locale === 'fr' && 'Vols en montgolfière au-dessus de l\'Empordà et de la Costa Brava depuis plus de 10 ans.'}
              {locale === 'en' && 'Hot air balloon flights over the Empordà and Costa Brava for over 10 years.'}
            </p>
          </div>

          {/* Experiences */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-gold mb-4">
              {t('nav.experiences')}
            </h3>
            <ul className="space-y-3">
              {[
                { key: 'sharedFlight', label: locale === 'es' ? 'Vuelo compartido' : locale === 'ca' ? 'Vol compartit' : locale === 'fr' ? 'Vol partagé' : 'Shared flight' },
                { key: 'privateFlight', label: locale === 'es' ? 'Vuelo privado' : locale === 'ca' ? 'Vol privat' : locale === 'fr' ? 'Vol privé' : 'Private flight' },
                { key: 'gift', label: locale === 'es' ? 'Regala un vuelo' : locale === 'ca' ? 'Regala un vol' : locale === 'fr' ? 'Offrir un vol' : 'Gift a flight' },
              ].map(({ key, label }) => (
                <li key={key}>
                  <Link
                    to={buildLocalePath(locale, key as Parameters<typeof buildLocalePath>[1])}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-gold mb-4">
              {locale === 'es' ? 'Información' : locale === 'ca' ? 'Informació' : locale === 'fr' ? 'Information' : 'Information'}
            </h3>
            <ul className="space-y-3">
              {[
                { key: 'flightZone', label: t('nav.flightZone') },
                { key: 'faq', label: t('nav.faq') },
                { key: 'about', label: t('nav.about') },
                { key: 'blog', label: t('nav.blog') },
              ].map(({ key, label }) => (
                <li key={key}>
                  <Link
                    to={buildLocalePath(locale, key as Parameters<typeof buildLocalePath>[1])}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-gold mb-4">
              {t('nav.contact')}
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:info@aironaglobus.com" className="text-sm text-white/60 hover:text-white transition-colors">
                  info@aironaglobus.com
                </a>
              </li>
              <li>
                <a href="tel:+34652907515" className="text-sm text-white/60 hover:text-white transition-colors">
                  +34 652 907 515
                </a>
              </li>
              <li className="text-sm text-white/60">
                Empordà, Girona
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            {t('footer.rights', { year })}
          </p>
          <div className="flex items-center gap-6">
            <Link to={buildLocalePath(locale, 'contact')} className="text-xs text-white/40 hover:text-white/70 transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link to={buildLocalePath(locale, 'contact')} className="text-xs text-white/40 hover:text-white/70 transition-colors">
              {t('footer.terms')}
            </Link>
            <Link to={buildLocalePath(locale, 'contact')} className="text-xs text-white/40 hover:text-white/70 transition-colors">
              {t('footer.cookies')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
