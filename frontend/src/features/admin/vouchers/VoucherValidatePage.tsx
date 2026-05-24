import { useState, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { adminValidateVoucher, adminRedeemVoucher } from '@/services/api/endpoints'
import type { AdminVoucher } from '@/services/api/endpoints'

const STATUS_BADGES: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  pending_payment: 'bg-blue-100 text-blue-700',
  redeemed: 'bg-purple-100 text-purple-700',
  expired: 'bg-gray-100 text-gray-500',
  refunded: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-red-100 text-red-600',
}

export function VoucherValidatePage() {
  const { t, i18n } = useTranslation('admin')
  const [code, setCode] = useState('')
  const [voucher, setVoucher] = useState<AdminVoucher | null>(null)
  const [step, setStep] = useState<'input' | 'preview' | 'done'>('input')
  const [redeemError, setRedeemError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const validate = useMutation({
    mutationFn: (c: string) => adminValidateVoucher(c).then(r => r.data.data),
    onSuccess: (v) => {
      setVoucher(v)
      setStep('preview')
      setRedeemError('')
    },
    onError: () => {
      setVoucher(null)
      setRedeemError(t('validate.notFoundError'))
    },
  })

  const redeem = useMutation({
    mutationFn: (c: string) => adminRedeemVoucher(c).then(r => r.data.data),
    onSuccess: (v) => {
      setVoucher(v)
      setStep('done')
      setRedeemError('')
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setRedeemError(msg ?? t('validate.notFoundError'))
    },
  })

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return
    validate.mutate(trimmed)
  }

  function handleReset() {
    setCode('')
    setVoucher(null)
    setStep('input')
    setRedeemError('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="admin-page-title">{t('validate.title')}</h1>

      {/* Step 1: code input */}
      {step === 'input' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-5">
          <p className="text-sm text-gray-500">{t('validate.description')}</p>

          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-xs font-medium text-gray-500 mb-2">
                {t('validate.codeLabel')}
              </label>
              <input
                ref={inputRef}
                id="code"
                type="text"
                autoFocus
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="AIRONA-XXXX-XXXX-XXXX"
                className="w-full font-mono border border-gray-200 rounded-xl px-4 py-3 text-base text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-gold/30 uppercase"
              />
            </div>
            {redeemError && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{redeemError}</p>
            )}
            <button
              type="submit"
              disabled={!code.trim() || validate.isPending}
              className="w-full py-3 rounded-xl bg-brand-gold text-white font-semibold hover:bg-brand-gold/90 transition-colors disabled:opacity-60"
            >
              {validate.isPending ? t('validate.lookingUp') : t('validate.lookUp')}
            </button>
          </form>

          {/* QR scanner hint */}
          <div className="border border-dashed border-gray-200 rounded-xl p-5 text-center text-sm text-gray-400">
            <div className="text-2xl mb-2">📷</div>
            <p>{t('validate.qrHint')}</p>
          </div>
        </div>
      )}

      {/* Step 2: preview before redeeming */}
      {step === 'preview' && voucher && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-5">
          <div className="text-center">
            <code className="font-mono text-xl font-bold text-brand-gold">{voucher.code}</code>
            <div className="mt-2">
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${STATUS_BADGES[voucher.status] ?? 'bg-gray-100 text-gray-500'}`}>
                {voucher.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            {voucher.customer_email && (
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-400">{t('validate.detailCustomer')}</span>
                <span className="text-gray-700 font-medium">{voucher.customer_email}</span>
              </div>
            )}
            {voucher.product_name && (
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-400">{t('validate.detailExperience')}</span>
                <span className="text-gray-700 font-medium">{voucher.product_name}</span>
              </div>
            )}
            {voucher.expires_at && (
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-400">{t('validate.detailExpires')}</span>
                <span className={`font-medium ${new Date(voucher.expires_at) < new Date() ? 'text-red-600' : 'text-gray-700'}`}>
                  {new Date(voucher.expires_at).toLocaleDateString(i18n.language)}
                </span>
              </div>
            )}
          </div>

          {redeemError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{redeemError}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
            >
              {t('validate.cancel')}
            </button>
            {voucher.status === 'active' ? (
              <button
                onClick={() => redeem.mutate(voucher.code)}
                disabled={redeem.isPending}
                className="flex-1 py-3 rounded-xl bg-brand-gold text-white font-semibold hover:bg-brand-gold/90 transition-colors disabled:opacity-60"
              >
                {redeem.isPending ? t('validate.redeeming') : t('validate.confirmRedemption')}
              </button>
            ) : (
              <div className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-400 font-semibold text-center text-sm">
                {t('validate.cannotRedeem')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: success */}
      {step === 'done' && voucher && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-4">
          <div className="text-5xl">✅</div>
          <h2 className="text-xl font-display font-bold text-brand-dusk">{t('validate.successTitle')}</h2>
          <code className="font-mono text-brand-gold">{voucher.code}</code>
          <p className="text-sm text-gray-500">
            {t('validate.redeemedAt')} {voucher.redeemed_at ? new Date(voucher.redeemed_at).toLocaleString(i18n.language) : new Date().toLocaleString(i18n.language)}
          </p>
          <button
            onClick={handleReset}
            className="w-full py-3 rounded-xl bg-brand-gold text-white font-semibold hover:bg-brand-gold/90 transition-colors"
          >
            {t('validate.validateAnother')}
          </button>
        </div>
      )}
    </div>
  )
}
