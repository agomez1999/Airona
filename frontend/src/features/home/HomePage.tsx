import { Link } from 'react-router-dom'
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

const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://airona.com'

const TESTIMONIALS = [
  {
    name: 'María G.',
    rating: 5,
    source: 'Google',
    text: {
      es: 'Una experiencia que te cambia la perspectiva, literalmente. El amanecer sobre el Empordà desde el globo es algo que no se puede explicar con palabras. El equipo de Airona cuida cada detalle.',
      ca: 'Una experiència que et canvia la perspectiva, literalment. L\'alba sobre l\'Empordà des del globus és quelcom que no es pot explicar amb paraules. L\'equip d\'Airona cuida cada detall.',
      fr: 'Une expérience qui change vraiment la perspective. Le lever du soleil sur l\'Empordà depuis la montgolfière est quelque chose qu\'on ne peut pas décrire avec des mots. L\'équipe d\'Airona soigne chaque détail.',
      en: 'An experience that genuinely changes your perspective. The sunrise over the Empordà from the balloon is something words can\'t do justice. The Airona team takes care of every detail.',
    },
  },
  {
    name: 'Jean-Pierre M.',
    rating: 5,
    source: 'Tripadvisor',
    text: {
      es: 'Reservé el vuelo privado para el aniversario de mi mujer y fue simplemente mágico. Ver la Costa Brava y el Mediterráneo desde 800 metros de altura, con el Pirineo al fondo... inolvidable.',
      ca: 'Vaig reservar el vol privat per a l\'aniversari de la meva dona i va ser simplement màgic. Veure la Costa Brava i el Mediterrani des de 800 metres d\'alçada, amb el Pirineu al fons... inoblidable.',
      fr: 'J\'ai réservé le vol privé pour l\'anniversaire de ma femme et c\'était tout simplement magique. Voir la Costa Brava et la Méditerranée à 800 mètres d\'altitude, avec les Pyrénées en arrière-plan... inoubliable.',
      en: 'I booked the private flight for my wife\'s anniversary and it was simply magical. Seeing the Costa Brava and the Mediterranean from 800 metres up, with the Pyrenees in the background... unforgettable.',
    },
  },
  {
    name: 'Laura T.',
    rating: 5,
    source: 'Google',
    text: {
      es: 'Regalé este vuelo a mi marido y dijo que fue el mejor regalo de su vida. El brindis con cava al aterrizar, las fotos del vuelo... todo perfecto. Volveremos.',
      ca: 'Li vaig regalar aquest vol al meu marit i va dir que va ser el millor regal de la seva vida. El brindis amb cava en aterrar, les fotos del vol... tot perfecte. Tornarem.',
      fr: 'J\'ai offert ce vol à mon mari et il m\'a dit que c\'était le plus beau cadeau de sa vie. Le toast au cava à l\'atterrissage, les photos du vol... tout était parfait. Nous reviendrons.',
      en: 'I gifted this flight to my husband and he said it was the best present he\'s ever received. The cava toast on landing, the flight photos... everything was perfect. We\'ll be back.',
    },
  },
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
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6 drop-shadow-sm">
            {tHome('hero.headline')}
          </h1>
          <p className="text-xl sm:text-2xl text-white/85 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
            {tHome('hero.subheadline')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
          </div>
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
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: tHome('trust.years', { n: 10 }), icon: '🎈' },
            { value: tHome('trust.flights', { n: 5000 }), icon: '👥' },
            { value: tHome('trust.satisfaction'), icon: '⭐' },
            { value: tHome('trust.safety'), icon: '🛡️' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <span className="text-2xl" aria-hidden="true">{item.icon}</span>
              <p className="text-sm font-semibold text-brand-gold">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Experiences section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-display font-bold text-brand-dusk mb-3">
            {tHome('experiences.title')}
          </h2>
          <p className="text-brand-dusk/60 text-lg">{tHome('experiences.subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.length > 0
            ? products.map(product => (
                <ExperienceCard key={product.id} product={product} locale={locale} />
              ))
            : [
                { type: 'shared', slug: 'sharedFlight' as const },
                { type: 'private', slug: 'privateFlight' as const },
                { type: 'gift', slug: 'gift' as const },
              ].map(({ type }) => (
                <PlaceholderCard key={type} type={type} locale={locale} />
              ))
          }
        </div>
      </section>

      {/* What's included strip */}
      <section className="bg-brand-mist py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-brand-dusk text-center mb-8">
            {locale === 'es' ? 'Incluido en cada vuelo' : locale === 'ca' ? 'Inclòs en cada vol' : locale === 'fr' ? 'Inclus dans chaque vol' : 'Included in every flight'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              {
                icon: '🍾',
                label: { es: 'Brindis con cava', ca: 'Brindis amb cava', fr: 'Toast au cava', en: 'Cava toast' },
              },
              {
                icon: '📸',
                label: { es: 'Fotos y vídeo 360°', ca: 'Fotos i vídeo 360°', fr: 'Photos & vidéo 360°', en: 'Photos & 360° video' },
              },
              {
                icon: '🎓',
                label: { es: 'Piloto certificado AESA', ca: 'Pilot certificat AESA', fr: 'Pilote certifié AESA', en: 'AESA certified pilot' },
              },
              {
                icon: '🌅',
                label: { es: 'Vuelo al amanecer', ca: 'Vol a l\'alba', fr: 'Vol au lever du soleil', en: 'Sunrise flight' },
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-3xl mb-2">{item.icon}</div>
                <p className="text-sm font-medium text-brand-dusk">{item.label[locale]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-display font-bold text-center text-brand-dusk mb-12">
            {tHome('testimonials.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-brand-mist">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-0.5" aria-label={`${testimonial.rating} estrellas`}>
                    {Array.from({ length: testimonial.rating }).map((_, j) => (
                      <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill="#C9A84C" aria-hidden="true">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-brand-dusk/40">{testimonial.source}</span>
                </div>
                <p className="text-brand-dusk/80 text-sm leading-relaxed mb-4 italic">
                  "{testimonial.text[locale]}"
                </p>
                <p className="text-brand-dusk font-semibold text-sm">— {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ snippet */}
      <section className="py-20 px-4 max-w-3xl mx-auto">
        <h2 className="text-4xl font-display font-bold text-center text-brand-dusk mb-10">
          {tHome('faqSnippet.title')}
        </h2>
        <FaqSnippet locale={locale} />
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
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-display font-bold mb-4">{tHome('cta.title')}</h2>
          <p className="text-white/70 text-lg mb-8">{tHome('cta.subtitle')}</p>
          <Link
            to={buildLocalePath(locale, 'experiences')}
            className="inline-flex items-center px-10 py-4 rounded-full bg-brand-gold text-white font-semibold text-lg hover:bg-brand-gold/90 transition-all hover:scale-105"
          >
            {tHome('cta.button')}
          </Link>
        </div>
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
  const labels: Record<string, Record<string, string>> = {
    shared: { es: 'Vuelo Compartido', ca: 'Vol Compartit', fr: 'Vol Partagé', en: 'Shared Flight' },
    private: { es: 'Vuelo Exclusivo', ca: 'Vol Exclusiu', fr: 'Vol Exclusif', en: 'Exclusive Flight' },
    gift: { es: 'Cheque Regalo', ca: 'Xec Regal', fr: 'Bon Cadeau', en: 'Gift Voucher' },
  }
  const descs: Record<string, Record<string, string>> = {
    shared: {
      es: '¡Vive la experiencia al mejor precio! Cesta para hasta 8 personas, salida al amanecer desde Colomers.',
      ca: 'Viu l\'experiència al millor preu! Cistella per a fins a 8 persones, sortida a l\'alba des de Colomers.',
      fr: 'Vivez l\'expérience au meilleur prix ! Nacelle jusqu\'à 8 personnes, départ à l\'aube depuis Colomers.',
      en: 'The experience at the best price! Basket for up to 8 people, sunrise departure from Colomers.',
    },
    private: {
      es: 'Disfruta de un vuelo exclusivo, solo para ti y quien tú quieras. Cesta de hasta 8 personas, totalmente personalizado.',
      ca: 'Gaudeix d\'un vol exclusiu, només per a tu i qui vulguis. Cistella de fins a 8 persones, totalment personalitzat.',
      fr: 'Profitez d\'un vol exclusif, rien que pour vous et vos proches. Nacelle jusqu\'à 8 personnes, entièrement personnalisé.',
      en: 'An exclusive flight, just for you and your chosen guests. Basket for up to 8 people, fully personalised.',
    },
    gift: {
      es: 'La persona que recibe el regalo elige la fecha. Válido 1 año desde la compra. Enviado al instante por email.',
      ca: 'La persona que rep el regal tria la data. Vàlid 1 any des de la compra. Enviat a l\'instant per email.',
      fr: 'Le destinataire choisit la date. Valable 1 an à partir de l\'achat. Envoyé instantanément par email.',
      en: 'The recipient chooses the date. Valid 1 year from purchase. Delivered instantly by email.',
    },
  }
  const slugs: Record<string, 'sharedFlight' | 'privateFlight' | 'gift'> = {
    shared: 'sharedFlight', private: 'privateFlight', gift: 'gift',
  }

  return (
    <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      <div className="aspect-[4/3] bg-gradient-to-br from-brand-sky/30 to-brand-gold/20 flex items-center justify-center">
        <span className="text-6xl">{type === 'gift' ? '🎁' : '🎈'}</span>
      </div>
      <div className="p-6">
        <h3 className="font-display text-xl font-bold text-brand-dusk mb-2">{labels[type][locale]}</h3>
        <p className="text-brand-dusk/60 text-sm leading-relaxed mb-4">{descs[type][locale]}</p>
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

const FAQ_ITEMS: { q: Record<string, string>; a: Record<string, string> }[] = [
  {
    q: {
      es: '¿Es seguro volar en globo aerostático?',
      ca: 'És segur volar en globus aerostàtic?',
      fr: 'Est-il sécurisé de voler en montgolfière ?',
      en: 'Is hot air ballooning safe?',
    },
    a: {
      es: 'Sí. Los vuelos solo se realizan cuando las condiciones meteorológicas son óptimas. Todos nuestros pilotos están certificados por la Agencia Estatal de Seguridad Aérea (AESA) y tienen más de 10 años de experiencia.',
      ca: 'Sí. Els vols només es realitzen quan les condicions meteorològiques són òptimes. Tots els nostres pilots estan certificats per l\'Agència Estatal de Seguretat Aèria (AESA) i tenen més de 10 anys d\'experiència.',
      fr: 'Oui. Les vols n\'ont lieu que lorsque les conditions météorologiques sont optimales. Tous nos pilotes sont certifiés par l\'Agence espagnole de sécurité aérienne (AESA) et ont plus de 10 ans d\'expérience.',
      en: 'Yes. Flights only take place when weather conditions are optimal. All our pilots are certified by the Spanish State Aviation Safety Agency (AESA) and have over 10 years of experience.',
    },
  },
  {
    q: {
      es: '¿Cuánto dura la experiencia?',
      ca: 'Quant dura l\'experiència?',
      fr: 'Combien de temps dure l\'expérience ?',
      en: 'How long does the experience last?',
    },
    a: {
      es: 'La experiencia completa dura entre 3 y 4 horas. Incluye la preparación e inflado del globo, aproximadamente 1 hora de vuelo, el brindis con cava al aterrizar y el traslado de vuelta al punto de partida.',
      ca: 'L\'experiència completa dura entre 3 i 4 hores. Inclou la preparació i inflat del globus, aproximadament 1 hora de vol, el brindis amb cava en aterrar i el trasllat de tornada al punt de sortida.',
      fr: 'L\'expérience complète dure entre 3 et 4 heures. Elle comprend la préparation et le gonflage de la montgolfière, environ 1 heure de vol, le toast au cava à l\'atterrissage et le retour au point de départ.',
      en: 'The complete experience lasts 3 to 4 hours. It includes balloon preparation and inflation, approximately 1 hour of flight, the cava toast on landing, and the return transfer to the meeting point.',
    },
  },
  {
    q: {
      es: '¿Qué pasa si hay mal tiempo?',
      ca: 'Què passa si hi ha mal temps?',
      fr: 'Que se passe-t-il en cas de mauvais temps ?',
      en: 'What happens if the weather is bad?',
    },
    a: {
      es: 'Nuestros pilotos monitorizan el tiempo constantemente. Si las condiciones no son seguras, el vuelo se reprograma sin ningún coste adicional. Tu seguridad es siempre la prioridad.',
      ca: 'Els nostres pilots monitoritzen el temps constantment. Si les condicions no són segures, el vol es reprograma sense cap cost addicional. La teva seguretat és sempre la prioritat.',
      fr: 'Nos pilotes surveillent constamment la météo. Si les conditions ne sont pas sûres, le vol est reprogrammé sans frais supplémentaires. Votre sécurité est toujours la priorité.',
      en: 'Our pilots constantly monitor the weather. If conditions are not safe, the flight is rescheduled at no extra cost. Your safety is always the priority.',
    },
  },
]

function FaqSnippet({ locale }: { locale: LocaleContext['locale'] }) {
  return (
    <div className="space-y-4">
      {FAQ_ITEMS.map((item, i) => (
        <details key={i} className="group bg-white rounded-xl border border-brand-mist overflow-hidden">
          <summary className="flex items-center justify-between p-5 cursor-pointer list-none font-semibold text-brand-dusk">
            {item.q[locale]}
            <svg className="w-5 h-5 text-brand-gold flex-shrink-0 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </summary>
          <p className="px-5 pb-5 text-brand-dusk/70 text-sm leading-relaxed">{item.a[locale]}</p>
        </details>
      ))}
    </div>
  )
}
