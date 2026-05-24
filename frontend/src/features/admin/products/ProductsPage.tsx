import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { adminGetProducts, adminUpdateProduct, adminDeleteProduct } from '@/services/api/endpoints'
import type { AdminProduct } from '@/services/api/endpoints'
import { formatCurrency } from '@/lib/formatCurrency'
import { ProductEditModal } from './ProductEditModal'
import { listItem } from '@/lib/motion'

export function ProductsPage() {
  const { t } = useTranslation('admin')
  const qc = useQueryClient()
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null | 'new'>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => adminGetProducts().then(r => r.data),
    staleTime: 1000 * 60 * 5,
  })

  const toggleVisibility = useMutation({
    mutationFn: ({ id, is_visible }: { id: number; is_visible: boolean }) =>
      adminUpdateProduct(id, { is_visible }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] }),
  })

  const deleteProduct = useMutation({
    mutationFn: (id: number) => adminDeleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] }),
  })

  const typeLabels: Record<string, string> = {
    shared: t('products.typeShared'),
    private: t('products.typePrivate'),
    gift: t('products.typeGift'),
    special: t('products.typeSpecial'),
  }

  const products = data?.data ?? []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="admin-page-title">{t('products.title')}</h1>
        <button
          onClick={() => setEditingProduct('new')}
          className="px-4 py-2 cursor-pointer rounded-lg bg-brand-gold text-white text-sm font-semibold hover:bg-brand-gold/90 transition-colors"
        >
          {t('products.new')}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm animate-pulse">{t('common.loading')}</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                <th className="px-5 py-3 text-left font-medium">{t('products.colProduct')}</th>
                <th className="px-5 py-3 text-left font-medium">{t('products.colType')}</th>
                <th className="px-5 py-3 text-left font-medium">{t('products.colPrice')}</th>
                <th className="px-5 py-3 text-left font-medium">{t('products.colVisible')}</th>
                <th className="px-5 py-3 text-right font-medium">{t('products.colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product, idx) => {
                const name = product.translations?.es?.name ?? product.translations?.en?.name ?? product.sku
                const hero = product.images?.find(i => i.is_hero) ?? product.images?.[0]
                return (
                  <motion.tr key={product.id} className="hover:bg-gray-50/50 transition-colors" variants={listItem} custom={idx} initial="hidden" animate="visible">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {hero ? (
                          <img src={hero.url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-brand-sky/20 flex items-center justify-center text-lg flex-shrink-0">🎈</div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{name}</p>
                          <p className="text-xs text-gray-400">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {typeLabels[product.type] ?? product.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium">
                      {formatCurrency(product.price_cents)}
                      {product.sale_price_cents && (
                        <span className="ml-2 text-xs text-green-600">{formatCurrency(product.sale_price_cents)} {t('products.sale')}</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleVisibility.mutate({ id: product.id, is_visible: !product.is_visible })}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${product.is_visible ? 'bg-brand-gold' : 'bg-gray-200'}`}
                        aria-label={product.is_visible ? t('products.hide') : t('products.show')}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${product.is_visible ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(t('products.deleteConfirm', { name }))) deleteProduct.mutate(product.id)
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                        >
                          {t('common.delete')}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
              {products.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">{t('products.empty')}</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {editingProduct !== null && (
        <ProductEditModal
          product={editingProduct === 'new' ? null : editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  )
}
