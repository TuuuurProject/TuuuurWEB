<template>
  <section class="space-y-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <button class="pill" @click="$emit('exit')">← Accueil</button>
        <h2 class="font-branding text-3xl">Quiz Solo</h2>
      </div>
      <div class="flex items-center gap-3">
        <span class="pill">Question {{ index + 1 }} / {{ deck.length }}</span>
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
        <span>+{{ previewPoints }} pts si correct</span>
      </div>
    </div>

    <!-- Question card -->
    <div v-if="!finished" class="gaming-card">
      <h3 class="font-branding text-2xl mb-4 text-brand-lightGray">{{ current.question }}</h3>
      <div class="grid gap-3 sm:grid-cols-2">
        <button
          v-for="opt in current.options"
          :key="opt"
          class="group rounded-2xl border px-4 py-3 text-left font-semibold transition duration-250"
          :disabled="answered"
          :class="buttonClass(opt)"
          @click="answer(opt)"
        >
          {{ opt }}
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
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'

interface Params {
  categories: string[]
  questions: number
  shuffle: boolean
}
interface QA {
  question: string
  correct: string
  incorrect: string[]
}
interface QRuntime {
  question: string
  options: string[]
  correct: string
}

const props = defineProps<Params>()
const TOTAL_TIME = 15 // seconds per question

// Question bank (minimal but extensible)
const BANK: Record<string, QA[]> = {
  general: [
    {
      question: 'Quelle est la capitale de la France ?',
      correct: 'Paris',
      incorrect: ['Lyon', 'Marseille', 'Bordeaux'],
    },
    { question: 'Combien font 7 × 6 ?', correct: '42', incorrect: ['36', '48', '54'] },
    {
      question: 'Quelle planète est surnommée la planète rouge ?',
      correct: 'Mars',
      incorrect: ['Jupiter', 'Vénus', 'Saturne'],
    },
  ],
  histoire: [
    {
      question: 'En quelle année a eu lieu la Révolution française ?',
      correct: '1789',
      incorrect: ['1492', '1815', '1914'],
    },
    {
      question: 'Qui était Napoléon Bonaparte ?',
      correct: 'Un empereur français',
      incorrect: ['Un peintre', 'Un physicien', 'Un poète'],
    },
  ],
  science: [
    {
      question: "Quelle est la formule chimique de l'eau ?",
      correct: 'H₂O',
      incorrect: ['CO₂', 'O₂', 'NaCl'],
    },
    {
      question: 'Quel organe pompe le sang ?',
      correct: 'Le cœur',
      incorrect: ['Le foie', 'Le poumon', 'Le cerveau'],
    },
  ],
  sport: [
    {
      question: 'Combien de joueurs dans une équipe de football sur le terrain ?',
      correct: '11',
      incorrect: ['9', '10', '12'],
    },
    {
      question: 'Dans quel sport utilise-t-on une raquette et un volant ?',
      correct: 'Badminton',
      incorrect: ['Tennis', 'Squash', 'Ping-pong'],
    },
  ],
  musique: [
    {
      question: 'Combien de notes dans une gamme majeure ?',
      correct: '7',
      incorrect: ['5', '6', '8'],
    },
  ],
  cinema: [
    {
      question: 'Qui a réalisé "Inception" ?',
      correct: 'Christopher Nolan',
      incorrect: ['Steven Spielberg', 'James Cameron', 'Ridley Scott'],
    },
  ],
  art: [
    {
      question: 'Qui a peint La Joconde ?',
      correct: 'Léonard de Vinci',
      incorrect: ['Michel-Ange', 'Raphaël', 'Botticelli'],
    },
  ],
  geo: [
    {
      question: 'Quel est le plus grand océan ?',
      correct: 'Pacifique',
      incorrect: ['Atlantique', 'Arctique', 'Indien'],
    },
  ],
  tech: [
    {
      question: 'Que signifie HTML ?',
      correct: 'HyperText Markup Language',
      incorrect: [
        'HighText Makeup Language',
        'Hyperlinks and Text Mark Language',
        'Home Tool Markup Language',
      ],
    },
  ],
  jeux: [
    {
      question: 'Quel studio a créé Minecraft ?',
      correct: 'Mojang',
      incorrect: ['Epic Games', 'Valve', 'Ubisoft'],
    },
  ],
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildDeck(): QRuntime[] {
  const cats = props.categories.length ? props.categories : ['general']
  const pool: QRuntime[] = []
  for (const c of cats) {
    const list = BANK[c] || []
    for (const q of list) {
      const options = shuffle([q.correct, ...q.incorrect]).slice(0, 4)
      pool.push({ question: q.question, options, correct: q.correct })
    }
  }
  // fallback if not enough
  if (pool.length < props.questions) {
    for (const [key, list] of Object.entries(BANK)) {
      if (cats.includes(key)) continue
      for (const q of list) {
        const options = shuffle([q.correct, ...q.incorrect]).slice(0, 4)
        pool.push({ question: q.question, options, correct: q.correct })
      }
    }
  }
  const deck = shuffle(pool).slice(0, Math.max(1, props.questions))
  return props.shuffle ? shuffle(deck) : deck
}

const deck = reactive(buildDeck())
const index = ref(0)
const score = ref(0)
const answered = ref(false)
const wasCorrect = ref(false)
const lastPoints = ref(0)
const finished = ref(false)

const remaining = ref(TOTAL_TIME)
let timer: number | null = null

const current = computed(() => deck[index.value])
const remainingRatio = computed(() => Math.max(0, remaining.value / TOTAL_TIME))
const previewPoints = computed(() => Math.round(30 + 70 * remainingRatio.value))

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

function answer(opt: string) {
  if (answered.value) return
  answered.value = true
  clearTimer()
  if (opt === current.value.correct) {
    wasCorrect.value = true
    lastPoints.value = Math.round(30 + 70 * remainingRatio.value)
    score.value += lastPoints.value
  } else {
    wasCorrect.value = false
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

function next() {
  if (!answered.value) return
  if (index.value + 1 >= deck.length) {
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
  const newDeck = buildDeck()
  deck.splice(0, deck.length, ...newDeck)
  index.value = 0
  score.value = 0
  answered.value = false
  wasCorrect.value = false
  lastPoints.value = 0
  finished.value = false
  startTimer()
}

function buttonClass(opt: string) {
  if (!answered.value) {
    return 'bg-brand-darkGray/50 border-brand-purple/30 text-brand-lightGray hover:bg-brand-purple/20 hover:border-brand-purple'
  }
  const correct = opt === current.value.correct
  return correct
    ? 'bg-brand-green/20 border-brand-green text-brand-green'
    : 'bg-brand-orange/20 border-brand-orange text-brand-orange'
}

onMounted(() => {
  startTimer()
})
onBeforeUnmount(clearTimer)
</script>
