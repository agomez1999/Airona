import { useState } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import type { LocaleContext } from '@/components/layout/LocaleLayout'
import { MetaTags } from '@/components/seo/MetaTags'
import { SchemaOrg } from '@/components/seo/SchemaOrg'
import { HreflangTags } from '@/components/seo/HreflangTags'
import { buildLocalePath } from '@/config/routes'
import { accordionVariants, fadeUpVariants, staggerContainerVariants, staggerItemVariants } from '@/lib/motion'

const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://airona.com'

// Structure: [categoryKey, [q/a index pairs]]
const FAQ_STRUCTURE: { categoryKey: string; nsKey: string; count: number }[] = [
  { categoryKey: 'categories.safety', nsKey: 'safety', count: 3 },
  { categoryKey: 'categories.experience', nsKey: 'experience', count: 5 },
  { categoryKey: 'categories.bookings', nsKey: 'bookings', count: 4 },
  { categoryKey: 'categories.gift', nsKey: 'giftVoucher', count: 2 },
]

export function FaqPage() {
  const { locale } = useOutletContext<LocaleContext>()
  const { t: tSeo } = useTranslation('seo')
  const { t } = useTranslation()
  const { t: tFaq } = useTranslation('faq')
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setOpenItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const faqSchema = {
    '@type': 'FAQPage',
    mainEntity: FAQ_STRUCTURE.flatMap(({ nsKey, count }) =>
      Array.from({ length: count }, (_, i) => ({
        '@type': 'Question',
        name: tFaq(`${nsKey}.q${i}`),
        acceptedAnswer: { '@type': 'Answer', text: tFaq(`${nsKey}.a${i}`) },
      }))
    ),
  }

  return (
    <>
      <MetaTags
        title={tSeo('faq.title')}
        description={tSeo('faq.description')}
        canonical={`${SITE_URL}/${locale}/${buildLocalePath(locale, 'faq').slice(locale.length + 2)}`}
        ogImage={`${SITE_URL}/og/faq.jpg`}
      />
      <HreflangTags pageKey="faq" />
      <SchemaOrg schema={faqSchema} />

      {/* Hero */}
      <section className="pt-24 pb-12 px-4 text-center bg-gradient-to-b from-brand-sky/10 to-brand-cream">
        <motion.div
          className="max-w-3xl mx-auto"
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
        >
          <h1 className="text-5xl font-display font-bold text-brand-dusk mb-4">
            {tFaq('hero.title')}
          </h1>
          <p className="text-brand-dusk/60 text-lg">
            {tFaq('hero.subtitle')}
          </p>
        </motion.div>
      </section>

      {/* FAQ content */}
      <section className="py-16 px-4 max-w-3xl mx-auto">
        {FAQ_STRUCTURE.map(({ categoryKey, nsKey, count }, ci) => (
          <motion.div
            key={ci}
            className="mb-12"
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            <motion.h2
              className="text-2xl font-display font-bold text-brand-dusk mb-6 pb-2 border-b border-brand-mist"
              variants={staggerItemVariants}
            >
              {tFaq(categoryKey)}
            </motion.h2>
            <div className="space-y-3">
              {Array.from({ length: count }, (_, ii) => {
                const id = `${ci}-${ii}`
                const isOpen = openItems.has(id)
                return (
                  <motion.div key={ii} className="bg-white rounded-xl border border-brand-mist overflow-hidden" variants={staggerItemVariants}>
                    <button
                      onClick={() => toggle(id)}
                      className="w-full flex items-center justify-between p-5 text-left font-semibold text-brand-dusk hover:text-brand-gold transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span>{tFaq(`${nsKey}.q${ii}`)}</span>
                      <motion.svg
                        className="w-5 h-5 text-brand-gold flex-shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                      >
                        <polyline points="6 9 12 15 18 9"/>
                      </motion.svg>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          style={{ overflow: 'hidden' }}
                          variants={accordionVariants}
                          initial="collapsed"
                          animate="expanded"
                          exit="collapsed"
                        >
                          <div className="px-5 pb-5 text-brand-dusk/70 text-sm leading-relaxed border-t border-brand-mist pt-4">
                            {tFaq(`${nsKey}.a${ii}`)}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        ))}
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-brand-mist text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-brand-dusk mb-3">
            {tFaq('cta.title')}
          </h2>
          <p className="text-brand-dusk/60 mb-6">
            {tFaq('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="tel:+34652907515"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-brand-gold text-white font-semibold hover:bg-brand-gold/90 transition-all"
            >
              +34 652 907 515
            </a>
            <Link
              to={buildLocalePath(locale, 'contact')}
              className="inline-flex items-center justify-center px-6 py-3 rounded-full border-2 border-brand-gold text-brand-gold font-semibold hover:bg-brand-gold/5 transition-all"
            >
              {t('nav.contact')}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
