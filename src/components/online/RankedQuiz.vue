<template>
  <section class="flex flex-col gap-6">
    <Transition name="slide-fade" mode="out-in">
      <div
        v-if="
          (phase === 'question' || phase === 'answered' || phase === 'revealing') &&
          !showCurrentRanking
        "
        key="game"
        class="flex flex-col gap-6"
      >
        <game-hud
          :current="currentIndex + 1"
          :total="totalQuestions || undefined"
          :score="myScore"
          :remaining="remaining"
          :duration="QUESTION_DURATION"
          :multiplier="currentQuestionData?.multiplier ?? null"
          leavable
          :leave-label="$t('competitive.quiz.abort')"
          @leave="showConfirmLeaveModal = true"
        />

        <question-card
          :question="currentQuestionData?.question?.label ?? ''"
          :answers="currentQuestionData?.question?.answer ?? []"
          :selected-id="selectedAnswerId"
          :revealed="answersRevealed"
          :locked="phase !== 'question'"
          :tags="questionTags"
          @select="(answer) => sendAnswer(Number(answer.id))"
        >
          <template
            v-if="(phase === 'answered' || phase === 'revealing') && myAnsweredResult !== null"
            #footer
          >
            <answer-feedback :correct="myAnsweredResult" />
          </template>
        </question-card>

        <player-status-list :players="duelPlayers" class="lg:!grid-cols-2" />
      </div>

      <live-ranking
        v-else-if="showCurrentRanking"
        key="ranking"
        :entries="scoreEntries"
        :title="$t('competitive.quiz.currentRanking')"
        :me-id="currentUser?.id"
      />

      <game-results
        v-else-if="phase === 'finished'"
        key="finished"
        :title="resultTitle"
        :tone="
          rankedStore.hasWon === true ? 'win' : rankedStore.hasWon === false ? 'lose' : 'neutral'
        "
        :message="resultMessage"
        :score="myScore"
        :correct="correctAnswersCount"
        :total="totalQuestions"
      >
        <template #highlight>
          <div class="flex flex-wrap items-center gap-3">
            <span
              v-if="rankedStore.eloChange !== null"
              class="inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-display text-xl font-extrabold"
              :class="
                rankedStore.hasWon === true
                  ? 'bg-brand-green/15 text-brand-green'
                  : rankedStore.hasWon === false
                    ? 'bg-brand-orange/15 text-brand-orange'
                    : 'bg-brand-surface2 text-brand-lightGray'
              "
            >
              <font-awesome-icon icon="chart-line" />
              {{
                rankedStore.hasWon === true
                  ? $t('competitive.quiz.eloGained', { points: rankedStore.eloChange })
                  : rankedStore.hasWon === false
                    ? $t('competitive.quiz.eloLost', { points: rankedStore.eloChange })
                    : $t('competitive.quiz.eloUnchanged')
              }}
            </span>
            <span v-if="opponent?.nickName" class="text-brand-gray">
              {{ $t('game.results.against', { name: opponent.nickName }) }}
            </span>
          </div>
          <p
            v-if="rankedStore.isForfeited"
            class="flex items-center gap-2 font-semibold text-brand-orange"
          >
            <font-awesome-icon icon="flag" /> {{ $t('competitive.quiz.opponentForfeited') }}
          </p>
        </template>

        <template #actions>
          <button v-if="!historyMode" class="btn btn-primary" @click="$emit('replay')">
            <font-awesome-icon icon="rotate-right" class="mr-2" />
            {{ $t('competitive.quiz.replay') }}
          </button>
          <button
            class="btn btn-ghost"
            @click="historyMode ? router.push({ name: 'Profile' }) : $emit('home')"
          >
            {{ historyMode ? $t('game.results.backToProfile') : $t('competitive.quiz.home') }}
          </button>
        </template>

        <question-recap :items="recapItems" />
      </game-results>
    </Transition>

    <!-- Confirmation de sortie en cours de partie -->
    <ModalDialog
      :open="showConfirmLeaveModal"
      :title="$t('competitive.quiz.confirmLeave.title')"
      @confirm="confirmLeave"
      @close="cancelLeave"
    >
      <p class="text-brand-lightGray">{{ $t('competitive.quiz.confirmLeave.message') }}</p>
    </ModalDialog>
  </section>

  <countdown-overlay
    :value="phase === 'countdown' ? countdownValue : null"
    :message="$t('competitive.quiz.getReady')"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'
import { onBeforeRouteLeave, useRouter, type RouteLocationNormalized } from 'vue-router'
import signalrService, { RankedEvent } from '@/services/signalrService'
import useRankedStore from '@/stores/ranked'
import type {
  RankedUser,
  RankedQuestion,
  UserAnswered,
  UserScore,
  RankedPartyQuestion,
} from '@/stores/ranked'
import { useRankedLifecycle } from '@/composables/useRankedLifecycle'
import ModalDialog from '@/components/ModalDialog.vue'
import GameHud from '@/components/game/GameHud.vue'
import QuestionCard from '@/components/game/QuestionCard.vue'
import AnswerFeedback from '@/components/game/AnswerFeedback.vue'
import PlayerStatusList, {
  type PlayerStatusEntry,
  type PlayerStatus,
} from '@/components/game/PlayerStatusList.vue'
import LiveRanking, { type RankingEntry } from '@/components/game/LiveRanking.vue'
import GameResults from '@/components/game/GameResults.vue'
import QuestionRecap, { type RecapItem } from '@/components/game/QuestionRecap.vue'
import CountdownOverlay from '@/components/game/CountdownOverlay.vue'

const props = defineProps<{
  opponent?: RankedUser
  currentUser: RankedUser | null
  initialCountdown?: number
  historyMode?: boolean
}>()

const emit = defineEmits<{ home: []; replay: [] }>()

const { t } = useI18n()
const router = useRouter()
const rankedStore = useRankedStore()
const { cleanupRanked } = useRankedLifecycle()

// ─── Confirmation de sortie ───────────────────────────────────────────────────
const showConfirmLeaveModal = ref(false)
const bypassGuard = ref(false) // Permet de bypass le guard après confirmation
let pendingNavigation: { to: RouteLocationNormalized; from: RouteLocationNormalized } | null = null

// ─── Phase ───────────────────────────────────────────────────────────────────
type Phase = 'countdown' | 'question' | 'answered' | 'revealing' | 'finished'
const phase = ref<Phase>(
  props.historyMode ? 'finished' : props.initialCountdown === undefined ? 'question' : 'countdown',
)
const countdownValue = ref(props.initialCountdown ?? 3)

// ─── Question state ───────────────────────────────────────────────────────────
const currentQuestionData = ref<RankedQuestion | null>(null)
const currentIndex = ref(0)
const totalQuestions = ref(0)
const selectedAnswerId = ref<number | null>(null)
const meAnswered = ref(false)
const opponentAnswered = ref(false)
const myAnsweredResult = ref<boolean | null>(null)
const opponentAnsweredCorrect = ref<boolean | null>(null)
const answersRevealed = ref(false)
const lastPoints = ref(0)

// ─── Score & timer ────────────────────────────────────────────────────────────
const myScore = ref(5000)
const scores = ref<UserScore[]>([])
const showCurrentRanking = computed(() => phase.value === 'revealing' && scores.value.length > 0)

// ─── Question history (pour le récapitulatif de fin) ──────────────────────────
type HistoryEntry = {
  question: RankedQuestion
  correct: boolean
  points: number
  selectedAnswerId: number | null
}
const questionHistory = ref<HistoryEntry[]>([])
const correctAnswersCount = computed(() => questionHistory.value.filter((e) => e.correct).length)

const QUESTION_DURATION = 15
const remaining = ref(QUESTION_DURATION)
let timerInterval: ReturnType<typeof setInterval> | null = null

function startTimer() {
  remaining.value = QUESTION_DURATION
  stopTimer()
  timerInterval = setInterval(() => {
    if (remaining.value > 0) {
      remaining.value = Math.max(0, remaining.value - 0.1)
    }
  }, 100)
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

// ─── Données d'affichage ──────────────────────────────────────────────────────
const questionTags = computed(() => {
  const question = currentQuestionData.value?.question
  if (!question) return []
  const themes = (question.questionTheme ?? []).map((qt) => qt.theme?.label).filter(Boolean)
  return question.difficulty?.label ? [...themes, question.difficulty.label] : themes
})

const statusOf = (answered: boolean, result: boolean | null): PlayerStatus => {
  if (result === true) return 'correct'
  if (result === false) return 'wrong'
  return answered ? 'answered' : 'waiting'
}

const duelPlayers = computed<PlayerStatusEntry[]>(() => [
  {
    id: props.currentUser?.id ?? 'me',
    name: props.currentUser?.nickName ?? t('competitive.matchmaking.you'),
    avatar: props.currentUser?.avatar,
    status: statusOf(meAnswered.value, myAnsweredResult.value),
    isMe: true,
  },
  {
    id: props.opponent?.id ?? 'opponent',
    name: props.opponent?.nickName ?? t('competitive.matchmaking.opponent'),
    avatar: props.opponent?.avatar,
    status: statusOf(opponentAnswered.value, opponentAnsweredCorrect.value),
  },
])

const scoreEntries = computed<RankingEntry[]>(() =>
  scores.value.map((entry) => ({
    id: entry.user.id,
    name: entry.user.nickName,
    avatar: entry.user.avatar,
    score: entry.score,
  })),
)

const resultTitle = computed(() => {
  if (rankedStore.hasWon === true) return t('competitive.quiz.victory')
  if (rankedStore.hasWon === false) return t('competitive.quiz.defeat')
  return t('competitive.quiz.draw')
})

const resultMessage = computed(() => {
  if (rankedStore.hasWon === true) return t('game.results.ranked.win')
  if (rankedStore.hasWon === false) return t('game.results.ranked.lose')
  return t('game.results.ranked.draw')
})

const recapItems = computed<RecapItem[]>(() =>
  questionHistory.value.map((entry) => ({
    label: entry.question.question?.label ?? '',
    correct: entry.correct,
    points: entry.points,
    selectedId: entry.selectedAnswerId,
    answers: entry.question.question?.answer ?? [],
  })),
)

// ─── Functions ──────────────────────────────────────────────────────────────

// ─── Send answer ──────────────────────────────────────────────────────────────
async function sendAnswer(answerId: number) {
  if (phase.value !== 'question' || meAnswered.value) return

  selectedAnswerId.value = answerId
  meAnswered.value = true
  phase.value = 'answered'
  stopTimer()

  try {
    await signalrService.invoke(RankedEvent.SendAnswer, answerId)
  } catch {
    toast.error(t('competitive.quiz.errorAnswering'))
  }
}

// ─── SignalR event handlers ───────────────────────────────────────────────────
function onCountdown(seconds: number) {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.log('[SignalR] Countdown:', seconds)
  countdownValue.value = seconds
  phase.value = 'countdown'
  stopTimer()
}

function onQuestionSend(question: RankedQuestion) {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.log('[SignalR] Question received:', question)
  currentQuestionData.value = question
  currentIndex.value = question.currentIndex
  if (question.question?.answer?.length) {
    totalQuestions.value = Math.max(totalQuestions.value, question.currentIndex + 1)
  }
  selectedAnswerId.value = null
  meAnswered.value = false
  opponentAnswered.value = false
  myAnsweredResult.value = null
  opponentAnsweredCorrect.value = null
  answersRevealed.value = false
  lastPoints.value = 0
  phase.value = 'question'
  startTimer()
}

function onUserAnswer() {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.log('[SignalR] Opponent answered')
  opponentAnswered.value = true
}

function onAllPlayerAnswered(results: UserAnswered[]) {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG)
    console.log('[SignalR] All players answered:', results)
  stopTimer()
  meAnswered.value = true
  opponentAnswered.value = true

  const myId = props.currentUser?.id
  if (myId) {
    const myResult = results.find((r) => r.user.id === myId)
    if (myResult !== undefined) myAnsweredResult.value = myResult.correct

    const opponentResult = results.find((r) => r.user.id !== myId)
    if (opponentResult !== undefined) opponentAnsweredCorrect.value = opponentResult.correct
  }

  // Push to history now that we know correctness (question data already in currentQuestionData)
  if (currentQuestionData.value) {
    const existingIdx = questionHistory.value.findIndex(
      (e) => e.question.currentIndex === currentQuestionData.value!.currentIndex,
    )
    if (existingIdx !== -1) {
      questionHistory.value[existingIdx].correct = myAnsweredResult.value ?? false
      questionHistory.value[existingIdx].selectedAnswerId = selectedAnswerId.value
    } else {
      questionHistory.value.push({
        question: currentQuestionData.value,
        correct: myAnsweredResult.value ?? false,
        points: 0,
        selectedAnswerId: selectedAnswerId.value,
      })
    }
  }
}

function onQuestionAnswerSend(question: RankedQuestion) {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG)
    console.log('[SignalR] Question answer revealed:', question)
  currentQuestionData.value = question
  answersRevealed.value = true
  stopTimer()

  // Update the existing history entry with the revealed question (answers have `valid` set)
  const existingIdx = questionHistory.value.findIndex(
    (e) => e.question.currentIndex === question.currentIndex,
  )
  if (existingIdx !== -1) {
    questionHistory.value[existingIdx].question = question
  } else {
    // Fallback: AllPlayerAnswered didn't fire (e.g. timer expired)
    questionHistory.value.push({
      question,
      correct: false,
      points: 0,
      selectedAnswerId: selectedAnswerId.value,
    })
  }
}

function onScoreUpdate(updatedScores: UserScore[]) {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG)
    console.log('[SignalR] Scores updated:', updatedScores)
  scores.value = updatedScores
  rankedStore.scores = updatedScores

  const myId = props.currentUser?.id
  if (myId) {
    const serverEntry = updatedScores.find((s) => s.user.id === myId)
    if (serverEntry) {
      // Compute points earned this round as delta from previous score
      const earned = serverEntry.score - myScore.value
      lastPoints.value = Math.max(earned, 0)

      // Update last history entry with actual points
      const last = questionHistory.value[questionHistory.value.length - 1]
      if (last) last.points = lastPoints.value

      myScore.value = serverEntry.score
    }
  }

  phase.value = 'revealing'
}

function onUserWin(eloPoints: number) {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG)
    console.log('[SignalR] You win! ELO change:', eloPoints)
  rankedStore.eloChange = eloPoints
  rankedStore.hasWon = true
  phase.value = 'finished'
}

function onUserLoose(eloPoints: number) {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG)
    console.log('[SignalR] You lose. ELO change:', eloPoints)
  rankedStore.eloChange = eloPoints
  rankedStore.hasWon = false
  phase.value = 'finished'
}

function onUserForfeited() {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.log('[SignalR] Opponent forfeited')
  rankedStore.isForfeited = true
}

function onError(message: string) {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.error('[SignalR] Error:', message)
  toast.error(message)
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
const allEvents = [
  { name: RankedEvent.Countdown, handler: onCountdown },
  { name: RankedEvent.QuestionSend, handler: onQuestionSend },
  { name: RankedEvent.UserAnswer, handler: onUserAnswer },
  { name: RankedEvent.AllPlayerAnswered, handler: onAllPlayerAnswered },
  { name: RankedEvent.QuestionAnswerSend, handler: onQuestionAnswerSend },
  { name: RankedEvent.ScoreUpdate, handler: onScoreUpdate },
  { name: RankedEvent.UserWin, handler: onUserWin },
  { name: RankedEvent.UserLoose, handler: onUserLoose },
  { name: RankedEvent.UserForfeited, handler: onUserForfeited }, // Même traitement que la défaite côté client
  { name: RankedEvent.Error, handler: onError },
]

// Fermeture de l'onglet/navigateur pendant la partie
const handleBeforeUnload = () => {
  // SignalR n'est pas disponible en synchrone sur beforeunload,
  // on se contente de déconnecter proprement côté serveur via la perte de connexion.
  // Si nécessaire, ajouter ici un fetch keepalive vers une API de forfait ranked.
}

// ─── Keyboard shortcuts ───────────────────────────────────────────────────────
const handleKeyPress = (event: KeyboardEvent) => {
  if (phase.value !== 'question') return

  // Mapping QWERTY + AZERTY pour sélectionner une réponse (1-4)
  const keyMap: Record<string, number> = {
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4, // QWERTY
    '&': 1,
    é: 2,
    '"': 3,
    "'": 4, // AZERTY
  }

  const answerNumber = keyMap[event.key]
  if (answerNumber) {
    const opt = currentQuestionData.value?.question?.answer?.[answerNumber - 1]
    if (opt) sendAnswer(opt.id)
  }
}

onMounted(() => {
  if (props.historyMode && rankedStore.partyInfo) {
    const info = rankedStore.partyInfo

    rankedStore.hasWon = info.isWinner
    rankedStore.eloChange = info.elo
    myScore.value = info.finalScore

    if (info.partyQuestions && info.partyQuestions.length > 0) {
      totalQuestions.value = info.partyQuestions.length
      questionHistory.value = info.partyQuestions.map((pq: RankedPartyQuestion, idx: number) => ({
        question: {
          question: {
            id: pq.question.id,
            label: pq.question.label,
            idDifficulty: pq.question.idDifficulty,
            answer: pq.question.answer,
            difficulty: pq.question.difficulty ?? { id: 0, label: '' },
            partyQuestion: [],
            questionTheme: pq.question.questionTheme ?? [],
          },
          currentIndex: idx,
          score: pq.userPartyQuestion?.score ?? 0,
          multiplier: 1,
        },
        correct: pq.userPartyQuestion?.correct ?? false,
        points: pq.userPartyQuestion?.score ?? 0,
        selectedAnswerId: pq.userPartyQuestion?.idAnswer ?? null,
      }))
    }

    phase.value = 'finished'
    return
  }

  // Même pattern que GroupQuiz :
  // 1. Nettoyer TOUS les handlers existants pour ces events (évite les doublons)
  // 2. Enregistrer les nouveaux handlers directement (pas de wrapper anonyme)
  allEvents.forEach((event) => signalrService.off(event.name))
  allEvents.forEach((event) => signalrService.on(event.name, event.handler))

  globalThis.addEventListener('beforeunload', handleBeforeUnload)
  globalThis.addEventListener('keydown', handleKeyPress)
})

const handlePageLeave = async () => {
  if (signalrService.isConnected()) {
    await signalrService.invoke(RankedEvent.GiveUp)
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handlePageLeave)
  window.addEventListener('pagehide', handlePageLeave)
})

onBeforeUnmount(async () => {
  stopTimer()

  await handlePageLeave()
  window.removeEventListener('beforeunload', handlePageLeave)
  window.removeEventListener('pagehide', handlePageLeave)

  if (props.historyMode) {
    rankedStore.reset()
    return
  }

  globalThis.removeEventListener('beforeunload', handleBeforeUnload)
  globalThis.removeEventListener('keydown', handleKeyPress)

  // Retirer les handlers SignalR de ce composant
  allEvents.forEach((event) => signalrService.off(event.name, event.handler))

  // Si la connexion est encore ouverte (fin de partie normale ou sortie via "Home"),
  // déconnecter proprement. Le guard isCleaningUp dans useRankedLifecycle empêche
  // le double appel si confirmLeave() a déjà déconnecté.
  if (signalrService.isConnected()) {
    await cleanupRanked()
  }
})

// ─── Guard de navigation ──────────────────────────────────────────────────────
onBeforeRouteLeave((to, from, next) => {
  if (bypassGuard.value || phase.value === 'finished') {
    next()
  } else {
    pendingNavigation = { to, from }
    showConfirmLeaveModal.value = true
    next(false)
  }
})

async function confirmLeave() {
  showConfirmLeaveModal.value = false

  // GiveUp de l'utilisateur
  await signalrService.invoke(RankedEvent.GiveUp)
  await cleanupRanked()

  if (pendingNavigation) {
    bypassGuard.value = true
    await router.push(pendingNavigation.to)
    pendingNavigation = null
  } else {
    emit('home')
  }
}

function cancelLeave() {
  showConfirmLeaveModal.value = false
  pendingNavigation = null
}
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}
.slide-fade-enter-from {
  transform: translateY(12px);
  opacity: 0;
}
.slide-fade-leave-to {
  transform: translateY(-8px);
  opacity: 0;
}
</style>
