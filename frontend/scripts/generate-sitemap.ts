/**
 * Sitemap generator — run after prerender to produce sitemap-index.xml and nested sitemaps.
 * Reads blog posts from the API to include dynamic blog URLs.
 */
import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const clientDir = resolve(__dirname, '../dist/client')
const SITE_URL = process.env.VITE_SITE_URL ?? 'https://airona.com'
const API_URL = process.env.VITE_API_URL ?? 'http://localhost:80/api'
const TODAY = new Date().toISOString().split('T')[0]

const LOCALES = ['es', 'ca', 'fr', 'en'] as const

const SLUGS = {
  experiences: { es: 'experiencias', ca: 'experiencies', fr: 'experiences', en: 'experiences' },
  sharedFlight: { es: 'vuelo-compartido', ca: 'vol-compartit', fr: 'vol-partage', en: 'shared-flight' },
  privateFlight: { es: 'vuelo-privado', ca: 'vol-privat', fr: 'vol-prive', en: 'private-flight' },
  gift: { es: 'regalo', ca: 'regal', fr: 'cadeau', en: 'gift' },
  flightZone: { es: 'zona-de-vuelo', ca: 'zona-de-vol', fr: 'zone-de-vol', en: 'flight-zone' },
  about: { es: 'nosotros', ca: 'nosaltres', fr: 'a-propos', en: 'about-us' },
  faq: { es: 'preguntas-frecuentes', ca: 'preguntes-frequents', fr: 'questions-frequentes', en: 'faq' },
  contact: { es: 'contacto', ca: 'contacte', fr: 'contact', en: 'contact' },
  blog: { es: 'blog', ca: 'blog', fr: 'blog', en: 'blog' },
} as const

function url(loc: string, lastmod = TODAY, changefreq = 'monthly', priority = '0.7') {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

function wrap(name: string, urls: string[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`
}

async function fetchBlogPosts(locale: string): Promise<{ slug: string; updated_at: string }[]> {
  try {
    const res = await fetch(`${API_URL}/v1/blog?per_page=1000`, {
      headers: { 'Accept-Language': locale, 'Accept': 'application/json' },
    })
    if (!res.ok) return []
    const json = await res.json()
    return (json.data ?? []) as { slug: string; updated_at: string }[]
  } catch {
    return []
  }
}

async function main() {
  mkdirSync(clientDir, { recursive: true })

  // ── Static pages sitemap ────────────────────────────────────────────────────
  const staticUrls: string[] = []
  for (const locale of LOCALES) {
    staticUrls.push(url(`${SITE_URL}/${locale}/`, TODAY, 'weekly', '1.0'))
    for (const [, localeMap] of Object.entries(SLUGS)) {
      const slug = localeMap[locale]
      if (slug !== 'blog') {
        staticUrls.push(url(`${SITE_URL}/${locale}/${slug}/`, TODAY, 'monthly', '0.8'))
      }
    }
  }
  writeFileSync(resolve(clientDir, 'sitemap-static.xml'), wrap('static', staticUrls))
  console.log('  ✓ sitemap-static.xml')

  // ── Experiences sitemap ─────────────────────────────────────────────────────
  const experienceKeys = ['sharedFlight', 'privateFlight', 'gift'] as const
  const expUrls: string[] = []
  for (const locale of LOCALES) {
    for (const key of experienceKeys) {
      expUrls.push(url(`${SITE_URL}/${locale}/${SLUGS[key][locale]}/`, TODAY, 'weekly', '0.9'))
    }
  }
  writeFileSync(resolve(clientDir, 'sitemap-experiences.xml'), wrap('experiences', expUrls))
  console.log('  ✓ sitemap-experiences.xml')

  // ── Blog sitemap (fetches live posts) ───────────────────────────────────────
  const blogUrls: string[] = []
  for (const locale of LOCALES) {
    const posts = await fetchBlogPosts(locale)
    for (const post of posts) {
      const lastmod = post.updated_at ? post.updated_at.split('T')[0] : TODAY
      blogUrls.push(url(`${SITE_URL}/${locale}/${SLUGS.blog[locale]}/${post.slug}/`, lastmod, 'weekly', '0.6'))
    }
  }
  writeFileSync(resolve(clientDir, 'sitemap-blog.xml'), wrap('blog', blogUrls))
  console.log('  ✓ sitemap-blog.xml')

  // ── Index ───────────────────────────────────────────────────────────────────
  const index = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap-static.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-experiences.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-blog.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>
</sitemapindex>`
  writeFileSync(resolve(clientDir, 'sitemap-index.xml'), index)
  console.log('  ✓ sitemap-index.xml')

  console.log('\nSitemap generation complete.')
}

main().catch(err => {
  console.error('Sitemap generation failed:', err)
  process.exit(1)
})
