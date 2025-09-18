import { defineStore } from 'pinia'
// import axiosOverlayConnector from '@/services/axiosOverlayConnector.js'

export default defineStore('user', {
  state: () => ({
    token: null as string | null,
    loading: 0 as number,
  }),

  // TODO: Faire login, register, deconnexion, decode token jwt, ...
})
