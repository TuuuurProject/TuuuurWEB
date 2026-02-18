import { defineStore } from 'pinia'
import axiosOverlayConnector from '@/services/axiosOverlayConnector.js'
import { jwtDecode } from 'jwt-decode'

// Dayjs
import dayjs from 'dayjs'
import 'dayjs/locale/fr'
dayjs.locale('fr')

interface UserInfo {
  nickName: string
  avatar: string
  email: string
  isGoogleUser: boolean
}

export default defineStore('user', {
  state: () => ({
    token: null as string | null,
    refreshToken: null as string | null,
    loading: 0 as number,
    comeFrom: null as string | null, // To store the route before login
    userInfo: null as UserInfo | null,
  }),

  persist: {
    key: 'user-store',
    storage: localStorage,
    pick: ['token', 'refreshToken', 'comeFrom'],
  },

  getters: {
    isLoading: (state) => state.loading > 0,

    isLogged() {
      if (this.token) {
        const payload = this.decodedPayloadToken as any
        if (!payload) return false

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

    isRefreshTokenExist(): boolean {
      if (this.refreshToken) return true
      return false
    },

    userId(): number {
      const payload = this.decodedPayloadToken as any
      if (payload && payload.id) {
        return parseInt(payload.id)
      }
      return 0
    },
  },

  actions: {
    logout() {
      this.token = null
      this.refreshToken = null
    },

    async updateNickname(newNickname: string) {
      this.loading++
      const url = import.meta.env.VITE_API_URL + 'me/nickname'
      try {
        const config = {
          url,
          method: 'PUT',
          data: {
            nickname: newNickname,
          },
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

    async changePassword(currentPassword: string, newPassword: string) {
      this.loading++
      const url = import.meta.env.VITE_API_URL + 'me/change-password'
      try {
        const data = {
          currentPassword,
          newPassword,
        }
        const config = {
          url,
          method: 'PUT',
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

    async deleteAccount() {
      this.loading++
      const url = import.meta.env.VITE_API_URL + 'me'
      try {
        const config = {
          url,
          method: 'DELETE',
        }
        await axiosOverlayConnector(config)
        this.logout()
      } catch (error: any) {
        const errData = error?.response?.data
        return errData ?? error
      } finally {
        this.loading--
      }
    },

    async getUserInfo() {
      this.loading++
      const url = import.meta.env.VITE_API_URL + 'me'
      try {
        const config = {
          url,
          method: 'GET',
        }
        const response = await axiosOverlayConnector(config)
        this.userInfo = response.data
      } catch (error: any) {
        const errData = error?.response?.data
        return errData ?? error
      } finally {
        this.loading--
      }
    },

    async updateAvatar(avatarBase64: string) {
      this.loading++
      const url = import.meta.env.VITE_API_URL + 'me/avatar'
      try {
        const config = {
          url,
          method: 'PUT',
          data: { avatar: avatarBase64 },
        }
        const response = await axiosOverlayConnector(config)
        // Update local userInfo with new avatar
        if (this.userInfo) {
          this.userInfo.avatar = avatarBase64
        }
        return response.data
      } catch (error: any) {
        const errData = error?.response?.data
        return errData ?? error
      } finally {
        this.loading--
      }
    },

    async register(data: object) {
      this.loading++
      const url = import.meta.env.VITE_API_URL + 'auth/register'
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
      const url = import.meta.env.VITE_API_URL + 'auth/2fa/verify'
      try {
        const config = {
          url,
          method: 'POST',
          data,
        }
        const response = await axiosOverlayConnector(config)
        const responseData = response.data

        if (responseData.token) {
          this.token = responseData.token.token
          this.refreshToken = responseData.token.refreshToken
        }

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
      const url = import.meta.env.VITE_API_URL + 'auth/login'
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

    async getRefreshToken() {
      this.loading++
      const url = import.meta.env.VITE_API_URL + 'auth/refresh'
      try {
        const config = {
          url,
          method: 'POST',
          data: {
            bearer: this.token,
            refreshToken: this.refreshToken,
          },
        }

        const response = await axiosOverlayConnector(config)
        const responseData = response.data

        if (responseData.token) {
          this.token = responseData.token.token
          this.refreshToken = responseData.token.refreshToken
        }
      } catch (error: any) {
        const errData = error?.response?.data
        return errData ?? error
      } finally {
        this.loading--
      }
    },

    async googleLogin(token: string) {
      this.loading++
      const url = import.meta.env.VITE_API_URL + 'auth/google'
      try {
        const config = {
          url,
          method: 'POST',
          data: { token },
        }
        const response = await axiosOverlayConnector(config)
        const responseData = response.data

        if (responseData.token) {
          this.token = responseData.token.token
          this.refreshToken = responseData.token.refreshToken
        }

        return responseData
      } catch (error: any) {
        const errData = error?.response?.data
        return errData ?? error
      } finally {
        this.loading--
      }
    },

    async forgotPassword(login: string) {
      this.loading++
      const url = import.meta.env.VITE_API_URL + 'auth/password/forgot'
      try {
        const config = {
          url,
          method: 'POST',
          data: { login },
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

    async resetPassword(login: string, password: string, code: string) {
      this.loading++
      const url = import.meta.env.VITE_API_URL + 'auth/password/reset'
      try {
        const config = {
          url,
          method: 'POST',
          data: { login, password, code },
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
