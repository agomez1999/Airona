import { useParams, Navigate } from 'react-router-dom'
import { useOutletContext } from 'react-router-dom'
import type { LocaleContext } from '@/components/layout/LocaleLayout'
import { resolveSlug } from '@/config/routes'
import { ExperiencesPage } from '@/features/experiences/ExperiencesPage'
import { ExperienceDetailPage } from '@/features/experiences/ExperienceDetailPage'
import { FlightZonePage } from '@/features/flight-zone/FlightZonePage'
import { AboutPage } from '@/features/about/AboutPage'
import { FaqPage } from '@/features/faq/FaqPage'
import { ContactPage } from '@/features/contact/ContactPage'
import { CartPage } from '@/features/cart/CartPage'

export function SlugRouter() {
  const { locale } = useOutletContext<LocaleContext>()
  const { slug = '' } = useParams<{ slug: string }>()
  const key = resolveSlug(locale, slug)

  switch (key) {
    case 'experiences':    return <ExperiencesPage />
    case 'sharedFlight':   return <ExperienceDetailPage type="shared" />
    case 'privateFlight':  return <ExperienceDetailPage type="private" />
    case 'gift':           return <ExperienceDetailPage type="gift" />
    case 'flightZone':     return <FlightZonePage />
    case 'about':          return <AboutPage />
    case 'faq':            return <FaqPage />
    case 'contact':        return <ContactPage />
    case 'cart':           return <CartPage />
    default:               return <Navigate to={`/${locale}/`} replace />
  }
}
