<template>
  <section class="flex flex-col gap-6">
    <header class="flex flex-col gap-2">
      <h2 class="text-3xl font-bold">{{ $t('competitive.lobby.title') }}</h2>
    </header>

    <div
      class="surface-card mx-auto flex w-full max-w-3xl flex-col items-center gap-8 md:p-10"
      aria-live="polite"
    >
      <p
        class="flex items-center gap-2 rounded-full px-4 py-1.5 font-bold"
        :class="
          state === 'found'
            ? 'bg-brand-green/15 text-brand-green'
            : 'bg-brand-purple/10 text-brand-purple'
        "
      >
        <font-awesome-icon
          :icon="state === 'found' ? 'bolt' : 'circle-notch'"
          :class="{ 'animate-spin': state === 'search' }"
        />
        {{
          state === 'found'
            ? $t('competitive.matchmaking.found')
            : $t('competitive.matchmaking.searching')
        }}
      </p>

      <!-- Face-à-face : le joueur à gauche, l'adversaire (ou sa place vide) à droite -->
      <div
        class="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-6"
      >
        <div class="flex min-w-0 flex-col items-center gap-2 text-center">
          <player-avatar
            :name="currentUser?.nickName"
            :avatar="currentUser?.avatar"
            size="xl"
            class="border-4 border-brand-purple"
          />
          <span class="w-full truncate text-lg font-bold">
            {{ currentUser?.nickName ?? $t('competitive.matchmaking.you') }}
          </span>
          <span class="text-sm font-semibold text-brand-gray tabular-nums">
            {{ $t('competitive.matchmaking.elo', { value: currentUser?.globalElo ?? '—' }) }}
          </span>
        </div>

        <span class="font-display text-3xl font-extrabold text-brand-gray">
          {{ $t('competitive.matchmaking.vs') }}
        </span>

        <div class="flex min-w-0 flex-col items-center gap-2 text-center">
          <template v-if="state === 'found'">
            <player-avatar
              :name="opponent?.nickName"
              :avatar="opponent?.avatar"
              size="xl"
              class="border-4 border-brand-orange"
            />
            <span class="w-full truncate text-lg font-bold">
              {{ opponent?.nickName ?? $t('competitive.matchmaking.opponent') }}
            </span>
            <span class="text-sm font-semibold text-brand-gray tabular-nums">
              {{ $t('competitive.matchmaking.elo', { value: opponent?.globalElo ?? '—' }) }}
            </span>
          </template>
          <template v-else>
            <span
              class="opponent-slot flex h-20 w-20 items-center justify-center rounded-full border-4 border-dashed border-brand-line text-3xl font-bold text-brand-gray"
              aria-hidden="true"
            >
              ?
            </span>
            <span class="text-lg font-bold text-brand-gray">
              {{ $t('competitive.matchmaking.opponent') }}
            </span>
            <span class="text-sm font-semibold text-brand-gray tabular-nums">
              {{ $t('competitive.matchmaking.elapsed', { time: elapsedLabel }) }}
            </span>
          </template>
        </div>
      </div>

      <p class="max-w-md text-center text-brand-gray">
        {{
          state === 'found'
            ? $t('competitive.matchmaking.gameStartingSoon')
            : $t('competitive.matchmaking.searchingMessage')
        }}
      </p>

      <button v-if="state === 'search'" class="btn btn-ghost" @click="$emit('cancel')">
        <font-awesome-icon icon="xmark" class="mr-2" />
        {{ $t('competitive.matchmaking.cancel') }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import PlayerAvatar from '@/components/game/PlayerAvatar.vue'
import type { RankedUser } from '@/stores/ranked'

const props = defineProps<{
  state: 'search' | 'found'
  opponent?: RankedUser | null
  currentUser?: RankedUser | null
}>()

defineEmits<{ cancel: [] }>()

// Temps d'attente affiché pendant la recherche
const elapsed = ref(0)
let interval: ReturnType<typeof setInterval> | null = null

const stopClock = () => {
  if (interval) clearInterval(interval)
  interval = null
}

const startClock = () => {
  stopClock()
  elapsed.value = 0
  interval = setInterval(() => elapsed.value++, 1000)
}

const elapsedLabel = computed(() => {
  const minutes = Math.floor(elapsed.value / 60)
  const seconds = String(elapsed.value % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
})

watch(
  () => props.state,
  (state) => (state === 'search' ? startClock() : stopClock()),
)

onMounted(() => {
  if (props.state === 'search') startClock()
})

onBeforeUnmount(stopClock)
</script>

<style scoped>
/* Place de l'adversaire : respiration lente pendant la recherche */
.opponent-slot {
  animation: slot-breathe 2s ease-in-out infinite;
}

@keyframes slot-breathe {
  0%,
  100% {
    opacity: 0.55;
    transform: scale(0.96);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
