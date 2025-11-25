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

    partySetup: {
      themes: [] as Array<number>,
      difficulties: [] as Array<number>,
      nbQuestions: 0 as number,
    },
  }),

  getters: {
    isLoading: (state) => state.loading > 0,
    getQuestions: (state) => {
      return state.partyInfo ? (state.partyInfo as any).partyQuestions : []
    },
  },

  actions: {
    resetSoloParty() {
      this.partyId = null
      this.partyInfo = null
      this.partySetup = {
        themes: [],
        difficulties: [],
        nbQuestions: 0,
      }
    },

    setPartySetup(data: SoloPartyData) {
      this.partySetup.themes = data.themes
      this.partySetup.difficulties = data.difficulties
      this.partySetup.nbQuestions = data.nbQuestions
    },

    async createSoloParty() {
      this.loading++
      const url = import.meta.env.VITE_API_URL + 'solo'
      try {
        const config = {
          url,
          method: 'POST',
          data: this.partySetup,
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
      const url = import.meta.env.VITE_API_URL + `solo/${this.partyId}`
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

    async loadAnswerById(answerId: number | null) {
      if (!this.partyId) return null

      this.loading++
      const url = import.meta.env.VITE_API_URL + `solo/${this.partyId}`
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
