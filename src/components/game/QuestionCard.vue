<template>
  <div class="surface-card flex flex-col gap-6 md:p-8">
    <div v-if="tags.length > 0" class="flex flex-wrap gap-2">
      <span
        v-for="tag in tags"
        :key="tag"
        class="rounded-full bg-brand-surface2 px-3 py-1 text-sm font-semibold text-brand-muted"
      >
        {{ tag }}
      </span>
    </div>

    <h3 class="text-2xl font-bold leading-snug md:text-3xl" style="text-wrap: balance">
      {{ question }}
    </h3>

    <div class="grid gap-3 sm:grid-cols-2">
      <button
        v-for="(answer, index) in answers"
        :key="answer.id"
        type="button"
        class="answer-tile"
        :class="`is-${answerState(answer)}`"
        :disabled="locked || revealed"
        @click="$emit('select', answer)"
      >
        <span class="answer-key" aria-hidden="true">
          <font-awesome-icon v-if="answerState(answer) === 'correct'" icon="check" />
          <font-awesome-icon v-else-if="answerState(answer) === 'wrong'" icon="xmark" />
          <template v-else>{{ index + 1 }}</template>
        </span>
        <span class="min-w-0 flex-1">{{ answer.value }}</span>
      </button>
    </div>

    <div v-if="$slots.footer" class="flex flex-wrap items-center gap-3">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
export interface PlayableAnswer {
  id: number | string
  value: string
  valid?: boolean | null
}

const props = withDefaults(
  defineProps<{
    question: string
    answers: PlayableAnswer[]
    /** Réponse choisie par le joueur */
    selectedId?: number | string | null
    /** Les bonnes réponses sont connues et affichées */
    revealed?: boolean
    /** Plus aucune réponse ne peut être choisie */
    locked?: boolean
    tags?: string[]
  }>(),
  {
    selectedId: null,
    revealed: false,
    locked: false,
    tags: () => [],
  },
)

defineEmits<{ select: [answer: PlayableAnswer] }>()

const isSelected = (answer: PlayableAnswer) =>
  props.selectedId !== null && String(answer.id) === String(props.selectedId)

const answerState = (answer: PlayableAnswer) => {
  if (props.revealed) {
    if (answer.valid === true) return 'correct'
    if (isSelected(answer)) return answer.valid === false ? 'wrong' : 'pending'
    return 'dim'
  }
  if (isSelected(answer)) return 'pending'
  if (props.locked) return 'dim'
  return 'idle'
}
</script>
