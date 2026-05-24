import { Helmet } from 'react-helmet-async'
import type { Locale } from '@/config/routes'

interface Props {
  title: string
  description: string
  canonical: string
  locale?: Locale
  ogImage?: string
  ogImageWidth?: number
  ogImageHeight?: number
  ogType?: 'website' | 'article' | 'product'
  noIndex?: boolean
  articlePublishedTime?: string
  articleModifiedTime?: string
}

const SITE_URL = 'https://airona.com'
const DEFAULT_OG_IMAGE = `${SITE_URL}/og/default.jpg`

export function MetaTags({
  title,
  description,
  canonical,
  locale = 'es',
  ogImage = DEFAULT_OG_IMAGE,
  ogImageWidth = 1200,
  ogImageHeight = 630,
  ogType = 'website',
  noIndex = false,
  articlePublishedTime,
  articleModifiedTime,
}: Props) {
  const fullCanonical = canonical.startsWith('http') ? canonical : `${SITE_URL}${canonical}`

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullCanonical} />

      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content={String(ogImageWidth)} />
      <meta property="og:image:height" content={String(ogImageHeight)} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="Airona Globus" />
      <meta property="og:locale" content={`${locale}_${locale.toUpperCase()}`} />

      {/* Article timestamps (for ogType="article") */}
      {articlePublishedTime && <meta property="article:published_time" content={articlePublishedTime} />}
      {articleModifiedTime && <meta property="article:modified_time" content={articleModifiedTime} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  )
}
