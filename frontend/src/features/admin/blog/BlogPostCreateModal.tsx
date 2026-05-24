import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { adminCreateBlogPost } from '@/services/api/endpoints'
import type { BlogPostPayload } from '@/services/api/endpoints'
import { LOCALES } from '@/config/routes'
import { BaseModal } from '@/components/ui/BaseModal'

const empty = (locale: string): BlogPostPayload => ({
  title: '', content: '', excerpt: '', meta_title: '',
  meta_description: '', is_published: false, locale,
})

interface Props {
  open: boolean
  onClose: () => void
  defaultLocale?: string
}

export function BlogPostCreateModal({ open, onClose, defaultLocale = 'es' }: Props) {
  const { t } = useTranslation('admin')
  const qc = useQueryClient()
  const [form, setForm] = useState<BlogPostPayload>(() => empty(defaultLocale))

  const set = <K extends keyof BlogPostPayload>(k: K, v: BlogPostPayload[K]) =>
    setForm(p => ({ ...p, [k]: v }))

  const create = useMutation({
    mutationFn: adminCreateBlogPost,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'blog'] })
      setForm(empty(defaultLocale))
      onClose()
    },
  })

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={t('blog.newPostHeading')}
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
            onClick={() => create.mutate(form)}
            disabled={create.isPending || !form.title || !form.content}
            className="px-5 py-2 rounded-lg bg-brand-gold text-white text-sm font-semibold hover:bg-brand-gold/90 disabled:opacity-60 transition-colors"
          >
            {create.isPending ? t('blog.saving') : t('blog.save')}
          </button>
        </>
      }
    >
      <div className="px-6 py-5 space-y-4">
        {/* Locale selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-gray-500 whitespace-nowrap">{t('blog.colLang')}</label>
          <select
            value={form.locale}
            onChange={e => set('locale', e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
          >
            {LOCALES.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
          </select>
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
        {create.isError && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {(create.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error saving post.'}
          </p>
        )}
      </div>
    </BaseModal>
  )
}
