import { useOutletContext } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { LocaleContext } from '@/components/layout/LocaleLayout'
import { MetaTags } from '@/components/seo/MetaTags'
import { HreflangTags } from '@/components/seo/HreflangTags'
import { LazyImage } from '@/components/common/LazyImage'
import { buildLocalePath } from '@/config/routes'

const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://airona.com'

const VALUES: { icon: string; label: Record<string, string>; desc: Record<string, string> }[] = [
  {
    icon: '🛡️',
    label: { es: 'Seguridad', ca: 'Seguretat', fr: 'Sécurité', en: 'Safety' },
    desc: {
      es: 'Todos nuestros pilotos están certificados por la AESA y se forman continuamente. Los vuelos solo se realizan en condiciones meteorológicas óptimas — nunca asumimos riesgos.',
      ca: 'Tots els nostres pilots estan certificats per l\'AESA i es formen contínuament. Els vols només es realitzen en condicions meteorològiques òptimes — mai assumim riscos.',
      fr: 'Tous nos pilotes sont certifiés par l\'AESA et se forment continuellement. Les vols n\'ont lieu que dans des conditions météorologiques optimales — nous ne prenons jamais de risques.',
      en: 'All our pilots are AESA certified and continuously trained. Flights only take place in optimal weather conditions — we never take risks.',
    },
  },
  {
    icon: '✨',
    label: { es: 'Experiencia premium', ca: 'Experiència premium', fr: 'Expérience premium', en: 'Premium experience' },
    desc: {
      es: 'Desde el primer contacto hasta el brindis de llegada, cada detalle está pensado para que te sientas especial. El brindis con cava, las fotos y el vídeo 360° forman parte de cada vuelo.',
      ca: 'Des del primer contacte fins al brindis d\'arribada, cada detall està pensat perquè et sentis especial. El brindis amb cava, les fotos i el vídeo 360° formen part de cada vol.',
      fr: 'Du premier contact jusqu\'au toast à l\'arrivée, chaque détail est pensé pour vous faire sentir spécial. Le toast au cava, les photos et la vidéo 360° font partie de chaque vol.',
      en: 'From first contact to the landing toast, every detail is designed to make you feel special. The cava toast, photos and 360° video are part of every single flight.',
    },
  },
  {
    icon: '🌿',
    label: { es: 'Amor por el territorio', ca: 'Amor pel territori', fr: 'Amour du territoire', en: 'Love for the land' },
    desc: {
      es: 'Somos del Empordà y conocemos cada rincón de esta comarca. Compartimos con nuestros pasajeros la pasión por estos paisajes únicos entre el Mediterráneo y los Pirineos.',
      ca: 'Som de l\'Empordà i coneixem cada racó d\'aquesta comarca. Compartim amb els nostres passatgers la passió per aquests paisatges únics entre el Mediterrani i els Pirineus.',
      fr: 'Nous sommes de l\'Empordà et connaissons chaque recoin de cette région. Nous partageons avec nos passagers la passion pour ces paysages uniques entre la Méditerranée et les Pyrénées.',
      en: 'We are from the Empordà and know every corner of this region. We share with our passengers a passion for these unique landscapes between the Mediterranean and the Pyrenees.',
    },
  },
]

export function AboutPage() {
  const { locale } = useOutletContext<LocaleContext>()
  const { t: tSeo } = useTranslation('seo')
  const { t } = useTranslation()

  const heroTitles: Record<string, string> = {
    es: 'Somos Airona Globus',
    ca: 'Som Airona Globus',
    fr: 'Nous sommes Airona Globus',
    en: 'We are Airona Globus',
  }

  const heroSubtitles: Record<string, string> = {
    es: 'Especialistas en vuelos en globo aerostático sobre el Empordà y la Costa Brava. Más de 10 años compartiendo este rincón único de Cataluña desde el cielo.',
    ca: 'Especialistes en vols en globus aerostàtic sobre l\'Empordà i la Costa Brava. Més de 10 anys compartint aquest racó únic de Catalunya des del cel.',
    fr: 'Spécialistes des vols en montgolfière sur l\'Empordà et la Costa Brava. Plus de 10 ans à partager ce coin unique de Catalogne depuis le ciel.',
    en: 'Specialists in hot air balloon flights over the Empordà and Costa Brava. Over 10 years sharing this unique corner of Catalonia from the sky.',
  }

  return (
    <>
      <MetaTags
        title={tSeo('about.title')}
        description={tSeo('about.description')}
        canonical={`${SITE_URL}/${locale}/${buildLocalePath(locale, 'about').slice(locale.length + 2)}`}
        ogImage={`${SITE_URL}/og/about.jpg`}
      />
      <HreflangTags pageKey="about" />

      {/* Hero */}
      <section className="pt-24 pb-16 px-4 bg-gradient-to-b from-brand-sky/10 to-brand-cream">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-display font-bold text-brand-dusk mb-6">
            {heroTitles[locale]}
          </h1>
          <p className="text-brand-dusk/60 text-xl max-w-2xl mx-auto leading-relaxed">
            {heroSubtitles[locale]}
          </p>
        </div>
      </section>

      {/* Story section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="rounded-2xl overflow-hidden aspect-[4/3]">
            <LazyImage
              src="/images/about-team.jpg"
              alt="Equipo Airona Globus — pilotos certificados en el Empordà"
              width={800}
              height={600}
              className="w-full h-full"
            />
          </div>
          <div>
            <h2 className="text-3xl font-display font-bold text-brand-dusk mb-6">
              {locale === 'es' && 'Una empresa nacida del Empordà'}
              {locale === 'ca' && 'Una empresa nascuda de l\'Empordà'}
              {locale === 'fr' && 'Une entreprise née de l\'Empordà'}
              {locale === 'en' && 'A company born from the Empordà'}
            </h2>
            <div className="space-y-4 text-brand-dusk/70 leading-relaxed">
              <p>
                {locale === 'es' && 'Airona Globus nació de la pasión por compartir la belleza única del Empordà y la Costa Brava desde las alturas. Fundada en Girona, nuestra misión siempre ha sido la misma: que cada pasajero aterrice con una sonrisa y un recuerdo que no se borra.'}
                {locale === 'ca' && 'Airona Globus va néixer de la passió per compartir la bellesa única de l\'Empordà i la Costa Brava des de les altures. Fundada a Girona, la nostra missió sempre ha estat la mateixa: que cada passatger aterri amb un somriure i un record que no s\'esborra.'}
                {locale === 'fr' && 'Airona Globus est né de la passion de partager la beauté unique de l\'Empordà et de la Costa Brava depuis les hauteurs. Fondée à Gérone, notre mission a toujours été la même : que chaque passager atterrisse avec le sourire et un souvenir impérissable.'}
                {locale === 'en' && 'Airona Globus was born from a passion for sharing the unique beauty of the Empordà and Costa Brava from above. Founded in Girona, our mission has always been the same: to have every passenger land with a smile and a memory that never fades.'}
              </p>
              <p>
                {locale === 'es' && 'Volamos desde Colomers, en el Baix Empordà, sobrevolando campos medievales, viñedos y el litoral de la Costa Brava. Cada vuelo es diferente porque el viento nos lleva por rutas distintas — y eso es parte de la magia.'}
                {locale === 'ca' && 'Volem des de Colomers, al Baix Empordà, sobrevolant camps medievals, vinyes i el litoral de la Costa Brava. Cada vol és diferent perquè el vent ens porta per rutes diferents — i això és part de la màgia.'}
                {locale === 'fr' && 'Nous décollons de Colomers, dans le Baix Empordà, en survolant des champs médiévaux, des vignobles et le littoral de la Costa Brava. Chaque vol est différent car le vent nous emmène par des routes différentes — et c\'est là toute la magie.'}
                {locale === 'en' && 'We fly from Colomers, in the Baix Empordà, soaring over medieval fields, vineyards and the Costa Brava coastline. Every flight is different because the wind takes us on different routes — and that\'s part of the magic.'}
              </p>
              <p>
                {locale === 'es' && 'Nuestro equipo de pilotos certificados AESA cuida cada detalle: desde el inflado del globo — que ya es un espectáculo — hasta el brindis con cava al aterrizar. Cada experiencia incluye fotos y vídeo 360° para que puedas revivir el vuelo una y otra vez.'}
                {locale === 'ca' && 'El nostre equip de pilots certificats AESA cuida cada detall: des de l\'inflat del globus — que ja és un espectacle — fins al brindis amb cava en aterrar. Cada experiència inclou fotos i vídeo 360° perquè puguis reviure el vol una vegada i una altra.'}
                {locale === 'fr' && 'Notre équipe de pilotes certifiés AESA soigne chaque détail : du gonflage de la montgolfière — qui est déjà un spectacle — jusqu\'au toast au cava à l\'atterrissage. Chaque expérience comprend des photos et une vidéo 360° pour que vous puissiez revivre le vol encore et encore.'}
                {locale === 'en' && 'Our team of AESA-certified pilots takes care of every detail: from the balloon inflation — which is already a spectacle — to the cava toast on landing. Every experience includes photos and 360° video so you can relive the flight again and again.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-brand-mist py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-display font-bold text-brand-dusk text-center mb-12">
            {locale === 'es' ? 'Lo que nos define' : locale === 'ca' ? 'El que ens defineix' : locale === 'fr' ? 'Ce qui nous définit' : 'What defines us'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {VALUES.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <div className="text-5xl mb-4">{v.icon}</div>
                <h3 className="font-display text-xl font-bold text-brand-dusk mb-3">{v.label[locale]}</h3>
                <p className="text-brand-dusk/60 text-sm leading-relaxed">{v.desc[locale]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Practical info */}
      <section className="py-20 px-4 max-w-5xl mx-auto">
        <h2 className="text-3xl font-display font-bold text-brand-dusk text-center mb-12">
          {locale === 'es' ? 'Información práctica' : locale === 'ca' ? 'Informació pràctica' : locale === 'fr' ? 'Informations pratiques' : 'Practical information'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              label: { es: 'Punto de encuentro', ca: 'Punt de trobada', fr: 'Point de rendez-vous', en: 'Meeting point' },
              value: { es: 'Colomers, Baix Empordà', ca: 'Colomers, Baix Empordà', fr: 'Colomers, Baix Empordà', en: 'Colomers, Baix Empordà' },
              icon: '📍',
            },
            {
              label: { es: 'Horario verano', ca: 'Horari estiu', fr: 'Horaire été', en: 'Summer schedule' },
              value: { es: 'Salida a las 6:30 h', ca: 'Sortida a les 6:30 h', fr: 'Départ à 6h30', en: 'Departure at 6:30' },
              icon: '🌅',
            },
            {
              label: { es: 'Horario invierno', ca: 'Horari hivern', fr: 'Horaire hiver', en: 'Winter schedule' },
              value: { es: 'Salida a las 8:00 h', ca: 'Sortida a les 8:00 h', fr: 'Départ à 8h00', en: 'Departure at 8:00' },
              icon: '🌄',
            },
            {
              label: { es: 'Duración total', ca: 'Durada total', fr: 'Durée totale', en: 'Total duration' },
              value: { es: '3–4 horas (1h de vuelo)', ca: '3–4 hores (1h de vol)', fr: '3–4 heures (1h de vol)', en: '3–4 hours (1h flight)' },
              icon: '⏱️',
            },
            {
              label: { es: 'Capacidad', ca: 'Capacitat', fr: 'Capacité', en: 'Capacity' },
              value: { es: '2–8 pasajeros por vuelo', ca: '2–8 passatgers per vol', fr: '2–8 passagers par vol', en: '2–8 passengers per flight' },
              icon: '👥',
            },
            {
              label: { es: 'Temporada', ca: 'Temporada', fr: 'Saison', en: 'Season' },
              value: { es: 'Todo el año (según meteorología)', ca: 'Tot l\'any (segons meteorologia)', fr: 'Toute l\'année (selon météo)', en: 'Year-round (weather permitting)' },
              icon: '📅',
            },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl border border-brand-mist p-5 flex items-start gap-4">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <div className="text-xs text-brand-dusk/50 font-medium mb-1">{item.label[locale]}</div>
                <div className="text-brand-dusk font-semibold text-sm">{item.value[locale]}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4 bg-brand-dusk text-white">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {[
            { n: '10+', label: { es: 'años volando', ca: 'anys volant', fr: 'ans de vols', en: 'years flying' } },
            { n: '5.000+', label: { es: 'pasajeros', ca: 'passatgers', fr: 'passagers', en: 'passengers' } },
            { n: '4', label: { es: 'idiomas', ca: 'idiomes', fr: 'langues', en: 'languages' } },
            { n: '5★', label: { es: 'valoración media', ca: 'valoració mitjana', fr: 'note moyenne', en: 'average rating' } },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-4xl font-display font-bold text-brand-gold mb-2">{s.n}</div>
              <div className="text-white/60 text-sm">{s.label[locale]}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-brand-dusk mb-4">
            {locale === 'es' ? '¿Listo para volar con nosotros?' : locale === 'ca' ? 'Llest per volar amb nosaltres?' : locale === 'fr' ? 'Prêt à voler avec nous ?' : 'Ready to fly with us?'}
          </h2>
          <p className="text-brand-dusk/60 mb-8">
            {locale === 'es' && 'Llámanos al +34 652 907 515 o reserva directamente online.'}
            {locale === 'ca' && 'Truca\'ns al +34 652 907 515 o reserva directament online.'}
            {locale === 'fr' && 'Appelez-nous au +34 652 907 515 ou réservez directement en ligne.'}
            {locale === 'en' && 'Call us on +34 652 907 515 or book directly online.'}
          </p>
          <Link
            to={buildLocalePath(locale, 'experiences')}
            className="inline-flex items-center px-8 py-3.5 rounded-full bg-brand-gold text-white font-semibold hover:bg-brand-gold/90 transition-all"
          >
            {t('actions.learnMore')}
          </Link>
        </div>
      </section>
    </>
  )
}
