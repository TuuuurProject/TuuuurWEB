<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-3">
      <button
        v-if="leavable"
        type="button"
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-brand-line text-brand-muted transition-colors hover:border-brand-orange hover:text-brand-orange"
        :aria-label="leaveLabel"
        :title="leaveLabel"
        @click="$emit('leave')"
      >
        <font-awesome-icon icon="xmark" />
      </button>
      <span class="pill font-bold tabular-nums">
        <template v-if="total">
          {{ $t('game.hud.questionOf', { current, total }) }}
        </template>
        <template v-else>{{ $t('game.hud.question', { current }) }}</template>
      </span>
      <span
        v-if="multiplier"
        class="rounded-full bg-brand-yellow/15 px-3 py-1 text-sm font-bold text-brand-yellow tabular-nums"
        :title="$t('game.hud.multiplier')"
      >
        ×{{ multiplier.toFixed(1) }}
      </span>
      <span class="ml-auto flex items-baseline gap-1">
        <span class="font-display text-3xl font-extrabold tabular-nums">{{ score }}</span>
        <span class="text-sm font-semibold text-brand-muted">{{ $t('game.hud.points') }}</span>
      </span>
    </div>

    <div
      class="flex items-center gap-3"
      role="timer"
      :aria-label="$t('game.hud.timeLeft', { time: Math.ceil(remaining) })"
    >
      <div class="h-3 flex-1 overflow-hidden rounded-full bg-brand-surface2">
        <div
          class="h-full rounded-full transition-[width] duration-200 ease-linear"
          :class="isLow ? 'bg-brand-orange' : 'bg-brand-green'"
          :style="{ width: `${(ratio * 100).toFixed(2)}%` }"
        />
      </div>
      <span
        class="w-12 text-right font-bold tabular-nums"
        :class="isLow ? 'text-brand-orange' : 'text-brand-muted'"
      >
        {{ Math.ceil(remaining) }} s
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    current: number
    total?: number
    score: number
    remaining: number
    duration: number
    multiplier?: number | null
    leavable?: boolean
    leaveLabel?: string
  }>(),
  {
    total: undefined,
    multiplier: null,
    leavable: false,
    leaveLabel: '',
  },
)

defineEmits<{ leave: [] }>()

const ratio = computed(() => Math.min(1, Math.max(0, props.remaining / props.duration)))
const isLow = computed(() => ratio.value < 0.33)
</script>
