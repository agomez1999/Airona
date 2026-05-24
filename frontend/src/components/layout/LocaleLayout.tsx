import { useEffect } from 'react'
import { Outlet, useParams, Navigate } from 'react-router-dom'
import { LOCALES, type Locale } from '@/config/routes'
import { setLocale } from '@/i18n/config'
import { Header } from './Header'
import { Footer } from './Footer'

interface Props {
  transparentHeader?: boolean
}

export function LocaleLayout({ transparentHeader = false }: Props) {
  const { lang } = useParams<{ lang: string }>()
  if (!lang || !LOCALES.includes(lang as Locale)) {
    return <Navigate to="/es/" replace />
  }

  const locale = lang as Locale

  useEffect(() => {
    setLocale(locale)
    document.documentElement.lang = locale
  }, [locale])

  return (
    <>
      <Header locale={locale} transparent={transparentHeader} />
      <main className="flex-1">
        <Outlet context={{ locale }} />
      </main>
      <Footer locale={locale} />
    </>
  )
}

// Typed helper for useOutletContext
export type LocaleContext = { locale: Locale }
