import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { adminGetBlogPost, adminUpdateBlogPost } from '@/services/api/endpoints'
import type { BlogPostPayload } from '@/services/api/endpoints'
import { LOCALES } from '@/config/routes'
import { BaseModal } from '@/components/ui/BaseModal'

interface Props {
  postId: number | null
  onClose: () => void
}

type FormState = Omit<BlogPostPayload, 'locale'>

function emptyForm(): FormState {
  return {
    title: '',
    content: '',
    excerpt: '',
    cover_image: '',
    meta_title: '',
    meta_description: '',
    is_published: false,
  }
}

export function BlogPostEditModal({ postId, onClose }: Props) {
  const { t } = useTranslation('admin')
  const qc = useQueryClient()
  const [form, setForm] = useState<FormState>(emptyForm())

  const { data: post, isLoading } = useQuery({
    queryKey: ['admin', 'blog', postId],
    queryFn: () => adminGetBlogPost(postId as number).then(r => r.data.data),
    enabled: postId !== null,
  })

  // Populate form when post data loads
  useEffect(() => {
    if (post) {
      setForm({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt ?? '',
        cover_image: post.cover_image ?? '',
        meta_title: post.meta_title ?? '',
        meta_description: post.meta_description ?? '',
        is_published: post.is_published,
      })
    }
  }, [post])

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(p => ({ ...p, [k]: v }))

  const update = useMutation({
    mutationFn: (data: Partial<BlogPostPayload>) =>
      adminUpdateBlogPost(postId as number, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'blog'] })
      qc.invalidateQueries({ queryKey: ['admin', 'blog', postId] })
      onClose()
    },
  })

  function handleSave() {
    if (postId === null) return
    update.mutate({
      title: form.title,
      content: form.content,
      excerpt: form.excerpt,
      cover_image: form.cover_image,
      meta_title: form.meta_title,
      meta_description: form.meta_description,
      is_published: form.is_published,
    })
  }

  // Keep LOCALES import consistent with create modal (not used functionally here)
  void LOCALES

  return (
    <BaseModal
      open={postId !== null}
      onClose={onClose}
      title={t('blog.editPostHeading')}
      size="lg"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {t('blog.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={update.isPending || !form.title || !form.content}
            className="px-5 py-2 rounded-lg bg-brand-gold text-white text-sm font-semibold hover:bg-brand-gold/90 disabled:opacity-60 transition-colors"
          >
            {update.isPending ? t('blog.saving') : t('blog.save')}
          </button>
        </>
      }
    >
      <div className="px-6 py-5 space-y-4">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="h-9 bg-gray-100 rounded" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-9 bg-gray-100 rounded" />
              <div className="h-9 bg-gray-100 rounded" />
            </div>
            <div className="h-16 bg-gray-100 rounded" />
            <div className="h-9 bg-gray-100 rounded" />
            <div className="h-48 bg-gray-100 rounded" />
          </div>
        ) : (
          <>
            {/* Read-only locale badge */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-500 whitespace-nowrap">{t('blog.colLang')}</span>
              <span className="inline-flex px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {post?.locale ?? '—'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('blog.fieldTitle')}</label>
                <input
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('blog.fieldMetaTitle')}</label>
                <input
                  value={form.meta_title ?? ''}
                  onChange={e => set('meta_title', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('blog.fieldCoverImage')}</label>
                <input
                  value={form.cover_image ?? ''}
                  onChange={e => set('cover_image', e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('blog.fieldExcerpt')}</label>
                <textarea
                  rows={2}
                  value={form.excerpt ?? ''}
                  onChange={e => set('excerpt', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 resize-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('blog.fieldMetaDesc')}</label>
                <input
                  value={form.meta_description ?? ''}
                  onChange={e => set('meta_description', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('blog.fieldContent')}</label>
                <textarea
                  rows={14}
                  value={form.content}
                  onChange={e => set('content', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-gold/30 resize-y"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={e => set('is_published', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-brand-gold"
              />
              {t('blog.fieldPublish')}
            </label>
            {update.isError && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                {(update.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error saving post.'}
              </p>
            )}
          </>
        )}
      </div>
    </BaseModal>
  )
}
