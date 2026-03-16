<template>
  <section class="space-y-6">
    <!-- Header -->
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <h2 class="font-branding text-3xl text-brand-lightGray">
          {{ $t('competitive.quiz.title') }}
        </h2>
      </div>
      <div v-if="!finished" class="flex items-center gap-3">
        <span class="pill">
          {{ $t('competitive.quiz.question', { current: currentIndex + 1, total: totalQuestions }) }}
        </span>
        <span class="pill">
          {{ $t('competitive.quiz.score') }} <strong>{{ myScore }}</strong>
        </span>
      </div>
    </header>

    <Transition name="slide-fade" mode="out-in">

      <!-- === COUNTDOWN === -->
      <div v-if="phase === 'countdown'" key="countdown" class="flex flex-col items-center justify-center py-16 gap-6">
        <p class="text-brand-gray font-branding text-xl">{{ $t('competitive.quiz.getReady') }}</p>
        <div
          class="w-32 h-32 rounded-full bg-brand-purple/20 border-4 border-brand-purple shadow-neon flex items-center justify-center animate-pulse"
        >
          <span class="font-branding text-6xl text-brand-lightGray">{{ countdownValue }}</span>
        </div>
      </div>

      <!-- === QUESTION + GAME === -->
      <div v-else-if="phase === 'question' || phase === 'answered' || phase === 'revealing'" key="game" class="flex flex-col gap-4">

        <!-- Timer bar -->
        <div class="rounded-2xl overflow-hidden border border-brand-purple/20 bg-brand-darkGray/80 shadow-neon">
          <div class="h-2 w-full bg-brand-dark/30">
            <div
              class="h-2 transition-[width] duration-300"
              :class="remainingRatio < 0.33 ? 'bg-brand-orange' : 'bg-brand-green'"
              :style="{ width: (remainingRatio * 100).toFixed(2) + '%' }"
            />
          </div>
          <div class="px-6 py-3 flex items-center justify-between text-sm text-brand-lightGray">
            <span>{{ $t('competitive.quiz.timeRemaining', { time: remaining.toFixed(1) }) }}</span>
            <span v-if="currentQuestionData" class="text-brand-gray text-xs">
              × {{ currentQuestionData.multiplier.toFixed(1) }}
            </span>
          </div>
        </div>

        <!-- Question card -->
        <div class="gaming-card">
          <h3 class="font-branding text-2xl mb-6 text-brand-lightGray leading-snug">
            {{ currentQuestionData?.question?.label }}
          </h3>

          <div class="grid gap-3 sm:grid-cols-2">
            <button
              v-for="(opt, idx) in currentQuestionData?.question?.answer"
              :key="opt.id"
              class="group rounded-2xl border px-4 py-3 text-left font-semibold transition duration-200 relative"
              :disabled="phase !== 'question'"
              :class="answerButtonClass(opt)"
              @click="sendAnswer(opt.id)"
            >
              <span
                class="absolute top-2 right-2 w-6 h-6 rounded-md bg-brand-purple/20 border border-brand-purple/40 text-brand-purple text-xs flex items-center justify-center font-bold"
              >
                {{ idx + 1 }}
              </span>
              {{ opt.value }}
            </button>
          </div>

          <!-- Result feedback after answers revealed -->
          <div v-if="phase === 'revealing' && myAnsweredResult !== null" class="mt-5 flex items-center gap-3">
            <span v-if="myAnsweredResult" class="badge-green">
              {{ $t('competitive.quiz.correct', { points: lastPoints }) }}
            </span>
            <span v-else class="badge-orange">{{ $t('competitive.quiz.incorrect') }}</span>
          </div>
        </div>

        <!-- Players status card -->
        <div class="gaming-card">
          <h4 class="font-branding text-base text-brand-gray mb-3">
            <font-awesome-icon icon="users" class="mr-2" />
            {{ $t('competitive.quiz.playersStatus') }}
          </h4>
          <div class="grid grid-cols-2 gap-3">
            <!-- Me -->
            <div
              class="rounded-xl border bg-brand-darkGray/30 p-3 flex items-center gap-3 transition-all duration-300"
              :class="meAnswered ? 'border-brand-green/50 bg-brand-green/5' : 'border-brand-purple/20'"
            >
              <div class="relative shrink-0">
                <div class="w-10 h-10 rounded-full bg-brand-purple/20 overflow-hidden flex items-center justify-center border-2"
                     :class="meAnswered ? 'border-brand-green' : 'border-brand-purple/40'">
                  <img v-if="currentUser?.avatar" :src="currentUser.avatar" class="w-full h-full object-cover" alt="" />
                  <font-awesome-icon v-else icon="user" class="text-brand-purple" />
                </div>
                <span v-if="meAnswered" class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-brand-green flex items-center justify-center">
                  <font-awesome-icon icon="check" class="text-white text-xs" style="font-size: 8px" />
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-brand-lightGray truncate">{{ currentUser?.nickName ?? $t('competitive.matchmaking.you') }}</p>
                <p class="text-xs" :class="meAnswered ? 'text-brand-green' : 'text-brand-gray'">
                  {{ meAnswered ? $t('competitive.quiz.answered') : $t('competitive.quiz.waitingAnswer') }}
                </p>
              </div>
            </div>

            <!-- Opponent -->
            <div
              class="rounded-xl border bg-brand-darkGray/30 p-3 flex items-center gap-3 transition-all duration-300"
              :class="opponentAnswered ? 'border-brand-orange/50 bg-brand-orange/5' : 'border-brand-purple/20'"
            >
              <div class="relative shrink-0">
                <div class="w-10 h-10 rounded-full bg-brand-orange/20 overflow-hidden flex items-center justify-center border-2"
                     :class="opponentAnswered ? 'border-brand-orange' : 'border-brand-orange/30'">
                  <img v-if="opponent?.avatar" :src="opponent.avatar" class="w-full h-full object-cover" alt="" />
                  <font-awesome-icon v-else icon="user-ninja" class="text-brand-orange" />
                </div>
                <span v-if="opponentAnswered" class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-brand-orange flex items-center justify-center">
                  <font-awesome-icon icon="check" class="text-white" style="font-size: 8px" />
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-brand-lightGray truncate">{{ opponent?.nickName ?? $t('competitive.matchmaking.opponent') }}</p>
                <p class="text-xs" :class="opponentAnswered ? 'text-brand-orange' : 'text-brand-gray'">
                  {{ opponentAnswered ? $t('competitive.quiz.opponentAnswered') : $t('competitive.quiz.waitingOpponent') }}
                </p>
              </div>
            </div>
          </div>

          <!-- Live scores -->
          <div v-if="scores.length" class="mt-4 pt-4 border-t border-brand-purple/10">
            <div class="flex items-center justify-between text-xs text-brand-gray mb-2">
              <span>Scores</span>
            </div>
            <div class="flex gap-4">
              <div v-for="s in scores" :key="s.user.id" class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-brand-darkGray overflow-hidden flex items-center justify-center shrink-0">
                  <img v-if="s.user.avatar" :src="s.user.avatar" class="w-full h-full object-cover" alt="" />
                  <font-awesome-icon v-else icon="user" class="text-brand-gray text-xs" />
                </div>
                <span class="text-sm font-bold text-brand-lightGray">{{ s.score }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- === END GAME === -->
      <div v-else-if="phase === 'finished'" key="finished" class="flex flex-col gap-6">
        <!-- Result banner -->
        <div
          class="gaming-card text-center"
          :class="rankedStore.hasWon === true ? 'border-brand-green/40' : rankedStore.hasWon === false ? 'border-brand-orange/40' : 'border-brand-purple/20'"
        >
          <div class="text-5xl mb-3">
            <span v-if="rankedStore.hasWon === true">🏆</span>
            <span v-else-if="rankedStore.hasWon === false">😔</span>
            <span v-else>🤝</span>
          </div>
          <h3 class="font-branding text-4xl mb-2"
              :class="rankedStore.hasWon === true ? 'text-brand-green' : rankedStore.hasWon === false ? 'text-brand-orange' : 'text-brand-lightGray'">
            {{ rankedStore.hasWon === true ? $t('competitive.quiz.victory') : rankedStore.hasWon === false ? $t('competitive.quiz.defeat') : $t('competitive.quiz.draw') }}
          </h3>

          <!-- ELO change -->
          <div v-if="rankedStore.eloChange !== null" class="inline-flex items-center gap-2 px-4 py-2 rounded-full mt-2"
               :class="rankedStore.hasWon === true ? 'bg-brand-green/15 border border-brand-green/30' : rankedStore.hasWon === false ? 'bg-brand-orange/15 border border-brand-orange/30' : 'bg-brand-purple/15 border border-brand-purple/30'">
            <font-awesome-icon icon="chart-line" :class="rankedStore.hasWon === true ? 'text-brand-green' : 'text-brand-orange'" />
            <span class="font-branding text-xl"
                  :class="rankedStore.hasWon === true ? 'text-brand-green' : rankedStore.hasWon === false ? 'text-brand-orange' : 'text-brand-lightGray'">
              {{ rankedStore.hasWon === true
                ? $t('competitive.quiz.eloGained', { points: rankedStore.eloChange })
                : rankedStore.hasWon === false
                  ? $t('competitive.quiz.eloLost', { points: rankedStore.eloChange })
                  : $t('competitive.quiz.eloUnchanged') }}
            </span>
          </div>
        </div>

        <!-- Final ranking -->
        <div class="gaming-card">
          <h4 class="font-branding text-xl text-brand-lightGray mb-4">
            <font-awesome-icon icon="trophy" class="mr-2 text-brand-yellow" />
            {{ $t('competitive.quiz.finalRanking') }}
          </h4>

          <div class="space-y-3">
            <div
              v-for="(entry, idx) in rankedStore.finalScores"
              :key="entry.user.id"
              class="flex items-center gap-4 p-4 rounded-2xl border transition-all"
              :class="idx === 0 ? 'border-brand-yellow/40 bg-brand-yellow/5' : 'border-brand-purple/20 bg-brand-darkGray/20'"
            >
              <!-- Position -->
              <div class="w-10 h-10 rounded-full flex items-center justify-center font-branding text-xl shrink-0"
                   :class="idx === 0 ? 'bg-brand-yellow/20 text-brand-yellow' : 'bg-brand-purple/20 text-brand-purple'">
                {{ idx === 0 ? '🥇' : '🥈' }}
              </div>

              <!-- Avatar -->
              <div class="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shrink-0 border-2"
                   :class="idx === 0 ? 'border-brand-yellow/50' : 'border-brand-purple/30'">
                <img v-if="entry.user.avatar" :src="entry.user.avatar" class="w-full h-full object-cover" alt="" />
                <font-awesome-icon v-else icon="user" class="text-brand-gray" />
              </div>

              <!-- Name -->
              <div class="flex-1 min-w-0">
                <p class="font-branding text-lg text-brand-lightGray truncate">{{ entry.user.nickName }}</p>
                <p class="text-xs text-brand-gray">{{ entry.user.globalElo }} ELO</p>
              </div>

              <!-- Score -->
              <div class="text-right">
                <p class="font-branding text-2xl"
                   :class="idx === 0 ? 'text-brand-yellow' : 'text-brand-lightGray'">
                  {{ entry.score }}
                </p>
                <p class="text-xs text-brand-gray">pts</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-center gap-3">
          <button class="btn btn-ghost" @click="$emit('home')">
            <font-awesome-icon icon="house" />
            {{ $t('competitive.quiz.home') }}
          </button>
          <button class="btn btn-primary" @click="$emit('replay')">
            <font-awesome-icon icon="rotate-right" />
            {{ $t('competitive.quiz.replay') }}
          </button>
        </div>
      </div>

    </Transition>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'
import rankedSignalrService, { RankedEvent } from '@/services/rankedSignalrService'
import useRankedStore from '@/stores/ranked'
import type { RankedUser, RankedQuestion, UserAnswered, UserScore } from '@/stores/ranked'

const props = defineProps<{
  opponent: RankedUser
  currentUser: RankedUser | null
  initialCountdown?: number
}>()

defineEmits<{ home: []; replay: [] }>()

const { t } = useI18n()
const rankedStore = useRankedStore()

// ─── Phase ───────────────────────────────────────────────────────────────────
type Phase = 'countdown' | 'question' | 'answered' | 'revealing' | 'finished'
const phase = ref<Phase>(props.initialCountdown !== undefined ? 'countdown' : 'question')
const countdownValue = ref(props.initialCountdown ?? 3)

// ─── Question state ───────────────────────────────────────────────────────────
const currentQuestionData = ref<RankedQuestion | null>(null)
const currentIndex = ref(0)
const totalQuestions = ref(10)
const selectedAnswerId = ref<number | null>(null)
const meAnswered = ref(false)
const opponentAnswered = ref(false)
const myAnsweredResult = ref<boolean | null>(null)
const lastPoints = ref(0)

// ─── Score & timer ────────────────────────────────────────────────────────────
const myScore = ref(0)
const scores = ref<UserScore[]>([])
const finished = computed(() => phase.value === 'finished')

const QUESTION_DURATION = 30
const remaining = ref(QUESTION_DURATION)
const remainingRatio = computed(() => remaining.value / QUESTION_DURATION)
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

// ─── Answer button classes ────────────────────────────────────────────────────
function answerButtonClass(opt: { id: number; valid: boolean | null }) {
  if (phase.value === 'revealing') {
    if (opt.valid === true) {
      return 'border-brand-green bg-brand-green/15 text-brand-green cursor-default'
    }
    if (opt.id === selectedAnswerId.value && opt.valid === false) {
      return 'border-brand-orange bg-brand-orange/15 text-brand-orange cursor-default'
    }
    return 'border-brand-purple/20 bg-brand-darkGray/20 text-brand-gray cursor-default opacity-50'
  }

  if (opt.id === selectedAnswerId.value) {
    return 'border-brand-purple bg-brand-purple/20 text-brand-lightGray cursor-default'
  }

  if (phase.value !== 'question') {
    return 'border-brand-purple/20 bg-brand-darkGray/20 text-brand-gray cursor-default opacity-50'
  }

  return 'border-brand-purple/20 bg-brand-darkGray/30 text-brand-lightGray hover:border-brand-purple/60 hover:bg-brand-purple/10 cursor-pointer'
}

// ─── Send answer ──────────────────────────────────────────────────────────────
async function sendAnswer(answerId: number) {
  if (phase.value !== 'question' || meAnswered.value) return

  selectedAnswerId.value = answerId
  meAnswered.value = true
  phase.value = 'answered'
  stopTimer()

  try {
    await rankedSignalrService.invoke(RankedEvent.SendAnswer, answerId)
  } catch (e) {
    toast.error(t('competitive.quiz.errorAnswering'))
  }
}

// ─── SignalR event handlers ───────────────────────────────────────────────────
function onCountdown(seconds: number) {
  countdownValue.value = seconds
  phase.value = 'countdown'
  stopTimer()
}

function onQuestionSend(question: RankedQuestion) {
  currentQuestionData.value = question
  currentIndex.value = question.currentIndex
  if (question.question?.answer?.length) {
    totalQuestions.value = Math.max(totalQuestions.value, question.currentIndex + 1)
  }
  selectedAnswerId.value = null
  meAnswered.value = false
  opponentAnswered.value = false
  myAnsweredResult.value = null
  lastPoints.value = 0
  phase.value = 'question'
  startTimer()
}

function onUserAnswer(_user: RankedUser) {
  opponentAnswered.value = true
}

function onAllPlayerAnswered(results: UserAnswered[]) {
  stopTimer()
  meAnswered.value = true
  opponentAnswered.value = true

  // Find my result if available
  const myId = props.currentUser?.id
  if (myId) {
    const myResult = results.find((r) => r.user.id === myId)
    if (myResult !== undefined) {
      myAnsweredResult.value = myResult.correct
    }
  }
}

function onQuestionAnswerSend(question: RankedQuestion) {
  currentQuestionData.value = question
  lastPoints.value = question.score
  myScore.value += question.score
  phase.value = 'revealing'
  stopTimer()
}

function onScoreUpdate(updatedScores: UserScore[]) {
  scores.value = updatedScores
  rankedStore.scores = updatedScores

  // Update myScore from server scores
  const myId = props.currentUser?.id
  if (myId) {
    const myScore_ = updatedScores.find((s) => s.user.id === myId)
    if (myScore_) myScore.value = myScore_.score
  }
}

function onPartyFinished(finalScores: UserScore[]) {
  rankedStore.finalScores = finalScores
  phase.value = 'finished'
  stopTimer()
}

function onUserWin(eloPoints: number) {
  rankedStore.eloChange = eloPoints
  rankedStore.hasWon = true
}

function onUserLoose(eloPoints: number) {
  rankedStore.eloChange = eloPoints
  rankedStore.hasWon = false
}

function onError(message: string) {
  toast.error(message)
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  rankedSignalrService.on(RankedEvent.Countdown, onCountdown as any)
  rankedSignalrService.on(RankedEvent.QuestionSend, onQuestionSend as any)
  rankedSignalrService.on(RankedEvent.UserAnswer, onUserAnswer as any)
  rankedSignalrService.on(RankedEvent.AllPlayerAnswered, onAllPlayerAnswered as any)
  rankedSignalrService.on(RankedEvent.QuestionAnswerSend, onQuestionAnswerSend as any)
  rankedSignalrService.on(RankedEvent.ScoreUpdate, onScoreUpdate as any)
  rankedSignalrService.on(RankedEvent.PartyFinished, onPartyFinished as any)
  rankedSignalrService.on(RankedEvent.UserWin, onUserWin as any)
  rankedSignalrService.on(RankedEvent.UserLoose, onUserLoose as any)
  rankedSignalrService.on(RankedEvent.Error, onError as any)
})

onBeforeUnmount(() => {
  stopTimer()
  rankedSignalrService.off(RankedEvent.Countdown, onCountdown as any)
  rankedSignalrService.off(RankedEvent.QuestionSend, onQuestionSend as any)
  rankedSignalrService.off(RankedEvent.UserAnswer, onUserAnswer as any)
  rankedSignalrService.off(RankedEvent.AllPlayerAnswered, onAllPlayerAnswered as any)
  rankedSignalrService.off(RankedEvent.QuestionAnswerSend, onQuestionAnswerSend as any)
  rankedSignalrService.off(RankedEvent.ScoreUpdate, onScoreUpdate as any)
  rankedSignalrService.off(RankedEvent.PartyFinished, onPartyFinished as any)
  rankedSignalrService.off(RankedEvent.UserWin, onUserWin as any)
  rankedSignalrService.off(RankedEvent.UserLoose, onUserLoose as any)
  rankedSignalrService.off(RankedEvent.Error, onError as any)
})
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
