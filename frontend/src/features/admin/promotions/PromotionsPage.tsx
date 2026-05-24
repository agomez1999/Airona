import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { adminGetPromotions, adminDeletePromotion } from '@/services/api/endpoints'
import type { AdminPromotion } from '@/services/api/endpoints'
import { PromotionCreateModal } from './PromotionCreateModal'
import { PromotionEditModal } from './PromotionEditModal'
import { listItem } from '@/lib/motion'

export function PromotionsPage() {
  const { t } = useTranslation('admin')
  const qc = useQueryClient()
  const [creating, setCreating] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<AdminPromotion | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'promotions'],
    queryFn: () => adminGetPromotions().then(r => r.data),
    staleTime: 1000 * 60 * 5,
  })

  const remove = useMutation({
    mutationFn: adminDeletePromotion,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'promotions'] }),
  })

  const promotions = data?.data ?? []

  function formatDiscount(p: AdminPromotion) {
    return p.discount_type === 'percentage' ? `${p.discount_value}%` : `€${(p.discount_value / 100).toFixed(2)}`
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="admin-page-title">{t('promotions.title')}</h1>
        <button onClick={() => setCreating(true)}
          className="px-4 py-2 rounded-lg bg-brand-gold text-white text-sm font-semibold hover:bg-brand-gold/90 transition-colors">
          {t('promotions.new')}
        </button>
      </div>

      <PromotionCreateModal open={creating} onClose={() => setCreating(false)} />

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm animate-pulse">{t('common.loading')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                  <th className="px-5 py-3 text-left font-medium">{t('promotions.colCode')}</th>
                  <th className="px-5 py-3 text-left font-medium">{t('promotions.colDiscount')}</th>
                  <th className="px-5 py-3 text-left font-medium">{t('promotions.colValidity')}</th>
                  <th className="px-5 py-3 text-left font-medium">{t('promotions.colUsage')}</th>
                  <th className="px-5 py-3 text-left font-medium">{t('promotions.colStatus')}</th>
                  <th className="px-5 py-3 text-right font-medium">{t('promotions.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {promotions.map((p, idx) => (
                  <motion.tr key={p.id} className="hover:bg-gray-50/50 transition-colors" variants={listItem} custom={idx} initial="hidden" animate="visible">
                    <td className="px-5 py-3 font-mono font-bold text-brand-gold">{p.code}</td>
                    <td className="px-5 py-3 font-medium">{formatDiscount(p)}</td>
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {p.valid_from ? new Date(p.valid_from).toLocaleDateString() : '∞'}
                      {' – '}
                      {p.valid_until ? new Date(p.valid_until).toLocaleDateString() : '∞'}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {p.used_count}{p.max_uses ? ` / ${p.max_uses}` : ' / ∞'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.is_active ? t('promotions.active') : t('promotions.inactive')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditingPromotion(p)}
                          className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                          {t('common.edit')}
                        </button>
                        <button onClick={() => { if (confirm(t('promotions.deleteConfirm', { code: p.code }))) remove.mutate(p.id) }}
                          className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                          {t('common.delete')}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {promotions.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">{t('promotions.empty')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PromotionEditModal promotion={editingPromotion} onClose={() => setEditingPromotion(null)} />
    </div>
  )
}
