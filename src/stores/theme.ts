import { defineStore } from 'pinia'
import axiosOverlayConnector from '@/services/axiosOverlayConnector.js'

interface Theme {
  id: string
  label: string
  icon: string
}

export default defineStore('theme', {
  state: () => ({
    list: null as Array<Theme> | null,
    loading: 0 as number,
  }),

  getters: {
    isLoading: (state) => state.loading > 0,
  },

  actions: {
    async loadThemes() {
      this.loading++
      const url = import.meta.env.VITE_API_URL + 'Theme'
      try {
        const config = {
          url,
          method: 'GET',
        }
        const response = await axiosOverlayConnector(config)
        this.list = response.data
      } catch (error: any) {
        const errData = error?.response?.data
        return errData ?? error
      } finally {
        this.loading--
      }
    },
  },
})
