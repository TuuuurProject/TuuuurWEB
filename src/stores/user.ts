import { defineStore } from 'pinia'
import axiosOverlayConnector from '@/services/axiosOverlayConnector.js'
import { jwtDecode } from 'jwt-decode'

// Dayjs
import dayjs from 'dayjs'
import 'dayjs/locale/fr'
dayjs.locale('fr')

export default defineStore('user', {
  state: () => ({
    token: null as string | null,
    loading: 0 as number,
    comeFrom: null as string | null, // To store the route before login
  }),

  persist: {
    key: 'user-store',
    storage: localStorage,
    pick: ['token', 'comeFrom'],
  },

  getters: {
    isLoading: (state) => state.loading > 0,

    isLogged() {
      if (this.token) {
        const payload = this.decodedPayloadToken
        if (!payload) return false

        // TODO : payload.exp is in UTC but Date.now() is in local time UTC + 1, need to set payload.exp in local time too
        const localExp = dayjs.unix(payload.exp).unix()
        const currentTimeInSeconds = Math.floor(Date.now() / 1000)
        return localExp > currentTimeInSeconds
      }
      return false
    },

    decodedPayloadToken: (state) => {
      if (!state.token) return null
      return jwtDecode(state.token)
    },
  },

  actions: {
    logout() {
      this.token = null
    },

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

        return responseData
      } catch (error: any) {
        const errData = error?.response?.data
        return errData ?? error
      } finally {
        this.loading--
      }
    },

    async login(data: object) {
      this.loading++
      const url = import.meta.env.VITE_API_URL + 'Auth/Login'
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
  },
})
