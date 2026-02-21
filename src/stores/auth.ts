import { defineStore } from 'pinia'
import type { User, TokenResult } from '@/backend/AttendMeBackendClientBase'
import { AttendMeBackendClient } from '@/backend/AttendMeBackendClient'

const client = new AttendMeBackendClient('https://attendme-backend.runasp.net')

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    // 🔐 LOGIN
    async login(login: string, password: string) {
      this.loading = true
      this.error = null

      try {
        const tokenResult: TokenResult = await client.userLogin(login, password)

        // zapis tokena
        sessionStorage.setItem('attend-me:userAuthData', JSON.stringify(tokenResult))

        // pobranie danych użytkownika
        this.user = await client.userGet(undefined)
      } catch {
        this.user = null
        this.error = 'Nieprawidłowy login lub hasło'
        throw new Error('login failed')
      } finally {
        this.loading = false
      }
    },

    // 🔁 Przywracanie sesji po refreshu
    async loginFromStorage() {
      const raw = sessionStorage.getItem('attend-me:userAuthData')

      if (!raw) {
        this.user = null
        return
      }

      try {
        this.user = await client.userGet(undefined)
      } catch {
        this.user = null
        sessionStorage.removeItem('attend-me:userAuthData')
        throw new Error('invalid token')
      }
    },

    // 🚪 Logout
    logout() {
      this.user = null
      sessionStorage.removeItem('attend-me:userAuthData')
    },
  },
})
