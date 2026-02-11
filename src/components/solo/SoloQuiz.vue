<template>
  <section class="space-y-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <h2 class="font-branding text-3xl">{{ $t('solo.quiz.title') }}</h2>
      </div>
      <div v-if="!finished" class="flex items-center gap-3">
        <span class="pill">{{
          $t('solo.quiz.question', { current: index + 1, total: nbMaxQuestions })
        }}</span>
        <span class="pill">
          {{ $t('solo.quiz.score') }} <strong>{{ score }}</strong>
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
        <span>{{ $t('solo.quiz.timeRemaining', { time: remaining.toFixed(1) }) }}</span>
      </div>
    </div>

    <!-- Question card -->
    <div v-if="!finished" class="gaming-card">
      <overlay-block :loading="soloStore.isLoading">
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
              $t('solo.quiz.correct', { points: lastPoints })
            }}</span>
            <span v-else class="badge-orange">{{ $t('solo.quiz.incorrect') }}</span>
          </div>
          <div class="flex items-center gap-3 ml-auto">
            <button class="btn btn-secondary" @click="skip" :disabled="answered">
              {{ $t('solo.quiz.skip') }}
              <span
                v-if="!answered"
                class="ml-2 px-2 py-0.5 rounded bg-brand-lightGray/20 text-xs font-mono"
              >
                S
              </span>
            </button>
            <button class="btn btn-primary relative" @click="next" :disabled="!answered">
              {{ $t('solo.quiz.next') }}
              <span
                v-if="answered"
                class="ml-2 px-2 py-0.5 rounded bg-brand-lightGray/20 text-xs font-mono"
              >
                <font-awesome-icon icon="turn-down" />
              </span>
            </button>
          </div>
        </div>
      </overlay-block>
    </div>

    <!-- Results -->
    <div v-if="finished" class="space-y-6">
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
          {{ $t('solo.quiz.finished') }}
        </h3>
        <div class="flex items-center justify-center gap-6 mt-4">
          <div class="text-center">
            <div class="text-sm text-brand-gray mb-1">{{ $t('solo.quiz.finalScore') }}</div>
            <div class="font-branding text-3xl text-brand-yellow">{{ score }}</div>
          </div>
          <div class="h-12 w-px bg-brand-purple/30"></div>
          <div class="text-center">
            <div class="text-sm text-brand-gray mb-1">{{ $t('solo.quiz.questions') }}</div>
            <div class="font-branding text-3xl text-brand-lightGray">
              {{ (soloPartyInfoComputed as PartyInfo)?.nbQuestions }}
            </div>
          </div>
          <div class="h-12 w-px bg-brand-purple/30"></div>
          <div class="text-center">
            <div class="text-sm text-brand-gray mb-1">{{ $t('solo.quiz.successRate') }}</div>
            <div class="font-branding text-3xl text-brand-green">
              {{
                Math.round(
                  (correctAnswersCount / (soloPartyInfoComputed as PartyInfo)?.nbQuestions) * 100,
                )
              }}%
            </div>
          </div>
        </div>

        <!-- Statistiques rapides -->
        <div class="flex items-center justify-center gap-3 mt-6">
          <div class="badge-success">
            <font-awesome-icon icon="check-circle" class="mr-1" />
            {{ correctAnswersCount }} {{ $t('solo.quiz.correctAnswers') }}
          </div>
          <div class="badge-warning">
            <font-awesome-icon icon="times-circle" class="mr-1" />
            {{ (soloPartyInfoComputed as PartyInfo)?.nbQuestions - correctAnswersCount }}
            {{ $t('solo.quiz.incorrectAnswers') }}
          </div>
        </div>
      </div>

      <!-- Informations de la partie -->
      <div class="gaming-card">
        <div class="flex items-center gap-3 mb-6 pb-4 border-b border-brand-purple/20">
          <div
            class="w-8 h-8 rounded-xl bg-brand-purple/20 flex items-center justify-center text-brand-purple"
          >
            <font-awesome-icon icon="info-circle" />
          </div>
          <h3 class="font-branding text-2xl text-brand-lightGray">
            {{ $t('solo.quiz.partyInfo') }}
          </h3>
        </div>

        <div class="space-y-4">
          <!-- Thèmes -->
          <div class="flex flex-wrap gap-2 items-center">
            <h3 class="font-branding text-xl text-brand-lightGray">
              <font-awesome-icon icon="tag" class="mr-2" /> {{ $t('solo.quiz.themes') }} :
            </h3>
            <div class="flex flex-wrap gap-3">
              <div
                v-for="theme in partyThemes"
                :key="theme.id"
                class="category-button group inline-flex items-center gap-2 px-4 py-3 font-semibold"
              >
                <font-awesome-icon :icon="theme.icon" class="text-lg" />
                <span>{{ theme.label }}</span>
              </div>
            </div>
          </div>

          <!-- Difficultés -->
          <div class="flex flex-wrap gap-2 items-center">
            <h3 class="font-branding text-xl text-brand-lightGray">
              <font-awesome-icon icon="fire" class="mr-2 text-brand-orange" />
              {{ $t('solo.quiz.difficulties') }} :
            </h3>
            <div class="flex flex-wrap gap-3">
              <div
                v-for="diff in partyDifficulties"
                :key="diff?.id"
                class="difficulty-button group inline-flex items-center gap-2 px-4 py-3 font-semibold"
                :class="[diff?.colorClass]"
              >
                <font-awesome-icon :icon="diff?.icon" class="text-lg" />
                <span>{{ diff?.label }}</span>
              </div>
            </div>
          </div>

          <!-- Nombre de questions -->
          <div>
            <h3 class="font-branding text-xl text-brand-lightGray">
              <font-awesome-icon icon="list-ol" class="mr-2" />
              {{ $t('solo.quiz.numberOfQuestions') }} :
              {{ (soloPartyInfoComputed as PartyInfo)?.nbQuestions }}
            </h3>
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
          <h3 class="font-branding text-2xl text-brand-lightGray">{{ $t('solo.quiz.summary') }}</h3>
        </div>

        <div class="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          <div
            v-for="(questionData, idx) in allQuestionsParty"
            :key="idx"
            class="rounded-2xl border border-brand-purple/20 bg-brand-darkGray/50 p-4 hover:border-brand-purple/40 transition-all duration-300"
          >
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
                  {{ $t('solo.quiz.goodAnswer') }} +{{ getQuestionPoints(questionData) }}
                  pts
                </div>
                <div v-else class="badge-warning text-xs">
                  <font-awesome-icon icon="times" class="mr-1" /> {{ $t('solo.quiz.badAnswer') }}
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
      <div
        class="sticky bottom-0 left-0 right-0 flex flex-col sm:flex-row items-center justify-center gap-3 pb-3"
      >
        <button
          class="btn btn-secondary w-full sm:w-auto"
          @click="comeFromHistory ? router.push({ name: 'Profile' }) : $emit('exit')"
        >
          <font-awesome-icon icon="arrow-left" class="mr-2" /> {{ $t('common.back') }}
        </button>
        <button v-if="!comeFromHistory" class="btn btn-primary w-full sm:w-auto" @click="restart">
          <font-awesome-icon icon="rotate-right" class="mr-2" /> {{ $t('solo.quiz.replay') }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import useSoloStore from '@/stores/solo.js'
import useThemeStore from '@/stores/theme.js'
import OverlayBlock from '@/components/OverlayBlock.vue'

const soloStore = useSoloStore()
const themeStore = useThemeStore()
const router = useRouter()
const { t } = useI18n()

const TOTAL_TIME = 15 // seconds per question

interface PartyInfo {
  nbQuestions: number
  score: number
  finish: boolean
}

const index = ref(0)
const nbMaxQuestions = ref(0)
const score = ref(0)
const answered = ref(false)
const wasCorrect = ref(false)
const lastPoints = ref(0)
const finished = ref(false)
const comeFromHistory = ref(false)

const remaining = ref(TOTAL_TIME)
let timer: number | null = null

const remainingRatio = computed(() => Math.max(0, remaining.value / TOTAL_TIME))

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
      await soloStore.loadAnswerById(null)

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

const answer = async (opt: { id: string }) => {
  if (answered.value) return
  answered.value = true

  clearTimer()

  // Load the answer by ID
  await soloStore.loadAnswerById(parseInt(opt.id))

  // Test if correct
  wasCorrect.value = isUserAnswerIsCorrect(parseInt(opt.id))

  let newScore = 0
  if (wasCorrect.value) {
    newScore = getScoreAfterAnswer()
    lastPoints.value = Math.abs(score.value - newScore)
    score.value = newScore
  } else {
    lastPoints.value = 0
  }
}

const skip = async () => {
  if (!answered.value) {
    // Load the answer by ID, set to null to indicate skip
    await soloStore.loadAnswerById(null)

    answered.value = true
    clearTimer()
    wasCorrect.value = false
    lastPoints.value = 0
  }
}

const soloPartyInfoComputed = computed(() => {
  if (soloStore.isLoading) return null
  return soloStore.partyInfo
})

const next = async () => {
  if (!answered.value) return

  await soloStore.loadPartyInfo()

  if (index.value + 1 >= nbMaxQuestions.value) {
    finished.value = true
    clearTimer()
    return
  }
  index.value++
  answered.value = false
  wasCorrect.value = false
  lastPoints.value = 0
  startTimer()
}

const restart = async () => {
  await soloStore.createSoloParty()
  await soloStore.loadPartyInfo()

  router.replace({ name: 'SoloQuiz', params: { id: soloStore.partyId } })

  answered.value = false
  index.value = 0
  score.value = 0
  wasCorrect.value = false
  lastPoints.value = 0
  finished.value = false
  startTimer()
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
  if (soloStore.partyInfo) {
    return soloStore.getQuestions
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

const isUserAnswerIsCorrect = (answerId: number) => {
  const currentQuestionData = allQuestionsParty.value[lastQuestionIndex.value]
  if (!currentQuestionData) return false

  const answer = currentQuestionData.question.answer.find(
    (ans: { id: number }) => ans.id === answerId,
  )
  return answer ? answer.valid : false
}

const getScoreAfterAnswer = () => {
  return soloStore.partyInfo ? (soloStore.partyInfo as PartyInfo).score : 0
}

// Fonctions pour le récapitulatif
const correctAnswersCount = computed(() => {
  return allQuestionsParty.value.filter((q: any) => isQuestionCorrect(q)).length
})

const isQuestionCorrect = (questionData: any) => {
  if (!questionData?.userPartyQuestion?.correct) return false
  return questionData?.userPartyQuestion?.correct
}

const getQuestionPoints = (questionData: any) => {
  // Simuler les points gagnés (à adapter selon votre logique)
  return questionData?.userPartyQuestion?.score || 100
}

const isUserAnswer = (questionData: any) => {
  return questionData?.userPartyQuestion?.idAnswer !== null
}

// Computed properties pour les informations de la partie
const difficulties = computed(() => [
  {
    id: 1,
    label: t('solo.difficulties.easy'),
    icon: 'seedling',
    colorClass: 'diff-easy',
    glowClass: 'glow-green',
  },
  {
    id: 2,
    label: t('solo.difficulties.medium'),
    icon: 'bolt',
    colorClass: 'diff-medium',
    glowClass: 'glow-yellow',
  },
  {
    id: 3,
    label: t('solo.difficulties.hard'),
    icon: 'fire',
    colorClass: 'diff-hard',
    glowClass: 'glow-orange',
  },
  {
    id: 4,
    label: t('solo.difficulties.hardcore'),
    icon: 'skull',
    colorClass: 'diff-hardcore',
    glowClass: 'glow-red',
  },
])

const partyDifficulties = computed(() => {
  const diffLabels =
    (soloPartyInfoComputed.value as any)?.partyDifficulty.map((d: any) => {
      const difficultyObj = difficulties.value.find(
        (diff: any) => diff.label.toLowerCase() === d.difficulty.label.toLowerCase(),
      )

      if (difficultyObj) return difficultyObj
    }) || []

  if (!diffLabels || diffLabels.length === 0) return []

  // Remove null values and duplicates
  return diffLabels.filter(Boolean)
})

const partyThemes = computed(() => {
  const themeIds = (soloPartyInfoComputed.value as any)?.partyTheme.map((t: any) => t.id) || []
  if (!themeIds || themeIds.length === 0 || !themeStore.list) return []
  return themeStore.list.filter((t: any) => themeIds.includes(parseInt(t.id)))
})

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

onMounted(async () => {
  // Load themes if not already loaded
  if (!themeStore.list) {
    await themeStore.loadThemes()
  }

  // Load party info and get questions
  await soloStore.loadPartyInfo()

  nbMaxQuestions.value = (soloPartyInfoComputed.value as PartyInfo)?.nbQuestions || 0

  // If onMounted, the partyId exist, display the recap
  if (soloStore.partyId && soloStore.partyInfo && (soloStore.partyInfo as PartyInfo).finish) {
    finished.value = true
    comeFromHistory.value = true
  }

  startTimer()

  // Ajouter l'écouteur d'événements clavier
  window.addEventListener('keydown', handleKeyPress)
})

onBeforeUnmount(() => {
  clearTimer()
  // Retirer l'écouteur d'événements clavier
  window.removeEventListener('keydown', handleKeyPress)

  // Reset des variables locales
  index.value = 0
  nbMaxQuestions.value = 0
  score.value = 0
  answered.value = false
  wasCorrect.value = false
  lastPoints.value = 0
  finished.value = false
  comeFromHistory.value = false
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

/* Boutons de difficulté */
.difficulty-button {
  position: relative;
  padding: 0.875rem 1rem;
  border-radius: 0.75rem;
  border: 2px solid rgba(255, 255, 255, 0.1);
  background: rgba(30, 30, 40, 0.5);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--brand-lightGray);
}

.difficulty-button:hover {
  transform: translateX(4px);
  border-color: rgba(255, 255, 255, 0.2);
}

.difficulty-button.selected {
  border-color: currentColor;
  background: rgba(30, 30, 40, 0.8);
}

/* Couleurs par difficulté */
.diff-easy {
  --diff-color: #10b981;
}
.diff-medium {
  --diff-color: #f59e0b;
}
.diff-hard {
  --diff-color: #f97316;
}
.diff-hardcore {
  --diff-color: #ef4444;
}

.difficulty-button {
  color: var(--diff-color);
}

.difficulty-button.selected {
  box-shadow: 0 0 20px rgba(var(--diff-color-rgb), 0.3);
}

/* Effet de glow animé */
.difficulty-glow {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 0.75rem;
}

.difficulty-button:hover .difficulty-glow {
  opacity: 0.1;
}

.glow-green {
  background: radial-gradient(circle, #10b981 0%, transparent 70%);
}
.glow-yellow {
  background: radial-gradient(circle, #f59e0b 0%, transparent 70%);
}
.glow-orange {
  background: radial-gradient(circle, #f97316 0%, transparent 70%);
}
.glow-red {
  background: radial-gradient(circle, #ef4444 0%, transparent 70%);
}
</style>
