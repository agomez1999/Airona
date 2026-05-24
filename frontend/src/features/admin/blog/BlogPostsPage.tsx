import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  adminGetBlogPosts, adminDeleteBlogPost,
} from '@/services/api/endpoints'
import { LOCALES } from '@/config/routes'
import { BlogPostCreateModal } from './BlogPostCreateModal'
import { BlogPostEditModal } from './BlogPostEditModal'

export function BlogPostsPage() {
  const { t } = useTranslation('admin')
  const qc = useQueryClient()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editorLocale] = useState<string>('es')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'blog'],
    queryFn: () => adminGetBlogPosts().then(r => r.data),
    staleTime: 1000 * 60 * 5,
  })

  const remove = useMutation({
    mutationFn: adminDeleteBlogPost,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'blog'] }),
  })

  const posts = data?.data ?? []

  // Keep LOCALES import consistent (used by editorLocale selector)
  void LOCALES

  return (
    <div className="space-y-5">
      <BlogPostCreateModal open={showCreateModal} onClose={() => setShowCreateModal(false)} defaultLocale={editorLocale} />
      <BlogPostEditModal postId={editingId} onClose={() => setEditingId(null)} />

      <div className="flex items-center justify-between">
        <h1 className="admin-page-title">{t('blog.title')}</h1>
        <button onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-lg bg-brand-gold text-white text-sm font-semibold hover:bg-brand-gold/90 transition-colors">
          {t('blog.new')}
        </button>
      </div>

      {/* Posts table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm animate-pulse">{t('common.loading')}</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                <th className="px-5 py-3 text-left font-medium">{t('blog.colTitle')}</th>
                <th className="px-5 py-3 text-left font-medium">{t('blog.colLang')}</th>
                <th className="px-5 py-3 text-left font-medium">{t('blog.colStatus')}</th>
                <th className="px-5 py-3 text-left font-medium">{t('blog.colDate')}</th>
                <th className="px-5 py-3 text-right font-medium">{t('blog.colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900 max-w-xs truncate">{post.title}</td>
                  <td className="px-5 py-3 text-xs uppercase text-gray-400">{post.locale}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${post.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {post.is_published ? t('blog.statusPublished') : t('blog.statusDraft')}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400">
                    {post.published_at ? new Date(post.published_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setEditingId(post.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                        {t('common.edit')}
                      </button>
                      <button onClick={() => { if (confirm(t('blog.deleteConfirm'))) remove.mutate(post.id) }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                        {t('common.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">{t('blog.empty')}</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
