import { defineStore } from 'pinia'
import axiosOverlayConnector from '@/services/axiosOverlayConnector.js'
import useUserStore from './user'

export interface PartyUser {
  id: number | string
  user: User
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
  id?: number | string
  idUser?: string
  nickName?: string
  avatar?: string
  email?: string
  [key: string]: unknown
}

export interface GroupePartyInfo {
  active: boolean
  code: string
  dt: string
  finish: boolean
  id: string
  idPartyType: number
  idUserHost: string
  nbQuestions: number
  scoreEachRound?: boolean
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

const GROUP_STORAGE_KEY = 'tuuuur_active_group'

export default defineStore('groupe', {
  state: () => ({
    groupeId: null as string | null,
    groupePartyInfo: null as GroupePartyInfo | null,
    loading: 0 as number,
    loadingCreationGroupe: 0 as number,
    comeFromEndOfQuizGame: false as boolean,
  }),

  getters: {
    isLoading: (state) => state.loading > 0,
    isLoadingCreationGroupe: (state) => state.loadingCreationGroupe > 0,
    getQuestions: (state) => {
      return state.groupePartyInfo ? (state.groupePartyInfo as any).partyQuestions : []
    },
    isInGroup: (state) => state.groupeId !== null && state.groupePartyInfo !== null,
  },

  actions: {
    /**
     * Sauvegarde l'état du groupe dans localStorage
     */
    persistGroupState() {
      if (this.groupeId && this.groupePartyInfo) {
        try {
          localStorage.setItem(
            GROUP_STORAGE_KEY,
            JSON.stringify({
              groupeId: this.groupeId,
              code: this.groupePartyInfo.code,
              timestamp: Date.now(),
            }),
          )
        } catch (error) {
          console.error('Failed to persist group state:', error)
        }
      }
    },

    /**
     * Restaure l'état du groupe depuis localStorage
     */
    restoreGroupState() {
      try {
        const stored = localStorage.getItem(GROUP_STORAGE_KEY)
        if (stored) {
          const data = JSON.parse(stored)
          const age = Date.now() - data.timestamp

          // Si le groupe a moins de 30 minutes, on considère qu'il est encore valide
          if (age < 30 * 60 * 1000) {
            return data
          } else {
            // Nettoyer les données trop anciennes
            this.clearPersistedState()
          }
        }
      } catch (error) {
        console.error('Failed to restore group state:', error)
        this.clearPersistedState()
      }
      return null
    },

    /**
     * Nettoie l'état persisté
     */
    clearPersistedState() {
      try {
        localStorage.removeItem(GROUP_STORAGE_KEY)
      } catch (error) {
        console.error('Failed to clear persisted state:', error)
      }
    },

    /**
     * Réinitialise complètement l'état du groupe
     */
    resetGroupState() {
      this.groupeId = null
      this.groupePartyInfo = null
      this.clearPersistedState()
    },

    async updateSettings(settings: any) {
      this.loading++
      const url = import.meta.env.VITE_API_URL + 'group/settings'
      try {
        const config = {
          url,
          method: 'POST',
          data: settings,
        }
        await axiosOverlayConnector(config)
      } catch (error: any) {
        const errData = error?.response?.data
        return errData ?? error
      } finally {
        this.loading--
      }
    },

    async getGroupeInfo(id: string) {
      this.loading++
      const url = import.meta.env.VITE_API_URL + 'group/' + id
      try {
        const config = {
          url,
          method: 'GET'
        }
        const response = await axiosOverlayConnector(config)
        this.groupePartyInfo = response.data
      } catch (error: any) {
        const errData = error?.response?.data
        return errData ?? error
      } finally {
        this.loading--
      }
    },

    async createGroupe() {
      this.loadingCreationGroupe++
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

        // Persister l'état du groupe
        this.persistGroupState()
      } catch (error: any) {
        const errData = error?.response?.data
        return errData ?? error
      } finally {
        this.loadingCreationGroupe--
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

        // Persister l'état du groupe
        this.persistGroupState()

        return true
      } catch (error: any) {
        const errData = error?.response?.data
        return errData ?? error
      } finally {
        this.loading--
      }
    },

    /**
     * Quitte le groupe de manière synchrone pour beforeunload
     * Utilise fetch avec keepalive pour fonctionner lors de la fermeture de page
     */
    leaveGroupeSync() {
      if (!this.groupeId) {
        return
      }

      const url = import.meta.env.VITE_API_URL + 'group/leave'

      try {
        // Récupérer le token depuis le store user
        const userStore = useUserStore()
        const token = userStore.token

        // Utiliser fetch avec keepalive: true pour fonctionner dans beforeunload
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
          keepalive: true, // Crucial pour que la requête soit envoyée même pendant beforeunload
        }).catch((err) => {
          console.error('Error in sync leave:', err)
        })

        // Nettoyer l'état local immédiatement
        this.resetGroupState()
      } catch (error) {
        console.error('Error leaving group sync:', error)
        this.resetGroupState()
      }
    },

    async leaveGroupe() {
      // Éviter les appels multiples
      if (!this.groupeId) {
        return
      }

      this.loading++
      const url = import.meta.env.VITE_API_URL + 'group/leave'
      try {
        const config = {
          url,
          method: 'POST',
          data: {},
        }
        await axiosOverlayConnector(config)

        // Nettoyer l'état local dans tous les cas
        this.resetGroupState()
      } catch (error: any) {
        // Même en cas d'erreur, nettoyer l'état local
        // L'utilisateur ne devrait pas rester bloqué dans un groupe
        console.error('Error leaving group:', error)
        this.resetGroupState()

        const errData = error?.response?.data
        return errData ?? error
      } finally {
        this.loading--
      }
    },

    async expelledPlayer(idPlayer: number | string) {
      this.loading++
      const url = import.meta.env.VITE_API_URL + 'group/user/' + idPlayer
      try {
        const config = {
          url,
          method: 'DELETE',
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
