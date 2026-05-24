export type Locale = 'es' | 'ca' | 'fr' | 'en'

export const LOCALES: Locale[] = ['es', 'ca', 'fr', 'en']
export const DEFAULT_LOCALE: Locale = 'es'

export const LOCALE_LABELS: Record<Locale, string> = {
  es: 'Español', ca: 'Català', fr: 'Français', en: 'English',
}
export const LOCALE_SHORT: Record<Locale, string> = {
  es: 'ES', ca: 'CA', fr: 'FR', en: 'EN',
}

// Translated slug map — all public page slugs per locale
export const slugs = {
  experiences: { es: 'experiencias', ca: 'experiencies', fr: 'experiences', en: 'experiences' },
  sharedFlight: { es: 'vuelo-compartido', ca: 'vol-compartit', fr: 'vol-partage', en: 'shared-flight' },
  privateFlight: { es: 'vuelo-privado', ca: 'vol-privat', fr: 'vol-prive', en: 'private-flight' },
  gift: { es: 'regalo', ca: 'regal', fr: 'cadeau', en: 'gift' },
  flightZone: { es: 'zona-de-vuelo', ca: 'zona-de-vol', fr: 'zone-de-vol', en: 'flight-zone' },
  about: { es: 'nosotros', ca: 'nosaltres', fr: 'a-propos', en: 'about-us' },
  faq: { es: 'preguntas-frecuentes', ca: 'preguntes-frequents', fr: 'questions-frequentes', en: 'faq' },
  contact: { es: 'contacto', ca: 'contacte', fr: 'contact', en: 'contact' },
  cart: { es: 'carrito', ca: 'cistella', fr: 'panier', en: 'cart' },
  blog: { es: 'blog', ca: 'blog', fr: 'blog', en: 'blog' },
} as const

export type SlugKey = keyof typeof slugs

// Build reverse lookup: slug string → { locale, key }
const reverseMap = new Map<string, { locale: Locale; key: SlugKey }>()
for (const [key, localeMap] of Object.entries(slugs) as [SlugKey, Record<Locale, string>][]) {
  for (const [locale, slug] of Object.entries(localeMap) as [Locale, string][]) {
    reverseMap.set(`${locale}/${slug}`, { locale, key })
  }
}

export function resolveSlug(locale: Locale, slug: string): SlugKey | null {
  return reverseMap.get(`${locale}/${slug}`)?.key ?? null
}

export function getSlug(locale: Locale, key: SlugKey): string {
  return slugs[key][locale]
}

export function buildLocalePath(locale: Locale, key: SlugKey, ...segments: string[]): string {
  const base = `/${locale}/${slugs[key][locale]}`
  return segments.length ? `${base}/${segments.join('/')}` : base + '/'
}

// All static SSG routes to prerender
export function getAllStaticRoutes(): string[] {
  const routes: string[] = ['/']
  for (const locale of LOCALES) {
    routes.push(`/${locale}/`)
    for (const key of Object.keys(slugs) as SlugKey[]) {
      routes.push(`/${locale}/${slugs[key][locale]}/`)
    }
  }
  return routes
}
