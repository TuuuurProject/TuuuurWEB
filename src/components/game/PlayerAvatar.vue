<template>
  <span
    class="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-surface2 font-bold text-brand-ink"
    :class="sizeClass"
  >
    <img v-if="avatar" :src="avatar" alt="" class="h-full w-full object-cover" />
    <span v-else aria-hidden="true">{{ initial }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    name?: string | null
    avatar?: string | null
    size?: 'sm' | 'md' | 'lg' | 'xl'
  }>(),
  { name: '', avatar: null, size: 'md' },
)

const initial = computed(() => props.name?.charAt(0).toUpperCase() || '?')

const sizeClass = computed(
  () =>
    ({
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-base',
      lg: 'h-16 w-16 text-2xl',
      xl: 'h-20 w-20 text-3xl',
    })[props.size],
)
</script>
