import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useOutletContext } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import type { LocaleContext } from '@/components/layout/LocaleLayout'
import { MetaTags } from '@/components/seo/MetaTags'
import { SchemaOrg } from '@/components/seo/SchemaOrg'
import { HreflangTags } from '@/components/seo/HreflangTags'
import { LazyImage } from '@/components/common/LazyImage'
import { buildLocalePath } from '@/config/routes'
import { getProducts } from '@/services/api/endpoints'
import { formatCurrency } from '@/lib/formatCurrency'
import {
  transitions,
  fadeUpVariants,
  staggerContainerVariants,
  staggerItemVariants,
  accordionVariants,
} from '@/lib/motion'

const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://airona.com'

const TESTIMONIAL_AUTHORS = [
  { name: 'María G.', rating: 5, source: 'Google' },
  { name: 'Jean-Pierre M.', rating: 5, source: 'Tripadvisor' },
  { name: 'Laura T.', rating: 5, source: 'Google' },
]

export function HomePage() {
  const { locale } = useOutletContext<LocaleContext>()
  const { t: tSeo } = useTranslation('seo')
  const { t: tHome } = useTranslation('home')

  const { data: productsData } = useQuery({
    queryKey: ['products', locale],
    queryFn: () => getProducts(locale).then(r => r.data.data),
    staleTime: 1000 * 60 * 15,
  })

  const products = productsData ?? []

  const localBusinessSchema = {
    '@type': 'LocalBusiness',
    name: 'Airona Globus',
    url: `${SITE_URL}/${locale}/`,
    telephone: '+34652907515',
    email: 'info@aironaglobus.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Colomers',
      addressLocality: 'Colomers',
      addressRegion: 'Girona',
      postalCode: '17252',
      addressCountry: 'ES',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 42.0028, longitude: 3.0184 },
    priceRange: '€€',
    description: tSeo('home.description'),
    image: `${SITE_URL}/og/home.jpg`,
    sameAs: [
      'https://www.tripadvisor.es/Attraction_Review-g187497-d8145614-Reviews-Airona_Globus-Girona_Province_of_Girona_Catalonia.html',
      'https://www.facebook.com/aironaglobus',
      'https://www.instagram.com/aironaglobus',
      'https://www.youtube.com/@aironaglobus',
    ],
  }

  return (
    <>
      <MetaTags
        title={tSeo('home.title')}
        description={tSeo('home.description')}
        canonical={`${SITE_URL}/${locale}/`}
        ogImage={`${SITE_URL}/og/home.jpg`}
      />
      <HreflangTags />
      <SchemaOrg schema={localBusinessSchema} />

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-brand-dusk">
          <LazyImage
            src="/images/hero-balloon.jpg"
            alt="Vuelo en globo aerostático al amanecer sobre el Empordà y la Costa Brava"
            width={1920}
            height={1080}
            className="w-full h-full"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dusk/40 via-brand-dusk/20 to-brand-dusk/60" />
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6 drop-shadow-sm"
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            {tHome('hero.headline')}
          </motion.h1>
          <motion.p
            className="text-xl sm:text-2xl text-white/85 mb-10 max-w-2xl mx-auto leading-relaxed font-light"
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ ...transitions.normal, delay: 0.1 }}
          >
            {tHome('hero.subheadline')}
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ ...transitions.normal, delay: 0.2 }}
          >
            <Link
              to={buildLocalePath(locale, 'experiences')}
              className="inline-flex items-center px-8 py-4 rounded-full bg-brand-gold text-white font-semibold text-lg hover:bg-brand-gold/90 transition-all hover:scale-105 shadow-lg"
            >
              {tHome('hero.cta')}
            </Link>
            <Link
              to={buildLocalePath(locale, 'gift')}
              className="inline-flex items-center px-8 py-4 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 text-white font-semibold text-lg hover:bg-white/25 transition-all"
            >
              {tHome('hero.ctaGift')}
            </Link>
          </motion.div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-brand-dusk text-white py-10">
        <motion.div
          className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {[
            { value: tHome('trust.years', { n: 10 }), icon: '🎈' },
            { value: tHome('trust.flights', { n: 5000 }), icon: '👥' },
            { value: tHome('trust.satisfaction'), icon: '⭐' },
            { value: tHome('trust.safety'), icon: '🛡️' },
          ].map((item, i) => (
            <motion.div key={i} className="flex flex-col items-center gap-2" variants={staggerItemVariants}>
              <span className="text-2xl" aria-hidden="true">{item.icon}</span>
              <p className="text-sm font-semibold text-brand-gold">{item.value}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Experiences section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          <h2 className="text-4xl font-display font-bold text-brand-dusk mb-3">
            {tHome('experiences.title')}
          </h2>
          <p className="text-brand-dusk/60 text-lg">{tHome('experiences.subtitle')}</p>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {products.length > 0
            ? products.map(product => (
                <motion.div key={product.id} variants={staggerItemVariants}>
                  <ExperienceCard product={product} locale={locale} />
                </motion.div>
              ))
            : [
                { type: 'shared', slug: 'sharedFlight' as const },
                { type: 'private', slug: 'privateFlight' as const },
                { type: 'gift', slug: 'gift' as const },
              ].map(({ type }) => (
                <motion.div key={type} variants={staggerItemVariants}>
                  <PlaceholderCard type={type} locale={locale} />
                </motion.div>
              ))
          }
        </motion.div>
      </section>

      {/* What's included strip */}
      <section className="bg-brand-mist py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            className="text-2xl font-display font-bold text-brand-dusk text-center mb-8"
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {tHome('included.title')}
          </motion.h2>
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center"
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {[
              { icon: '🍾', labelKey: 'included.cava' },
              { icon: '📸', labelKey: 'included.photos' },
              { icon: '🎓', labelKey: 'included.pilot' },
              { icon: '🌅', labelKey: 'included.sunrise' },
            ].map((item, i) => (
              <motion.div key={i} className="bg-white rounded-xl p-4 shadow-sm" variants={staggerItemVariants}>
                <div className="text-3xl mb-2">{item.icon}</div>
                <p className="text-sm font-medium text-brand-dusk">{tHome(item.labelKey)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            className="text-4xl font-display font-bold text-center text-brand-dusk mb-12"
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {tHome('testimonials.title')}
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {TESTIMONIAL_AUTHORS.map((author, i) => (
              <motion.div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-sm border border-brand-mist"
                variants={staggerItemVariants}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-0.5" aria-label={`${author.rating} estrellas`}>
                    {Array.from({ length: author.rating }).map((_, j) => (
                      <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill="#C9A84C" aria-hidden="true">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-brand-dusk/40">{author.source}</span>
                </div>
                <p className="text-brand-dusk/80 text-sm leading-relaxed mb-4 italic">
                  "{tHome(`testimonials.${i}`)}"
                </p>
                <p className="text-brand-dusk font-semibold text-sm">— {author.name}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ snippet */}
      <section className="py-20 px-4 max-w-3xl mx-auto">
        <motion.h2
          className="text-4xl font-display font-bold text-center text-brand-dusk mb-10"
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {tHome('faqSnippet.title')}
        </motion.h2>
        <FaqSnippet />
        <div className="text-center mt-8">
          <Link
            to={buildLocalePath(locale, 'faq')}
            className="inline-flex items-center text-brand-gold font-semibold hover:underline"
          >
            {tHome('faqSnippet.viewAll')} →
          </Link>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-brand-dusk text-white py-20 px-4 text-center">
        <motion.div
          className="max-w-2xl mx-auto"
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          <h2 className="text-4xl font-display font-bold mb-4">{tHome('cta.title')}</h2>
          <p className="text-white/70 text-lg mb-8">{tHome('cta.subtitle')}</p>
          <Link
            to={buildLocalePath(locale, 'experiences')}
            className="inline-flex items-center px-10 py-4 rounded-full bg-brand-gold text-white font-semibold text-lg hover:bg-brand-gold/90 transition-all hover:scale-105"
          >
            {tHome('cta.button')}
          </Link>
        </motion.div>
      </section>
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

import type { Product } from '@/services/api/types/experience.types'

function ExperienceCard({ product, locale }: { product: Product; locale: LocaleContext['locale'] }) {
  const hero = product.images.find(i => i.is_hero) ?? product.images[0]
  const { t } = useTranslation()

  return (
    <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
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
          <div className="w-full h-full bg-brand-sky/20 flex items-center justify-center">
            <span className="text-4xl">🎈</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="font-display text-xl font-bold text-brand-dusk mb-2">{product.name}</h3>
        {product.short_description && (
          <p className="text-brand-dusk/60 text-sm leading-relaxed mb-4">{product.short_description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-brand-gold font-bold text-xl">
            {formatCurrency(product.price_cents)}
          </span>
          <Link
            to={buildLocalePath(locale, product.type === 'shared' ? 'sharedFlight' : product.type === 'private' ? 'privateFlight' : 'gift')}
            className="px-4 py-2 rounded-full bg-brand-gold text-white text-sm font-semibold hover:bg-brand-gold/90 transition-colors"
          >
            {t('actions.learnMore')}
          </Link>
        </div>
      </div>
    </article>
  )
}

function PlaceholderCard({ type, locale }: { type: string; locale: LocaleContext['locale'] }) {
  const { t } = useTranslation()
  const { t: tHome } = useTranslation('home')

  const slugs: Record<string, 'sharedFlight' | 'privateFlight' | 'gift'> = {
    shared: 'sharedFlight', private: 'privateFlight', gift: 'gift',
  }
  const typeKey = type as 'shared' | 'private' | 'gift'

  return (
    <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      <div className="aspect-[4/3] bg-gradient-to-br from-brand-sky/30 to-brand-gold/20 flex items-center justify-center">
        <span className="text-6xl">{type === 'gift' ? '🎁' : '🎈'}</span>
      </div>
      <div className="p-6">
        <h3 className="font-display text-xl font-bold text-brand-dusk mb-2">
          {tHome(`placeholders.${typeKey}.label`)}
        </h3>
        <p className="text-brand-dusk/60 text-sm leading-relaxed mb-4">
          {tHome(`placeholders.${typeKey}.desc`)}
        </p>
        <Link
          to={buildLocalePath(locale, slugs[type])}
          className="inline-flex px-4 py-2 rounded-full bg-brand-gold text-white text-sm font-semibold hover:bg-brand-gold/90 transition-colors"
        >
          {t('actions.learnMore')}
        </Link>
      </div>
    </article>
  )
}

function FaqSnippet() {
  const { t: tHome } = useTranslation('home')
  const FAQ_KEYS = [0, 1, 2] as const
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-4">
      {FAQ_KEYS.map((i) => (
        <div key={i} className="bg-white rounded-xl border border-brand-mist overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between p-5 cursor-pointer font-semibold text-brand-dusk hover:text-brand-gold transition-colors text-left"
            aria-expanded={openIndex === i}
          >
            <span>{tHome(`faq.q${i}`)}</span>
            <motion.svg
              className="w-5 h-5 text-brand-gold flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              animate={{ rotate: openIndex === i ? 180 : 0 }}
              transition={transitions.fast}
            >
              <polyline points="6 9 12 15 18 9"/>
            </motion.svg>
          </button>
          <AnimatePresence initial={false}>
            {openIndex === i && (
              <motion.div
                variants={accordionVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                style={{ overflow: 'hidden' }}
              >
                <p className="px-5 pb-5 pt-1 text-brand-dusk/70 text-sm leading-relaxed">
                  {tHome(`faq.a${i}`)}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}
