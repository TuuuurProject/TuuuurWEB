<template>
  <header
    class="sticky top-0 z-10 bg-brand-darkGray/80 backdrop-blur-xl border-b border-brand-purple/20 h-[75px]"
  >
    <div class="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between h-full">
      <button
        class="inline-flex items-center gap-2 text-brand-lightGray hover:text-brand-purple transition group"
        @click="router.push({ name: 'Home' })"
      >
        <svg width="28" height="28" viewBox="0 0 64 64" class="group-hover:animate-glow">
          <defs>
            <linearGradient id="headerGradient" x1="0" x2="1">
              <stop offset="0" stop-color="#6C5CE7" />
              <stop offset="1" stop-color="#FF6B35" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="28" fill="url(#headerGradient)" opacity="0.85" />
        </svg>
        <span class="font-display text-2xl">Tuuuur</span>
      </button>
      <nav class="hidden sm:flex gap-3">
        <button
          class="pill hover:bg-brand-purple/20 hover:border-brand-purple/40"
          @click="router.push({ name: 'SoloQuiz' })"
        >
          Solo
        </button>
        <button
          class="pill hover:bg-brand-purple/20 hover:border-brand-purple/40"
          @click="router.push({ name: 'GroupMode' })"
        >
          Groupe
        </button>
        <button
          class="pill hover:bg-brand-purple/20 hover:border-brand-purple/40"
          @click="router.push({ name: 'CompetitiveMode' })"
        >
          Compétitif
        </button>
      </nav>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>
