import { defineStore } from 'pinia'
import { ref } from 'vue'

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

const useRankedStore = defineStore('ranked', () => {
  const opponent = ref<RankedUser | null>(null)
  const scores = ref<UserScore[]>([])
  const finalScores = ref<UserScore[]>([])
  const eloChange = ref<number | null>(null)
  const hasWon = ref<boolean | null>(null)
  const isForfeited = ref<boolean>(false)

  function reset() {
    opponent.value = null
    scores.value = []
    finalScores.value = []
    eloChange.value = null
    hasWon.value = null
    isForfeited.value = false
  }

  return {
    opponent,
    scores,
    finalScores,
    eloChange,
    hasWon,
    isForfeited,
    reset,
  }
})

export default useRankedStore
