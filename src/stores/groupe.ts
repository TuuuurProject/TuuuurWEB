import { defineStore } from 'pinia'
import axiosOverlayConnector from '@/services/axiosOverlayConnector.js'

export interface PartyUser {
  [key: string]: unknown
}

export interface PartyDifficulty {
  [key: string]: unknown
}

export interface PartyQuestion {
  [key: string]: unknown
}

export interface PartyTheme {
  [key: string]: unknown
}

export interface PartyType {
  [key: string]: unknown
}

export interface User {
  [key: string]: unknown
}

export interface GroupePartyInfo {
  active: boolean
  code: string
  dt: string
  finish: boolean
  id: string
  idPartyType: number
  idUserHost: number
  nbQuestions: number
  partyDifficulty: PartyDifficulty[]
  partyQuestions: PartyQuestion[]
  partyTheme: PartyTheme[]
  partyType: PartyType | null
  partyUsers: PartyUser[]
  percent: number
  score: number
  time: number
  user: User | null
  [key: string]: unknown
}

export default defineStore('groupe', {
  state: () => ({
    groupeId: null as string | null,
    groupePartyInfo: null as GroupePartyInfo | null,
    loading: 0 as number,
  }),

  getters: {
    isLoading: (state) => state.loading > 0,
  },

  actions: {
    async createGroupe() {
      this.loading++
      const url = import.meta.env.VITE_API_URL + 'group/create'
      try {
        const config = {
          url,
          method: 'POST',
          data: {},
        }
        const response = await axiosOverlayConnector(config)
        this.groupeId = response.data.id
        this.groupePartyInfo = response.data
      } catch (error: unknown) {
        const errData = (error as { response?: { data?: unknown } })?.response?.data
        return errData ?? error
      } finally {
        this.loading--
      }
    },

    async joinGroupe(code: string) {
      this.loading++
      const url = import.meta.env.VITE_API_URL + 'group/join'
      try {
        const config = {
          url,
          method: 'POST',
          data: {
            code: code,
          },
        }
        const response = await axiosOverlayConnector(config)
        this.groupeId = response.data.id
        this.groupePartyInfo = response.data
      } catch (error: any) {
        const errData = error?.response?.data
        return errData ?? error
      } finally {
        this.loading--
      }
    },

    async leaveGroupe() {
      this.loading++
      const url = import.meta.env.VITE_API_URL + 'group/leave'
      try {
        const config = {
          url,
          method: 'POST',
          data: {},
        }
        const response = await axiosOverlayConnector(config)
        if (response.data) {
          this.groupeId = null
          this.groupePartyInfo = null
        }
      } catch (error: any) {
        const errData = error?.response?.data
        return errData ?? error
      } finally {
        this.loading--
      }
    },
  },
})
