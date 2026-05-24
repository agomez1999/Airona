import { useOutletContext } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { LocaleContext } from '@/components/layout/LocaleLayout'
import { MetaTags } from '@/components/seo/MetaTags'
import { HreflangTags } from '@/components/seo/HreflangTags'
import { LazyImage } from '@/components/common/LazyImage'
import { buildLocalePath } from '@/config/routes'

const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://airona.com'

const LANDSCAPES: { icon: string; label: Record<string, string>; desc: Record<string, string> }[] = [
  {
    icon: '🌾',
    label: { es: 'Campos del Empordà', ca: 'Camps de l\'Empordà', fr: 'Champs de l\'Empordà', en: 'Empordà Fields' },
    desc: {
      es: 'Un mosaico infinito de viñedos, olivares y campos de cereales que se extiende hasta donde alcanza la vista. La luz del amanecer transforma este paisaje en algo de otro mundo.',
      ca: 'Un mosaic infinit de vinyes, oliveres i camps de cereals que s\'estén fins on arriba la vista. La llum de l\'alba transforma aquest paisatge en quelcom d\'un altre món.',
      fr: 'Une mosaïque infinie de vignobles, d\'oliveraies et de champs de céréales qui s\'étend à perte de vue. La lumière de l\'aube transforme ce paysage en quelque chose d\'un autre monde.',
      en: 'An endless mosaic of vineyards, olive groves and cereal fields stretching as far as the eye can see. The dawn light transforms this landscape into something otherworldly.',
    },
  },
  {
    icon: '🌊',
    label: { es: 'Costa Brava y Mediterráneo', ca: 'Costa Brava i Mediterrani', fr: 'Costa Brava & Méditerranée', en: 'Costa Brava & Mediterranean' },
    desc: {
      es: 'En los días claros, el Mediterráneo brilla en el horizonte y las calas de aguas turquesas de la Costa Brava se revelan desde el aire como nunca habías imaginado.',
      ca: 'En els dies clars, el Mediterrani brilla a l\'horitzó i les cales d\'aigües turqueses de la Costa Brava es revelen des de l\'aire com mai havies imaginat.',
      fr: 'Par temps clair, la Méditerranée brille à l\'horizon et les criques aux eaux turquoise de la Costa Brava se révèlent depuis les airs comme vous ne l\'aviez jamais imaginé.',
      en: 'On clear days, the Mediterranean shines on the horizon and the turquoise-water coves of the Costa Brava reveal themselves from the air as you\'d never imagined.',
    },
  },
  {
    icon: '⛰️',
    label: { es: 'Los Pirineos al horizonte', ca: 'Els Pirineus a l\'horitzó', fr: 'Les Pyrénées à l\'horizon', en: 'The Pyrenees on the horizon' },
    desc: {
      es: 'En los días más claros, la cadena pirenaica corona el horizonte norte con una silueta imponente. Una perspectiva que raramente se tiene la oportunidad de contemplar.',
      ca: 'En els dies més clars, la cadena pirinenca corona l\'horitzó nord amb una silueta imponent. Una perspectiva que rarament es té l\'oportunitat de contemplar.',
      fr: 'Par les journées les plus claires, la chaîne pyrénéenne couronne l\'horizon nord d\'une silhouette imposante. Une perspective qu\'on a rarement l\'occasion de contempler.',
      en: 'On the clearest days, the Pyrenean chain crowns the northern horizon with an imposing silhouette. A perspective you rarely get the chance to see.',
    },
  },
  {
    icon: '🏰',
    label: { es: 'Pueblos medievales', ca: 'Pobles medievals', fr: 'Villages médiévaux', en: 'Medieval villages' },
    desc: {
      es: 'Peratallada, Pals, Ullastret, Torroella de Montgrí... El Empordà es tierra de joyas medievales. Vistas desde el cielo, estas poblaciones cobran una dimensión completamente diferente.',
      ca: 'Peratallada, Pals, Ullastret, Torroella de Montgrí... L\'Empordà és terra de joies medievals. Vistes des del cel, aquestes poblacions adquireixen una dimensió completament diferent.',
      fr: 'Peratallada, Pals, Ullastret, Torroella de Montgrí... L\'Empordà est une terre de joyaux médiévaux. Vus depuis le ciel, ces villages acquièrent une dimension complètement différente.',
      en: 'Peratallada, Pals, Ullastret, Torroella de Montgrí... The Empordà is a land of medieval gems. Seen from the sky, these villages take on a completely different dimension.',
    },
  },
  {
    icon: '🌿',
    label: { es: 'Parque Natural dels Aiguamolls', ca: 'Parc Natural dels Aiguamolls', fr: 'Parc naturel des Aiguamolls', en: 'Aiguamolls Natural Park' },
    desc: {
      es: 'Uno de los humedales más importantes del Mediterráneo occidental. Vista desde el globo, la biodiversidad de este espacio protegido entre los ríos Fluvià y Muga es impresionante.',
      ca: 'Un dels aiguamolls més importants del Mediterrani occidental. Vista des del globus, la biodiversitat d\'aquest espai protegit entre els rius Fluvià i Muga és impressionant.',
      fr: 'L\'une des zones humides les plus importantes de la Méditerranée occidentale. Vue depuis la montgolfière, la biodiversité de cet espace protégé entre les rivières Fluvià et Muga est impressionnante.',
      en: 'One of the most important wetlands in the western Mediterranean. Seen from the balloon, the biodiversity of this protected area between the Fluvià and Muga rivers is breathtaking.',
    },
  },
  {
    icon: '🍷',
    label: { es: 'Viñedos D.O. Empordà', ca: 'Vinyes D.O. Empordà', fr: 'Vignobles D.O. Empordà', en: 'D.O. Empordà Vineyards' },
    desc: {
      es: 'La comarca del Empordà es tierra de vino con denominación de origen propia. Sobrevolar los viñedos durante el otoño, con el cambio de color de las hojas, es un espectáculo único.',
      ca: 'La comarca de l\'Empordà és terra de vi amb denominació d\'origen pròpia. Sobrevolat els ceps durant la tardor, amb el canvi de color de les fulles, és un espectacle únic.',
      fr: 'La région de l\'Empordà est une terre de vin avec sa propre appellation d\'origine. Survoler les vignobles en automne, avec le changement de couleur des feuilles, est un spectacle unique.',
      en: 'The Empordà region is wine country with its own denomination of origin. Flying over the vineyards in autumn, with the changing leaf colours, is a truly unique spectacle.',
    },
  },
]

export function FlightZonePage() {
  const { locale } = useOutletContext<LocaleContext>()
  const { t: tSeo } = useTranslation('seo')
  const { t } = useTranslation()

  const heroTitles: Record<string, string> = {
    es: 'Zona de vuelo: el Empordà desde el cielo',
    ca: 'Zona de vol: l\'Empordà des del cel',
    fr: 'Zone de vol : l\'Empordà depuis le ciel',
    en: 'Flight zone: the Empordà from the sky',
  }

  return (
    <>
      <MetaTags
        title={tSeo('flightZone.title')}
        description={tSeo('flightZone.description')}
        canonical={`${SITE_URL}/${locale}/${buildLocalePath(locale, 'flightZone').slice(locale.length + 2)}`}
        ogImage={`${SITE_URL}/og/flight-zone.jpg`}
      />
      <HreflangTags pageKey="flightZone" />

      {/* Hero */}
      <section className="relative pt-16 min-h-[60vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <LazyImage
            src="/images/flight-zone-hero.jpg"
            alt="Vista aérea del Empordà y la Costa Brava desde un globo aerostático"
            width={1920}
            height={800}
            className="w-full h-full"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dusk/80 via-brand-dusk/20 to-transparent" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 pb-12 text-white">
          <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4">
            {heroTitles[locale]}
          </h1>
          <p className="text-white/80 text-xl max-w-2xl">
            {locale === 'es' && 'Cada vuelo es un camino diferente, trazado por el viento. Desde Colomers, sobrevolamos un territorio que sorprende en cada viaje.'}
            {locale === 'ca' && 'Cada vol és un camí diferent, traçat pel vent. Des de Colomers, sobrevolem un territori que sorprèn en cada viatge.'}
            {locale === 'fr' && 'Chaque vol est un chemin différent, tracé par le vent. Depuis Colomers, nous survolons un territoire qui surprend à chaque voyage.'}
            {locale === 'en' && 'Every flight is a different path, drawn by the wind. From Colomers, we soar over a region that surprises with every trip.'}
          </p>
        </div>
      </section>

      {/* Map placeholder + info */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Map placeholder */}
          <div className="rounded-2xl overflow-hidden bg-brand-mist aspect-[4/3] flex items-center justify-center">
            <div className="text-center text-brand-dusk/40">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="mx-auto mb-3">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <p className="text-sm font-medium">Colomers, Baix Empordà (Girona)</p>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-display font-bold text-brand-dusk mb-6">
              {locale === 'es' && 'El corazón del Empordà, nuestro territorio de vuelo'}
              {locale === 'ca' && 'El cor de l\'Empordà, el nostre territori de vol'}
              {locale === 'fr' && 'Le cœur de l\'Empordà, notre territoire de vol'}
              {locale === 'en' && 'The heart of the Empordà, our flight territory'}
            </h2>
            <p className="text-brand-dusk/70 leading-relaxed mb-8">
              {locale === 'es' && 'Volamos sobre el corazón del Empordà, una comarca de singular belleza enclavada entre los Pirineos, la Costa Brava y las fértiles llanuras del Alt y Baix Empordà. Nuestros globos despegan desde Colomers y el viento decide la ruta — cada vuelo es una aventura única que nunca se repite exactamente igual.'}
              {locale === 'ca' && 'Volem sobre el cor de l\'Empordà, una comarca de singular bellesa enclavada entre els Pirineus, la Costa Brava i les fèrtils planures de l\'Alt i Baix Empordà. Els nostres globus enlairem des de Colomers i el vent decideix la ruta — cada vol és una aventura única que mai es repeteix exactament igual.'}
              {locale === 'fr' && 'Nous volons au cœur de l\'Empordà, une région d\'une beauté singulière enclavée entre les Pyrénées, la Costa Brava et les fertiles plaines de l\'Alt et Baix Empordà. Nos montgolfières décollent depuis Colomers et le vent décide de la route — chaque vol est une aventure unique qui ne se répète jamais exactement à l\'identique.'}
              {locale === 'en' && 'We fly over the heart of the Empordà, a region of singular beauty nestled between the Pyrenees, the Costa Brava and the fertile plains of the Alt and Baix Empordà. Our balloons take off from Colomers and the wind decides the route — every flight is a unique adventure that never repeats itself in quite the same way.'}
            </p>

            <div className="space-y-4">
              {[
                {
                  label: { es: 'Punto de encuentro', ca: 'Punt de trobada', fr: 'Point de rendez-vous', en: 'Meeting point' },
                  value: 'Colomers, Baix Empordà',
                },
                {
                  label: { es: 'Punto de despegue', ca: 'Punt d\'enlairament', fr: 'Point de décollage', en: 'Launch point' },
                  value: { es: 'Variable según el viento (zona del Empordà)', ca: 'Variable segons el vent (zona de l\'Empordà)', fr: 'Variable selon le vent (zone Empordà)', en: 'Variable depending on wind (Empordà area)' }[locale],
                },
                {
                  label: { es: 'Radio de vuelo', ca: 'Radi de vol', fr: 'Rayon de vol', en: 'Flight radius' },
                  value: '20–40 km',
                },
                {
                  label: { es: 'Vistas habituales', ca: 'Vistes habituals', fr: 'Vues habituelles', en: 'Regular sights' },
                  value: {
                    es: 'Mediterráneo, Pirineos, Costa Brava, viñedos',
                    ca: 'Mediterrani, Pirineus, Costa Brava, vinyes',
                    fr: 'Méditerranée, Pyrénées, Costa Brava, vignobles',
                    en: 'Mediterranean, Pyrenees, Costa Brava, vineyards',
                  }[locale],
                },
              ].map(({ label, value }, i) => (
                <div key={i} className="flex justify-between py-3 border-b border-brand-mist">
                  <span className="text-brand-dusk/60 text-sm">{label[locale]}</span>
                  <span className="text-brand-dusk font-medium text-sm text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Landscapes grid */}
      <section className="bg-brand-mist py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-display font-bold text-brand-dusk text-center mb-4">
            {locale === 'es' ? 'Lo que verás desde el globo' : locale === 'ca' ? 'El que veuràs des del globus' : locale === 'fr' ? 'Ce que vous verrez depuis la montgolfière' : 'What you\'ll see from the balloon'}
          </h2>
          <p className="text-brand-dusk/60 text-center mb-12 max-w-2xl mx-auto">
            {locale === 'es' && 'El Empordà es uno de los territorios más ricos y variados de Cataluña. Cada vuelo revela una combinación diferente de estos paisajes.'}
            {locale === 'ca' && 'L\'Empordà és un dels territoris més rics i variats de Catalunya. Cada vol revela una combinació diferent d\'aquests paisatges.'}
            {locale === 'fr' && 'L\'Empordà est l\'un des territoires les plus riches et variés de Catalogne. Chaque vol révèle une combinaison différente de ces paysages.'}
            {locale === 'en' && 'The Empordà is one of the richest and most varied regions in Catalonia. Every flight reveals a different combination of these landscapes.'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {LANDSCAPES.map((l, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="text-3xl mb-3">{l.icon}</div>
                <h3 className="font-display text-lg font-bold text-brand-dusk mb-2">{l.label[locale]}</h3>
                <p className="text-brand-dusk/60 text-sm leading-relaxed">{l.desc[locale]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-brand-dusk text-white text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-display font-bold mb-4">
            {locale === 'es' ? '¿Listo para descubrir el Empordà desde el cielo?' : locale === 'ca' ? 'Llest per descobrir l\'Empordà des del cel?' : locale === 'fr' ? 'Prêt à découvrir l\'Empordà depuis le ciel ?' : 'Ready to discover the Empordà from the sky?'}
          </h2>
          <p className="text-white/70 mb-8">
            {locale === 'es' && 'Salida desde Colomers. Verano: 6:30 h — Invierno: 8:00 h.'}
            {locale === 'ca' && 'Sortida des de Colomers. Estiu: 6:30 h — Hivern: 8:00 h.'}
            {locale === 'fr' && 'Départ depuis Colomers. Été : 6h30 — Hiver : 8h00.'}
            {locale === 'en' && 'Departure from Colomers. Summer: 6:30 — Winter: 8:00.'}
          </p>
          <Link
            to={buildLocalePath(locale, 'experiences')}
            className="inline-flex items-center px-8 py-3.5 rounded-full bg-brand-gold text-white font-semibold hover:bg-brand-gold/90 transition-all"
          >
            {t('actions.buy')}
          </Link>
        </div>
      </section>
    </>
  )
}
