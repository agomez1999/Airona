import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import { useCartStore } from '@/stores/cartStore'
import { createCheckoutSession } from '@/services/api/endpoints'
import type { LocaleContext } from '@/components/layout/LocaleLayout'

export function CheckoutPage() {
  const { locale } = useOutletContext<LocaleContext>()
  const { t } = useTranslation('checkout')
  const { items, promoCode, clearCart } = useCartStore()
  const navigate = useNavigate()

  const schema = useMemo(
    () =>
      z.object({
        customer_email: z.string().min(1, t('validation.emailRequired')).email(t('validation.emailInvalid')),
        customer_name: z.string().min(1, t('validation.nameRequired')).max(255),
        agree_terms: z.literal(true, { message: t('validation.termsRequired') }),
      }),
    [t],
  )

  type FormData = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  if (items.length === 0) {
    navigate(`/${locale}/carrito`)
    return null
  }

  const onSubmit = async (data: FormData) => {
    const origin = window.location.origin

    try {
      const response = await createCheckoutSession({
        items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
        customer_email: data.customer_email,
        customer_name: data.customer_name,
        locale,
        success_url: `${origin}/${locale}/confirmacion/{CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/${locale}/carrito`,
        ...(promoCode ? { promo_code: promoCode } : {}),
      })

      clearCart()
      // External redirect to Stripe hosted checkout — intentional mutation of window.location
      // eslint-disable-next-line react-hooks/immutability
      window.location.href = response.data.data.checkout_url
    } catch (err: unknown) {
      const apiErrors = (err as { response?: { data?: { errors?: Record<string, string[]> } } })
        ?.response?.data?.errors
      if (apiErrors) {
        Object.entries(apiErrors).forEach(([field, messages]) => {
          setError(field as keyof FormData, { message: messages[0] })
        })
      } else {
        setError('root', { message: t('errors.paymentFailed') })
      }
    }
  }

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat(locale === 'en' ? 'en-GB' : `${locale}-ES`, {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100)

  const total = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0)

  return (
    <>
      <Helmet><meta name="robots" content="noindex,nofollow" /></Helmet>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto px-4 py-12">
          <h1 className="text-3xl font-semibold text-gray-900 mb-8">{t('title')}</h1>

          {/* Order summary */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {t('summary')}
            </h2>
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.productId} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium">{formatPrice(item.priceCents * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t mt-3 pt-3 flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('fields.email')} <span className="text-red-500">*</span>
              </label>
              <input
                {...register('customer_email')}
                type="email"
                placeholder={t('fields.emailPlaceholder')}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                disabled={isSubmitting}
              />
              {errors.customer_email && (
                <p className="text-red-500 text-xs mt-1">{errors.customer_email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('fields.name')} <span className="text-red-500">*</span>
              </label>
              <input
                {...register('customer_name')}
                type="text"
                placeholder={t('fields.namePlaceholder')}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                disabled={isSubmitting}
              />
              {errors.customer_name && (
                <p className="text-red-500 text-xs mt-1">{errors.customer_name.message}</p>
              )}
            </div>

            <div className="flex items-start gap-3 pt-2">
              <input
                {...register('agree_terms')}
                id="agree_terms"
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-gray-900"
                disabled={isSubmitting}
              />
              <label htmlFor="agree_terms" className="text-sm text-gray-600">
                {t('terms.accept')}{' '}
                <a href={`/${locale}/terminos`} className="underline hover:text-gray-900">
                  {t('terms.termsLink')}
                </a>{' '}
                {t('terms.and')}{' '}
                <a href={`/${locale}/privacidad`} className="underline hover:text-gray-900">
                  {t('terms.privacyLink')}
                </a>
              </label>
            </div>
            {errors.agree_terms && (
              <p className="text-red-500 text-xs -mt-3">{errors.agree_terms.message}</p>
            )}

            {errors.root && (
              <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                {errors.root.message}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gray-900 text-white py-4 rounded-lg font-semibold text-lg hover:bg-gray-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? t('buttons.redirecting')
                : t('buttons.pay', { amount: formatPrice(total) })}
            </button>

            <p className="text-xs text-gray-400 text-center">
              {t('security')}
            </p>
          </form>
        </div>
      </div>
    </>
  )
}
