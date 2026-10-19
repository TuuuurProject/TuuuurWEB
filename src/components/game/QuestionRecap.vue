<template>
  <section class="surface-card flex flex-col gap-4" aria-labelledby="question-recap-title">
    <h3 id="question-recap-title" class="text-xl font-bold">{{ $t('game.recap.title') }}</h3>

    <ol v-if="items.length > 0" class="flex flex-col divide-y divide-brand-line">
      <li v-for="(item, index) in items" :key="index" class="flex gap-4 py-4 first:pt-0 last:pb-0">
        <span
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
          :class="
            item.correct
              ? 'bg-brand-green/15 text-brand-green'
              : 'bg-brand-orange/15 text-brand-orange'
          "
          :aria-label="item.correct ? $t('game.feedback.correct') : $t('game.feedback.wrong')"
        >
          {{ index + 1 }}
        </span>
        <div class="flex min-w-0 flex-1 flex-col gap-2">
          <p class="font-semibold">{{ item.label }}</p>
          <p class="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <span
              v-if="userAnswer(item)"
              :class="item.correct ? 'text-brand-green' : 'text-brand-orange'"
            >
              <font-awesome-icon :icon="item.correct ? 'check' : 'xmark'" class="mr-1" />
              {{ $t('game.recap.yourAnswer', { answer: userAnswer(item) }) }}
            </span>
            <span v-else class="text-brand-gray">
              <font-awesome-icon icon="xmark" class="mr-1" /> {{ $t('game.recap.noAnswer') }}
            </span>
            <span v-if="!item.correct && correctAnswer(item)" class="text-brand-green">
              <font-awesome-icon icon="check" class="mr-1" />
              {{ $t('game.recap.correctAnswer', { answer: correctAnswer(item) }) }}
            </span>
          </p>
        </div>
        <span
          v-if="item.correct && item.points"
          class="shrink-0 self-start font-bold tabular-nums text-brand-green"
        >
          +{{ item.points }}
        </span>
      </li>
    </ol>
    <p v-else class="text-brand-gray">{{ $t('game.recap.empty') }}</p>
  </section>
</template>

<script setup lang="ts">
export interface RecapItem {
  label: string
  correct: boolean
  points?: number
  selectedId?: number | string | null
  answers: Array<{ id: number | string; value: string; valid?: boolean | null }>
}

defineProps<{ items: RecapItem[] }>()

const userAnswer = (item: RecapItem) =>
  item.selectedId == null
    ? null
    : item.answers.find((a) => String(a.id) === String(item.selectedId))?.value

const correctAnswer = (item: RecapItem) => item.answers.find((a) => a.valid)?.value
</script>
