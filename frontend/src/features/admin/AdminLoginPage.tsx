import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

type FormValues = z.infer<typeof schema>

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated, isLoading } = useAuthStore()
  const { adminLang } = useUiStore()
  const { t, i18n } = useTranslation('admin')

  // Apply the persisted admin language on login page too
  useEffect(() => {
    if (i18n.language !== adminLang) {
      void i18n.changeLanguage(adminLang)
    }
  }, [adminLang, i18n])

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const onSubmit = async (values: FormValues) => {
    try {
      await login(values.email, values.password)
      navigate('/admin', { replace: true })
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 401) {
        setError('root', { message: t('auth.errorInvalid') })
      } else if (status === 403) {
        setError('root', { message: t('auth.errorForbidden') })
      } else {
        setError('root', { message: t('auth.errorGeneric') })
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-brand-cream)' }}>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brand-dusk)' }}>
            {t('auth.title')}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{t('auth.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.email')}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.password')}
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          {errors.root && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {errors.root.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60"
            style={{ backgroundColor: 'var(--color-brand-sunrise)' }}
          >
            {isLoading ? t('auth.signingIn') : t('auth.signIn')}
          </button>
        </form>
      </div>
    </div>
  )
}
