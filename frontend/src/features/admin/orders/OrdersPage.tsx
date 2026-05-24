import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { adminGetOrders, adminGetOrder, adminRefundOrder } from '@/services/api/endpoints'
import { formatCurrency } from '@/lib/formatCurrency'
import { BaseModal } from '@/components/ui/BaseModal'
import type { AdminOrderFilters } from '@/services/api/endpoints'

const STATUS_BADGES: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  pending_payment: 'bg-blue-100 text-blue-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-gray-100 text-gray-600',
}

export function OrdersPage() {
  const { t, i18n } = useTranslation('admin')
  const qc = useQueryClient()
  const [filters, setFilters] = useState<AdminOrderFilters>({ page: 1, per_page: 20 })
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', filters],
    queryFn: () => adminGetOrders(filters).then(r => r.data),
    staleTime: 1000 * 60 * 2,
  })

  const { data: orderDetail } = useQuery({
    queryKey: ['admin', 'orders', selectedId],
    queryFn: () => adminGetOrder(selectedId!).then(r => r.data.data),
    enabled: !!selectedId,
  })

  const refund = useMutation({
    mutationFn: (id: string) => adminRefundOrder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] })
      setSelectedId(null)
    },
  })

  const orders = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-5">
      <h1 className="admin-page-title">{t('orders.title')}</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder={t('orders.search')}
          value={filters.search ?? ''}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 w-56"
        />
        <select
          value={filters.status ?? ''}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value || undefined, page: 1 }))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
        >
          <option value="">{t('orders.allStatuses')}</option>
          <option value="paid">{t('orders.statusPaid')}</option>
          <option value="pending_payment">{t('orders.statusPending')}</option>
          <option value="refunded">{t('orders.statusRefunded')}</option>
          <option value="cancelled">{t('orders.statusCancelled')}</option>
          <option value="failed">{t('orders.statusFailed')}</option>
        </select>
        <input type="date" value={filters.from ?? ''} onChange={e => setFilters(f => ({ ...f, from: e.target.value || undefined, page: 1 }))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30" />
        <input type="date" value={filters.to ?? ''} onChange={e => setFilters(f => ({ ...f, to: e.target.value || undefined, page: 1 }))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm animate-pulse">{t('common.loading')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                  <th className="px-5 py-3 text-left font-medium">{t('orders.colOrder')}</th>
                  <th className="px-5 py-3 text-left font-medium">{t('orders.colCustomer')}</th>
                  <th className="px-5 py-3 text-left font-medium">{t('orders.colTotal')}</th>
                  <th className="px-5 py-3 text-left font-medium">{t('orders.colStatus')}</th>
                  <th className="px-5 py-3 text-left font-medium">{t('orders.colDate')}</th>
                  <th className="px-5 py-3 text-right font-medium">{t('orders.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-brand-gold">{order.order_number}</td>
                    <td className="px-5 py-3">
                      <p className="text-gray-900">{order.customer_name}</p>
                      <p className="text-xs text-gray-400">{order.customer_email}</p>
                    </td>
                    <td className="px-5 py-3 font-medium">{formatCurrency(order.total_cents)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGES[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {new Date(order.created_at).toLocaleDateString(i18n.language)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setSelectedId(order.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        {t('orders.view')}
                      </button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">{t('orders.empty')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {t('orders.pagination', { current: meta.current_page, total: meta.last_page, count: meta.total })}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters(f => ({ ...f, page: (f.page ?? 1) - 1 }))}
                disabled={meta.current_page === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 transition-colors"
              >{t('common.prev')}</button>
              <button
                onClick={() => setFilters(f => ({ ...f, page: (f.page ?? 1) + 1 }))}
                disabled={meta.current_page === meta.last_page}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 transition-colors"
              >{t('common.next')}</button>
            </div>
          </div>
        )}
      </div>

      {/* Order detail modal */}
      <BaseModal
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        title={orderDetail?.order_number ?? ''}
        size="md"
        footer={
          orderDetail?.status === 'paid' ? (
            <button
              onClick={() => {
                if (confirm(t('orders.refundConfirm'))) refund.mutate(orderDetail.id)
              }}
              disabled={refund.isPending}
              className="px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
            >
              {refund.isPending ? t('orders.refunding') : t('orders.refund')}
            </button>
          ) : undefined
        }
      >
        {!orderDetail ? (
          <div className="p-6 space-y-4 animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
            <div className="h-4 bg-gray-100 rounded w-2/3" />
            <div className="h-4 bg-gray-100 rounded w-1/3" />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="space-y-3 text-sm">
              <Row label={t('orders.detailCustomer')} value={`${orderDetail.customer_name} · ${orderDetail.customer_email}`} />
              <Row label={t('orders.detailStatus')}>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGES[orderDetail.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {orderDetail.status.replace('_', ' ')}
                </span>
              </Row>
              <Row label={t('orders.detailTotal')} value={formatCurrency(orderDetail.total_cents)} />
              <Row label={t('orders.detailCreated')} value={new Date(orderDetail.created_at).toLocaleString(i18n.language)} />
              {orderDetail.paid_at && <Row label={t('orders.detailPaidAt')} value={new Date(orderDetail.paid_at).toLocaleString(i18n.language)} />}
            </div>

            {orderDetail.items && orderDetail.items.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase text-gray-400 mb-2">{t('orders.sectionItems')}</h3>
                <div className="space-y-2">
                  {orderDetail.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.product_name} × {item.quantity}</span>
                      <span className="font-medium">{formatCurrency(item.subtotal_cents)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {orderDetail.vouchers && orderDetail.vouchers.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase text-gray-400 mb-2">{t('orders.sectionVouchers')}</h3>
                <div className="space-y-1">
                  {orderDetail.vouchers.map(v => (
                    <div key={v.code} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                      <code className="font-mono text-brand-gold">{v.code}</code>
                      <span className="text-xs text-gray-500">{v.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </BaseModal>
    </div>
  )
}

function Row({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-50">
      <span className="text-gray-400">{label}</span>
      {children ?? <span className="text-gray-700 font-medium text-right max-w-xs">{value}</span>}
    </div>
  )
}
