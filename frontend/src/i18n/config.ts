import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import type { Locale } from '@/config/routes'

// Eagerly import all locale files so SSG can pre-render without HTTP requests
import esCommon from './locales/es/common.json'
import esHome from './locales/es/home.json'
import esSeo from './locales/es/seo.json'
import esAdmin from './locales/es/admin.json'

import caCommon from './locales/ca/common.json'
import caHome from './locales/ca/home.json'
import caSeo from './locales/ca/seo.json'
import caAdmin from './locales/ca/admin.json'

import frCommon from './locales/fr/common.json'
import frHome from './locales/fr/home.json'
import frSeo from './locales/fr/seo.json'
import frAdmin from './locales/fr/admin.json'

import enCommon from './locales/en/common.json'
import enHome from './locales/en/home.json'
import enSeo from './locales/en/seo.json'
import enAdmin from './locales/en/admin.json'

const resources = {
  es: { common: esCommon, home: esHome, seo: esSeo, admin: esAdmin },
  ca: { common: caCommon, home: caHome, seo: caSeo, admin: caAdmin },
  fr: { common: frCommon, home: frHome, seo: frSeo, admin: frAdmin },
  en: { common: enCommon, home: enHome, seo: enSeo, admin: enAdmin },
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'es',
  fallbackLng: 'es',
  ns: ['common', 'home', 'seo', 'admin'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
})

export function setLocale(locale: Locale) {
  if (i18n.language !== locale) {
    void i18n.changeLanguage(locale)
  }
}

export default i18n
