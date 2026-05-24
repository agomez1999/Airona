import { useOutletContext, useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import DOMPurify from 'dompurify'
import type { LocaleContext } from '@/components/layout/LocaleLayout'
import { MetaTags } from '@/components/seo/MetaTags'
import { SchemaOrg } from '@/components/seo/SchemaOrg'
import { HreflangTags } from '@/components/seo/HreflangTags'
import { LazyImage } from '@/components/common/LazyImage'
import { buildLocalePath } from '@/config/routes'
import apiClient from '@/services/api/client'

const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://airona.com'

interface BlogPost {
  id: number
  slug: string
  title: string
  content: string
  excerpt: string | null
  cover_image: string | null
  meta_title: string | null
  meta_description: string | null
  published_at: string
  updated_at?: string
  reading_time_minutes: number | null
}

export function BlogPostPage() {
  const { locale } = useOutletContext<LocaleContext>()
  const { postSlug } = useParams<{ postSlug: string }>()
  const { t: tSeo } = useTranslation('seo')
  const { t } = useTranslation()

  const { data: post, isLoading, isError } = useQuery<BlogPost>({
    queryKey: ['blog', locale, postSlug],
    queryFn: () =>
      apiClient.get(`/v1/blog/${postSlug}`, { headers: { 'Accept-Language': locale } }).then(r => r.data.data),
    enabled: !!postSlug,
    staleTime: 1000 * 60 * 60,
  })

  const dateFormat = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : locale, {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  if (isLoading) {
    return (
      <div className="pt-24 pb-16 px-4 max-w-3xl mx-auto animate-pulse space-y-6">
        <div className="h-10 bg-brand-mist rounded w-2/3" />
        <div className="aspect-[16/9] bg-brand-mist rounded-2xl" />
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-4 bg-brand-mist rounded" />)}
        </div>
      </div>
    )
  }

  if (isError || !post) {
    return (
      <div className="pt-24 pb-16 px-4 max-w-3xl mx-auto text-center">
        <h1 className="text-3xl font-display font-bold text-brand-dusk mb-4">
          {t('errors.notFound')}
        </h1>
        <Link to={buildLocalePath(locale, 'blog')} className="text-brand-gold hover:underline">
          ← {locale === 'es' ? 'Volver al blog' : locale === 'ca' ? 'Tornar al blog' : locale === 'fr' ? 'Retour au blog' : 'Back to blog'}
        </Link>
      </div>
    )
  }

  const canonicalUrl = `${SITE_URL}/${locale}/${buildLocalePath(locale, 'blog').slice(locale.length + 2)}${post.slug}/`

  const articleSchema = {
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.cover_image ?? `${SITE_URL}/og/blog.jpg`,
    datePublished: post.published_at,
    dateModified: post.updated_at ?? post.published_at,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    author: { '@type': 'Organization', name: 'Airona Globus' },
    publisher: {
      '@type': 'Organization',
      name: 'Airona Globus',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
  }

  return (
    <>
      <MetaTags
        title={post.meta_title ?? post.title}
        description={post.meta_description ?? post.excerpt ?? tSeo('blog.description')}
        canonical={canonicalUrl}
        ogImage={post.cover_image ?? `${SITE_URL}/og/blog.jpg`}
        ogType="article"
        articlePublishedTime={post.published_at}
        articleModifiedTime={post.updated_at ?? post.published_at}
      />
      <HreflangTags pageKey="blog" />
      <SchemaOrg schema={articleSchema} />

      <article className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          to={buildLocalePath(locale, 'blog')}
          className="inline-flex items-center gap-2 text-sm text-brand-dusk/50 hover:text-brand-gold transition-colors mb-8"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          {locale === 'es' ? 'Blog' : locale === 'ca' ? 'Blog' : locale === 'fr' ? 'Blog' : 'Blog'}
        </Link>

        {/* Header */}
        <header className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-brand-dusk mb-5 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-brand-dusk/50">
            <time dateTime={post.published_at}>
              {dateFormat.format(new Date(post.published_at))}
            </time>
            {post.reading_time_minutes && (
              <>
                <span>·</span>
                <span>{post.reading_time_minutes} min read</span>
              </>
            )}
          </div>
        </header>

        {/* Cover image */}
        {post.cover_image && (
          <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-10">
            <LazyImage
              src={post.cover_image}
              alt={post.title}
              width={900}
              height={506}
              className="w-full h-full"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-brand-dusk prose-a:text-brand-gold prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        />

        {/* CTA */}
        <div className="mt-16 bg-brand-mist rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-display font-bold text-brand-dusk mb-3">
            {locale === 'es' ? '¿Listo para vivir la experiencia?' : locale === 'ca' ? 'Llest per viure l\'experiència?' : locale === 'fr' ? 'Prêt à vivre l\'expérience?' : 'Ready to experience it?'}
          </h2>
          <Link
            to={buildLocalePath(locale, 'experiences')}
            className="inline-flex items-center px-8 py-3.5 rounded-full bg-brand-gold text-white font-semibold hover:bg-brand-gold/90 transition-all mt-3"
          >
            {t('actions.learnMore')}
          </Link>
        </div>
      </article>
    </>
  )
}
