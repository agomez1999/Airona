/**
 * SSG prerender script — run after `vite build --ssr` to generate static HTML per route.
 * Usage: node --loader tsx scripts/prerender.ts  (or via npm run prerender)
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = resolve(__dirname, '../dist')
const clientDir = resolve(distDir, 'client')
const templatePath = resolve(clientDir, 'index.html')

const LOCALES = ['es', 'ca', 'fr', 'en']
const BLOG_SLUGS: Record<string, string> = { es: 'blog', ca: 'blog', fr: 'blog', en: 'blog' }

async function fetchBlogSlugs(locale: string): Promise<string[]> {
  const apiBase = process.env.PRERENDER_API_BASE ?? 'http://localhost/api'
  try {
    const res = await fetch(`${apiBase}/v1/blog?per_page=1000`, {
      headers: { 'Accept-Language': locale, Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return []
    const json = await res.json() as { data?: { slug?: string }[] }
    return (json.data ?? []).map(p => p.slug ?? '').filter(Boolean)
  } catch {
    console.warn(`  ⚠ Could not fetch blog slugs for [${locale}] — skipping dynamic blog routes`)
    return []
  }
}

async function main() {
  const template = readFileSync(templatePath, 'utf-8')

  // Dynamic import of the SSR bundle (compiled by vite --ssr)
  const { render } = await import(resolve(distDir, 'server/entry-server.js'))

  // Import routes after build
  const { getAllStaticRoutes } = await import(resolve(distDir, 'server/config/routes.js'))
  const routes: string[] = getAllStaticRoutes()

  // Fetch blog post slugs per locale and append dynamic routes
  for (const locale of LOCALES) {
    const slugs = await fetchBlogSlugs(locale)
    for (const slug of slugs) {
      routes.push(`/${locale}/${BLOG_SLUGS[locale]}/${slug}/`)
    }
    if (slugs.length > 0) {
      console.log(`  + ${slugs.length} blog routes for [${locale}]`)
    }
  }

  console.log(`Prerendering ${routes.length} routes...`)

  for (const route of routes) {
    const { html, helmetContext } = render(route) as {
      html: string
      helmetContext: { helmet?: Record<string, { toString: () => string }> }
    }

    const helmet = helmetContext.helmet
    const headTags = helmet
      ? [
          helmet.title?.toString() ?? '',
          helmet.meta?.toString() ?? '',
          helmet.link?.toString() ?? '',
          helmet.script?.toString() ?? '',
        ].join('\n    ')
      : ''

    let page = template
      .replace('</head>', `${headTags}\n  </head>`)
      .replace('<div id="root"></div>', `<div id="root">${html}</div>`)

    // Determine output path: /es/ → dist/client/es/index.html
    const cleanRoute = route.startsWith('/') ? route.slice(1) : route
    const htmlPath = cleanRoute === '' || cleanRoute === '/'
      ? resolve(clientDir, 'index.html')
      : resolve(clientDir, cleanRoute, 'index.html')

    mkdirSync(dirname(htmlPath), { recursive: true })
    writeFileSync(htmlPath, page, 'utf-8')
    console.log(`  ✓ ${route}`)
  }

  console.log(`\nPrerender complete. ${routes.length} pages written.`)
}

main().catch(err => {
  console.error('Prerender failed:', err)
  process.exit(1)
})
