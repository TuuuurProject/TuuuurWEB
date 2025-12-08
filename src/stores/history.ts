import { defineStore } from 'pinia'
import axiosOverlayConnector from '@/services/axiosOverlayConnector.js'

interface Theme {
  id: number
  icon: string
  label: string
}

interface PartyTheme {
  id: number
  idParty: string
  idTheme: number
  theme: Theme
}

interface Difficulty {
  id: number
  label: string
}

interface PartyDifficulty {
  id: number
  idParty: string
  idDifficulty: number
  difficulty: Difficulty
}

interface PartyType {
  id: number
  label: string
}

interface Match {
  id: string
  dt: string
  idPartyType: number
  idUserHost: number
  active: boolean
  finish: boolean
  score: number
  nbQuestions: number
  percent?: number
  time?: number
  partyType: PartyType
  partyDifficulty: PartyDifficulty[]
  partyTheme: PartyTheme[]
}

export default defineStore('history', {
  state: () => ({
    historyList: null as Match[] | null,
    nbParties: null as number | null,
    currentPage: 1 as number,
    totalPages: 1 as number,
    loading: 0 as number,
  }),

  getters: {
    isLoading: (state) => state.loading > 0,
  },

  actions: {
    async getHistory(page = 1, size = 7) {
      this.loading++
      const url = import.meta.env.VITE_API_URL + 'history?page=' + page + '&size=' + size
      try {
        const config = {
          url,
          method: 'GET',
        }
        const response = await axiosOverlayConnector(config)
        this.historyList = response.data.history
        this.nbParties = response.data.totalParties
        this.currentPage = response.data.currentPage
        this.totalPages = response.data.totalPages
      } catch (error: any) {
        const errData = error?.response?.data
        return errData ?? error
      } finally {
        this.loading--
      }
    },
  },
})

export type { Match }
