<template>
  <section class="flex flex-col gap-6">
    <template v-if="!finished">
      <game-hud
        :current="index + 1"
        :total="nbMaxQuestions"
        :score="score"
        :remaining="remaining"
        :duration="TOTAL_TIME"
      />

      <overlay-block :loading="soloStore.isLoading">
        <question-card
          :question="currentQuestion"
          :answers="currentAnswer || []"
          :selected-id="userAnswerId"
          :revealed="answered"
          :locked="answered"
          @select="answer"
        >
          <template #footer>
            <answer-feedback
              v-if="answered"
              :correct="wasCorrect"
              :points="lastPoints"
              :timed-out="userAnswerId === null && !skipped"
              :skipped="skipped"
            />
            <div class="ml-auto flex flex-wrap gap-3">
              <button v-if="!answered" class="btn btn-ghost" @click="skip">
                {{ $t('game.controls.skip') }}
                <kbd class="ml-2 rounded bg-brand-surface2 px-2 py-0.5 text-xs font-bold">S</kbd>
              </button>
              <button v-else class="btn btn-primary" @click="next">
                {{
                  index + 1 >= nbMaxQuestions
                    ? $t('game.controls.finish')
                    : $t('game.controls.next')
                }}
                <kbd class="ml-2 rounded bg-white/20 px-2 py-0.5 text-xs">
                  <font-awesome-icon icon="turn-down" class="rotate-90" />
                </kbd>
              </button>
            </div>
          </template>
        </question-card>
      </overlay-block>
    </template>

    <game-results
      v-else
      :title="$t('game.results.finished')"
      :score="score"
      :correct="correctAnswersCount"
      :total="(soloPartyInfoComputed as PartyInfo)?.nbQuestions ?? allQuestionsParty.length"
    >
      <template #actions>
        <template v-if="comeFromHistory">
          <button class="btn btn-primary" @click="router.push({ name: 'Profile' })">
            <font-awesome-icon icon="arrow-left" class="mr-2" />
            {{ $t('game.results.backToProfile') }}
          </button>
        </template>
        <template v-else>
          <button class="btn btn-primary" @click="restart">
            <font-awesome-icon icon="rotate-right" class="mr-2" /> {{ $t('game.results.replay') }}
          </button>
          <button class="btn btn-ghost" @click="$emit('exit')">
            {{ $t('game.results.newGame') }}
          </button>
        </template>
      </template>

      <div class="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start">
        <section class="surface-card flex flex-col gap-4">
          <h3 class="text-xl font-bold">{{ $t('game.results.partyInfo') }}</h3>
          <party-summary
            :themes="partyThemes"
            :difficulties="partyDifficulties"
            :questions="(soloPartyInfoComputed as PartyInfo)?.nbQuestions"
          />
        </section>
        <question-recap :items="recapItems" />
      </div>
    </game-results>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import useSoloStore from '@/stores/solo.js'
import useThemeStore from '@/stores/theme.js'
import OverlayBlock from '@/components/OverlayBlock.vue'
import GameHud from '@/components/game/GameHud.vue'
import QuestionCard from '@/components/game/QuestionCard.vue'
import AnswerFeedback from '@/components/game/AnswerFeedback.vue'
import GameResults from '@/components/game/GameResults.vue'
import PartySummary from '@/components/game/PartySummary.vue'
import QuestionRecap, { type RecapItem } from '@/components/game/QuestionRecap.vue'
import { useDifficulties } from '@/composables/useDifficulties'

const soloStore = useSoloStore()
const themeStore = useThemeStore()
const router = useRouter()
const { fromParty } = useDifficulties()

defineEmits<{ exit: [] }>()

const TOTAL_TIME = 15 // seconds per question

interface PartyInfo {
  nbQuestions: number
  score: number
  finish: boolean
  partyQuestions: any[]
}

const index = ref(0)
const nbMaxQuestions = ref(0)
const score = ref(0)
const answered = ref(false)
const userAnswerId = ref<number | null>(null)
const wasCorrect = ref(false)
const lastPoints = ref(0)
const finished = ref(false)
const comeFromHistory = ref(false)
const skipped = ref(false)

const remaining = ref(TOTAL_TIME)
let timer: ReturnType<typeof setInterval> | null = null
let startTime: number | null = null

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

const answer = async (opt: { id: string | number }) => {
  if (answered.value) return
  answered.value = true
  userAnswerId.value = Number.parseInt(String(opt.id))

  clearTimer()

  // Load the answer by ID
  await soloStore.loadAnswerById(Number.parseInt(String(opt.id)))

  // Test if correct
  wasCorrect.value = isUserAnswerIsCorrect(Number.parseInt(String(opt.id)))

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
    skipped.value = true
    userAnswerId.value = null
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
  skipped.value = false
  userAnswerId.value = null
  wasCorrect.value = false
  lastPoints.value = 0
  startTimer()
}

const restart = async () => {
  await soloStore.createSoloParty()
  await soloStore.loadPartyInfo()

  router.replace({ name: 'SoloQuiz', params: { id: soloStore.partyId } })

  answered.value = false
  skipped.value = false
  userAnswerId.value = null
  index.value = 0
  score.value = 0
  wasCorrect.value = false
  lastPoints.value = 0
  finished.value = false
  startTimer()
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
  return allQuestionsParty.value[lastQuestionIndex.value]?.question?.answer ?? []
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

// Informations de la partie
const partyDifficulties = computed(() =>
  fromParty((soloPartyInfoComputed.value as any)?.partyDifficulty),
)

const partyThemes = computed(() => {
  const themeIds = (soloPartyInfoComputed.value as any)?.partyTheme.map((t: any) => t.idTheme) || []
  if (!themeIds || themeIds.length === 0 || !themeStore.list) return []
  return themeStore.list.filter((t: any) => themeIds.includes(Number.parseInt(t.id)))
})

const recapItems = computed<RecapItem[]>(() =>
  allQuestionsParty.value.map((q: any) => ({
    label: q?.question?.label ?? '',
    correct: isQuestionCorrect(q),
    points: q?.userPartyQuestion?.score,
    selectedId: q?.userPartyQuestion?.idAnswer ?? null,
    answers: q?.question?.answer ?? [],
  })),
)

onMounted(async () => {
  // Load themes if not already loaded
  if (!themeStore.list) {
    await themeStore.loadThemes()
  }

  // Load party info and get questions
  await soloStore.loadPartyInfo()

  nbMaxQuestions.value = (soloPartyInfoComputed.value as PartyInfo)?.nbQuestions || 0
  score.value = (soloPartyInfoComputed.value as PartyInfo)?.score || 0
  index.value = (soloPartyInfoComputed.value as PartyInfo)?.partyQuestions?.length - 1 || 0

  // If onMounted, the partyId exist, display the recap
  if (soloStore.partyId && soloStore.partyInfo && (soloStore.partyInfo as PartyInfo).finish) {
    finished.value = true
    comeFromHistory.value = true
    return
  }

  startTimer()

  // Ajouter l'écouteur d'événements clavier
  globalThis.addEventListener('keydown', handleKeyPress)
})

onBeforeUnmount(() => {
  clearTimer()
  // Retirer l'écouteur d'événements clavier
  globalThis.removeEventListener('keydown', handleKeyPress)

  // Reset des variables locales
  index.value = 0
  nbMaxQuestions.value = 0
  score.value = 0
  answered.value = false
  wasCorrect.value = false
  lastPoints.value = 0
  finished.value = false
  comeFromHistory.value = false
  soloStore.partyInfo = null
  soloStore.partyId = null
})
</script>
