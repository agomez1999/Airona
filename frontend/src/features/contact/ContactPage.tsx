import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { LocaleContext } from '@/components/layout/LocaleLayout'
import { MetaTags } from '@/components/seo/MetaTags'
import { HreflangTags } from '@/components/seo/HreflangTags'
import { buildLocalePath } from '@/config/routes'
import apiClient from '@/services/api/client'

const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://airona.com'

interface FormData {
  name: string
  email: string
  subject: string
  message: string
}

export function ContactPage() {
  const { locale } = useOutletContext<LocaleContext>()
  const { t: tSeo } = useTranslation('seo')

  const [form, setForm] = useState<FormData>({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      await apiClient.post('/v1/contact', { ...form, locale })
      setStatus('success')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  const labels = {
    name: { es: 'Nombre', ca: 'Nom', fr: 'Prénom et nom', en: 'Name' },
    email: { es: 'Correo electrónico', ca: 'Correu electrònic', fr: 'Adresse e-mail', en: 'Email address' },
    subject: { es: 'Asunto', ca: 'Assumpte', fr: 'Sujet', en: 'Subject' },
    message: { es: 'Tu mensaje', ca: 'El teu missatge', fr: 'Votre message', en: 'Your message' },
    send: { es: 'Enviar mensaje', ca: 'Enviar missatge', fr: 'Envoyer le message', en: 'Send message' },
    success: {
      es: '¡Mensaje enviado! Te responderemos lo antes posible.',
      ca: 'Missatge enviat! Et respondrem el més aviat possible.',
      fr: 'Message envoyé ! Nous vous répondrons dans les plus brefs délais.',
      en: 'Message sent! We\'ll get back to you as soon as possible.',
    },
    error: {
      es: 'Error al enviar. Por favor, inténtalo de nuevo o llámanos directamente.',
      ca: 'Error en enviar. Si us plau, torna-ho a intentar o truca\'ns directament.',
      fr: 'Erreur lors de l\'envoi. Veuillez réessayer ou nous appeler directement.',
      en: 'Error sending message. Please try again or call us directly.',
    },
    subjects: {
      es: ['Información sobre vuelos', 'Reservar un vuelo', 'Cheque regalo', 'Grupos y eventos', 'Condiciones y cancelaciones', 'Otro'],
      ca: ['Informació sobre vols', 'Reservar un vol', 'Xec regal', 'Grups i esdeveniments', 'Condicions i cancel·lacions', 'Altre'],
      fr: ['Informations sur les vols', 'Réserver un vol', 'Bon cadeau', 'Groupes et événements', 'Conditions et annulations', 'Autre'],
      en: ['Flight information', 'Book a flight', 'Gift voucher', 'Groups & events', 'Conditions & cancellations', 'Other'],
    },
    formTitle: { es: 'Escríbenos', ca: 'Escriu-nos', fr: 'Écrivez-nous', en: 'Send us a message' },
    infoTitle: { es: 'Información de contacto', ca: 'Informació de contacte', fr: 'Informations de contact', en: 'Contact information' },
    heroTitle: {
      es: 'Estamos aquí para ayudarte',
      ca: 'Estem aquí per ajudar-te',
      fr: 'Nous sommes là pour vous aider',
      en: 'We\'re here to help',
    },
  }

  return (
    <>
      <MetaTags
        title={tSeo('contact.title')}
        description={tSeo('contact.description')}
        canonical={`${SITE_URL}/${locale}/${buildLocalePath(locale, 'contact').slice(locale.length + 2)}`}
        ogImage={`${SITE_URL}/og/contact.jpg`}
      />
      <HreflangTags pageKey="contact" />

      {/* Hero */}
      <section className="pt-24 pb-16 px-4 text-center bg-gradient-to-b from-brand-sky/10 to-brand-cream">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-display font-bold text-brand-dusk mb-4">
            {labels.heroTitle[locale]}
          </h1>
          <p className="text-brand-dusk/60 text-xl max-w-xl mx-auto">
            {locale === 'es' && 'Cuéntanos lo que necesitas y te responderemos lo antes posible. También puedes llamarnos directamente.'}
            {locale === 'ca' && 'Explica\'ns el que necessites i et respondrem el més aviat possible. També ens pots trucar directament.'}
            {locale === 'fr' && 'Dites-nous ce dont vous avez besoin et nous vous répondrons dès que possible. Vous pouvez aussi nous appeler directement.'}
            {locale === 'en' && 'Tell us what you need and we\'ll get back to you as soon as possible. You can also call us directly.'}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact info */}
          <div>
            <h2 className="text-2xl font-display font-bold text-brand-dusk mb-8">
              {labels.infoTitle[locale]}
            </h2>
            <div className="space-y-6">
              {[
                {
                  icon: '📞',
                  label: { es: 'Teléfono', ca: 'Telèfon', fr: 'Téléphone', en: 'Phone' }[locale],
                  value: '+34 652 907 515',
                  href: 'tel:+34652907515',
                },
                {
                  icon: '📧',
                  label: 'Email',
                  value: 'info@aironaglobus.com',
                  href: 'mailto:info@aironaglobus.com',
                },
                {
                  icon: '📍',
                  label: { es: 'Punto de encuentro', ca: 'Punt de trobada', fr: 'Point de rendez-vous', en: 'Meeting point' }[locale],
                  value: 'Colomers, Empordà (Girona)',
                  href: null,
                },
                {
                  icon: '🕐',
                  label: { es: 'Horario de vuelos', ca: 'Horari de vols', fr: 'Horaires de vols', en: 'Flight schedule' }[locale],
                  value: {
                    es: 'Verano 6:30 h · Invierno 8:00 h',
                    ca: 'Estiu 6:30 h · Hivern 8:00 h',
                    fr: 'Été 6h30 · Hiver 8h00',
                    en: 'Summer 6:30 · Winter 8:00',
                  }[locale],
                  href: null,
                },
                {
                  icon: '📅',
                  label: { es: 'Temporada', ca: 'Temporada', fr: 'Saison', en: 'Season' }[locale],
                  value: { es: 'Todo el año (según meteorología)', ca: 'Tot l\'any (segons meteorologia)', fr: 'Toute l\'année (selon météo)', en: 'Year-round (weather permitting)' }[locale],
                  href: null,
                },
              ].map(({ icon, label, value, href }, i) => (
                <div key={i} className="flex items-start gap-4">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <div className="text-sm text-brand-dusk/50 font-medium">{label}</div>
                    {href ? (
                      <a href={href} className="text-brand-dusk hover:text-brand-gold transition-colors font-medium">
                        {value}
                      </a>
                    ) : (
                      <div className="text-brand-dusk font-medium">{value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Social links */}
            <div className="mt-10">
              <p className="text-sm text-brand-dusk/50 font-medium mb-4">
                {locale === 'es' ? 'Síguenos' : locale === 'ca' ? 'Segueix-nos' : locale === 'fr' ? 'Suivez-nous' : 'Follow us'}
              </p>
              <div className="flex gap-3">
                {[
                  { label: 'Tripadvisor', color: 'bg-[#34E0A1]/10 text-[#34E0A1]', href: 'https://www.tripadvisor.es/Attraction_Review-g187499-d3477526-Reviews-Airona-Girona_Province_of_Girona_Catalonia.html' },
                  { label: 'Instagram', color: 'bg-pink-50 text-pink-500', href: 'https://www.instagram.com/aironaglobus/?hl=es' },
                  { label: 'Facebook', color: 'bg-blue-50 text-blue-600', href: 'https://www.facebook.com/aironaglobus/?ref=ts&fref=ts' },
                  { label: 'YouTube', color: 'bg-red-50 text-red-600', href: 'https://www.youtube.com/channel/UCvbam5gNF_vSX_BJdOYsZ1Q' },
                ].map(({ label, color, href }) => (
                  <a target="_blank" href={href} key={label} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${color}`}>
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div>
            <h2 className="text-2xl font-display font-bold text-brand-dusk mb-8">
              {labels.formTitle[locale]}
            </h2>

            {status === 'success' ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-green-800 text-center">
                <div className="text-4xl mb-3">✓</div>
                <p className="font-semibold text-lg mb-1">{labels.success[locale]}</p>
                <p className="text-sm text-green-700">
                  {locale === 'es' && 'También puedes llamarnos al +34 652 907 515.'}
                  {locale === 'ca' && 'També ens pots trucar al +34 652 907 515.'}
                  {locale === 'fr' && 'Vous pouvez aussi nous appeler au +34 652 907 515.'}
                  {locale === 'en' && 'You can also call us on +34 652 907 515.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {status === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
                    {labels.error[locale]}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-brand-dusk mb-1.5">
                      {labels.name[locale]}
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-brand-mist bg-white text-brand-dusk focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-brand-dusk mb-1.5">
                      {labels.email[locale]}
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-brand-mist bg-white text-brand-dusk focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-brand-dusk mb-1.5">
                    {labels.subject[locale]}
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-brand-mist bg-white text-brand-dusk focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold transition-colors"
                  >
                    <option value=""></option>
                    {labels.subjects[locale].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-brand-dusk mb-1.5">
                    {labels.message[locale]}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-brand-mist bg-white text-brand-dusk focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full py-4 rounded-full bg-brand-gold text-white font-semibold hover:bg-brand-gold/90 transition-all disabled:opacity-60"
                >
                  {status === 'sending'
                    ? (locale === 'es' ? 'Enviando...' : locale === 'ca' ? 'Enviant...' : locale === 'fr' ? 'Envoi en cours...' : 'Sending...')
                    : labels.send[locale]}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
