<template>
  <div class="flex flex-col items-center gap-3">
    <p
      class="mascot-bubble relative max-w-sm rounded-3xl border border-brand-line bg-brand-darkGray px-6 py-4 text-center text-lg font-semibold shadow-card"
    >
      {{ message }}
    </p>
    <monkizz-mascot :size="size" :animated="animated" :class="mascotClass" />
  </div>
</template>

<script setup lang="ts">
import MonkizzMascot from './MonkizzMascot.vue'

withDefaults(
  defineProps<{
    message: string
    size?: number
    animated?: boolean
    mascotClass?: string
  }>(),
  { size: 240, animated: true, mascotClass: '' },
)
</script>

<style scoped>
/* Pointe de la bulle, tournée vers la mascotte */
.mascot-bubble::after {
  content: '';
  position: absolute;
  bottom: -9px;
  left: 50%;
  width: 18px;
  height: 18px;
  transform: translateX(-50%) rotate(45deg);
  background: rgb(var(--c-surface));
  border-right: 1px solid rgb(var(--c-line));
  border-bottom: 1px solid rgb(var(--c-line));
}
</style>
