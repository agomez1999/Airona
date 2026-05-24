import { useOutletContext } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import type { LocaleContext } from '@/components/layout/LocaleLayout'
import { MetaTags } from '@/components/seo/MetaTags'
import { HreflangTags } from '@/components/seo/HreflangTags'
import { LazyImage } from '@/components/common/LazyImage'
import { buildLocalePath } from '@/config/routes'
import apiClient from '@/services/api/client'
import { fadeUpVariants, staggerContainerVariants, staggerItemVariants } from '@/lib/motion'

const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://airona.com'

interface BlogPost {
  id: number
  slug: string
  title: string
  excerpt: string | null
  cover_image: string | null
  published_at: string
  reading_time_minutes: number | null
}

export function BlogListPage() {
  const { locale } = useOutletContext<LocaleContext>()
  const { t: tSeo } = useTranslation('seo')

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ['blog', locale],
    queryFn: () =>
      apiClient.get('/v1/blog', { headers: { 'Accept-Language': locale } }).then(r => r.data.data),
    staleTime: 1000 * 60 * 30,
  })

  const dateFormat = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : locale, {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <>
      <MetaTags
        title={tSeo('blog.title')}
        description={tSeo('blog.description')}
        canonical={`${SITE_URL}/${locale}/${buildLocalePath(locale, 'blog').slice(locale.length + 2)}`}
        ogImage={`${SITE_URL}/og/blog.jpg`}
      />
      <HreflangTags pageKey="blog" />

      {/* Hero */}
      <section className="pt-24 pb-16 px-4 text-center bg-gradient-to-b from-brand-sky/10 to-brand-cream">
        <motion.div
          className="max-w-3xl mx-auto"
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
        >
          <h1 className="text-5xl font-display font-bold text-brand-dusk mb-4">
            {locale === 'es' ? 'Blog' : locale === 'ca' ? 'Blog' : locale === 'fr' ? 'Blog' : 'Blog'}
          </h1>
          <p className="text-brand-dusk/60 text-xl">{tSeo('blog.description')}</p>
        </motion.div>
      </section>

      {/* Posts */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="aspect-[16/9] bg-brand-mist" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-brand-mist rounded w-3/4" />
                  <div className="h-4 bg-brand-mist rounded w-full" />
                  <div className="h-4 bg-brand-mist rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-brand-dusk/50">
            {locale === 'es' ? 'Próximamente...' : locale === 'ca' ? 'Pròximament...' : locale === 'fr' ? 'Bientôt...' : 'Coming soon...'}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {posts.map(post => (
              <motion.article key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group" variants={staggerItemVariants}>
                <Link to={`${buildLocalePath(locale, 'blog')}${post.slug}/`} className="block">
                  <div className="aspect-[16/9] overflow-hidden">
                    {post.cover_image ? (
                      <LazyImage
                        src={post.cover_image}
                        alt={post.title}
                        width={640}
                        height={360}
                        className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-sky/30 to-brand-gold/20 flex items-center justify-center text-4xl">📰</div>
                    )}
                  </div>
                </Link>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs text-brand-dusk/40 mb-3">
                    <time dateTime={post.published_at}>
                      {dateFormat.format(new Date(post.published_at))}
                    </time>
                    {post.reading_time_minutes && (
                      <>
                        <span>·</span>
                        <span>
                          {post.reading_time_minutes} {locale === 'es' ? 'min' : locale === 'ca' ? 'min' : locale === 'fr' ? 'min' : 'min'} read
                        </span>
                      </>
                    )}
                  </div>
                  <Link to={`${buildLocalePath(locale, 'blog')}${post.slug}/`}>
                    <h2 className="font-display text-lg font-bold text-brand-dusk mb-2 hover:text-brand-gold transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                  </Link>
                  {post.excerpt && (
                    <p className="text-brand-dusk/60 text-sm leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </section>
    </>
  )
}
