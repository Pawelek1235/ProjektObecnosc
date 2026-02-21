import { defineStore } from 'pinia'
import type { User } from '@/backend/AttendMeBackendClientBase'
import { AttendMeBackendClient } from '@/backend/AttendMeBackendClient'

const client = new AttendMeBackendClient('https://attendme-backend.runasp.net')
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async login(login: string, password: string) {
      this.loading = true
      this.error = null

      try {
        await client.userLogin(login, password)
        this.user = await client.userGet(undefined)
      } catch {
        this.user = null
        this.error = 'Nieprawidłowy login lub hasło'
        throw new Error('login failed')
      } finally {
        this.loading = false
      }
    },

    async init() {
      try {
        this.user = await client.userGet(undefined)
      } catch {
        this.user = null
      }
    },

    logout() {
      this.user = null
      client.userTokenResult = undefined
      sessionStorage.removeItem('attend-me:userAuthData')
    },
  },
})
