import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import type { Locale } from '@/config/routes'

// Eagerly import all locale files so SSG can pre-render without HTTP requests
import esCommon from './locales/es/common.json'
import esHome from './locales/es/home.json'
import esSeo from './locales/es/seo.json'
import esAdmin from './locales/es/admin.json'
import esCheckout from './locales/es/checkout.json'
import esExperiences from './locales/es/experiences.json'
import esFaq from './locales/es/faq.json'
import esContact from './locales/es/contact.json'
import esConfirmation from './locales/es/confirmation.json'

import caCommon from './locales/ca/common.json'
import caHome from './locales/ca/home.json'
import caSeo from './locales/ca/seo.json'
import caAdmin from './locales/ca/admin.json'
import caCheckout from './locales/ca/checkout.json'
import caExperiences from './locales/ca/experiences.json'
import caFaq from './locales/ca/faq.json'
import caContact from './locales/ca/contact.json'
import caConfirmation from './locales/ca/confirmation.json'

import frCommon from './locales/fr/common.json'
import frHome from './locales/fr/home.json'
import frSeo from './locales/fr/seo.json'
import frAdmin from './locales/fr/admin.json'
import frCheckout from './locales/fr/checkout.json'
import frExperiences from './locales/fr/experiences.json'
import frFaq from './locales/fr/faq.json'
import frContact from './locales/fr/contact.json'
import frConfirmation from './locales/fr/confirmation.json'

import enCommon from './locales/en/common.json'
import enHome from './locales/en/home.json'
import enSeo from './locales/en/seo.json'
import enAdmin from './locales/en/admin.json'
import enCheckout from './locales/en/checkout.json'
import enExperiences from './locales/en/experiences.json'
import enFaq from './locales/en/faq.json'
import enContact from './locales/en/contact.json'
import enConfirmation from './locales/en/confirmation.json'

const resources = {
  es: { common: esCommon, home: esHome, seo: esSeo, admin: esAdmin, checkout: esCheckout, experiences: esExperiences, faq: esFaq, contact: esContact, confirmation: esConfirmation },
  ca: { common: caCommon, home: caHome, seo: caSeo, admin: caAdmin, checkout: caCheckout, experiences: caExperiences, faq: caFaq, contact: caContact, confirmation: caConfirmation },
  fr: { common: frCommon, home: frHome, seo: frSeo, admin: frAdmin, checkout: frCheckout, experiences: frExperiences, faq: frFaq, contact: frContact, confirmation: frConfirmation },
  en: { common: enCommon, home: enHome, seo: enSeo, admin: enAdmin, checkout: enCheckout, experiences: enExperiences, faq: enFaq, contact: enContact, confirmation: enConfirmation },
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'es',
  fallbackLng: 'es',
  ns: ['common', 'home', 'seo', 'admin', 'checkout', 'experiences', 'faq', 'contact', 'confirmation'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
})

export function setLocale(locale: Locale) {
  if (i18n.language !== locale) {
    void i18n.changeLanguage(locale)
  }
}

export default i18n
