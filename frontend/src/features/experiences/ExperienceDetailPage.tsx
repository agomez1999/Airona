import { useOutletContext } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import type { LocaleContext } from '@/components/layout/LocaleLayout'
import { MetaTags } from '@/components/seo/MetaTags'
import { SchemaOrg } from '@/components/seo/SchemaOrg'
import { HreflangTags } from '@/components/seo/HreflangTags'
import { LazyImage } from '@/components/common/LazyImage'
import { buildLocalePath } from '@/config/routes'
import { getProducts } from '@/services/api/endpoints'
import { formatCurrency } from '@/lib/formatCurrency'
import { useCartStore } from '@/stores/cartStore'
import type { ProductType } from '@/services/api/types/experience.types'

const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://airona.com'

const SEO_KEY_MAP: Record<string, 'sharedFlight' | 'privateFlight' | 'gift'> = {
  shared: 'sharedFlight',
  private: 'privateFlight',
  gift: 'gift',
}

const SLUG_KEY_MAP: Record<string, 'sharedFlight' | 'privateFlight' | 'gift'> = {
  shared: 'sharedFlight',
  private: 'privateFlight',
  gift: 'gift',
}

const FEATURES: Record<string, Record<ProductType, string[]>> = {
  es: {
    shared: ['Pequeños grupos (máx. 8 personas)', 'Piloto certificado', 'Brindis con cava al aterrizar', 'Diploma de vuelo'],
    private: ['Solo para vosotros', 'Personalizable', 'Champagne premium', 'Recuerdo fotográfico'],
    gift: ['Válido 1 año', 'Descargable al instante', 'Para cualquier vuelo', 'Transferible'],
    special: ['Experiencia exclusiva', 'Grupos reducidos', 'Cava incluido', 'Diploma'],
  },
  ca: {
    shared: ['Grups petits (màx. 8 persones)', 'Pilot certificat', 'Brindis amb cava en aterrar', 'Diploma de vol'],
    private: ['Sols per a vosaltres', 'Personalitzable', 'Champagne premium', 'Record fotogràfic'],
    gift: ['Vàlid 1 any', 'Descarregable a l\'instant', 'Per a qualsevol vol', 'Transferible'],
    special: ['Experiència exclusiva', 'Grups reduïts', 'Cava inclòs', 'Diploma'],
  },
  fr: {
    shared: ['Petits groupes (max. 8 personnes)', 'Pilote certifié', 'Toast au champagne à l\'atterrissage', 'Diplôme de vol'],
    private: ['Rien que pour vous', 'Personnalisable', 'Champagne premium', 'Souvenir photo'],
    gift: ['Valable 1 an', 'Téléchargeable immédiatement', 'Pour tout vol', 'Transférable'],
    special: ['Expérience exclusive', 'Groupes réduits', 'Champagne inclus', 'Diplôme'],
  },
  en: {
    shared: ['Small groups (max. 8 people)', 'Certified pilot', 'Champagne toast on landing', 'Flight certificate'],
    private: ['Just for you', 'Customisable', 'Premium champagne', 'Photo memento'],
    gift: ['Valid 1 year', 'Instantly downloadable', 'For any flight', 'Transferable'],
    special: ['Exclusive experience', 'Small groups', 'Champagne included', 'Certificate'],
  },
}

interface Props {
  type: 'shared' | 'private' | 'gift'
}

export function ExperienceDetailPage({ type }: Props) {
  const { locale } = useOutletContext<LocaleContext>()
  const { t } = useTranslation()
  const { t: tSeo } = useTranslation('seo')
  const addItem = useCartStore(s => s.addItem)

  const { data: products = [] } = useQuery({
    queryKey: ['products', locale],
    queryFn: () => getProducts(locale).then(r => r.data.data),
    staleTime: 1000 * 60 * 15,
  })

  const product = products.find(p => p.type === type)
  const seoKey = SEO_KEY_MAP[type]
  const slugKey = SLUG_KEY_MAP[type]
  const hero = product?.images.find(i => i.is_hero) ?? product?.images[0]
  const features = FEATURES[locale]?.[type] ?? FEATURES.es[type]

  const price = product?.sale_price_cents ?? product?.price_cents

  const productSchema = product && price ? {
    '@type': 'Product',
    name: product.name,
    description: product.description ?? product.short_description,
    offers: {
      '@type': 'Offer',
      price: (price / 100).toFixed(2),
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/${locale}/${buildLocalePath(locale, slugKey).slice(locale.length + 2)}`,
    },
    image: hero?.url ?? `${SITE_URL}/og/${type}.jpg`,
  } : null

  function handleAddToCart() {
    if (!product || !price) return
    addItem({
      productId: product.id,
      name: product.name ?? '',
      priceCents: price,
      quantity: 1,
      slug: product.slug ?? '',
    })
  }

  return (
    <>
      <MetaTags
        title={tSeo(`${seoKey}.title`)}
        description={tSeo(`${seoKey}.description`)}
        canonical={`${SITE_URL}/${locale}/${buildLocalePath(locale, slugKey).slice(locale.length + 2)}`}
        ogImage={hero?.url ?? `${SITE_URL}/og/${type}.jpg`}
        ogType="product"
      />
      <HreflangTags pageKey={seoKey} />
      {productSchema && <SchemaOrg schema={productSchema} />}

      {/* Hero */}
      <section className="relative pt-16 min-h-[55vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          {hero ? (
            <LazyImage
              src={hero.url}
              alt={hero.alt_text ?? product?.name ?? ''}
              width={1920}
              height={800}
              className="w-full h-full"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-sky to-brand-gold/40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dusk/80 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full pb-12">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-3">
            {product?.name ?? (type === 'shared' ? 'Vuelo Compartido' : type === 'private' ? 'Vuelo Privado' : 'Regalo')}
          </h1>
          {price && (
            <p className="text-brand-gold text-2xl font-bold">
              {formatCurrency(price)}
              <span className="text-white/60 text-base font-normal ml-2">/ persona</span>
            </p>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Description */}
          <div className="lg:col-span-2">
            {product?.description && (
              <div
                className="prose prose-lg max-w-none text-brand-dusk/80"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            )}

            {/* Features list */}
            <div className="mt-10">
              <h2 className="text-2xl font-display font-bold text-brand-dusk mb-6">
                {locale === 'es' ? 'Incluye' : locale === 'ca' ? 'Inclou' : locale === 'fr' ? 'Inclus' : 'Includes'}
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-brand-dusk/80">
                    <svg className="w-5 h-5 text-brand-gold flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Duration/capacity */}
            {product && (product.duration_minutes || product.capacity) && (
              <div className="mt-10 grid grid-cols-2 gap-6">
                {product.duration_minutes && (
                  <div className="bg-brand-mist rounded-xl p-5 text-center">
                    <div className="text-3xl font-bold text-brand-gold">{product.duration_minutes}'</div>
                    <div className="text-sm text-brand-dusk/60 mt-1">
                      {locale === 'es' ? 'duración vuelo' : locale === 'ca' ? 'durada vol' : locale === 'fr' ? 'durée vol' : 'flight duration'}
                    </div>
                  </div>
                )}
                {product.capacity && (
                  <div className="bg-brand-mist rounded-xl p-5 text-center">
                    <div className="text-3xl font-bold text-brand-gold">{product.capacity}</div>
                    <div className="text-sm text-brand-dusk/60 mt-1">
                      {locale === 'es' ? 'plazas máximo' : locale === 'ca' ? 'places màxim' : locale === 'fr' ? 'places maximum' : 'max capacity'}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sticky booking card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl shadow-lg border border-brand-mist p-6">
              <h3 className="font-display text-xl font-bold text-brand-dusk mb-4">
                {locale === 'es' ? 'Reservar' : locale === 'ca' ? 'Reservar' : locale === 'fr' ? 'Réserver' : 'Book now'}
              </h3>
              {price && (
                <div className="mb-6">
                  <div className="text-3xl font-bold text-brand-gold">
                    {formatCurrency(price)}
                  </div>
                  {product?.sale_price_cents && product.price_cents !== product.sale_price_cents && (
                    <div className="text-brand-dusk/40 text-sm line-through">
                      {formatCurrency(product.price_cents)}
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={handleAddToCart}
                disabled={!product}
                className="w-full py-4 rounded-full bg-brand-gold text-white font-semibold text-lg hover:bg-brand-gold/90 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('cart.add')}
              </button>
              <p className="text-xs text-brand-dusk/50 text-center mt-3">
                {locale === 'es' ? 'Pago seguro con Stripe' : locale === 'ca' ? 'Pagament segur amb Stripe' : locale === 'fr' ? 'Paiement sécurisé par Stripe' : 'Secure payment via Stripe'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
