<template>
  <section class="space-y-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <button class="pill" @click="$emit('exit')">← Accueil</button>
        <h2 class="font-branding text-3xl">Quiz Solo</h2>
      </div>
      <div v-if="!finished" class="flex items-center gap-3">
        <span class="pill"
          >Question {{ index + 1 }} / {{ (soloPartyInfoComputed as PartyInfo)?.nbQuestions }}</span
        >
        <span class="pill"
          >Score: <strong>{{ score }}</strong></span
        >
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
        <span>Temps restant: {{ remaining.toFixed(1) }}s</span>
      </div>
    </div>

    <!-- Question card -->
    <div v-if="!finished" class="gaming-card">
      <overlay-block :loading="soloStore.isLoading">
        <h3 class="font-branding text-2xl mb-4 text-brand-lightGray">{{ currentQuestion }}</h3>
        <div class="grid gap-3 sm:grid-cols-2">
          <button
            v-for="opt in currentAnswer"
            :key="opt"
            class="group rounded-2xl border px-4 py-3 text-left font-semibold transition duration-250"
            :disabled="answered"
            :class="buttonClass(opt.valid)"
            @click="answer(opt)"
          >
            {{ opt?.value }}
          </button>
        </div>

        <div class="mt-6 flex items-center justify-between">
          <div class="text-sm" v-if="answered">
            <span v-if="wasCorrect" class="badge-green">Correct +{{ lastPoints }} pts</span>
            <span v-else class="badge-orange">Mauvaise réponse</span>
          </div>
          <div class="flex items-center gap-3 ml-auto">
            <button class="btn btn-secondary" @click="skip" :disabled="answered">Passer</button>
            <button class="btn btn-primary" @click="next" :disabled="!answered">Suivant</button>
          </div>
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
        <h3 class="font-branding text-4xl mb-2 text-brand-lightGray glow-text">Quiz Terminé !</h3>
        <div class="flex items-center justify-center gap-6 mt-4">
          <div class="text-center">
            <div class="text-sm text-brand-gray mb-1">Score Final</div>
            <div class="font-branding text-3xl text-brand-yellow">{{ score }}</div>
          </div>
          <div class="h-12 w-px bg-brand-purple/30"></div>
          <div class="text-center">
            <div class="text-sm text-brand-gray mb-1">Questions</div>
            <div class="font-branding text-3xl text-brand-lightGray">
              {{ (soloPartyInfoComputed as PartyInfo)?.nbQuestions }}
            </div>
          </div>
          <div class="h-12 w-px bg-brand-purple/30"></div>
          <div class="text-center">
            <div class="text-sm text-brand-gray mb-1">Réussite</div>
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
            {{ correctAnswersCount }} Correctes
          </div>
          <div class="badge-warning">
            <font-awesome-icon icon="times-circle" class="mr-1" />
            {{ (soloPartyInfoComputed as PartyInfo)?.nbQuestions - correctAnswersCount }}
            Incorrectes
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
          <h3 class="font-branding text-2xl text-brand-lightGray">Récapitulatif des Réponses</h3>
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
                  <font-awesome-icon icon="check" class="mr-1" /> Bonne réponse +{{
                    getQuestionPoints(questionData)
                  }}
                  pts
                </div>
                <div v-else class="badge-warning text-xs">
                  <font-awesome-icon icon="times" class="mr-1" /> Mauvaise réponse
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
        <button class="btn btn-secondary w-full sm:w-auto" @click="$emit('exit')">
          <font-awesome-icon icon="arrow-left" class="mr-2" /> Retour à l'accueil
        </button>
        <button class="btn btn-primary w-full sm:w-auto" @click="restart">
          <font-awesome-icon icon="rotate-right" class="mr-2" /> Rejouer
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import useSoloStore from '@/stores/solo.js'
import OverlayBlock from '@/components/OverlayBlock.vue'

const soloStore = useSoloStore()

const TOTAL_TIME = 15 // seconds per question

interface PartyInfo {
  nbQuestions: number
  score: number
}

const index = ref(0)
const score = ref(0)
const answered = ref(false)
const wasCorrect = ref(false)
const lastPoints = ref(0)
const finished = ref(false)

const remaining = ref(TOTAL_TIME)
let timer: number | null = null

const remainingRatio = computed(() => Math.max(0, remaining.value / TOTAL_TIME))

function startTimer() {
  clearTimer()
  remaining.value = TOTAL_TIME
  timer = window.setInterval(() => {
    remaining.value = Math.max(0, +(remaining.value - 0.1).toFixed(1))
    if (remaining.value <= 0) {
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

function skip() {
  if (!answered.value) {
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

  if (index.value + 1 >= (soloPartyInfoComputed.value as PartyInfo)?.nbQuestions) {
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

function restart() {
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
  // Load party info and get questions
  await soloStore.loadPartyInfo()

  startTimer()
})
onBeforeUnmount(clearTimer)
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  @apply bg-brand-dark/50 rounded-full;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-brand-purple/40 rounded-full;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  @apply bg-brand-purple/60;
}
</style>
