<template>
  <div
    id="home-page-section"
    class="relative flex flex-col items-center justify-center px-6 py-10 overflow-hidden"
    style="min-height: calc(100vh - 75px)"
  >
    <div class="text-center space-y-8 z-10">
      <div class="flex flex-col items-center gap-4">
        <h1 class="font-display font-extrabold tracking-tight text-6xl md:text-7xl lg:text-8xl">
          Monk<span class="text-brand-purple">izz</span>
        </h1>
        <p class="max-w-xl text-brand-gray text-base md:text-lg">
          {{ $t('home.subtitle') }}
        </p>
      </div>

      <!-- Boutons principaux -->
      <div class="grid gap-4 sm:grid-cols-3 max-w-3xl mx-auto">
        <button
          data-testid="home-solo"
          class="btn btn-primary text-lg py-4 shadow-card"
          @click="router.push({ name: 'SoloQuiz' })"
        >
          <font-awesome-icon icon="bullseye" class="mr-2" /> {{ $t('home.playSolo') }}
        </button>
        <button
          data-testid="home-group"
          class="btn btn-secondary text-lg py-4 shadow-card"
          @click="router.push({ name: 'GroupMode' })"
        >
          <font-awesome-icon icon="users" class="mr-2" /> {{ $t('home.playGroup') }}
        </button>
        <button
          class="btn btn-ghost text-lg py-4"
          @click="router.push({ name: 'CompetitiveMode' })"
        >
          <font-awesome-icon icon="fire" class="mr-2" /> {{ $t('home.competitiveMode') }}
        </button>
      </div>

      <!-- Cartes de navigation -->
      <div class="mt-10 grid grid-cols-2 sm:grid-cols-2 gap-3 max-w-4xl mx-auto">
        <button
          data-testid="home-profile"
          class="surface-card group"
          @click="router.push({ name: 'Profile' })"
        >
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
            <span class="font-semibold text-brand-lightGray">{{ $t('nav.profile') }}</span>
          </div>
        </button>
        <button class="surface-card group" @click="router.push({ name: 'Ranking' })">
          <div class="flex items-center gap-3">
            <span
              class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-orange/20 text-brand-orange group-hover:bg-brand-orange group-hover:text-brand-onOrange transition-all duration-300"
            >
              <svg viewBox="0 0 24 24" class="h-6 w-6" fill="currentColor">
                <path
                  d="M19 3h-3V2a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v1H5a1 1 0 0 0-1 1v2a5 5 0 0 0 4 4.9V13a3 3 0 0 0-2 2.82V18h12v-2.18A3 3 0 0 0 16 13V10.9a5 5 0 0 0 4-4.9V4a1 1 0 0 0-1-1ZM6 6V5h2v3.82A3 3 0 0 1 6 6Zm12 0a3 3 0 0 1-2 2.82V5h2Z"
                />
              </svg>
            </span>
            <span class="font-semibold text-brand-lightGray">{{ $t('nav.ranking') }}</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Footer -->
    <footer class="absolute bottom-6 text-xs text-brand-gray">
      {{ $t('home.footer', { year: currentYear }) }} - V.{{ packageJson.version }}
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import packageJson from '../../package.json'

const router = useRouter()
const currentYear = new Date().getFullYear()
</script>
