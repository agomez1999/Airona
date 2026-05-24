import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AdminUser } from '@/services/api/types/experience.types'
import { getCsrfCookie, getMe, login as apiLogin, logout as apiLogout } from '@/services/api/endpoints'

interface AuthState {
  user: AdminUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          await getCsrfCookie()
          const { data } = await apiLogin(email, password)
          set({ user: data.data, isAuthenticated: true })
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        try {
          await apiLogout()
        } finally {
          set({ user: null, isAuthenticated: false })
        }
      },

      fetchMe: async () => {
        try {
          const { data } = await getMe()
          set({ user: data.data, isAuthenticated: true })
        } catch {
          set({ user: null, isAuthenticated: false })
        }
      },
    }),
    {
      name: 'airona_auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
