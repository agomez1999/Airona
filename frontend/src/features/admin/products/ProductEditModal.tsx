import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminCreateProduct, adminUpdateProduct } from '@/services/api/endpoints'
import type { AdminProduct } from '@/services/api/endpoints'
import type { ProductType } from '@/services/api/types/experience.types'
import { LOCALES, LOCALE_LABELS } from '@/config/routes'
import { BaseModal } from '@/components/ui/BaseModal'

interface Props {
  product: AdminProduct | null
  onClose: () => void
}

interface TranslationForm {
  name: string
  slug: string
  short_description: string
  description: string
  meta_title: string
  meta_description: string
}

type TranslationForms = Record<string, TranslationForm>

const emptyTranslation = (): TranslationForm => ({
  name: '', slug: '', short_description: '', description: '', meta_title: '', meta_description: '',
})

export function ProductEditModal({ product, onClose }: Props) {
  const { t } = useTranslation('admin')
  const qc = useQueryClient()

  const [activeLocale, setActiveLocale] = useState<string>('es')
  const [price, setPrice] = useState(product ? String(product.price_cents / 100) : '')
  const [salePrice, setSalePrice] = useState(product?.sale_price_cents ? String(product.sale_price_cents / 100) : '')
  const [type, setType] = useState<ProductType>(product?.type ?? 'shared')
  const [capacity, setCapacity] = useState(product?.capacity ? String(product.capacity) : '')
  const [duration, setDuration] = useState(product?.duration_minutes ? String(product.duration_minutes) : '')
  const [sku, setSku] = useState(product?.sku ?? '')
  const [translations, setTranslations] = useState<TranslationForms>(() => {
    const forms: TranslationForms = {}
    for (const l of LOCALES) {
      const t = product?.translations?.[l]
      forms[l] = t ? {
        name: t.name ?? '',
        slug: t.slug ?? '',
        short_description: t.short_description ?? '',
        description: t.description ?? '',
        meta_title: t.meta_title ?? '',
        meta_description: t.meta_description ?? '',
      } : emptyTranslation()
    }
    return forms
  })
  const [error, setError] = useState('')

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        sku,
        type,
        price_cents: Math.round(Number(price) * 100),
        sale_price_cents: salePrice ? Math.round(Number(salePrice) * 100) : null,
        capacity: capacity ? Number(capacity) : null,
        duration_minutes: duration ? Number(duration) : null,
        translations,
      }
      return product
        ? adminUpdateProduct(product.id, payload)
        : adminCreateProduct(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      onClose()
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Failed to save product.')
    },
  })

  function updateTranslation(field: keyof TranslationForm, value: string) {
    setTranslations(prev => ({
      ...prev,
      [activeLocale]: { ...prev[activeLocale], [field]: value },
    }))
  }

  const trans = translations[activeLocale] ?? emptyTranslation()

  return (
    <BaseModal
      open
      onClose={onClose}
      title={product ? t('products.editTitle') : t('products.newTitle')}
      size="md"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={() => save.mutate()}
            disabled={save.isPending}
            className="px-5 py-2 rounded-lg bg-brand-gold text-white text-sm font-semibold hover:bg-brand-gold/90 transition-colors disabled:opacity-60"
          >
            {save.isPending ? t('common.saving') : t('products.save')}
          </button>
        </>
      }
    >
      <div className="px-6 py-5 space-y-5">
        {/* Base fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('products.fieldSku')}</label>
            <input value={sku} onChange={e => setSku(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30" placeholder="e.g. SHARED-001" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('products.fieldType')}</label>
            <select value={type} onChange={e => setType(e.target.value as ProductType)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30">
              <option value="shared">{t('products.typeShared')}</option>
              <option value="private">{t('products.typePrivate')}</option>
              <option value="gift">{t('products.typeGift')}</option>
              <option value="special">{t('products.typeSpecial')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('products.fieldPrice')}</label>
            <input type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30" placeholder="149.00" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('products.fieldSalePrice')}</label>
            <input type="number" step="0.01" min="0" value={salePrice} onChange={e => setSalePrice(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30" placeholder="129.00" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('products.fieldCapacity')}</label>
            <input type="number" min="1" value={capacity} onChange={e => setCapacity(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30" placeholder="8" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('products.fieldDuration')}</label>
            <input type="number" min="1" value={duration} onChange={e => setDuration(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30" placeholder="60" />
          </div>
        </div>

        {/* Translations */}
        <div>
          <div className="flex border-b border-gray-100 mb-4">
            {LOCALES.map(l => (
              <button
                key={l}
                onClick={() => setActiveLocale(l)}
                className={`px-4 py-2 text-xs font-semibold transition-colors border-b-2 -mb-px ${
                  activeLocale === l
                    ? 'border-brand-gold text-brand-gold'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {LOCALE_LABELS[l]}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('products.fieldName')}</label>
                <input value={trans.name} onChange={e => updateTranslation('name', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('products.fieldSlug')}</label>
                <input value={trans.slug} onChange={e => updateTranslation('slug', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('products.fieldShortDesc')}</label>
              <textarea rows={2} value={trans.short_description} onChange={e => updateTranslation('short_description', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('products.fieldDescription')}</label>
              <textarea rows={5} value={trans.description} onChange={e => updateTranslation('description', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 resize-y font-mono text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('products.fieldMetaTitle')}</label>
                <input value={trans.meta_title} onChange={e => updateTranslation('meta_title', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('products.fieldMetaDesc')}</label>
                <input value={trans.meta_description} onChange={e => updateTranslation('meta_description', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30" />
              </div>
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      </div>
    </BaseModal>
  )
}
