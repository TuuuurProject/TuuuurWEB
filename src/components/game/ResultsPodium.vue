<template>
  <section class="surface-card flex flex-col gap-6" aria-labelledby="results-podium-title">
    <h3 id="results-podium-title" class="text-xl font-bold">{{ title }}</h3>

    <!-- Podium : 2e, 1er, 3e -->
    <div class="mx-auto grid w-full max-w-xl grid-cols-3 items-end gap-3">
      <div
        v-for="step in podium"
        :key="step.place"
        class="flex flex-col items-center gap-2 text-center"
        :class="{ invisible: !step.entry }"
      >
        <template v-if="step.entry">
          <font-awesome-icon
            v-if="step.place === 1"
            icon="crown"
            class="text-xl text-brand-yellow"
          />
          <player-avatar
            :name="step.entry.name"
            :avatar="step.entry.avatar"
            :size="step.place === 1 ? 'xl' : 'lg'"
            class="border-4"
            :class="medalBorder[step.place]"
          />
          <span
            class="w-full truncate font-semibold"
            :class="{ 'text-brand-purple': isMe(step.entry) }"
          >
            {{ step.entry.name }}
          </span>
          <span
            class="whitespace-nowrap font-display text-xl font-extrabold tabular-nums sm:text-2xl"
          >
            {{ step.entry.score }}
            <span v-if="unit" class="text-sm font-semibold text-brand-gray">{{ unit }}</span>
          </span>
        </template>
        <div
          class="flex w-full items-start justify-center rounded-t-2xl pt-2 font-display text-2xl font-extrabold"
          :class="[medalBlock[step.place], blockHeight[step.place]]"
        >
          {{ step.place }}
        </div>
      </div>
    </div>

    <ol v-if="others.length > 0" class="flex flex-col gap-2" :start="4">
      <li
        v-for="(entry, index) in others"
        :key="entry.id"
        class="flex items-center gap-3 rounded-2xl border-2 px-4 py-2"
        :class="isMe(entry) ? 'border-brand-purple bg-brand-purple/10' : 'border-brand-line'"
      >
        <span class="w-6 text-center font-bold tabular-nums text-brand-gray">{{ index + 4 }}</span>
        <player-avatar :name="entry.name" :avatar="entry.avatar" size="sm" />
        <span class="min-w-0 flex-1 truncate font-semibold">{{ entry.name }}</span>
        <span class="font-display text-xl font-extrabold tabular-nums">
          {{ entry.score }}
          <span v-if="unit" class="text-sm font-semibold text-brand-gray">{{ unit }}</span>
        </span>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PlayerAvatar from './PlayerAvatar.vue'
import type { RankingEntry } from './LiveRanking.vue'

const props = defineProps<{
  entries: RankingEntry[]
  title: string
  meId?: string | number | null
  /** Unité affichée après le score (ex. « Élo ») */
  unit?: string
}>()

const isMe = (entry: RankingEntry) => props.meId != null && String(entry.id) === String(props.meId)

const sorted = computed(() => [...props.entries].sort((a, b) => b.score - a.score))

const podium = computed(() => [
  { place: 2, entry: sorted.value[1] },
  { place: 1, entry: sorted.value[0] },
  { place: 3, entry: sorted.value[2] },
])

const others = computed(() => sorted.value.slice(3))

const medalBorder: Record<number, string> = {
  1: 'border-brand-yellow',
  2: 'border-brand-line',
  3: 'border-brand-orange/60',
}
const medalBlock: Record<number, string> = {
  1: 'bg-brand-yellow/20 text-brand-yellow',
  2: 'bg-brand-surface2 text-brand-gray',
  3: 'bg-brand-orange/15 text-brand-orange',
}
const blockHeight: Record<number, string> = {
  1: 'h-28',
  2: 'h-20',
  3: 'h-14',
}
</script>
