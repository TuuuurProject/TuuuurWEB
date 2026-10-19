<template>
  <section class="surface-card flex flex-col gap-4" aria-labelledby="live-ranking-title">
    <h3 id="live-ranking-title" class="text-xl font-bold">
      <font-awesome-icon icon="trophy" class="mr-2 text-brand-yellow" />
      {{ title }}
    </h3>
    <ol class="flex flex-col gap-2">
      <li
        v-for="(entry, index) in sorted"
        :key="entry.id"
        class="flex items-center gap-3 rounded-2xl border-2 px-4 py-2"
        :class="
          String(entry.id) === String(meId)
            ? 'border-brand-purple bg-brand-purple/10'
            : 'border-brand-line bg-brand-surface'
        "
      >
        <span class="w-6 text-center font-bold tabular-nums" :class="rankColor(index)">
          <font-awesome-icon v-if="index === 0" icon="crown" />
          <template v-else>{{ index + 1 }}</template>
        </span>
        <player-avatar :name="entry.name" :avatar="entry.avatar" size="sm" />
        <span class="min-w-0 flex-1 truncate font-semibold">{{ entry.name }}</span>
        <span class="font-display text-xl font-extrabold tabular-nums">{{ entry.score }}</span>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PlayerAvatar from './PlayerAvatar.vue'

export interface RankingEntry {
  id: string | number
  name?: string
  avatar?: string | null
  score: number
}

const props = defineProps<{
  entries: RankingEntry[]
  title: string
  meId?: string | number | null
}>()

const sorted = computed(() => [...props.entries].sort((a, b) => b.score - a.score))

const rankColor = (index: number) =>
  index === 0 ? 'text-brand-yellow' : index < 3 ? 'text-brand-ink' : 'text-brand-muted'
</script>
