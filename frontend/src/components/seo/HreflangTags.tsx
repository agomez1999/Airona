import { Helmet } from 'react-helmet-async'
import { LOCALES, slugs } from '@/config/routes'
import type { SlugKey } from '@/config/routes'

interface Props {
  pageKey?: SlugKey
  /** Extra path segments after the slug, e.g. blog post slug */
  suffix?: string
}

const SITE_URL = 'https://airona.com'

export function HreflangTags({ pageKey, suffix = '' }: Props) {
  const hreflangs = LOCALES.map((locale) => {
    const slug = pageKey ? slugs[pageKey][locale] : ''
    const path = slug ? `/${locale}/${slug}/` : `/${locale}/`
    const url = `${SITE_URL}${path}${suffix}`
    return { locale, url, hreflang: locale }
  })

  return (
    <Helmet>
      {hreflangs.map(({ hreflang, url }) => (
        <link key={hreflang} rel="alternate" hrefLang={hreflang} href={url} />
      ))}
      {/* x-default points to Spanish */}
      <link rel="alternate" hrefLang="x-default" href={hreflangs[0].url} />
    </Helmet>
  )
}
