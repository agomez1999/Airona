import { useState } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import type { LocaleContext } from '@/components/layout/LocaleLayout'
import { MetaTags } from '@/components/seo/MetaTags'
import { SchemaOrg } from '@/components/seo/SchemaOrg'
import { HreflangTags } from '@/components/seo/HreflangTags'
import { buildLocalePath } from '@/config/routes'
import { accordionContent } from '@/lib/motion'

const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://airona.com'

const FAQ_DATA: {
  category: Record<string, string>
  items: { q: Record<string, string>; a: Record<string, string> }[]
}[] = [
  {
    category: { es: 'Seguridad', ca: 'Seguretat', fr: 'Sécurité', en: 'Safety' },
    items: [
      {
        q: { es: '¿Es seguro volar en globo aerostático?', ca: 'És segur volar en globus aerostàtic?', fr: 'Est-il sécurisé de voler en montgolfière ?', en: 'Is hot air ballooning safe?' },
        a: { es: 'Absolutamente. Los vuelos solo se realizan cuando las condiciones meteorológicas son óptimas — nuestros pilotos monitorizan el tiempo durante las 24 horas previas al vuelo. Todos están certificados por la Agencia Estatal de Seguridad Aérea (AESA) y cuentan con más de 10 años de experiencia. Además, los globos pasan revisiones técnicas periódicas.', ca: 'Absolutament. Els vols només es realitzen quan les condicions meteorològiques són òptimes — els nostres pilots monitoren el temps durant les 24 hores prèvies al vol. Tots estan certificats per l\'Agència Estatal de Seguretat Aèria (AESA) i compten amb més de 10 anys d\'experiència. A més, els globus passen revisions tècniques periòdiques.', fr: 'Absolument. Les vols n\'ont lieu que lorsque les conditions météorologiques sont optimales — nos pilotes surveillent la météo 24 heures avant le vol. Tous sont certifiés par l\'Agence espagnole de sécurité aérienne (AESA) et ont plus de 10 ans d\'expérience. De plus, les montgolfières font l\'objet de contrôles techniques réguliers.', en: 'Absolutely. Flights only take place when weather conditions are optimal — our pilots monitor conditions for the 24 hours prior to each flight. All pilots are certified by the Spanish State Aviation Safety Agency (AESA) and have over 10 years of experience. Balloons also undergo regular technical inspections.' },
      },
      {
        q: { es: '¿Qué certificaciones tienen vuestros pilotos?', ca: 'Quines certificacions tenen els vostres pilots?', fr: 'Quelles certifications ont vos pilotes ?', en: 'What certifications do your pilots hold?' },
        a: { es: 'Todos nuestros pilotos poseen la licencia de piloto de globo aerostático emitida por la Agencia Estatal de Seguridad Aérea (AESA). Esta licencia requiere una formación rigurosa, un número mínimo de horas de vuelo y una revisión médica anual. Nuestros pilotos también tienen experiencia de más de 10 años volando en el Empordà.', ca: 'Tots els nostres pilots posseeixen la llicència de pilot de globus aerostàtic emesa per l\'Agència Estatal de Seguretat Aèria (AESA). Aquesta llicència requereix una formació rigorosa, un nombre mínim d\'hores de vol i una revisió mèdica anual. Els nostres pilots també tenen més de 10 anys d\'experiència volant a l\'Empordà.', fr: 'Tous nos pilotes possèdent la licence de pilote de montgolfière délivrée par l\'Agence espagnole de sécurité aérienne (AESA). Cette licence requiert une formation rigoureuse, un nombre minimum d\'heures de vol et une révision médicale annuelle. Nos pilotes ont également plus de 10 ans d\'expérience de vol en Empordà.', en: 'All our pilots hold the hot air balloon pilot licence issued by the Spanish State Aviation Safety Agency (AESA). This licence requires rigorous training, a minimum number of flight hours and an annual medical review. Our pilots also have over 10 years of experience flying over the Empordà.' },
      },
      {
        q: { es: '¿Hay restricciones para volar?', ca: 'Hi ha restriccions per volar?', fr: 'Y a-t-il des restrictions pour voler ?', en: 'Are there any restrictions for flying?' },
        a: { es: 'Sí. El vuelo en globo no está recomendado para mujeres embarazadas ni para niños menores de 6 años. Está prohibido fumar a bordo. El peso máximo por pasajero es de 95 kg — si tu peso es superior, consúltanos antes de reservar. La actividad también está condicionada a las condiciones meteorológicas.', ca: 'Sí. El vol en globus no es recomana per a dones embarassades ni per a nens menors de 6 anys. Està prohibit fumar a bord. El pes màxim per passatger és de 95 kg — si el teu pes és superior, consulta\'ns abans de reservar. L\'activitat també està condicionada a les condicions meteorològiques.', fr: 'Oui. Le vol en montgolfière n\'est pas recommandé aux femmes enceintes ni aux enfants de moins de 6 ans. Il est interdit de fumer à bord. Le poids maximum par passager est de 95 kg — si votre poids est supérieur, contactez-nous avant de réserver. L\'activité est également soumise aux conditions météorologiques.', en: 'Yes. Hot air ballooning is not recommended for pregnant women or children under 6. Smoking on board is not permitted. The maximum weight per passenger is 95 kg — if your weight is higher, please contact us before booking. The activity is also subject to weather conditions.' },
      },
    ],
  },
  {
    category: { es: 'La experiencia', ca: 'L\'experiència', fr: 'L\'expérience', en: 'The experience' },
    items: [
      {
        q: { es: '¿Cuánto dura el vuelo?', ca: 'Quant de temps dura el vol?', fr: 'Combien de temps dure le vol ?', en: 'How long does the flight last?' },
        a: { es: 'La experiencia completa dura entre 3 y 4 horas. El vuelo propiamente dicho dura aproximadamente 1 hora. A esto hay que añadir el tiempo de preparación e inflado del globo (unos 30 minutos), el brindis con cava al aterrizar y el traslado de vuelta al punto de encuentro.', ca: 'L\'experiència completa dura entre 3 i 4 hores. El vol pròpiament dit dura aproximadament 1 hora. A això cal afegir el temps de preparació i inflat del globus (uns 30 minuts), el brindis amb cava en aterrar i el trasllat de tornada al punt de trobada.', fr: 'L\'expérience complète dure entre 3 et 4 heures. Le vol en lui-même dure environ 1 heure. Il faut ajouter le temps de préparation et de gonflage de la montgolfière (environ 30 minutes), le toast au cava à l\'atterrissage et le retour au point de rendez-vous.', en: 'The complete experience lasts 3 to 4 hours. The flight itself lasts approximately 1 hour. Add to that balloon preparation and inflation (around 30 minutes), the cava toast on landing, and the return transfer to the meeting point.' },
      },
      {
        q: { es: '¿A qué hora salen los vuelos?', ca: 'A quina hora surten els vols?', fr: 'À quelle heure partent les vols ?', en: 'What time do flights depart?' },
        a: { es: 'Volamos al amanecer para aprovechar las mejores condiciones de viento y la luz dorada de la mañana. En verano, los vuelos salen a las 6:30 h. En invierno, la salida es a las 8:00 h. El punto de encuentro es en Colomers (Empordà).', ca: 'Volem a l\'alba per aprofitar les millors condicions de vent i la llum daurada del matí. A l\'estiu, els vols surten a les 6:30 h. A l\'hivern, la sortida és a les 8:00 h. El punt de trobada és a Colomers (Empordà).', fr: 'Nous volons à l\'aube pour profiter des meilleures conditions de vent et de la lumière dorée du matin. En été, les vols partent à 6h30. En hiver, le départ est à 8h00. Le point de rendez-vous est à Colomers (Empordà).', en: 'We fly at sunrise to take advantage of the best wind conditions and the golden morning light. In summer, flights depart at 6:30. In winter, departure is at 8:00. The meeting point is in Colomers (Empordà).' },
      },
      {
        q: { es: '¿A qué altura volamos?', ca: 'A quina alçada volem?', fr: 'À quelle altitude volons-nous ?', en: 'How high do we fly?' },
        a: { es: 'Volamos entre 300 y 1.000 metros de altitud, dependiendo de las condiciones del viento y del paisaje. Siempre buscamos la mejor perspectiva de la comarca: en días claros se pueden ver los Pirineos al norte y el Mediterráneo al este.', ca: 'Volem entre 300 i 1.000 metres d\'altitud, depenent de les condicions del vent i del paisatge. Sempre busquem la millor perspectiva de la comarca: en dies clars es poden veure els Pirineus al nord i el Mediterrani a l\'est.', fr: 'Nous volons entre 300 et 1 000 mètres d\'altitude, selon les conditions de vent et le paysage. Nous cherchons toujours la meilleure perspective de la région : par temps clair, on peut voir les Pyrénées au nord et la Méditerranée à l\'est.', en: 'We fly between 300 and 1,000 metres altitude, depending on wind conditions and the landscape. We always seek the best perspective of the region — on clear days you can see the Pyrenees to the north and the Mediterranean to the east.' },
      },
      {
        q: { es: '¿Qué está incluido en el precio?', ca: 'Què inclou el preu?', fr: 'Qu\'est-ce qui est inclus dans le prix ?', en: 'What\'s included in the price?' },
        a: { es: 'El precio incluye el vuelo en globo de aproximadamente 1 hora, el brindis con cava al aterrizar, fotos y vídeo 360° del vuelo, el piloto certificado AESA y el seguro de vuelo. El traslado de vuelta al punto de encuentro también está incluido.', ca: 'El preu inclou el vol en globus d\'aproximadament 1 hora, el brindis amb cava en aterrar, fotos i vídeo 360° del vol, el pilot certificat AESA i l\'assegurança de vol. El trasllat de tornada al punt de trobada també hi és inclòs.', fr: 'Le prix comprend le vol en montgolfière d\'environ 1 heure, le toast au cava à l\'atterrissage, les photos et la vidéo 360° du vol, le pilote certifié AESA et l\'assurance vol. Le retour au point de rendez-vous est également inclus.', en: 'The price includes approximately 1 hour of balloon flight, the cava toast on landing, photos and 360° video of the flight, the AESA certified pilot and flight insurance. The return transfer to the meeting point is also included.' },
      },
      {
        q: { es: '¿Qué debo llevar?', ca: 'Què he de portar?', fr: 'Que dois-je apporter ?', en: 'What should I bring?' },
        a: { es: 'Ropa cómoda adecuada para caminar y calzado deportivo o cerrado. La temperatura durante el vuelo es similar a la del suelo, así que viste según la época del año. En meses fríos, varias capas. Te recomendamos también una gorra para el sol y, por supuesto, la cámara de fotos.', ca: 'Roba còmoda adequada per caminar i calçat esportiu o tancat. La temperatura durant el vol és similar a la del terra, així que vesteix-te segons l\'època de l\'any. Als mesos freds, diverses capes. Et recomanem també una gorra per al sol i, per descomptat, la càmera de fotos.', fr: 'Des vêtements confortables adaptés à la marche et des chaussures de sport ou fermées. La température pendant le vol est similaire à celle au sol, donc habillez-vous selon la saison. Par temps froid, plusieurs couches. Nous recommandons également une casquette pour le soleil et, bien sûr, un appareil photo.', en: 'Comfortable clothing suitable for walking and sports or closed-toe shoes. The temperature during the flight is similar to that on the ground, so dress for the season. In cold months, layer up. We also recommend a sun cap and, of course, your camera.' },
      },
    ],
  },
  {
    category: { es: 'Reservas y cancelaciones', ca: 'Reserves i cancel·lacions', fr: 'Réservations et annulations', en: 'Bookings & cancellations' },
    items: [
      {
        q: { es: '¿Qué pasa si hay mal tiempo el día de mi vuelo?', ca: 'Què passa si hi ha mal temps el dia del meu vol?', fr: 'Que se passe-t-il en cas de mauvais temps le jour de mon vol ?', en: 'What happens if there\'s bad weather on my flight day?' },
        a: { es: 'Tu seguridad es la prioridad. Si las condiciones meteorológicas no son adecuadas, el vuelo se reprograma sin ningún coste adicional para ti. Nuestros pilotos toman esta decisión con antelación y te avisamos lo antes posible.', ca: 'La teva seguretat és la prioritat. Si les condicions meteorològiques no són adequades, el vol es reprograma sense cap cost addicional per a tu. Els nostres pilots prenen aquesta decisió amb antelació i t\'avisem el més aviat possible.', fr: 'Votre sécurité est la priorité. Si les conditions météorologiques ne sont pas adéquates, le vol est reprogrammé sans frais supplémentaires. Nos pilotes prennent cette décision à l\'avance et vous prévenons dès que possible.', en: 'Your safety is the priority. If weather conditions are not suitable, the flight is rescheduled at no extra cost to you. Our pilots make this decision in advance and we notify you as early as possible.' },
      },
      {
        q: { es: '¿Con cuánta antelación debo reservar?', ca: 'Amb quanta antelació he de reservar?', fr: 'Combien de temps à l\'avance dois-je réserver ?', en: 'How far in advance should I book?' },
        a: { es: 'Recomendamos reservar con al menos 2 o 3 semanas de antelación, especialmente en primavera y verano que son los meses de mayor demanda. En Navidad y San Valentín las plazas se agotan rápido. Dicho esto, siempre puedes consultar disponibilidad de última hora.', ca: 'Recomanem reservar amb almenys 2 o 3 setmanes d\'antelació, especialment a la primavera i l\'estiu que són els mesos de major demanda. Per Nadal i Sant Valentí les places s\'exhaureixen ràpid. Dit això, sempre pots consultar disponibilitat d\'última hora.', fr: 'Nous recommandons de réserver au moins 2 à 3 semaines à l\'avance, surtout au printemps et en été qui sont les mois les plus chargés. À Noël et à la Saint-Valentin, les places partent vite. Cela dit, vous pouvez toujours vérifier les disponibilités de dernière minute.', en: 'We recommend booking at least 2 to 3 weeks in advance, especially in spring and summer which are the busiest months. At Christmas and Valentine\'s Day spots fill up fast. That said, you can always check last-minute availability.' },
      },
      {
        q: { es: '¿Los cheques regalo tienen fecha de caducidad?', ca: 'Els xecs regal tenen data de caducitat?', fr: 'Les bons cadeaux ont-ils une date d\'expiration ?', en: 'Do gift vouchers expire?' },
        a: { es: 'Sí, los cheques regalo son válidos durante 1 año a partir de la fecha de compra. La persona que recibe el regalo es quien elige la fecha del vuelo. Dentro de ese año, puede volar en cualquiera de los días disponibles.', ca: 'Sí, els xecs regal són vàlids durant 1 any a partir de la data de compra. La persona que rep el regal és qui tria la data del vol. Dins d\'aquell any, pot volar en qualsevol dels dies disponibles.', fr: 'Oui, les bons cadeaux sont valables 1 an à compter de la date d\'achat. La personne qui reçoit le cadeau est celle qui choisit la date du vol. Dans cette année, elle peut voler n\'importe quel jour disponible.', en: 'Yes, gift vouchers are valid for 1 year from the date of purchase. The person who receives the gift is the one who chooses the flight date. Within that year, they can fly on any available day.' },
      },
      {
        q: { es: '¿Cuántas personas caben en la cesta del globo?', ca: 'Quantes persones caben a la cistella del globus?', fr: 'Combien de personnes peuvent monter dans la nacelle ?', en: 'How many people can fit in the basket?' },
        a: { es: 'La cesta está diseñada para entre 2 y 8 pasajeros, lo que te permite compartir este momento especial en un ambiente íntimo. Para el vuelo privado, la cesta es para ti y los acompañantes que elijas (hasta 8 personas en total, incluyendo el piloto).', ca: 'La cistella està dissenyada per entre 2 i 8 passatgers, la qual cosa et permet compartir aquest moment especial en un ambient íntim. Per al vol privat, la cistella és per a tu i els acompanyants que triïs (fins a 8 persones en total, incloent el pilot).', fr: 'La nacelle est conçue pour 2 à 8 passagers, ce qui vous permet de partager ce moment spécial dans une ambiance intime. Pour le vol privé, la nacelle est pour vous et les accompagnateurs de votre choix (jusqu\'à 8 personnes au total, pilote compris).', en: 'The basket is designed for 2 to 8 passengers, allowing you to share this special moment in an intimate setting. For the private flight, the basket is for you and the companions you choose (up to 8 people in total, including the pilot).' },
      },
    ],
  },
  {
    category: { es: 'Cheque regalo', ca: 'Xec regal', fr: 'Bon cadeau', en: 'Gift voucher' },
    items: [
      {
        q: { es: '¿Cómo funciona el cheque regalo?', ca: 'Com funciona el xec regal?', fr: 'Comment fonctionne le bon cadeau ?', en: 'How does the gift voucher work?' },
        a: { es: 'Compras el cheque regalo online en unos minutos. Lo recibes al instante en tu correo electrónico como un vale personalizado listo para imprimir o enviar digitalmente. La persona que lo recibe elige la fecha del vuelo con total flexibilidad, siempre dentro del año de validez.', ca: 'Compres el xec regal online en uns minuts. El reps a l\'instant al teu correu electrònic com un val personalitzat llest per imprimir o enviar digitalment. La persona que el rep tria la data del vol amb total flexibilitat, sempre dins de l\'any de validesa.', fr: 'Vous achetez le bon cadeau en ligne en quelques minutes. Vous le recevez instantanément par e-mail sous forme de bon personnalisé prêt à imprimer ou à envoyer numériquement. La personne qui le reçoit choisit la date du vol en toute flexibilité, dans la limite d\'un an de validité.', en: 'You buy the gift voucher online in just a few minutes. You receive it instantly by email as a personalised voucher ready to print or send digitally. The person who receives it chooses the flight date with full flexibility, within the one-year validity period.' },
      },
      {
        q: { es: '¿Para qué tipo de vuelo sirve el cheque regalo?', ca: 'Per a quin tipus de vol serveix el xec regal?', fr: 'Pour quel type de vol est valable le bon cadeau ?', en: 'Which flight type can the gift voucher be used for?' },
        a: { es: 'Puedes comprar el cheque regalo para el vuelo compartido o para el vuelo privado, según lo que quieras regalar. En ambos casos, la persona que recibe el regalo elige la fecha y gestiona su reserva directamente con nosotros.', ca: 'Pots comprar el xec regal per al vol compartit o per al vol privat, segons el que vulguis regalar. En tots dos casos, la persona que rep el regal tria la data i gestiona la seva reserva directament amb nosaltres.', fr: 'Vous pouvez acheter le bon cadeau pour le vol partagé ou pour le vol privé, selon ce que vous souhaitez offrir. Dans les deux cas, la personne qui reçoit le cadeau choisit la date et gère sa réservation directement avec nous.', en: 'You can buy the gift voucher for either the shared or the private flight, depending on what you want to give. In both cases, the person who receives the gift chooses the date and arranges their booking directly with us.' },
      },
    ],
  },
]

export function FaqPage() {
  const { locale } = useOutletContext<LocaleContext>()
  const { t: tSeo } = useTranslation('seo')
  const { t } = useTranslation()
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
    mainEntity: FAQ_DATA.flatMap(cat =>
      cat.items.map(item => ({
        '@type': 'Question',
        name: item.q[locale],
        acceptedAnswer: { '@type': 'Answer', text: item.a[locale] },
      }))
    ),
  }

  const heroTitles: Record<string, string> = {
    es: 'Preguntas Frecuentes',
    ca: 'Preguntes Freqüents',
    fr: 'Questions Fréquentes',
    en: 'Frequently Asked Questions',
  }
  const heroSubtitles: Record<string, string> = {
    es: 'Todo lo que necesitas saber antes de volar con Airona Globus',
    ca: 'Tot el que necessites saber abans de volar amb Airona Globus',
    fr: 'Tout ce que vous devez savoir avant de voler avec Airona Globus',
    en: 'Everything you need to know before flying with Airona Globus',
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
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-display font-bold text-brand-dusk mb-4">
            {heroTitles[locale]}
          </h1>
          <p className="text-brand-dusk/60 text-lg">
            {heroSubtitles[locale]}
          </p>
        </div>
      </section>

      {/* FAQ content */}
      <section className="py-16 px-4 max-w-3xl mx-auto">
        {FAQ_DATA.map((category, ci) => (
          <div key={ci} className="mb-12">
            <h2 className="text-2xl font-display font-bold text-brand-dusk mb-6 pb-2 border-b border-brand-mist">
              {category.category[locale]}
            </h2>
            <div className="space-y-3">
              {category.items.map((item, ii) => {
                const id = `${ci}-${ii}`
                const isOpen = openItems.has(id)
                return (
                  <div key={ii} className="bg-white rounded-xl border border-brand-mist overflow-hidden">
                    <button
                      onClick={() => toggle(id)}
                      className="w-full flex items-center justify-between p-5 text-left font-semibold text-brand-dusk hover:text-brand-gold transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span>{item.q[locale]}</span>
                      <svg
                        className={`w-5 h-5 text-brand-gold flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      >
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          className="overflow-hidden"
                          {...accordionContent}
                        >
                          <div className="px-5 pb-5 text-brand-dusk/70 text-sm leading-relaxed border-t border-brand-mist pt-4">
                            {item.a[locale]}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-brand-mist text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-brand-dusk mb-3">
            {locale === 'es' ? '¿Todavía tienes alguna duda?' : locale === 'ca' ? 'Encara tens algun dubte?' : locale === 'fr' ? 'Vous avez encore des questions ?' : 'Still have questions?'}
          </h2>
          <p className="text-brand-dusk/60 mb-6">
            {locale === 'es' && 'Nuestro equipo está disponible de lunes a domingo. Llámanos al +34 652 907 515 o escríbenos.'}
            {locale === 'ca' && 'El nostre equip és disponible de dilluns a diumenge. Truca\'ns al +34 652 907 515 o escriu-nos.'}
            {locale === 'fr' && 'Notre équipe est disponible du lundi au dimanche. Appelez-nous au +34 652 907 515 ou écrivez-nous.'}
            {locale === 'en' && 'Our team is available Monday to Sunday. Call us on +34 652 907 515 or send us a message.'}
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
