import { defineStore } from 'pinia'
import axiosOverlayConnector from '@/services/axiosOverlayConnector.js'

interface SoloPartyData {
  themes: Array<number>
  difficulties: Array<number>
  nbQuestions: number
}

export default defineStore('solo', {
  state: () => ({
    partyId: null as string | null,
    partyInfo: null as object | null,
    loading: 0 as number,
  }),

  getters: {
    isLoading: (state) => state.loading > 0,
    getQuestions: (state) => {
      return state.partyInfo ? (state.partyInfo as any).partyQuestions : []
    },
  },

  actions: {
    async createSoloParty(data: SoloPartyData) {
      this.loading++
      const url = import.meta.env.VITE_API_URL + 'Party/Solo'
      try {
        const config = {
          url,
          method: 'POST',
          data: data,
        }
        const response = await axiosOverlayConnector(config)
        this.partyId = response.data
      } catch (error: any) {
        const errData = error?.response?.data
        return errData ?? error
      } finally {
        this.loading--
      }
    },

    async loadPartyInfo() {
      if (!this.partyId) return null

      this.loading++
      const url = import.meta.env.VITE_API_URL + `Party/${this.partyId}`
      try {
        const config = {
          url,
          method: 'GET',
        }
        const response = await axiosOverlayConnector(config)
        this.partyInfo = response.data
      } catch (error: any) {
        const errData = error?.response?.data
        return errData ?? error
      } finally {
        this.loading--
      }
    },

    async loadAnswerById(answerId: number) {
      if (!this.partyId) return null

      this.loading++
      const url = import.meta.env.VITE_API_URL + `Party/${this.partyId}`
      try {
        const config = {
          url,
          method: 'POST',
          data: { answerId: answerId },
        }
        const response = await axiosOverlayConnector(config)
        this.partyInfo = response.data
      } catch (error: any) {
        const errData = error?.response?.data
        return errData ?? error
      } finally {
        this.loading--
      }
    },
  },
})
