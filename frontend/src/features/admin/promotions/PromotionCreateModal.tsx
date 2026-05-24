import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { adminCreatePromotion } from '@/services/api/endpoints'
import type { CreatePromotionPayload } from '@/services/api/endpoints'
import { BaseModal } from '@/components/ui/BaseModal'

const empty = (): CreatePromotionPayload => ({
  code: '',
  discount_type: 'percentage',
  discount_value: 0,
  is_active: true,
})

interface Props {
  open: boolean
  onClose: () => void
}

export function PromotionCreateModal({ open, onClose }: Props) {
  const { t } = useTranslation('admin')
  const qc = useQueryClient()
  const [form, setForm] = useState<CreatePromotionPayload>(empty)

  const set = <K extends keyof CreatePromotionPayload>(k: K, v: CreatePromotionPayload[K]) =>
    setForm(p => ({ ...p, [k]: v }))

  const create = useMutation({
    mutationFn: adminCreatePromotion,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'promotions'] })
      setForm(empty())
      onClose()
    },
  })

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={t('promotions.new')}
      size="md"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {t('promotions.formCancel')}
          </button>
          <button
            onClick={() => create.mutate(form)}
            disabled={create.isPending || !form.code}
            className="px-5 py-2 rounded-lg bg-brand-gold text-white text-sm font-semibold hover:bg-brand-gold/90 disabled:opacity-60 transition-colors"
          >
            {create.isPending ? t('promotions.formSaving') : t('promotions.formSave')}
          </button>
        </>
      }
    >
      <div className="px-6 py-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('promotions.formCode')}</label>
            <input
              value={form.code}
              onChange={e => set('code', e.target.value.toUpperCase())}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
              placeholder="SUMMER20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('promotions.formType')}</label>
            <select
              value={form.discount_type}
              onChange={e => set('discount_type', e.target.value as 'percentage' | 'fixed')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
            >
              <option value="percentage">{t('promotions.formPercentage')}</option>
              <option value="fixed">{t('promotions.formFixed')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {form.discount_type === 'percentage' ? t('promotions.formDiscountPct') : t('promotions.formDiscountFixed')}
            </label>
            <input
              type="number" min="0"
              step={form.discount_type === 'percentage' ? '1' : '0.01'}
              value={form.discount_value}
              onChange={e => set('discount_value', Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('promotions.formMinOrder')}</label>
            <input
              type="number" min="0" step="0.01"
              value={form.min_order_cents ? form.min_order_cents / 100 : ''}
              onChange={e => set('min_order_cents', e.target.value ? Math.round(Number(e.target.value) * 100) : undefined)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('promotions.formValidFrom')}</label>
            <input
              type="date"
              value={form.valid_from ?? ''}
              onChange={e => set('valid_from', e.target.value || undefined)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('promotions.formValidUntil')}</label>
            <input
              type="date"
              value={form.valid_until ?? ''}
              onChange={e => set('valid_until', e.target.value || undefined)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('promotions.formMaxUses')}</label>
            <input
              type="number" min="1"
              value={form.max_uses ?? ''}
              onChange={e => set('max_uses', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
              placeholder={t('promotions.formUnlimited')}
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={e => set('is_active', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-brand-gold focus:ring-brand-gold"
              />
              {t('promotions.formActive')}
            </label>
          </div>
        </div>
        {create.isError && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {(create.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error saving promotion.'}
          </p>
        )}
      </div>
    </BaseModal>
  )
}
