<template>
  <section class="flex flex-col gap-6">
    <Transition name="slide-fade" mode="out-in">
      <div v-if="!finished && !showCurrentRanking" key="game" class="flex flex-col gap-6">
        <game-hud
          :current="lastQuestionIndex + 1"
          :total="nbMaxQuestions"
          :score="globalUserScore"
          :remaining="remaining"
          :duration="TOTAL_TIME"
          leavable
          :leave-label="$t('game.hud.leave')"
          @leave="showConfirmLeaveModal = true"
        />

        <question-card
          :question="currentQuestion"
          :answers="currentAnswer || []"
          :selected-id="userAnswerId"
          :revealed="scoreIsAvailable"
          :locked="answered"
          @select="answer"
        >
          <template v-if="answered && scoreIsAvailable" #footer>
            <answer-feedback :correct="wasCorrect" :points="lastPoints" />
          </template>
        </question-card>

        <section class="flex flex-col gap-3" aria-labelledby="group-players-title">
          <h3 id="group-players-title" class="text-lg font-bold">
            {{ $t('group.quiz.playersStatus') }}
          </h3>
          <player-status-list :players="playerStatusEntries" />
        </section>
      </div>

      <live-ranking
        v-else-if="!finished && showCurrentRanking"
        key="ranking"
        :entries="rankingEntries"
        :title="$t('group.quiz.currentRanking')"
        :me-id="myId"
      />

      <game-results
        v-else
        key="results"
        :title="resultsTitle"
        :score="globalUserScore"
        :correct="correctAnswersCount"
        :total="allQuestionsParty.length"
        :rate="pourcentageCorrect"
        :tone="myRank === 1 ? 'win' : 'neutral'"
      >
        <template #actions>
          <button
            v-if="comeFromHistory"
            class="btn btn-primary"
            @click="router.push({ name: 'Profile' })"
          >
            <font-awesome-icon icon="arrow-left" class="mr-2" />
            {{ $t('game.results.backToProfile') }}
          </button>
          <button v-else class="btn btn-primary" @click="exitQuizGame">
            <font-awesome-icon icon="users" class="mr-2" /> {{ $t('group.quiz.returnToLobby') }}
          </button>
        </template>

        <results-podium
          v-if="rankingEntries.length > 0"
          :entries="rankingEntries"
          :title="$t('group.quiz.ranking')"
          :me-id="myId"
        />

        <div class="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start">
          <section class="surface-card flex flex-col gap-4">
            <h3 class="text-xl font-bold">{{ $t('game.results.partyInfo') }}</h3>
            <party-summary
              :themes="partyThemes"
              :difficulties="partyDifficulties"
              :questions="groupeStore.groupePartyInfo?.nbQuestions"
              :empty-themes="$t('group.quiz.allThemes')"
            >
              <div
                v-if="groupeStore.groupePartyInfo?.scoreEachRound !== undefined"
                class="flex flex-col gap-1"
              >
                <dt class="text-sm font-semibold text-brand-muted">
                  {{ $t('group.quiz.scoreEachRound') }}
                </dt>
                <dd class="font-bold">
                  {{
                    groupeStore.groupePartyInfo?.scoreEachRound ? $t('common.yes') : $t('common.no')
                  }}
                </dd>
              </div>
            </party-summary>
          </section>
          <question-recap :items="recapItems" />
        </div>
      </game-results>
    </Transition>

    <!-- Modale de confirmation pour quitter la partie -->
    <ModalDialog
      :open="showConfirmLeaveModal"
      :title="$t('group.quiz.confirmLeave.title')"
      @confirm="confirmLeave"
      @close="cancelLeave"
    >
      <p class="text-brand-ink">{{ $t('group.quiz.confirmLeave.message') }}</p>
    </ModalDialog>
  </section>

  <countdown-overlay :value="countdownValue" :message="$t('group.quiz.getReady')" />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, getCurrentInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave, useRouter, type RouteLocationNormalized } from 'vue-router'
import GameHud from '@/components/game/GameHud.vue'
import QuestionCard from '@/components/game/QuestionCard.vue'
import AnswerFeedback from '@/components/game/AnswerFeedback.vue'
import PlayerStatusList, { type PlayerStatusEntry } from '@/components/game/PlayerStatusList.vue'
import LiveRanking, { type RankingEntry } from '@/components/game/LiveRanking.vue'
import ResultsPodium from '@/components/game/ResultsPodium.vue'
import GameResults from '@/components/game/GameResults.vue'
import PartySummary from '@/components/game/PartySummary.vue'
import QuestionRecap, { type RecapItem } from '@/components/game/QuestionRecap.vue'
import CountdownOverlay from '@/components/game/CountdownOverlay.vue'
import { useDifficulties } from '@/composables/useDifficulties'
import ModalDialog from '@/components/ModalDialog.vue'
import signalrService, { GroupEvent } from '@/services/signalrService'
import useGroupeStore, {
  type GroupePartyInfo,
  type PartyQuestion,
  type User,
} from '@/stores/groupe'
import useUserStore from '@/stores/user'
import useThemeStore from '@/stores/theme'
import { useGroupLifecycle } from '@/composables/useGroupLifecycle'

const groupeStore = useGroupeStore()
const userStore = useUserStore()
const themeStore = useThemeStore()
const { cleanupGroup } = useGroupLifecycle()
const router = useRouter()

const { t } = useI18n()
const { fromParty } = useDifficulties()

const TOTAL_TIME = 15 // seconds per question

const emit = defineEmits<{
  (e: 'exit'): void
  (e: 'goToLobby'): void
}>()

const nbMaxQuestions = ref(0)
const answered = ref(false)
const wasCorrect = ref(false)
const lastPoints = ref(0)
const finished = ref(false)
const globalUserScore = ref(0)
const userAnswerId = ref(<number | null>null)
const scoreIsAvailable = ref(false)
const percentageCorrectScore = ref(<number | null>null)
const comeFromHistory = ref(false)

// Track which users have answered the current question
const usersAnswered = ref(new Set<number | string>())

// Track player answer results (userId -> correct)
const playerAnswerResults = ref(new Map<number | string, boolean>())

// Players ranking
const playersRanking = ref<
  Array<{
    score: number
    user: {
      id?: number
      nickName?: string
      avatar?: string | null
      email?: string
      isAdmin?: boolean
      isNew?: boolean
    }
  }>
>([])

const remaining = ref(TOTAL_TIME)
let timer: ReturnType<typeof setInterval> | null = null
let startTime: number | null = null

// Gestion de la modale de confirmation pour quitter
const showConfirmLeaveModal = ref(false)
let pendingNavigation: { to: RouteLocationNormalized; from: RouteLocationNormalized } | null = null

const instance = getCurrentInstance()
const proxy = instance?.proxy

// Computed to calculate all players' status once
const playersStatus = computed(() => {
  const players = groupeStore.groupePartyInfo?.partyUsers || []
  const statusMap = new Map()

  players.forEach((p: any) => {
    const userId = p.user?.id ?? p.user?.idUser
    if (userId == null) return

    const hasAnswered = usersAnswered.value.has(userId)
    const hasResult = playerAnswerResults.value.has(userId)
    const isCurrentUser =
      (userId === userStore.userId && userStore.isLogged) ||
      (userId === userStore.userIdInvited && userStore.isLoggedAsInvited)

    let status = 'waiting'

    // Before score is available: show if player answered or is waiting
    if (!scoreIsAvailable.value) {
      status = hasAnswered ? 'answered' : 'waiting'
    }
    // After score is available: show correct/incorrect/noAnswer
    else {
      if (isCurrentUser) {
        // For current user, use answered and wasCorrect
        if (answered.value) {
          status = wasCorrect.value ? 'correct' : 'incorrect'
        } else {
          status = 'noAnswer'
        }
      } else {
        // For other players, use playerAnswerResults if available
        if (hasResult) {
          const isCorrect = playerAnswerResults.value.get(userId)
          status = isCorrect ? 'correct' : 'incorrect'
        } else if (hasAnswered) {
          // Answered but result not received yet (transient state)
          status = 'answered'
        } else {
          status = 'noAnswer'
        }
      }
    }

    statusMap.set(userId, status === 'incorrect' ? 'wrong' : status)
  })

  return statusMap
})

const myId = computed(() =>
  userStore.isLogged
    ? userStore.userId
    : userStore.isLoggedAsInvited
      ? userStore.userIdInvited
      : null,
)

const playerStatusEntries = computed<PlayerStatusEntry[]>(() =>
  (groupeStore.groupePartyInfo?.partyUsers || []).map((p: any) => {
    const userId = p.user?.id ?? p.user?.idUser
    return {
      id: String(p.id),
      name: p.user?.nickName,
      avatar: p.user?.avatar,
      status: playersStatus.value.get(userId) ?? 'waiting',
      isMe: userId != null && String(userId) === String(myId.value),
    }
  }),
)

// Gestion du clavier
const handleKeyPress = async (event: KeyboardEvent) => {
  // Si le quiz est terminé, ne rien faire
  if (finished.value) return

  // Touche Enter pour passer à la question suivante
  if (event.key === 'Enter') {
    if (answered.value) {
      await next()
    }
    return
  }

  // Touche S pour skip la question
  if (event.key === 's' || event.key === 'S') {
    if (!answered.value) {
      await skip()
    }
    return
  }

  // Mapping des touches clavier français (AZERTY) et international (QWERTY)
  const keyMap: Record<string, number> = {
    // QWERTY
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    // AZERTY (français)
    '&': 1,
    é: 2,
    '"': 3,
    "'": 4,
  }

  const answerNumber = keyMap[event.key]
  if (answerNumber && !answered.value) {
    const answerIndex = answerNumber - 1
    if (currentAnswer.value && currentAnswer.value[answerIndex]) {
      await answer(currentAnswer.value[answerIndex])
    }
  }
}

const startTimer = () => {
  clearTimer()
  remaining.value = TOTAL_TIME
  startTime = Date.now()

  timer = globalThis.setInterval(async () => {
    const elapsed = (Date.now() - startTime!) / 1000 // temps écoulé en secondes
    remaining.value = Math.max(0, +(TOTAL_TIME - elapsed).toFixed(1))

    if (remaining.value <= 0) {
      // Load the answer by ID, set to null to indicate timeout
      // await soloStore.loadAnswerById(null)

      clearTimer()
      answered.value = true
      wasCorrect.value = false
      lastPoints.value = 0
    }
  }, 100)
}
function clearTimer() {
  if (timer != null) {
    clearInterval(timer)
    timer = null
  }
}

const answer = async (opt: { id: number | string }) => {
  if (answered.value) return
  answered.value = true

  clearTimer()

  // Set user answer ID
  const answerId = Number(opt.id)
  userAnswerId.value = answerId

  // Add current user to answered set
  if (userStore.userId && userStore.isLogged) {
    usersAnswered.value.add(userStore.userId)
  } else if (userStore.userIdInvited && userStore.isLoggedAsInvited) {
    usersAnswered.value.add(userStore.userIdInvited)
  }

  // Answer
  if (signalrService.isConnected()) {
    await signalrService.send(GroupEvent.SendAnswer, answerId)
  } else {
    proxy?.$toast.error(t('group.quiz.errorAnswering'))
  }
}

const skip = async () => {
  if (!answered.value) {
    // Load the answer by ID, set to null to indicate skip
    // await soloStore.loadAnswerById(null)
    // answered.value = true
    // clearTimer()
    // wasCorrect.value = false
    // lastPoints.value = 0
  }
}

const next = async () => {
  if (!answered.value) return

  // await soloStore.loadPartyInfo()

  // if (index.value + 1 >= nbMaxQuestions.value) {
  //   finished.value = true
  //   clearTimer()
  //   return
  // }
  // // index.value++
  // answered.value = false
  // wasCorrect.value = false
  // lastPoints.value = 0
  // startTimer()
}

const allQuestionsParty = computed(() => {
  if (groupeStore.groupePartyInfo) {
    return groupeStore.getQuestions
  }
  return []
})

const lastQuestionIndex = computed(() => allQuestionsParty.value.length - 1)

const currentQuestion = computed(() => {
  return allQuestionsParty.value[lastQuestionIndex.value]?.question?.label ?? ''
})

const currentAnswer = computed(() => {
  return allQuestionsParty.value[lastQuestionIndex.value]?.question?.answer ?? ''
})

// Classement des joueurs (intermédiaire et final)
const rankingEntries = computed<RankingEntry[]>(() =>
  playersRanking.value.map((p) => ({
    id: String(p.user?.id ?? ''),
    name: p.user?.nickName,
    avatar: p.user?.avatar,
    score: p.score,
  })),
)

const myRank = computed(() => {
  const sorted = [...rankingEntries.value].sort((a, b) => b.score - a.score)
  const index = sorted.findIndex((entry) => String(entry.id) === String(myId.value))
  return index === -1 ? null : index + 1
})

const resultsTitle = computed(() => {
  if (myRank.value === 1) return t('game.results.groupFirst')
  if (myRank.value) return t('game.results.groupPlace', { rank: myRank.value })
  return t('game.results.finished')
})

// Check if scoreEachRound is enabled
const scoreEachRound = computed(() => {
  return groupeStore.groupePartyInfo?.scoreEachRound ?? false
})

// Show current ranking when scoreEachRound is enabled and all answered
const showCurrentRanking = computed(() => {
  return scoreEachRound.value && playersRanking.value.length > 0
})

// Fonctions pour le récapitulatif
const correctAnswersCount = computed(() => {
  return allQuestionsParty.value.filter((q: any) => isQuestionCorrect(q)).length
})

const pourcentageCorrect = computed(() => {
  if (percentageCorrectScore.value !== null) return percentageCorrectScore.value
  if (allQuestionsParty.value.length === 0) return 0
  return Math.round((correctAnswersCount.value / allQuestionsParty.value.length) * 100)
})

const isQuestionCorrect = (questionData: any) => {
  if (!questionData?.correct) return false
  return questionData?.correct
}

const recapItems = computed<RecapItem[]>(() =>
  allQuestionsParty.value.map((q: any) => ({
    label: q?.question?.label ?? '',
    correct: isQuestionCorrect(q),
    points: q?.score,
    selectedId: q?.idAnswer ?? null,
    answers: q?.question?.answer ?? [],
  })),
)

// Informations de la partie
const partyDifficulties = computed(() =>
  fromParty(groupeStore.groupePartyInfo?.partyDifficulty as any),
)

const partyThemes = computed(() => {
  if (!groupeStore.groupePartyInfo?.partyTheme || !themeStore.list) return []
  const themeIds = groupeStore.groupePartyInfo.partyTheme.map((t: any) => t.idTheme)
  return themeStore.list.filter((t: any) => themeIds.includes(parseInt(t.id)))
})

const isUserAnswerIsCorrect = (questions: any, answerId: number) => {
  const answer = questions.answer.find((ans: { id: number }) => ans.id === answerId)

  return answer ? answer.valid : false
}

const exitQuizGame = async () => {
  // Si la partie n'est pas terminée, demander confirmation
  if (!finished.value && groupeStore.groupeId) {
    showConfirmLeaveModal.value = true
    return
  }

  // Sinon retour au lobby
  groupeStore.comeFromEndOfQuizGame = true

  // Reset data du groupe pour éviter des futures
  if (groupeStore.groupePartyInfo?.partyQuestions) groupeStore.groupePartyInfo.partyQuestions = []

  emit('goToLobby')
}

// Handlers for SignalR events
const countdownValue = ref<number | null>(null)
let countdownClearTimeout: ReturnType<typeof setTimeout> | null = null

const handleOnUserAnswer = (data: any) => {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.log('User answer received:', data)
  // Add user to the set of users who answered
  if (data && (data.id || data.userId)) {
    usersAnswered.value.add(data.id ?? data.userId)
  }
}

const handleCountdownEvent = (data: any) => {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.log('Countdown event received:', data)

  const value = Number(data)
  if (!Number.isFinite(value)) return

  // Affiche 3 / 2 / 1 en gros overlay
  if (value >= 1) {
    countdownValue.value = value

    // Reset du timeout à chaque tick pour éviter un état “bloqué”
    if (countdownClearTimeout != null) clearTimeout(countdownClearTimeout)

    // On masque un poil après le "1"
    if (value === 1) {
      countdownClearTimeout = globalThis.setTimeout(() => {
        clearCountdownOverlay()
      }, 900)
    }
  } else {
    // Si jamais le backend envoie 0 ou autre signal de fin
    clearCountdownOverlay()
  }
}

function clearCountdownOverlay() {
  if (countdownClearTimeout != null) {
    clearTimeout(countdownClearTimeout)
    countdownClearTimeout = null
  }
  countdownValue.value = null
}

const handleQuestionSend = (data: any) => {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.log('New question received:', data)

  // Reset ranking values for new question
  playersRanking.value = []

  // Reset user answer ID
  userAnswerId.value = null

  // Reset users answered set for new question
  usersAnswered.value.clear()

  // Reset player answer results for new question
  playerAnswerResults.value.clear()

  // Réinitialiser l'état "finished" si une nouvelle partie commence
  if (finished.value) {
    finished.value = false
    globalUserScore.value = 0

    // Réinitialiser les questions de la partie précédente
    if (groupeStore.groupePartyInfo) {
      groupeStore.groupePartyInfo.partyQuestions = []
    }
  }

  // Start timer, reset for new question and get question data
  answered.value = false
  wasCorrect.value = false
  scoreIsAvailable.value = false
  lastPoints.value = 0
  groupeStore.groupePartyInfo?.partyQuestions.push(data)

  // Clear timer before start new one
  clearTimer()
  startTimer()
}

const handleQuestionAnswerSend = (data: any) => {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.log('Answer received for question:', data)

  scoreIsAvailable.value = true

  // User good answered?
  wasCorrect.value = isUserAnswerIsCorrect(data.question, userAnswerId.value!)

  // Replace value of the question with the updated one containing user answer and correctness
  groupeStore.groupePartyInfo!.partyQuestions.splice(lastQuestionIndex.value, 1, {
    ...data,
    correct: wasCorrect.value,
    idAnswer: userAnswerId.value,
  })

  // Update score
  lastPoints.value = data.score // Points wined for this question
  globalUserScore.value += data.score
}

const handlePartyFinished = (data: any) => {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.log('Party finished:', data)

  // Store players ranking data
  if (Array.isArray(data)) {
    playersRanking.value = data
  }

  finished.value = true
}

const handleScoreUpdate = (data: any) => {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.log('Score update received:', data)

  // Update players ranking data
  if (Array.isArray(data)) {
    playersRanking.value = data
  }
}

const handleOnError = (error: any) => {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.log('Lobby deleted:', error)
  proxy?.$toast.error(error)
}

const handlePartyDeleted = async () => {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.log('Party deleted by host')
  proxy?.$toast.warning(t('group.lobby.lobbyDeleted'))

  // Nettoyer le groupe et rediriger
  await cleanupGroup(true) // Skip API call car la partie est déjà supprimée
  emit('exit')
}

const handleAllPlayerAnswered = (data: any) => {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG)
    console.log('All players answered the question : ', data)

  // Store player answer results
  if (Array.isArray(data)) {
    data.forEach((playerResult: any) => {
      const userId = playerResult.user?.id ?? playerResult.user?.idUser
      if (userId != null) {
        playerAnswerResults.value.set(userId, playerResult.correct)
      }
    })
  }
}

const allEvents = [
  { name: GroupEvent.Countdown, handler: handleCountdownEvent },
  { name: GroupEvent.QuestionSend, handler: handleQuestionSend },
  { name: GroupEvent.QuestionAnswerSend, handler: handleQuestionAnswerSend },
  { name: GroupEvent.UserAnswer, handler: handleOnUserAnswer },
  { name: GroupEvent.PartyFinished, handler: handlePartyFinished },
  { name: GroupEvent.PartyDeleted, handler: handlePartyDeleted },
  { name: GroupEvent.ScoreUpdate, handler: handleScoreUpdate },
  { name: GroupEvent.AllPlayerAnswered, handler: handleAllPlayerAnswered },
  { name: GroupEvent.Error, handler: handleOnError },
]

// Gestionnaire de fermeture de page
const handleBeforeUnload = () => {
  if (groupeStore.groupeId) {
    // Utiliser la méthode synchrone du store qui utilise fetch + keepalive
    groupeStore.leaveGroupeSync()
  }
}

onMounted(async () => {
  // If onMounted, the groupId exist, display the recap
  if (groupeStore.groupeId) {
    await groupeStore.getGroupeInfo(groupeStore.groupeId)
    finished.value = groupeStore.groupePartyInfo!.finish
    if (finished.value) {
      comeFromHistory.value = true
      globalUserScore.value = groupeStore.groupePartyInfo!.score
      percentageCorrectScore.value = groupeStore.groupePartyInfo!.percent

      // Populate players ranking from userScores (API data, not SignalR)
      const partyInfoRaw = groupeStore.groupePartyInfo as GroupePartyInfo & {
        userScores?: { score: number; user: User }[]
      }
      if (Array.isArray(partyInfoRaw.userScores)) {
        playersRanking.value = partyInfoRaw.userScores.map((us) => ({
          score: us.score,
          user: us.user as {
            id?: number
            nickName?: string
            avatar?: string | null
            email?: string
            isAdmin?: boolean
            isNew?: boolean
          },
        }))
      }

      // Normalize partyQuestions to match the live-game format expected by the recap
      if (groupeStore.groupePartyInfo!.partyQuestions) {
        groupeStore.groupePartyInfo!.partyQuestions =
          groupeStore.groupePartyInfo!.partyQuestions.map((pq) => {
            const raw = pq as PartyQuestion & {
              userPartyQuestion?: { correct?: boolean; idAnswer?: number | null; score?: number }
            }
            return {
              ...pq,
              correct: raw.userPartyQuestion?.correct ?? false,
              idAnswer: raw.userPartyQuestion?.idAnswer ?? null,
              score: raw.userPartyQuestion?.score ?? 0,
            }
          })
      }

      // Load themes so partyThemes computed can resolve icons/labels
      if (!themeStore.list) {
        await themeStore.loadThemes()
      }

      return
    }
  }

  // Load themes if not already loaded
  if (!themeStore.list) {
    await themeStore.loadThemes()
  }

  // Connection signalR
  try {
    allEvents.forEach((event) => {
      signalrService.off(event.name)
    })

    allEvents.forEach((event) => {
      signalrService.on(event.name, (data: unknown) => {
        event.handler(data)
      })
    })
  } catch (error) {
    console.error('Failed to connect to SignalR:', error)
    proxy?.$toast.error(t('group.lobby.connectionError'))
  }

  // Get max questions from party info
  nbMaxQuestions.value = groupeStore.groupePartyInfo?.nbQuestions || 0

  // Ajouter l'écouteur d'événements clavier
  globalThis.addEventListener('keydown', handleKeyPress)

  // Ajouter le gestionnaire de fermeture de page
  globalThis.addEventListener('beforeunload', handleBeforeUnload)
})

// Gérer la navigation (bouton retour du navigateur, changement de route)
onBeforeRouteLeave((to, from, next) => {
  // Si la partie n'est pas terminée et qu'il y a un groupe actif, demander confirmation
  if (groupeStore.groupeId && !finished.value) {
    // Bloquer la navigation et afficher la modale
    pendingNavigation = { to, from }
    showConfirmLeaveModal.value = true
    next(false) // Bloquer la navigation pour l'instant
  } else {
    // Si la partie est terminée ou pas de groupe, laisser partir
    next()
  }
})

// Confirmer le départ
const confirmLeave = async () => {
  showConfirmLeaveModal.value = false

  if (groupeStore.groupeId) {
    await cleanupGroup()
  }

  // Si c'est une navigation de route (bouton retour), naviguer vers la destination
  if (pendingNavigation) {
    await router.push(pendingNavigation.to)
    pendingNavigation = null
  } else {
    // Sinon, c'est le bouton "Leave" qui a été cliqué, émettre l'événement
    emit('exit')
  }
}

// Annuler le départ
const cancelLeave = () => {
  showConfirmLeaveModal.value = false
  pendingNavigation = null
}

onBeforeUnmount(async () => {
  clearTimer()
  clearCountdownOverlay()

  comeFromHistory.value = false

  globalThis.removeEventListener('keydown', handleKeyPress)
  globalThis.removeEventListener('beforeunload', handleBeforeUnload)

  // Nettoyer les listeners SignalR
  allEvents.forEach((event) => {
    signalrService.off(event.name, event.handler)
  })

  // Si on retourne au lobby, NE PAS déconnecter SignalR ni quitter le groupe
  if (groupeStore.comeFromEndOfQuizGame) {
    // Ne rien faire de plus, on garde la connexion et l'état du groupe
    return
  }

  // Sinon (sortie complète ou partie non terminée), cleanup total
  await cleanupGroup()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgb(var(--c-bg) / 0.5);
  border-radius: 9999px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgb(var(--c-primary) / 0.4);
  border-radius: 9999px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgb(var(--c-primary) / 0.6);
}
</style>
