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
          {{ $t('competitive.quiz.question', { current: currentIndex + 1 }) }}
        </span>
        <span class="pill">
          {{ $t('competitive.quiz.score') }} <strong>{{ myScore }}</strong>
        </span>
      </div>
    </header>

    <Transition name="slide-fade" mode="out-in">
      <!-- === QUESTION + GAME === -->
      <div
        v-if="
          (phase === 'question' || phase === 'answered' || phase === 'revealing') &&
          !showCurrentRanking
        "
        key="game"
        class="flex flex-col gap-4"
      >
        <!-- Timer bar -->
        <div
          class="rounded-2xl overflow-hidden border border-brand-purple/20 bg-brand-darkGray/80 shadow-neon"
        >
          <div class="h-2 w-full bg-brand-dark/30">
            <div
              class="h-2 transition-[width] duration-300"
              :class="remainingRatio < 0.33 ? 'bg-brand-orange' : 'bg-brand-green'"
              :style="{ width: (remainingRatio * 100).toFixed(2) + '%' }"
            />
          </div>
          <div class="px-6 py-3 flex items-center justify-between text-sm text-brand-lightGray">
            <span>{{ $t('competitive.quiz.timeRemaining', { time: remaining.toFixed(1) }) }}</span>
            <span v-if="currentQuestionData" class="text-brand-gray">
              × {{ currentQuestionData.multiplier.toFixed(1) }}
            </span>
          </div>
        </div>

        <!-- Question card -->
        <div class="gaming-card">
          <h3 class="font-branding text-2xl mb-4 text-brand-lightGray">
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
          <div
            v-if="(phase === 'answered' || phase === 'revealing') && myAnsweredResult !== null"
            class="mt-5 flex items-center gap-3"
          >
            <span v-if="myAnsweredResult" class="badge-green">
              {{ $t('competitive.quiz.correct') }}
            </span>
            <span v-else class="badge-orange">{{ $t('competitive.quiz.incorrect') }}</span>
          </div>
        </div>

        <!-- Players status card -->
        <div class="gaming-card">
          <div class="grid grid-cols-2 gap-3">
            <!-- Me -->
            <div
              class="rounded-xl border bg-brand-darkGray/30 p-3 flex items-center gap-3 transition-all duration-300"
              :class="
                myAnsweredResult === true
                  ? 'border-brand-green/50 bg-brand-green/5'
                  : myAnsweredResult === false
                    ? 'border-brand-orange/50 bg-brand-orange/5'
                    : meAnswered
                      ? 'border-brand-purple/50 bg-brand-purple/5'
                      : 'border-brand-purple/20'
              "
            >
              <div class="relative shrink-0">
                <div
                  class="w-10 h-10 rounded-full bg-brand-purple/20 overflow-hidden flex items-center justify-center border-2"
                  :class="
                    myAnsweredResult === true
                      ? 'border-brand-green'
                      : myAnsweredResult === false
                        ? 'border-brand-orange'
                        : meAnswered
                          ? 'border-brand-purple'
                          : 'border-brand-purple/40'
                  "
                >
                  <img
                    v-if="currentUser?.avatar"
                    :src="currentUser.avatar"
                    class="w-full h-full object-cover"
                    alt=""
                  />
                  <div v-else class="h-16 w-16 flex items-center justify-center">
                    <span id="nickaname" class="text-2xl font-bold text-brand-purple">
                      {{ currentUser?.nickName?.charAt(0).toUpperCase() || '?' }}
                    </span>
                  </div>
                </div>
                <span
                  v-if="myAnsweredResult !== null"
                  class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                  :class="myAnsweredResult ? 'bg-brand-green' : 'bg-brand-orange'"
                >
                  <font-awesome-icon
                    :icon="myAnsweredResult ? 'check' : 'times'"
                    class="text-white"
                    style="font-size: 8px"
                  />
                </span>
                <span
                  v-else-if="meAnswered"
                  class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-brand-purple flex items-center justify-center"
                >
                  <font-awesome-icon icon="check" class="text-white" style="font-size: 8px" />
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-brand-lightGray truncate">
                  {{ currentUser?.nickName ?? $t('competitive.matchmaking.you') }}
                </p>
                <p
                  class="text-xs"
                  :class="
                    myAnsweredResult === true
                      ? 'text-brand-green'
                      : myAnsweredResult === false
                        ? 'text-brand-orange'
                        : meAnswered
                          ? 'text-brand-purple'
                          : 'text-brand-gray'
                  "
                >
                  {{
                    myAnsweredResult === true
                      ? $t('competitive.quiz.correct')
                      : myAnsweredResult === false
                        ? $t('competitive.quiz.incorrect')
                        : meAnswered
                          ? $t('competitive.quiz.answered')
                          : $t('competitive.quiz.waitingAnswer')
                  }}
                </p>
              </div>
            </div>

            <!-- Opponent -->
            <div
              class="rounded-xl border bg-brand-darkGray/30 p-3 flex items-center gap-3 transition-all duration-300"
              :class="
                opponentAnsweredCorrect === true
                  ? 'border-brand-green/50 bg-brand-green/5'
                  : opponentAnsweredCorrect === false
                    ? 'border-brand-orange/50 bg-brand-orange/5'
                    : opponentAnswered
                      ? 'border-brand-purple/50 bg-brand-purple/5'
                      : 'border-brand-purple/20'
              "
            >
              <div class="relative shrink-0">
                <div
                  class="w-10 h-10 rounded-full bg-brand-orange/20 overflow-hidden flex items-center justify-center border-2"
                  :class="
                    opponentAnsweredCorrect === true
                      ? 'border-brand-green'
                      : opponentAnsweredCorrect === false
                        ? 'border-brand-orange'
                        : opponentAnswered
                          ? 'border-brand-purple'
                          : 'border-brand-orange/30'
                  "
                >
                  <img
                    v-if="opponent?.avatar"
                    :src="opponent.avatar"
                    class="w-full h-full object-cover"
                    alt=""
                  />
                  <div v-else class="h-16 w-16 flex items-center justify-center">
                    <span id="nickaname" class="text-2xl font-bold text-brand-orange">
                      {{ opponent?.nickName?.charAt(0).toUpperCase() || '?' }}
                    </span>
                  </div>
                </div>
                <span
                  v-if="opponentAnsweredCorrect !== null"
                  class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                  :class="opponentAnsweredCorrect ? 'bg-brand-green' : 'bg-brand-orange'"
                >
                  <font-awesome-icon
                    :icon="opponentAnsweredCorrect ? 'check' : 'times'"
                    class="text-white"
                    style="font-size: 8px"
                  />
                </span>
                <span
                  v-else-if="opponentAnswered"
                  class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-brand-purple flex items-center justify-center"
                >
                  <font-awesome-icon icon="check" class="text-white" style="font-size: 8px" />
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-brand-lightGray truncate">
                  {{ opponent?.nickName ?? $t('competitive.matchmaking.opponent') }}
                </p>
                <p
                  class="text-xs"
                  :class="
                    opponentAnsweredCorrect === true
                      ? 'text-brand-green'
                      : opponentAnsweredCorrect === false
                        ? 'text-brand-orange'
                        : opponentAnswered
                          ? 'text-brand-purple'
                          : 'text-brand-gray'
                  "
                >
                  {{
                    opponentAnsweredCorrect === true
                      ? $t('competitive.quiz.correct')
                      : opponentAnsweredCorrect === false
                        ? $t('competitive.quiz.incorrect')
                        : opponentAnswered
                          ? $t('competitive.quiz.opponentAnswered')
                          : $t('competitive.quiz.waitingOpponent')
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- === CURRENT RANKING (après révélation des réponses) === -->
      <div v-else-if="showCurrentRanking" key="ranking" class="gaming-card">
        <div class="flex items-center gap-3 mb-4 pb-3 border-b border-brand-purple/20">
          <div
            class="w-8 h-8 rounded-xl bg-brand-yellow/20 flex items-center justify-center text-brand-yellow"
          >
            <font-awesome-icon icon="trophy" />
          </div>
          <h3 class="font-branding text-xl text-brand-lightGray">
            {{ $t('competitive.quiz.currentRanking') }}
          </h3>
        </div>

        <div class="space-y-2">
          <div
            v-for="(entry, index) in sortedScores"
            :key="entry.user.id"
            class="flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300"
            :class="
              index === 0
                ? 'border-brand-yellow/40 bg-brand-yellow/10'
                : 'border-brand-gray/40 bg-brand-gray/5'
            "
          >
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <!-- Position badge -->
              <span
                class="font-bold text-sm w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                :class="
                  index === 0
                    ? 'bg-brand-yellow/20 text-brand-yellow'
                    : 'bg-brand-gray/20 text-brand-gray'
                "
              >
                {{ index + 1 }}
              </span>

              <!-- Avatar -->
              <div class="relative shrink-0">
                <div
                  class="w-10 h-10 rounded-full border-2 overflow-hidden flex items-center justify-center"
                  :class="index === 0 ? 'border-brand-yellow' : 'border-brand-gray'"
                >
                  <img
                    v-if="entry.user.avatar"
                    :src="entry.user.avatar"
                    alt="avatar"
                    class="w-full h-full object-cover"
                  />
                  <span
                    v-else
                    class="text-lg font-bold"
                    :class="index === 0 ? 'text-brand-yellow' : 'text-brand-gray'"
                  >
                    {{ entry.user.nickName?.charAt(0).toUpperCase() || '?' }}
                  </span>
                </div>
                <!-- Crown / number badge -->
                <div
                  class="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-brand-dark flex items-center justify-center"
                  :class="index === 0 ? 'bg-brand-yellow' : 'bg-brand-gray'"
                >
                  <font-awesome-icon
                    v-if="index === 0"
                    icon="crown"
                    class="text-[10px] text-brand-dark"
                  />
                  <span v-else class="text-[10px] font-bold text-white">2</span>
                </div>
              </div>

              <span class="font-semibold text-brand-lightGray truncate">
                {{ entry.user.nickName }}
              </span>
            </div>

            <!-- Score -->
            <div
              class="font-branding text-xl shrink-0 ml-3"
              :class="index === 0 ? 'text-brand-yellow' : 'text-brand-gray'"
            >
              {{ entry.score }}
            </div>
          </div>
        </div>
      </div>

      <!-- === END GAME === -->
      <div v-else-if="phase === 'finished'" key="finished" class="space-y-6">
        <!-- Header : résultat + ELO + stats -->
        <div
          class="gaming-card text-center bg-gradient-to-br"
          :class="
            rankedStore.hasWon === true
              ? 'from-brand-green/15 to-brand-purple/10 border-brand-green/40'
              : rankedStore.hasWon === false
                ? 'from-brand-orange/15 to-brand-purple/10 border-brand-orange/40'
                : 'from-brand-purple/15 to-brand-purple/10'
          "
        >
          <!-- Titre -->
          <h3
            class="font-branding text-4xl mb-2"
            :class="
              rankedStore.hasWon === true
                ? 'text-brand-green glow-text'
                : rankedStore.hasWon === false
                  ? 'text-brand-orange'
                  : 'text-brand-lightGray'
            "
          >
            {{
              rankedStore.hasWon === true
                ? $t('competitive.quiz.victory')
                : rankedStore.hasWon === false
                  ? $t('competitive.quiz.defeat')
                  : $t('competitive.quiz.draw')
            }}
          </h3>

          <!-- Badge ELO -->
          <div
            v-if="rankedStore.eloChange !== null"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
            :class="
              rankedStore.hasWon === true
                ? 'bg-brand-green/15 border border-brand-green/30'
                : rankedStore.hasWon === false
                  ? 'bg-brand-orange/15 border border-brand-orange/30'
                  : 'bg-brand-purple/15 border border-brand-purple/30'
            "
          >
            <font-awesome-icon
              icon="chart-line"
              :class="
                rankedStore.hasWon === true
                  ? 'text-brand-green'
                  : rankedStore.hasWon === false
                    ? 'text-brand-orange'
                    : 'text-brand-purple'
              "
            />
            <span
              class="font-branding text-xl"
              :class="
                rankedStore.hasWon === true
                  ? 'text-brand-green'
                  : rankedStore.hasWon === false
                    ? 'text-brand-orange'
                    : 'text-brand-lightGray'
              "
            >
              {{
                rankedStore.hasWon === true
                  ? $t('competitive.quiz.eloGained', { points: rankedStore.eloChange })
                  : rankedStore.hasWon === false
                    ? $t('competitive.quiz.eloLost', { points: rankedStore.eloChange })
                    : $t('competitive.quiz.eloUnchanged')
              }}
            </span>
          </div>

          <!-- Stats -->
          <div class="flex items-center justify-center gap-6 mt-2">
            <div class="text-center">
              <div class="text-sm text-brand-gray mb-1">
                {{ $t('competitive.quiz.finalScore') }}
              </div>
              <div class="font-branding text-3xl text-brand-yellow">{{ myScore }}</div>
            </div>
            <div class="h-12 w-px bg-brand-purple/30"></div>
            <div class="text-center">
              <div class="text-sm text-brand-gray mb-1">{{ $t('competitive.quiz.questions') }}</div>
              <div class="font-branding text-3xl text-brand-lightGray">{{ totalQuestions }}</div>
            </div>
            <div class="h-12 w-px bg-brand-purple/30"></div>
            <div class="text-center">
              <div class="text-sm text-brand-gray mb-1">
                {{ $t('competitive.quiz.successRate') }}
              </div>
              <div class="font-branding text-3xl text-brand-green">
                {{ totalQuestions ? Math.round((correctAnswersCount / totalQuestions) * 100) : 0 }}%
              </div>
            </div>
          </div>

          <!-- Badges correct / incorrect -->
          <div class="flex items-center justify-center gap-3 mt-6">
            <div class="badge-success">
              <font-awesome-icon icon="check-circle" class="mr-1" />
              {{ correctAnswersCount }} {{ $t('competitive.quiz.correctAnswers') }}
            </div>
            <div class="badge-warning">
              <font-awesome-icon icon="times-circle" class="mr-1" />
              {{ totalQuestions - correctAnswersCount }}
              {{ $t('competitive.quiz.incorrectAnswers') }}
            </div>
          </div>
        </div>

        <!-- Récapitulatif des questions -->
        <div class="gaming-card">
          <div class="flex items-center gap-3 mb-6 pb-4 border-b border-brand-purple/20">
            <div
              class="w-8 h-8 rounded-xl bg-brand-purple/20 flex items-center justify-center text-brand-purple"
            >
              <font-awesome-icon icon="list-check" />
            </div>
            <h3 class="font-branding text-2xl text-brand-lightGray">
              {{ $t('competitive.quiz.summary') }}
            </h3>
          </div>

          <div class="space-y-4">
            <div
              v-for="(entry, idx) in questionHistory"
              :key="idx"
              class="rounded-2xl border border-brand-purple/20 bg-brand-darkGray/50 p-4 hover:border-brand-purple/40 transition-all duration-300"
            >
              <!-- En-tête question -->
              <div class="flex items-start gap-3 mb-3">
                <div
                  class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                  :class="
                    entry.correct
                      ? 'bg-brand-green/20 text-brand-green border border-brand-green/40'
                      : 'bg-brand-orange/20 text-brand-orange border border-brand-orange/40'
                  "
                >
                  {{ idx + 1 }}
                </div>
                <div class="flex-1">
                  <p class="font-semibold text-brand-lightGray mb-2">
                    {{ entry.question.question?.label }}
                  </p>
                  <div v-if="entry.correct" class="badge-success text-xs">
                    <font-awesome-icon icon="check" class="mr-1" />
                    {{ $t('competitive.quiz.goodAnswer') }}
                  </div>
                  <div v-else class="badge-warning text-xs">
                    <font-awesome-icon icon="times" class="mr-1" />
                    {{ $t('competitive.quiz.badAnswer') }}
                  </div>
                </div>
              </div>

              <!-- Réponses -->
              <div class="grid gap-2 sm:grid-cols-2 mt-3">
                <div
                  v-for="answer in entry.question.question?.answer"
                  :key="answer.id"
                  class="rounded-xl px-3 py-2 text-sm border transition-all duration-200"
                  :class="getAnswerClass(entry.selectedAnswerId, answer)"
                >
                  <div class="flex items-center gap-2">
                    <span class="flex-shrink-0">
                      <font-awesome-icon v-if="answer.valid" icon="check" />
                      <font-awesome-icon
                        v-else-if="entry.selectedAnswerId === answer.id"
                        icon="times"
                      />
                      <font-awesome-icon v-else icon="circle" class="text-xs" />
                    </span>
                    <span class="flex-1">{{ answer.value }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions (sticky bas) -->
        <div
          class="flex flex-col sm:flex-row items-center justify-center gap-3 sticky bottom-0 left-0 right-0 pb-3"
        >
          <button class="btn btn-ghost w-full sm:w-auto" @click="$emit('home')">
            <font-awesome-icon icon="house" class="mr-2" />
            {{ $t('competitive.quiz.home') }}
          </button>
          <button class="btn btn-primary w-full sm:w-auto" @click="$emit('replay')">
            <font-awesome-icon icon="rotate-right" class="mr-2" />
            {{ $t('competitive.quiz.replay') }}
          </button>
        </div>
      </div>
    </Transition>

    <div v-if="!finished" class="flex flex-wrap items-center justify-end gap-3 mt-4 text-sm">
      <button class="btn btn-ghost" @click="showConfirmLeaveModal = true">
        <font-awesome-icon icon="arrow-right-from-bracket" class="mr-2" />
        {{ $t('competitive.quiz.abort') }}
      </button>
    </div>

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

  <!-- === COUNTDOWN === -->
  <transition name="countdown-fade">
    <div
      v-if="countdownValue !== null && phase === 'countdown'"
      class="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/80 backdrop-blur-sm mt-0"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="text-center select-none">
        <transition name="countdown-swap" mode="out-in">
          <div
            :key="countdownValue"
            class="countdown-pop drop-shadow-[0_0_30px_rgba(108,92,231,0.55)]"
            :class="countdownTextClass"
          >
            {{ countdownValue }}
          </div>
        </transition>
        <div class="countdown-message mt-4 text-sm text-brand-lightGray/80">
          {{ $t('competitive.quiz.getReady') }}
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'
import { onBeforeRouteLeave, useRouter, type RouteLocationNormalized } from 'vue-router'
import signalrService, { RankedEvent } from '@/services/signalrService'
import useRankedStore from '@/stores/ranked'
import type { RankedUser, RankedQuestion, UserAnswered, UserScore } from '@/stores/ranked'
import { useRankedLifecycle } from '@/composables/useRankedLifecycle'
import ModalDialog from '@/components/ModalDialog.vue'

const props = defineProps<{
  opponent: RankedUser
  currentUser: RankedUser | null
  initialCountdown?: number
}>()

const emit = defineEmits<{ home: []; replay: [] }>()

const { t } = useI18n()
const router = useRouter()
const rankedStore = useRankedStore()
const { cleanupRanked } = useRankedLifecycle()

// ─── Confirmation de sortie ───────────────────────────────────────────────────
const showConfirmLeaveModal = ref(false)
let pendingNavigation: { to: RouteLocationNormalized; from: RouteLocationNormalized } | null = null

// ─── Phase ───────────────────────────────────────────────────────────────────
type Phase = 'countdown' | 'question' | 'answered' | 'revealing' | 'finished'
const phase = ref<Phase>(props.initialCountdown !== undefined ? 'countdown' : 'question')
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
const myScore = ref(0)
const scores = ref<UserScore[]>([])
const finished = computed(() => phase.value === 'finished')
const showCurrentRanking = computed(() => phase.value === 'revealing' && scores.value.length > 0)
const sortedScores = computed(() => [...scores.value].sort((a, b) => b.score - a.score))

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
  if (answersRevealed.value) {
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

// ─── Functions ──────────────────────────────────────────────────────────────
const countdownTextClass = computed(() => {
  // Variantes de couleur façon “3-2-1” arcade
  if (countdownValue.value === 3) return 'text-brand-yellow'
  if (countdownValue.value === 2) return 'text-brand-orange'
  if (countdownValue.value === 1) return 'text-brand-green'
  return 'text-brand-lightGray'
})

// ─── Send answer ──────────────────────────────────────────────────────────────
async function sendAnswer(answerId: number) {
  if (phase.value !== 'question' || meAnswered.value) return

  selectedAnswerId.value = answerId
  meAnswered.value = true
  phase.value = 'answered'
  stopTimer()

  try {
    await signalrService.invoke(RankedEvent.SendAnswer, answerId)
  } catch (e) {
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
    questionHistory.value.push({
      question: currentQuestionData.value,
      correct: myAnsweredResult.value ?? false,
      points: 0,
      selectedAnswerId: selectedAnswerId.value,
    })
  }
}

function onQuestionAnswerSend(question: RankedQuestion) {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG)
    console.log('[SignalR] Question answer revealed:', question)
  currentQuestionData.value = question
  answersRevealed.value = true
  stopTimer()

  // Update the last history entry with the revealed question (answers have `valid` set)
  const last = questionHistory.value[questionHistory.value.length - 1]
  if (last && last.question.currentIndex === question.currentIndex) {
    last.question = question
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
      lastPoints.value = earned > 0 ? earned : 0

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
  { name: RankedEvent.Error, handler: onError },
]

// Fermeture de l'onglet/navigateur pendant la partie
const handleBeforeUnload = () => {
  // SignalR n'est pas disponible en synchrone sur beforeunload,
  // on se contente de déconnecter proprement côté serveur via la perte de connexion.
  // Si nécessaire, ajouter ici un fetch keepalive vers une API de forfait ranked.
}

// ─── Answer class pour le récapitulatif ──────────────────────────────────────
function getAnswerClass(selectedId: number | null, answer: { id: number; valid: boolean | null }) {
  const isCorrect = answer.valid === true
  const isUserChoice = selectedId === answer.id

  if (isCorrect && isUserChoice)
    return 'bg-brand-green/20 border-brand-green text-brand-green font-semibold'
  if (isCorrect) return 'bg-brand-green/10 border-brand-green/40 text-brand-green'
  if (isUserChoice) return 'bg-brand-orange/20 border-brand-orange text-brand-orange font-semibold'
  return 'bg-brand-darkGray/30 border-brand-gray/20 text-brand-gray'
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
  // Même pattern que GroupQuiz :
  // 1. Nettoyer TOUS les handlers existants pour ces events (évite les doublons)
  // 2. Enregistrer les nouveaux handlers directement (pas de wrapper anonyme)
  allEvents.forEach((event) => signalrService.off(event.name))
  allEvents.forEach((event) => signalrService.on(event.name, event.handler))

  window.addEventListener('beforeunload', handleBeforeUnload)
  window.addEventListener('keydown', handleKeyPress)
})

onBeforeUnmount(async () => {
  stopTimer()

  window.removeEventListener('beforeunload', handleBeforeUnload)
  window.removeEventListener('keydown', handleKeyPress)

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
  if (phase.value !== 'finished') {
    pendingNavigation = { to, from }
    showConfirmLeaveModal.value = true
    next(false)
  } else {
    next()
  }
})

async function confirmLeave() {
  showConfirmLeaveModal.value = false

  await cleanupRanked()

  if (pendingNavigation) {
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
