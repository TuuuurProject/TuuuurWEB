<template>
  <dl class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <dt class="text-sm font-semibold text-brand-muted">{{ $t('game.setup.themes') }}</dt>
      <dd class="flex flex-wrap gap-2">
        <span
          v-for="theme in themes"
          :key="theme.id"
          class="inline-flex items-center gap-2 rounded-full bg-brand-surface2 px-3 py-1 text-sm font-semibold"
        >
          <font-awesome-icon :icon="theme.icon" class="text-brand-muted" /> {{ theme.label }}
        </span>
        <span v-if="themes.length === 0" class="text-brand-muted">{{ emptyThemesLabel }}</span>
      </dd>
    </div>
    <div class="flex flex-col gap-2">
      <dt class="text-sm font-semibold text-brand-muted">{{ $t('game.setup.difficulty') }}</dt>
      <dd class="flex flex-wrap gap-2">
        <span
          v-for="diff in difficulties"
          :key="diff.id"
          class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold"
          :class="diffChipClass[diff.id]"
        >
          <font-awesome-icon :icon="diff.icon" /> {{ diff.label }}
        </span>
        <span v-if="difficulties.length === 0" class="text-brand-muted">
          {{ $t('game.summary.noDifficulty') }}
        </span>
      </dd>
    </div>
    <div class="flex flex-wrap gap-x-8 gap-y-4">
      <div class="flex flex-col gap-1">
        <dt class="text-sm font-semibold text-brand-muted">{{ $t('game.setup.questions') }}</dt>
        <dd class="font-bold tabular-nums">{{ questions }}</dd>
      </div>
      <slot />
    </div>
  </dl>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { DifficultyOption } from '@/composables/useDifficulties'

const props = defineProps<{
  themes: Array<{ id: string | number; label: string; icon: string }>
  difficulties: DifficultyOption[]
  questions: number | string | undefined
  emptyThemes?: string
}>()

const { t } = useI18n()

const emptyThemesLabel = computed(() => props.emptyThemes ?? t('game.summary.noTheme'))

const diffChipClass: Record<number, string> = {
  1: 'bg-diff-easy/15 text-diff-easy',
  2: 'bg-diff-medium/15 text-diff-medium',
  3: 'bg-diff-hard/15 text-diff-hard',
  4: 'bg-diff-hardcore/15 text-diff-hardcore',
}
</script>
