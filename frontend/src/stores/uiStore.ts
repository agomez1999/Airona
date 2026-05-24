import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Locale } from '@/config/routes'

type CookieConsent = 'accepted' | 'essential' | null

interface UiState {
  cookieConsent: CookieConsent
  setCookieConsent: (consent: Exclude<CookieConsent, null>) => void
  adminLang: Locale
  setAdminLang: (lang: Locale) => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      cookieConsent: null,
      setCookieConsent: (consent) => set({ cookieConsent: consent }),
      adminLang: 'es',
      setAdminLang: (lang) => set({ adminLang: lang }),
    }),
    {
      name: 'airona_ui_v1',
      partialize: (state) => ({
        cookieConsent: state.cookieConsent,
        adminLang: state.adminLang,
      }),
    },
  ),
)
