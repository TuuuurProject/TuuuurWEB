<template>
  <section class="space-y-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <button class="pill" @click="$emit('exit')">← Accueil</button>
        <h2 class="font-branding text-3xl">Quiz Solo</h2>
      </div>
      <div class="flex items-center gap-3">
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
    <div v-else class="gaming-card text-center">
      <h3 class="font-branding text-3xl mb-3 text-brand-lightGray">Terminé !</h3>
      <p class="text-brand-gray">
        Score final: <strong class="text-brand-lightGray">{{ score }}</strong> pts
      </p>
      <div class="mt-6 flex items-center justify-center gap-3">
        <button class="btn btn-secondary" @click="$emit('exit')">Accueil</button>
        <button class="btn btn-primary" @click="restart">Rejouer</button>
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
    // lastPoints.value = Math.round(30 + 70 * remainingRatio.value)
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
  // wasCorrect.value = false
  // lastPoints.value = 0
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

onMounted(async () => {
  // Load party info and get questions
  await soloStore.loadPartyInfo()

  startTimer()
})
onBeforeUnmount(clearTimer)
</script>
