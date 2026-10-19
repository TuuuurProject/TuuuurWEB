<template>
  <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
    <!-- Thèmes -->
    <section class="surface-card flex flex-col gap-5" aria-labelledby="setup-themes-title">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div class="flex flex-col gap-1">
          <h3 id="setup-themes-title" class="text-xl font-bold">{{ $t('game.setup.themes') }}</h3>
          <p class="text-brand-muted">{{ $t('game.setup.themesHint') }}</p>
        </div>
        <button
          v-if="themes.length > 0"
          type="button"
          class="text-sm font-bold text-brand-purple hover:underline"
          @click="toggleAll"
        >
          {{ allSelected ? $t('game.setup.clearThemes') : $t('game.setup.allThemes') }}
        </button>
      </div>

      <div v-if="themes.length > 0" class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        <button
          v-for="theme in themes"
          :key="theme.id"
          type="button"
          data-testid="setup-theme"
          class="choice-tile"
          :class="{ selected: isThemeSelected(theme.id) }"
          :aria-pressed="isThemeSelected(theme.id)"
          @click="toggleTheme(theme.id)"
        >
          <span class="choice-tile-icon"><font-awesome-icon :icon="theme.icon" /></span>
          <span class="min-w-0 flex-1 break-words leading-tight">{{ theme.label }}</span>
        </button>
      </div>
      <p v-else class="text-brand-muted">{{ $t('common.loading') }}</p>
    </section>

    <!-- Réglages et action -->
    <aside class="surface-card flex flex-col gap-6 lg:sticky lg:top-24">
      <div class="flex flex-col gap-3" role="group" aria-labelledby="setup-difficulty-title">
        <div class="flex flex-col gap-1">
          <h3 id="setup-difficulty-title" class="text-lg font-bold">
            {{ $t('game.setup.difficulty') }}
          </h3>
          <p class="text-sm text-brand-muted">{{ $t('game.setup.difficultyHint') }}</p>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="diff in difficultyOptions"
            :key="diff.id"
            type="button"
            class="difficulty-button flex items-center gap-2 text-left font-semibold"
            :class="[diff.colorClass, { selected: difficultiesModel.includes(diff.id) }]"
            :aria-pressed="difficultiesModel.includes(diff.id)"
            @click="toggleDifficulty(diff.id)"
          >
            <font-awesome-icon :icon="diff.icon" />
            <span class="truncate">{{ diff.label }}</span>
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <h3 id="setup-questions-title" class="text-lg font-bold">
          {{ $t('game.setup.questions') }}
        </h3>
        <div class="segmented" role="radiogroup" aria-labelledby="setup-questions-title">
          <button
            v-for="count in QUESTION_COUNTS"
            :key="count"
            type="button"
            role="radio"
            :aria-checked="questionsModel === count"
            @click="questionsModel = count"
          >
            {{ count }}
          </button>
        </div>
      </div>

      <slot name="options" />

      <div v-if="$slots.actions" class="flex flex-col gap-3 border-t border-brand-line pt-5">
        <slot name="actions" />
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDifficulties } from '@/composables/useDifficulties'

export interface SetupTheme {
  id: string
  label: string
  icon: string
}

const QUESTION_COUNTS = [5, 10, 15, 20]

const props = defineProps<{
  themes: SetupTheme[]
}>()

const themesModel = defineModel<string[]>('selectedThemes', { required: true })
const difficultiesModel = defineModel<number[]>('difficulties', { required: true })
const questionsModel = defineModel<number>('questions', { required: true })

const { difficulties: difficultyOptions } = useDifficulties()

const isThemeSelected = (id: string) => themesModel.value.includes(id)

const allSelected = computed(
  () => props.themes.length > 0 && props.themes.every((theme) => isThemeSelected(theme.id)),
)

const toggleTheme = (id: string) => {
  themesModel.value = isThemeSelected(id)
    ? themesModel.value.filter((themeId) => themeId !== id)
    : [...themesModel.value, id]
}

const toggleAll = () => {
  themesModel.value = allSelected.value ? [] : props.themes.map((theme) => theme.id)
}

const toggleDifficulty = (id: number) => {
  difficultiesModel.value = difficultiesModel.value.includes(id)
    ? difficultiesModel.value.filter((d) => d !== id)
    : [...difficultiesModel.value, id]
}
</script>
