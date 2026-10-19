<template>
  <transition name="countdown-fade">
    <div
      v-if="value !== null"
      class="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/90 backdrop-blur-sm"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="flex select-none flex-col items-center gap-2 text-center">
        <transition name="countdown-swap" mode="out-in">
          <div :key="value" class="countdown-pop font-display font-extrabold" :class="colorClass">
            {{ value }}
          </div>
        </transition>
        <div class="countdown-message text-lg font-semibold text-brand-gray">{{ message }}</div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  value: number | null
  message: string
}>()

const colorClass = computed(() => {
  if (props.value === 3) return 'text-brand-yellow'
  if (props.value === 2) return 'text-brand-orange'
  if (props.value === 1) return 'text-brand-green'
  return 'text-brand-lightGray'
})
</script>
