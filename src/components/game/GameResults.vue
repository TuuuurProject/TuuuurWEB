<template>
  <div class="flex flex-col gap-6">
    <!-- La mascotte réagit à la partie : c'est le moment fort de l'écran -->
    <section
      class="surface-card grid overflow-hidden p-0 lg:grid-cols-[20rem_minmax(0,1fr)]"
      data-testid="game-results"
    >
      <mascot-stage
        class="rounded-none"
        :height="320"
        :tone="mascotPose === 'victory' ? 'win' : 'lose'"
        :pose="mascotPose"
      />

      <div class="flex flex-col justify-center gap-6 p-6 md:p-10">
        <div class="flex flex-col gap-2">
          <h2 class="text-4xl font-extrabold md:text-5xl" :class="toneClass">{{ title }}</h2>
          <p class="text-lg text-brand-muted">{{ mascotMessage }}</p>
          <slot name="highlight" />
        </div>

        <dl class="grid grid-cols-3 gap-2 sm:gap-3">
          <div class="flex flex-col gap-1 rounded-2xl bg-brand-surface2/60 p-3 sm:p-4">
            <dt class="text-sm font-semibold text-brand-muted">{{ $t('game.results.score') }}</dt>
            <dd
              class="whitespace-nowrap font-display text-2xl font-extrabold tabular-nums sm:text-3xl"
            >
              {{ score }}
            </dd>
          </div>
          <div class="flex flex-col gap-1 rounded-2xl bg-brand-surface2/60 p-3 sm:p-4">
            <dt class="text-sm font-semibold text-brand-muted">
              {{ $t('game.results.goodAnswers') }}
            </dt>
            <dd
              class="whitespace-nowrap font-display text-2xl font-extrabold tabular-nums sm:text-3xl"
            >
              {{ correct }}<span class="text-lg text-brand-muted sm:text-xl">/{{ total }}</span>
            </dd>
          </div>
          <div class="flex flex-col gap-1 rounded-2xl bg-brand-surface2/60 p-3 sm:p-4">
            <dt class="text-sm font-semibold text-brand-muted">
              {{ $t('game.results.successRate') }}
            </dt>
            <dd
              class="whitespace-nowrap font-display text-2xl font-extrabold tabular-nums sm:text-3xl text-brand-green"
            >
              {{ successRate }} %
            </dd>
          </div>
        </dl>

        <div v-if="$slots.actions" class="flex flex-col gap-3 sm:flex-row">
          <slot name="actions" />
        </div>
      </div>
    </section>

    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import MascotStage from '@/components/mascot/MascotStage.vue'

const props = withDefaults(
  defineProps<{
    title: string
    score: number
    correct: number
    total: number
    /** Remplace la phrase de commentaire automatique sous le titre */
    message?: string
    tone?: 'win' | 'lose' | 'neutral'
    /** Taux de réussite fourni par l'API, prioritaire sur le calcul local */
    rate?: number | null
  }>(),
  { message: '', tone: 'neutral', rate: null },
)

const { t } = useI18n()

const successRate = computed(() => {
  if (props.rate !== null) return Math.round(props.rate)
  return props.total > 0 ? Math.round((props.correct / props.total) * 100) : 0
})

const mascotMessage = computed(() => {
  if (props.message) return props.message
  if (successRate.value >= 80) return t('game.results.mascot.great')
  if (successRate.value >= 50) return t('game.results.mascot.good')
  if (successRate.value > 0) return t('game.results.mascot.low')
  return t('game.results.mascot.zero')
})

// Le singe célèbre une victoire ou une bonne partie, et se désole sinon
const mascotPose = computed(() => {
  if (props.tone === 'win') return 'victory'
  if (props.tone === 'lose') return 'defeat'
  return successRate.value >= 50 ? 'victory' : 'defeat'
})

const toneClass = computed(
  () =>
    ({
      win: 'text-brand-green',
      lose: 'text-brand-orange',
      neutral: 'text-brand-ink',
    })[props.tone],
)
</script>
