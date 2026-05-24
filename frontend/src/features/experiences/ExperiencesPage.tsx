import { Link } from 'react-router-dom'
import { useOutletContext } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import type { LocaleContext } from '@/components/layout/LocaleLayout'
import { MetaTags } from '@/components/seo/MetaTags'
import { HreflangTags } from '@/components/seo/HreflangTags'
import { LazyImage } from '@/components/common/LazyImage'
import { buildLocalePath } from '@/config/routes'
import { getProducts } from '@/services/api/endpoints'
import { formatCurrency } from '@/lib/formatCurrency'
import {
  fadeUpVariants,
  staggerContainerVariants,
  staggerItemVariants,
} from '@/lib/motion'

const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://airona.com'

export function ExperiencesPage() {
  const { locale } = useOutletContext<LocaleContext>()
  const { t } = useTranslation()
  const { t: tSeo } = useTranslation('seo')
  const { t: tExp } = useTranslation('experiences')

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', locale],
    queryFn: () => getProducts(locale).then(r => r.data.data),
    staleTime: 1000 * 60 * 15,
  })

  const typeToSlug: Record<string, 'sharedFlight' | 'privateFlight' | 'gift'> = {
    shared: 'sharedFlight', private: 'privateFlight', gift: 'gift',
  }

  return (
    <>
      <MetaTags
        title={tSeo('experiences.title')}
        description={tSeo('experiences.description')}
        canonical={`${SITE_URL}/${locale}/${buildLocalePath(locale, 'experiences').slice(locale.length + 2)}`}
        ogImage={`${SITE_URL}/og/experiences.jpg`}
      />
      <HreflangTags pageKey="experiences" />

      {/* Hero */}
      <section className="pt-24 pb-16 px-4 text-center bg-gradient-to-b from-brand-sky/10 to-brand-cream">
        <motion.div
          className="max-w-3xl mx-auto"
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
        >
          <h1 className="text-5xl font-display font-bold text-brand-dusk mb-4">
            {tExp('heading')}
          </h1>
          <p className="text-brand-dusk/60 text-xl">{tExp('subtitle')}</p>
        </motion.div>
      </section>

      {/* Products grid */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="aspect-[4/3] bg-brand-mist" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-brand-mist rounded w-3/4" />
                  <div className="h-4 bg-brand-mist rounded w-full" />
                  <div className="h-4 bg-brand-mist rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {products.map(product => {
              const hero = product.images.find(i => i.is_hero) ?? product.images[0]
              const slug = typeToSlug[product.type] ?? 'experiences'
              return (
                <motion.article key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group" variants={staggerItemVariants}>
                  <Link to={buildLocalePath(locale, slug)} className="block">
                    <div className="aspect-[4/3] overflow-hidden">
                      {hero ? (
                        <LazyImage
                          src={hero.url}
                          alt={hero.alt_text ?? product.name ?? ''}
                          width={600}
                          height={450}
                          className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-brand-sky/20 flex items-center justify-center text-5xl">🎈</div>
                      )}
                    </div>
                  </Link>
                  <div className="p-6">
                    <Link to={buildLocalePath(locale, slug)}>
                      <h2 className="font-display text-xl font-bold text-brand-dusk mb-2 hover:text-brand-gold transition-colors">
                        {product.name}
                      </h2>
                    </Link>
                    {product.short_description && (
                      <p className="text-brand-dusk/60 text-sm leading-relaxed mb-5">
                        {product.short_description}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-brand-mist">
                      <div>
                        {product.sale_price_cents ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-brand-gold font-bold text-xl">
                              {formatCurrency(product.sale_price_cents)}
                            </span>
                            <span className="text-brand-dusk/40 text-sm line-through">
                              {formatCurrency(product.price_cents)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-brand-gold font-bold text-xl">
                            {formatCurrency(product.price_cents)}
                          </span>
                        )}
                      </div>
                      <Link
                        to={buildLocalePath(locale, slug)}
                        className="px-5 py-2.5 rounded-full bg-brand-gold text-white text-sm font-semibold hover:bg-brand-gold/90 transition-colors"
                      >
                        {t('actions.learnMore')}
                      </Link>
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </motion.div>
        )}
      </section>

      {/* Included section */}
      <section className="bg-brand-mist py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold text-brand-dusk mb-10">
            {tExp('included.title')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: '🌅', labelKey: 'included.sunrise' },
              { icon: '🍾', labelKey: 'included.cava' },
              { icon: '📸', labelKey: 'included.photos' },
              { icon: '🛡️', labelKey: 'included.pilot' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm text-center">
                <div className="text-3xl mb-2">{item.icon}</div>
                <p className="text-sm font-medium text-brand-dusk">{tExp(item.labelKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gift CTA */}
      <section className="bg-brand-dusk text-white py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-display font-bold mb-3">
            {tExp('gift.title')}
          </h2>
          <p className="text-white/60 mb-6">
            {tExp('gift.subtitle')}
          </p>
          <Link
            to={buildLocalePath(locale, 'gift')}
            className="inline-flex items-center px-8 py-3.5 rounded-full bg-brand-gold text-white font-semibold hover:bg-brand-gold/90 transition-all"
          >
            {t('nav.gift')}
          </Link>
        </div>
      </section>
    </>
  )
}
