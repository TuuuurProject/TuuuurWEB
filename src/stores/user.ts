import { defineStore } from 'pinia'
import axiosOverlayConnector from '@/services/axiosOverlayConnector.js'

export default defineStore('user', {
  state: () => ({
    token: null as string | null,
    loading: 0 as number,
  }),

  persist: {
    key: 'user-store',
    storage: localStorage,
    pick: ['token'],
  },

  getters: {
    isLoading: (state) => state.loading > 0,
  },

  actions: {
    async register(data: object) {
      this.loading++
      const url = import.meta.env.VITE_API_URL + 'Auth/Register'
      try {
        const config = {
          url,
          method: 'POST',
          data,
        }
        const response = await axiosOverlayConnector(config)
        return response.data
      } catch (error: any) {
        const errData = error?.response?.data
        return errData ?? error
      } finally {
        this.loading--
      }
    },

    async verifyEmail(data: object) {
      this.loading++
      const url = import.meta.env.VITE_API_URL + 'Auth/2fa/Verify'
      try {
        const config = {
          url,
          method: 'POST',
          data,
        }
        const response = await axiosOverlayConnector(config)
        const responseData = response.data

        this.token = responseData.token.token
        console.log('Token set:', this.token)

        return responseData
      } catch (error: any) {
        const errData = error?.response?.data
        return errData ?? error
      } finally {
        this.loading--
      }
    },
  },
})
