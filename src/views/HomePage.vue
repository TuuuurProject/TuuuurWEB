<template>
  <div
    id="home-page-section"
    class="relative flex flex-col items-center justify-center px-6 py-10 bg-gaming-gradient overflow-hidden"
    style="min-height: calc(100vh - 75px)"
  >
    <!-- Particules animées en arrière-plan -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute top-1/4 left-1/4 w-2 h-2 bg-brand-purple rounded-full animate-pulse-slow opacity-60"
      ></div>
      <div
        class="absolute top-3/4 right-1/4 w-1 h-1 bg-brand-orange rounded-full animate-bounce-slow opacity-80"
      ></div>
      <div
        class="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-brand-green rounded-full animate-float opacity-70"
      ></div>
      <div
        class="absolute top-1/3 right-1/3 w-1 h-1 bg-brand-pink rounded-full animate-wiggle opacity-60"
      ></div>
      <div
        class="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-brand-cyan rounded-full animate-pulse-slow opacity-50"
      ></div>
      <!-- Effets cosmiques -->
      <div class="absolute inset-0 bg-cosmic opacity-30"></div>
    </div>

    <div class="text-center space-y-8 z-10">
      <div class="flex flex-col items-center gap-4">
        <div class="flex items-center gap-3">
          <!-- Logo redesigné avec effets de glow -->
          <svg width="80" height="80" viewBox="0 0 64 64" class="drop-shadow-2xl animate-glow">
            <defs>
              <linearGradient id="gamingGradient" x1="0" x2="1">
                <stop offset="0" stop-color="#6C5CE7" />
                <stop offset="0.5" stop-color="#FF6B35" />
                <stop offset="1" stop-color="#00D084" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="url(#gamingGradient)"
              opacity="0.9"
              filter="url(#glow)"
            />
            <path
              d="M20 38c8-2 12-10 12-18 6 4 10 10 12 18 2 8-4 12-12 12s-14-4-12-12z"
              fill="#E1E5E9"
              opacity="0.9"
            />
          </svg>
          <!-- Titre avec gradient animé -->
          <h1 class="title-gaming tracking-tight animate-float">Tuuuur</h1>
        </div>
        <p class="max-w-xl text-brand-gray text-base md:text-lg">
          Quiz fun et compétitif. Jouez en solo, en groupe ou en duel en ligne.
        </p>
      </div>

      <!-- Boutons principaux avec effets gaming -->
      <div class="grid gap-4 sm:grid-cols-3 max-w-3xl mx-auto">
        <button
          class="btn btn-primary text-lg py-4 shadow-neon hover:shadow-glow-hover"
          @click="router.push({ name: 'SoloQuiz' })"
        >
          <font-awesome-icon icon="bullseye" class="mr-2" /> Jouer en solo
        </button>
        <button
          class="btn btn-secondary text-lg py-4 shadow-neon-orange hover:shadow-glow-hover"
          @click="router.push({ name: 'GroupMode' })"
        >
          <font-awesome-icon icon="users" class="mr-2" /> Jouer en groupe
        </button>
        <button
          class="btn btn-ghost text-lg py-4"
          @click="router.push({ name: 'CompetitiveMode' })"
        >
          <font-awesome-icon icon="fire" class="mr-2" /> Mode compétitif
        </button>
      </div>

      <!-- Cartes de navigation redesignées -->
      <div class="mt-10 grid grid-cols-2 sm:grid-cols-2 gap-3 max-w-4xl mx-auto">
        <button class="gaming-card group" @click="router.push({ name: 'Profile' })">
          <div class="flex items-center gap-3">
            <span
              class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-purple/20 text-brand-purple group-hover:bg-brand-purple group-hover:text-white transition-all duration-300"
            >
              <svg viewBox="0 0 24 24" class="h-6 w-6" fill="currentColor">
                <path
                  d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.2 0-8 2.1-8 5v1h16v-1c0-2.9-3.8-5-8-5Z"
                />
              </svg>
            </span>
            <span
              class="font-semibold text-brand-lightGray group-hover:text-white transition-colors"
              >Profil</span
            >
          </div>
        </button>
        <button class="gaming-card group" @click="router.push({ name: 'Ranking' })">
          <div class="flex items-center gap-3">
            <span
              class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-orange/20 text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-all duration-300"
            >
              <svg viewBox="0 0 24 24" class="h-6 w-6" fill="currentColor">
                <path
                  d="M19 3h-3V2a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v1H5a1 1 0 0 0-1 1v2a5 5 0 0 0 4 4.9V13a3 3 0 0 0-2 2.82V18h12v-2.18A3 3 0 0 0 16 13V10.9a5 5 0 0 0 4-4.9V4a1 1 0 0 0-1-1ZM6 6V5h2v3.82A3 3 0 0 1 6 6Zm12 0a3 3 0 0 1-2 2.82V5h2Z"
                />
              </svg>
            </span>
            <span
              class="font-semibold text-brand-lightGray group-hover:text-white transition-colors"
              >Classement</span
            >
          </div>
        </button>
      </div>
    </div>

    <!-- Footer avec effet glow -->
    <footer class="absolute bottom-6 text-xs text-brand-gray glow-text">© 2025 Tuuuur</footer>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>
