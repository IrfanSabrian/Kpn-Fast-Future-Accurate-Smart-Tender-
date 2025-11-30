import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated,
    currentUser: (state) => state.user,
    userRole: (state) => state.user?.role || null
  },

  actions: {
    async login(credentials) {
      try {
        const config = useRuntimeConfig()
        const { data } = await $fetch(`${config.public.apiBaseUrl}/auth/login`, {
          method: 'POST',
          body: credentials
        })

        this.user = data.user
        this.token = data.token
        this.isAuthenticated = true

        // Save to localStorage
        if (process.client) {
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))
        }

        return { success: true, data }
      } catch (error) {
        console.error('Login error:', error)
        return { success: false, error: error.message }
      }
    },

    async logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false

      if (process.client) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }

      navigateTo('/login')
    },

    async checkAuth() {
      if (process.client) {
        const token = localStorage.getItem('token')
        const user = localStorage.getItem('user')

        if (token && user) {
          this.token = token
          this.user = JSON.parse(user)
          this.isAuthenticated = true
          return true
        }
      }
      return false
    }
  }
})
