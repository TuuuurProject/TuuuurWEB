import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axiosOverlayConnector from '@/services/axiosOverlayConnector.js'

export interface RankedUser {
  id: string
  nickName: string
  email: string
  avatar: string | null
  isAdmin: boolean
  isNew: boolean
  isGoogleUser: boolean
  isInvitedUser: boolean
  elo: { idTheme: number; value: number; theme: null }[]
  globalElo: number
}

export interface RankedAnswer {
  id: number
  idQuestion: number
  value: string
  valid: boolean | null
}

export interface RankedQuestion {
  question: {
    id: number
    label: string
    idDifficulty: number
    answer: RankedAnswer[]
    difficulty: { id: number; label: string }
    partyQuestion: any[]
    questionTheme: {
      id: number
      idQuestion: number
      idTheme: number
      theme: { id: number; icon: string; label: string }
    }[]
  }
  currentIndex: number
  score: number
  multiplier: number
}

export interface UserAnswered {
  correct: boolean
  user: RankedUser
}

export interface UserScore {
  score: number
  user: RankedUser
}

export interface RankedPartyQuestion {
  id: number
  idParty: string
  idQuestion: number
  question: {
    id: number
    label: string
    idDifficulty: number
    answer: RankedAnswer[]
    difficulty?: { id: number; label: string }
    questionTheme?: {
      id: number
      idQuestion: number
      idTheme: number
      theme: { id: number; icon: string; label: string }
    }[]
  }
  userPartyQuestion: {
    idAnswer: number | null
    correct: boolean
    score: number
  } | null
}

export interface RankedPartyInfo {
  id: string
  finish: boolean
  isWinner: boolean
  elo: number
  finalScore: number
  partyQuestions?: RankedPartyQuestion[]
}

const useRankedStore = defineStore('ranked', () => {
  const opponent = ref<RankedUser | null>(null)
  const scores = ref<UserScore[]>([])
  const finalScores = ref<UserScore[]>([])
  const eloChange = ref<number | null>(null)
  const hasWon = ref<boolean | null>(null)
  const isForfeited = ref<boolean>(false)

  const partyId = ref<string | null>(null)
  const partyInfo = ref<RankedPartyInfo | null>(null)
  const loading = ref(0)

  const isLoading = computed(() => loading.value > 0)

  async function loadPartyInfo() {
    if (!partyId.value) return null

    loading.value++
    const url = import.meta.env.VITE_API_URL + `ranked/${partyId.value}`
    try {
      const response = await axiosOverlayConnector({ url, method: 'GET' })
      partyInfo.value = response.data
    } catch (error: any) {
      return error?.response?.data ?? error
    } finally {
      loading.value--
    }
  }

  function reset() {
    opponent.value = null
    scores.value = []
    finalScores.value = []
    eloChange.value = null
    hasWon.value = null
    isForfeited.value = false
    partyId.value = null
    partyInfo.value = null
    loading.value = 0
  }

  return {
    opponent,
    scores,
    finalScores,
    eloChange,
    hasWon,
    isForfeited,
    partyId,
    partyInfo,
    isLoading,
    loadPartyInfo,
    reset,
  }
})

export default useRankedStore
