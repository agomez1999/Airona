import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  adminGetVouchers, adminGetVoucher, adminGetVoucherAuditLog,
  adminRedeemVoucher, adminCancelVoucher, adminResendVoucherEmail,
} from '@/services/api/endpoints'
import { BaseModal } from '@/components/ui/BaseModal'
import type { AdminVoucherFilters } from '@/services/api/endpoints'

const STATUS_BADGES: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  pending_payment: 'bg-blue-100 text-blue-700',
  redeemed: 'bg-purple-100 text-purple-700',
  expired: 'bg-gray-100 text-gray-500',
  refunded: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-red-100 text-red-600',
}

export function VouchersPage() {
  const { t, i18n } = useTranslation('admin')
  const qc = useQueryClient()
  const [filters, setFilters] = useState<AdminVoucherFilters>({ page: 1, per_page: 20 })
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const [showAuditLog, setShowAuditLog] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'vouchers', filters],
    queryFn: () => adminGetVouchers(filters).then(r => r.data),
    staleTime: 1000 * 60 * 2,
  })

  const { data: voucherDetail } = useQuery({
    queryKey: ['admin', 'vouchers', 'detail', selectedCode],
    queryFn: () => adminGetVoucher(selectedCode!).then(r => r.data.data),
    enabled: !!selectedCode,
  })

  const { data: auditLog } = useQuery({
    queryKey: ['admin', 'vouchers', 'audit', selectedCode],
    queryFn: () => adminGetVoucherAuditLog(selectedCode!).then(r => r.data.data),
    enabled: !!selectedCode && showAuditLog,
  })

  const redeem = useMutation({
    mutationFn: (code: string) => adminRedeemVoucher(code),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'vouchers'] }),
  })

  const cancel = useMutation({
    mutationFn: (code: string) => adminCancelVoucher(code),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'vouchers'] }),
  })

  const resendEmail = useMutation({
    mutationFn: (code: string) => adminResendVoucherEmail(code),
  })

  const vouchers = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-5">
      <h1 className="admin-page-title">{t('vouchers.title')}</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder={t('vouchers.search')}
          value={filters.search ?? ''}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 w-56"
        />
        <select
          value={filters.status ?? ''}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value || undefined, page: 1 }))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
        >
          <option value="">{t('vouchers.allStatuses')}</option>
          <option value="active">{t('vouchers.statusActive')}</option>
          <option value="pending_payment">{t('vouchers.statusPending')}</option>
          <option value="redeemed">{t('vouchers.statusRedeemed')}</option>
          <option value="expired">{t('vouchers.statusExpired')}</option>
          <option value="refunded">{t('vouchers.statusRefunded')}</option>
          <option value="cancelled">{t('vouchers.statusCancelled')}</option>
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
                  <th className="px-5 py-3 text-left font-medium">{t('vouchers.colCode')}</th>
                  <th className="px-5 py-3 text-left font-medium">{t('vouchers.colCustomer')}</th>
                  <th className="px-5 py-3 text-left font-medium">{t('vouchers.colProduct')}</th>
                  <th className="px-5 py-3 text-left font-medium">{t('vouchers.colStatus')}</th>
                  <th className="px-5 py-3 text-left font-medium">{t('vouchers.colExpires')}</th>
                  <th className="px-5 py-3 text-right font-medium">{t('vouchers.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {vouchers.map(v => (
                  <tr key={v.code} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-brand-gold">{v.code}</td>
                    <td className="px-5 py-3 text-gray-600 text-xs">{v.customer_email ?? '—'}</td>
                    <td className="px-5 py-3 text-gray-700 text-xs">{v.product_name ?? '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGES[v.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {v.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {v.expires_at ? new Date(v.expires_at).toLocaleDateString(i18n.language) : '—'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => { setSelectedCode(v.code); setShowAuditLog(false) }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        {t('vouchers.view')}
                      </button>
                    </td>
                  </tr>
                ))}
                {vouchers.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">{t('vouchers.empty')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {meta && meta.last_page > 1 && (
          <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {t('vouchers.pagination', { current: meta.current_page, total: meta.last_page, count: meta.total })}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setFilters(f => ({ ...f, page: (f.page ?? 1) - 1 }))} disabled={meta.current_page === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-40">{t('common.prev')}</button>
              <button onClick={() => setFilters(f => ({ ...f, page: (f.page ?? 1) + 1 }))} disabled={meta.current_page === meta.last_page}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-40">{t('common.next')}</button>
            </div>
          </div>
        )}
      </div>

      {/* Voucher detail modal */}
      <BaseModal
        open={!!selectedCode}
        onClose={() => { setSelectedCode(null); setShowAuditLog(false) }}
        title={voucherDetail?.code ?? selectedCode ?? ''}
        size="md"
        footer={
          voucherDetail ? (
            <>
              {voucherDetail.status === 'active' && (
                <button
                  onClick={() => { if (confirm(t('vouchers.redeemConfirm'))) redeem.mutate(voucherDetail.code) }}
                  disabled={redeem.isPending}
                  className="px-5 py-2.5 rounded-lg bg-brand-gold text-white text-sm font-semibold hover:bg-brand-gold/90 transition-colors disabled:opacity-60"
                >
                  {t('vouchers.markRedeemed')}
                </button>
              )}
              <button
                onClick={() => { if (confirm(t('vouchers.resendEmail') + '?')) resendEmail.mutate(voucherDetail.code) }}
                disabled={resendEmail.isPending}
                className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-60"
              >
                {resendEmail.isSuccess ? t('vouchers.emailSent') : t('vouchers.resendEmail')}
              </button>
              {['active', 'pending_payment'].includes(voucherDetail.status) && (
                <button
                  onClick={() => { if (confirm(t('vouchers.cancelConfirm'))) cancel.mutate(voucherDetail.code) }}
                  disabled={cancel.isPending}
                  className="px-5 py-2.5 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-60"
                >
                  {t('vouchers.cancel')}
                </button>
              )}
            </>
          ) : undefined
        }
      >
        {!voucherDetail ? (
          <div className="p-6 space-y-4 animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-1/2" />
            <div className="h-4 bg-gray-100 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-2/3" />
            <div className="h-4 bg-gray-100 rounded w-1/3" />
          </div>
        ) : (
          <div className="p-6 space-y-5">
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${STATUS_BADGES[voucherDetail.status] ?? 'bg-gray-100 text-gray-500'}`}>
              {voucherDetail.status.replace('_', ' ')}
            </span>

            <div className="space-y-2 text-sm">
              {voucherDetail.customer_email && <VRow label={t('vouchers.detailCustomer')} value={voucherDetail.customer_email} />}
              {voucherDetail.product_name && <VRow label={t('vouchers.detailProduct')} value={voucherDetail.product_name} />}
              {voucherDetail.order_number && <VRow label={t('vouchers.detailOrder')} value={voucherDetail.order_number} />}
              {voucherDetail.expires_at && <VRow label={t('vouchers.detailExpires')} value={new Date(voucherDetail.expires_at).toLocaleDateString(i18n.language)} />}
              {voucherDetail.redeemed_at && <VRow label={t('vouchers.detailRedeemed')} value={new Date(voucherDetail.redeemed_at).toLocaleString(i18n.language)} />}
              <VRow label={t('vouchers.detailEmailSent')} value={voucherDetail.email_sent_at ? new Date(voucherDetail.email_sent_at).toLocaleString(i18n.language) : t('vouchers.detailEmailNone')} />
              <VRow label={t('vouchers.detailPdf')} value={voucherDetail.pdf_path ? t('vouchers.detailPdfOk') : t('vouchers.detailPdfNone')} />
            </div>

            {/* Audit log toggle */}
            <button
              onClick={() => setShowAuditLog(v => !v)}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              {showAuditLog ? t('vouchers.hideAudit') : t('vouchers.showAudit')}
            </button>
            {showAuditLog && auditLog && (
              <div className="space-y-2 mt-2">
                {auditLog.map(entry => (
                  <div key={entry.id} className="bg-gray-50 rounded-lg p-3 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-700">{entry.action}</span>
                      <span className="text-gray-400">{new Date(entry.created_at).toLocaleString(i18n.language)}</span>
                    </div>
                    <span className="text-gray-500">{entry.actor_type}{entry.actor_name ? ` · ${entry.actor_name}` : ''}</span>
                  </div>
                ))}
                {auditLog.length === 0 && <p className="text-xs text-gray-400">{t('vouchers.noAudit')}</p>}
              </div>
            )}
          </div>
        )}
      </BaseModal>
    </div>
  )
}

function VRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-gray-50">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-700 font-medium">{value}</span>
    </div>
  )
}
