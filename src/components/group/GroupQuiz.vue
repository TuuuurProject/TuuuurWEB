<template>
  <section class="space-y-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <button class="pill" @click="exitQuizGame">
          <font-awesome-icon icon="arrow-left" class="mr-2" />
          {{ $t('group.quiz.home') }}
        </button>
        <h2 class="font-branding text-3xl">{{ $t('group.quiz.title') }}</h2>
      </div>
      <div v-if="!finished" class="flex items-center gap-3">
        <span class="pill">{{
          $t('group.quiz.question', { current: lastQuestionIndex + 1, total: nbMaxQuestions })
        }}</span>
        <span class="pill">
          {{ $t('group.quiz.score') }} <strong>{{ globalUserScore }}</strong>
        </span>
      </div>
    </header>

    <!-- Timer / progress -->
    <div
      v-if="!finished"
      class="rounded-2xl overflow-hidden border border-brand-purple/20 bg-brand-darkGray/80 shadow-neon"
    >
      <div class="h-2 w-full bg-brand-dark/30">
        <div
          class="h-2 transition-[width] duration-250"
          :class="remainingRatio < 0.33 ? 'bg-brand-orange' : 'bg-brand-green'"
          :style="{ width: (remainingRatio * 100).toFixed(2) + '%' }"
        />
      </div>
      <div class="px-6 py-3 flex items-center justify-between text-sm text-brand-lightGray">
        <span>{{ $t('group.quiz.timeRemaining', { time: remaining.toFixed(1) }) }}</span>
      </div>
    </div>

    <!-- Question card -->
    <div v-if="!finished" class="gaming-card">
      <overlay-block :loading="false">
        <h3 class="font-branding text-2xl mb-4 text-brand-lightGray">{{ currentQuestion }}</h3>
        <div class="grid gap-3 sm:grid-cols-2">
          <button
            v-for="(opt, idx) in currentAnswer"
            :key="opt"
            class="group rounded-2xl border px-4 py-3 text-left font-semibold transition duration-250 relative"
            :disabled="answered"
            :class="buttonClass(opt.valid)"
            @click="answer(opt)"
          >
            <span
              class="absolute top-2 right-2 w-6 h-6 rounded-md bg-brand-purple/20 border border-brand-purple/40 text-brand-purple text-xs flex items-center justify-center font-bold"
            >
              {{ idx + 1 }}
            </span>
            {{ opt?.value }}
          </button>
        </div>

        <div class="mt-6 flex items-center justify-between">
          <div class="text-sm" v-if="answered">
            <span v-if="wasCorrect" class="badge-green">{{
              $t('group.quiz.correct', { points: lastPoints })
            }}</span>
            <span v-else class="badge-orange">{{ $t('group.quiz.incorrect') }}</span>
          </div>
          <!-- <div class="flex items-center gap-3 ml-auto">
            <button class="btn btn-secondary" @click="skip" :disabled="answered">
              {{ $t('group.quiz.skip') }}
              <span
                v-if="!answered"
                class="ml-2 px-2 py-0.5 rounded bg-brand-lightGray/20 text-xs font-mono"
              >
                S
              </span>
            </button>
            <button class="btn btn-primary relative" @click="next" :disabled="!answered">
              {{ $t('group.quiz.next') }}
              <span
                v-if="answered"
                class="ml-2 px-2 py-0.5 rounded bg-brand-lightGray/20 text-xs font-mono"
              >
                <font-awesome-icon icon="turn-down" />
              </span>
            </button>
          </div> -->
        </div>
      </overlay-block>
    </div>

    <!-- Results -->
    <div v-else class="space-y-6">
      <!-- Header avec score final -->
      <div
        class="gaming-card text-center bg-gradient-to-br from-brand-purple/20 to-brand-orange/20"
      >
        <div
          class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-yellow/20 border-2 border-brand-yellow mb-4 animate-pulse-slow"
        >
          <font-awesome-icon icon="trophy" class="text-3xl text-brand-yellow" />
        </div>
        <h3 class="font-branding text-4xl mb-2 text-brand-lightGray glow-text">
          {{ $t('group.quiz.finished') }}
        </h3>
        <div class="flex items-center justify-center gap-6 mt-4">
          <div class="text-center">
            <div class="text-sm text-brand-gray mb-1">{{ $t('group.quiz.finalScore') }}</div>
            <div class="font-branding text-3xl text-brand-yellow">{{ globalUserScore }}</div>
          </div>
          <div class="h-12 w-px bg-brand-purple/30"></div>
          <div class="text-center">
            <div class="text-sm text-brand-gray mb-1">{{ $t('group.quiz.questions') }}</div>
            <div class="font-branding text-3xl text-brand-lightGray">INFO</div>
          </div>
          <div class="h-12 w-px bg-brand-purple/30"></div>
          <div class="text-center">
            <div class="text-sm text-brand-gray mb-1">{{ $t('group.quiz.successRate') }}</div>
            <div class="font-branding text-3xl text-brand-green">
              {{ Math.round((correctAnswersCount / 10) * 100) }}%
            </div>
          </div>
        </div>

        <!-- Statistiques rapides -->
        <div class="flex items-center justify-center gap-3 mt-6">
          <div class="badge-success">
            <font-awesome-icon icon="check-circle" class="mr-1" />
            {{ correctAnswersCount }} {{ $t('group.quiz.correctAnswers') }}
          </div>
          <div class="badge-warning">
            <font-awesome-icon icon="times-circle" class="mr-1" />
            {{ 10 - correctAnswersCount }}
            {{ $t('group.quiz.incorrectAnswers') }}
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
            {{ $t('group.quiz.summary') }}
          </h3>
        </div>

        <div class="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          <div
            v-for="(questionData, idx) in allQuestionsParty"
            :key="idx"
            class="rounded-2xl border border-brand-purple/20 bg-brand-darkGray/50 p-4 hover:border-brand-purple/40 transition-all duration-300"
          >
            {{ questionData }}
            <!-- En-tête de la question -->
            <div class="flex items-start gap-3 mb-3">
              <div
                class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                :class="
                  isQuestionCorrect(questionData)
                    ? 'bg-brand-green/20 text-brand-green border border-brand-green/40'
                    : 'bg-brand-orange/20 text-brand-orange border border-brand-orange/40'
                "
              >
                {{ idx + 1 }}
              </div>
              <div class="flex-1">
                <p class="font-semibold text-brand-lightGray mb-2">
                  {{ questionData?.question?.label }}
                </p>
                <div v-if="isQuestionCorrect(questionData)" class="badge-success text-xs">
                  <font-awesome-icon icon="check" class="mr-1" />
                  {{ $t('group.quiz.goodAnswer') }} +{{ getQuestionPoints(questionData) }}
                  pts
                </div>
                <div v-else class="badge-warning text-xs">
                  <font-awesome-icon icon="times" class="mr-1" /> {{ $t('group.quiz.badAnswer') }}
                </div>
              </div>
            </div>

            <!-- Liste des réponses -->
            <div class="grid gap-2 sm:grid-cols-2 mt-3">
              <div
                v-for="answer in questionData?.question?.answer"
                :key="answer.id"
                class="rounded-xl px-3 py-2 text-sm border transition-all duration-200"
                :class="getAnswerClass(questionData, answer)"
              >
                <div class="flex items-center gap-2">
                  <span class="flex-shrink-0">
                    <font-awesome-icon v-if="answer.valid" icon="check" />
                    <font-awesome-icon v-else-if="isUserAnswer(questionData)" icon="times" />
                    <font-awesome-icon v-else icon="circle" class="text-xs" />
                  </span>
                  <span class="flex-1">{{ answer.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions finales -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button class="btn btn-secondary w-full sm:w-auto" @click="exitQuizGame">
          <font-awesome-icon icon="arrow-left" class="mr-2" /> {{ $t('common.leave') }}
        </button>
      </div>
    </div>

    <!-- Mario Kart style Countdown Overlay -->
    <transition name="countdown-fade">
      <div
        v-if="countdownValue !== null"
        class="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/80 backdrop-blur-sm"
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
            {{ $t('group.quiz.getReady') }}
          </div>
        </div>
      </div>
    </transition>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, getCurrentInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import OverlayBlock from '@/components/OverlayBlock.vue'
import signalrService, { GroupEvent } from '@/services/signalrService'
import useGroupeStore from '@/stores/groupe'

const groupeStore = useGroupeStore()

const { t } = useI18n()

const TOTAL_TIME = 15 // seconds per question

const emit = defineEmits<{
  (e: 'exit'): void
}>()

const nbMaxQuestions = ref(0)
const answered = ref(false)
const wasCorrect = ref(false)
const lastPoints = ref(0)
const finished = ref(false)
const globalUserScore = ref(0)
const userAnswerId = ref(<number | null>null)

const remaining = ref(TOTAL_TIME)
let timer: number | null = null

const remainingRatio = computed(() => Math.max(0, remaining.value / TOTAL_TIME))

const instance = getCurrentInstance()
const proxy = instance?.proxy

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
  timer = window.setInterval(async () => {
    remaining.value = Math.max(0, +(remaining.value - 0.1).toFixed(1))
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

const answer = async (opt: { id: number }) => {
  if (answered.value) return
  answered.value = true

  clearTimer()

  // Set user answer ID
  userAnswerId.value = opt.id

  console.log('Answer selected answer ID:', opt.id)

  // Answer
  if (signalrService.isConnected()) {
    await signalrService.send(GroupEvent.SendAnswer, opt.id)
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

function buttonClass(valid: boolean) {
  if (!answered.value) {
    return 'bg-brand-darkGray/50 border-brand-purple/30 text-brand-lightGray hover:bg-brand-purple/20 hover:border-brand-purple'
  }

  if (valid === null) return

  return valid
    ? 'bg-brand-green/20 border-brand-green text-brand-green'
    : 'bg-brand-orange/20 border-brand-orange text-brand-orange'
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

// Fonctions pour le récapitulatif
const correctAnswersCount = computed(() => {
  return allQuestionsParty.value.filter((q: any) => isQuestionCorrect(q)).length
})

const isQuestionCorrect = (questionData: any) => {
  if (!questionData?.correct) return false
  return questionData?.correct
}

const getQuestionPoints = (questionData: any) => {
  // Simuler les points gagnés (à adapter selon votre logique)
  return questionData?.score || 100
}

const isUserAnswer = (questionData: any) => {
  return questionData?.idAnswer !== null
}

const isUserAnswerIsCorrect = (questions: any, answerId: number) => {
  const answer = questions.answer.find((ans: { id: number }) => ans.id === answerId)

  return answer ? answer.valid : false
}

const getAnswerClass = (questionData: any, answer: any) => {
  const isCorrect = answer.valid
  const isUserChoice = isUserAnswer(questionData)

  if (isCorrect && isUserChoice) {
    // Bonne réponse sélectionnée
    return 'bg-brand-green/20 border-brand-green text-brand-green font-semibold'
  } else if (isCorrect) {
    // Bonne réponse non sélectionnée
    return 'bg-brand-green/10 border-brand-green/40 text-brand-green'
  } else if (isUserChoice) {
    // Mauvaise réponse sélectionnée
    return 'bg-brand-orange/20 border-brand-orange text-brand-orange font-semibold'
  } else {
    // Autre réponse
    return 'bg-brand-darkGray/30 border-brand-gray/20 text-brand-gray'
  }
}

const exitQuizGame = async () => {
  await groupeStore.leaveGroupe()
  emit('exit')
}

// Handlers for SignalR events
const countdownValue = ref<number | null>(null)
let countdownClearTimeout: number | null = null

const countdownTextClass = computed(() => {
  // Variantes de couleur façon “3-2-1” arcade
  if (countdownValue.value === 3) return 'text-brand-yellow'
  if (countdownValue.value === 2) return 'text-brand-orange'
  if (countdownValue.value === 1) return 'text-brand-green'
  return 'text-brand-lightGray'
})

const handleOnUserAnswer = (data: any) => {
  console.log('User answer received:', data)
}

const handleCountdownEvent = (data: any) => {
  console.log('Countdown event received:', data)

  const value = Number(data)
  if (!Number.isFinite(value)) return

  // Affiche 3 / 2 / 1 en gros overlay
  if (value >= 1) {
    countdownValue.value = value

    // Reset du timeout à chaque tick pour éviter un état “bloqué”
    if (countdownClearTimeout != null) clearTimeout(countdownClearTimeout)

    // On masque un poil après le "1"
    if (value === 1) {
      countdownClearTimeout = window.setTimeout(() => {
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
  console.log('New question received:', data)

  // Reset user answer ID
  userAnswerId.value = null

  // Start timer, reset for new question and get question data
  answered.value = false
  wasCorrect.value = false
  lastPoints.value = 0
  groupeStore.groupePartyInfo?.partyQuestions.push(data)

  // Clear timer before start new one
  clearTimer()
  startTimer()
}

const handleQuestionAnswerSend = (data: any) => {
  console.log('Answer received for question:', data)

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
  console.log('Party finished:', data)
  finished.value = true
}

const handleOnError = (error: any) => {
  console.log('Lobby deleted:', error)
  proxy?.$toast.error(error)
}

const allEvents = [
  { name: GroupEvent.Countdown, handler: handleCountdownEvent },
  { name: GroupEvent.QuestionSend, handler: handleQuestionSend },
  { name: GroupEvent.QuestionAnswerSend, handler: handleQuestionAnswerSend },
  { name: GroupEvent.UserAnswer, handler: handleOnUserAnswer },
  { name: GroupEvent.PartyFinished, handler: handlePartyFinished },
  { name: GroupEvent.Error, handler: handleOnError },
]

onMounted(async () => {
  // Connection signalR
  try {
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
  window.addEventListener('keydown', handleKeyPress)
})

onBeforeUnmount(() => {
  clearTimer()
  clearCountdownOverlay()
  // Retirer l'écouteur d'événements clavier
  window.removeEventListener('keydown', handleKeyPress)
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(10, 11, 30, 0.5);
  border-radius: 9999px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(108, 92, 231, 0.4);
  border-radius: 9999px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(108, 92, 231, 0.6);
}

/* Countdown overlay animation (Mario Kart vibe) */
.countdown-pop {
  font-size: clamp(96px, 18vw, 220px);
  line-height: 1;
  text-shadow:
    0 0 18px rgba(108, 92, 231, 0.55),
    0 0 42px rgba(108, 92, 231, 0.35);
  animation: countdown-pop 420ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
}

.countdown-message {
  font-size: 2rem;
  animation: countdown-pop 420ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
  animation-delay: 150ms;
}

@keyframes countdown-pop {
  0% {
    transform: scale(0.65) rotate(-3deg);
    opacity: 0;
    filter: blur(2px);
  }
  60% {
    transform: scale(1.08) rotate(1deg);
    opacity: 1;
    filter: blur(0px);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* Transition for overlay */
.countdown-fade-enter-active,
.countdown-fade-leave-active {
  transition: opacity 180ms ease;
}
.countdown-fade-enter-from,
.countdown-fade-leave-to {
  opacity: 0;
}

.countdown-swap-enter-active,
.countdown-swap-leave-active {
  transition:
    transform 120ms cubic-bezier(0.2, 0.9, 0.2, 1),
    opacity 120ms ease;
}

.countdown-swap-enter-from {
  transform: scale(0.8);
  opacity: 0;
}
.countdown-swap-enter-to {
  transform: scale(1);
  opacity: 1;
}

.countdown-swap-leave-from {
  transform: scale(1);
  opacity: 1;
}
.countdown-swap-leave-to {
  transform: scale(1.08);
  opacity: 0;
}
</style>
