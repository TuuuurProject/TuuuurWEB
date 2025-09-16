<template>
  <svg :width="size" :height="size" :viewBox="`0 0 ${n} ${n}`" class="rounded-2xl bg-white border border-brand-dark/10 shadow-soft">
    <rect :width="n" :height="n" fill="white" />
    <template v-for="(row, y) in matrix" :key="y">
      <template v-for="(val, x) in row" :key="x">
        <rect v-if="val" :x="x" :y="y" width="1" height="1" fill="#000" />
      </template>
    </template>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ text: string; size?: number }>(), {
  size: 160,
})

// Simple pseudo-QR matrix (not scannable, for display only)
const n = 25
function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = (h ^ s.charCodeAt(i)) * 16777619
  return Math.abs(h >>> 0)
}
function rng(seed: number) {
  let x = seed || 1
  return () => (x = (x * 48271) % 0x7fffffff)
}

const matrix = computed(() => {
  const mat: number[][] = Array.from({ length: n }, () => Array(n).fill(0))
  const rnd = rng(hash(props.text))

  // finder-like patterns
  const fp = (ox: number, oy: number) => {
    for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) mat[oy + y][ox + x] = 1
    for (let y = 1; y < 6; y++) for (let x = 1; x < 6; x++) mat[oy + y][ox + x] = 0
    for (let y = 2; y < 5; y++) for (let x = 2; x < 5; x++) mat[oy + y][ox + x] = 1
  }
  fp(1, 1)
  fp(n - 8, 1)
  fp(1, n - 8)

  // random modules
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (mat[y][x]) continue
      if (x < 9 && y < 9) continue
      if (x > n - 10 && y < 9) continue
      if (x < 9 && y > n - 10) continue
      mat[y][x] = rnd() % 3 === 0 ? 1 : 0
    }
  }
  return mat
})
</script>
