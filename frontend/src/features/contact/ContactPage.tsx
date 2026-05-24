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
  const { t: tContact } = useTranslation('contact')

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

  const subjects: string[] = tContact('form.subjects', { returnObjects: true }) as string[]

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
            {tContact('hero.title')}
          </h1>
          <p className="text-brand-dusk/60 text-xl max-w-xl mx-auto">
            {tContact('hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact info */}
          <div>
            <h2 className="text-2xl font-display font-bold text-brand-dusk mb-8">
              {tContact('info.title')}
            </h2>
            <div className="space-y-6">
              {[
                {
                  icon: '📞',
                  label: tContact('info.phone'),
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
                  label: tContact('info.meetingPoint'),
                  value: 'Colomers, Empordà (Girona)',
                  href: null,
                },
                {
                  icon: '🕐',
                  label: tContact('info.schedule'),
                  value: tContact('info.scheduleValue'),
                  href: null,
                },
                {
                  icon: '📅',
                  label: tContact('info.season'),
                  value: tContact('info.seasonValue'),
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
                {tContact('info.follow')}
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
              {tContact('form.title')}
            </h2>

            {status === 'success' ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-green-800 text-center">
                <div className="text-4xl mb-3">✓</div>
                <p className="font-semibold text-lg mb-1">{tContact('status.success')}</p>
                <p className="text-sm text-green-700">
                  {tContact('status.successPhone')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {status === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
                    {tContact('status.error')}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-brand-dusk mb-1.5">
                      {tContact('form.name')}
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
                      {tContact('form.email')}
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
                    {tContact('form.subject')}
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
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-brand-dusk mb-1.5">
                    {tContact('form.message')}
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
                  {status === 'sending' ? tContact('form.sending') : tContact('form.send')}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
