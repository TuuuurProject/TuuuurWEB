<template>
  <header class="sticky top-0 z-40 border-b border-brand-purple/15 bg-brand-dark/95 backdrop-blur-xl">
    <div class="mx-auto flex h-[76px] max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
      <button class="flex shrink-0 items-center gap-2.5 text-brand-lightGray" aria-label="Monkizz - accueil" @click="router.push({ name: 'Home' })">
        <img :src="monkizzMark" alt="" width="42" height="42" />
        <span class="font-display text-2xl font-bold tracking-[-0.075em]">monkizz<span class="text-brand-orange">.</span></span>
      </button>

      <nav class="hidden items-center gap-1 md:flex" :aria-label="$t('nav.menu')">
        <button class="nav-link" :class="{ 'nav-link-active': route.name === 'Home' }" @click="router.push({ name: 'Home' })">{{ $t('nav.home') }}</button>
        <button class="nav-link" :class="{ 'nav-link-active': route.name === 'SoloQuiz' }" @click="router.push({ name: 'SoloQuiz' })">{{ $t('nav.solo') }}</button>
        <button class="nav-link" :class="{ 'nav-link-active': route.name === 'GroupMode' }" @click="router.push({ name: 'GroupMode' })">{{ $t('nav.group') }}</button>
        <button class="nav-link" :class="{ 'nav-link-active': route.name === 'CompetitiveMode' }" @click="router.push({ name: 'CompetitiveMode' })">{{ $t('nav.competitive') }}</button>
        <button class="nav-link" :class="{ 'nav-link-active': route.name === 'Ranking' }" @click="router.push({ name: 'Ranking' })">{{ $t('nav.ranking') }}</button>
      </nav>

      <div class="flex items-center gap-2">
        <button data-testid="theme-toggle" class="icon-button" :aria-label="colorScheme === 'light' ? $t('nav.darkTheme') : $t('nav.lightTheme')" :title="colorScheme === 'light' ? $t('nav.darkTheme') : $t('nav.lightTheme')" @click="toggleTheme">
          <svg v-if="colorScheme === 'light'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true" class="h-5 w-5"><path d="M20.3 15.2A8.6 8.6 0 0 1 8.8 3.7a8.7 8.7 0 1 0 11.5 11.5Z" stroke-linejoin="round" /></svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true" class="h-5 w-5"><circle cx="12" cy="12" r="4" /><path stroke-linecap="round" d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
        </button>
        <div class="hidden sm:block"><language-switcher /></div>
        <button class="hidden rounded-full bg-brand-purple px-5 py-2.5 font-display text-sm font-bold text-white transition hover:bg-brand-purpleDark md:block dark-ink" @click="router.push({ name: 'Profile' })">{{ $t('nav.profile') }}</button>
        <button class="icon-button md:hidden" :aria-label="$t('nav.menu')" :aria-expanded="mobileMenuOpen" aria-controls="mobile-navigation" @click="mobileMenuOpen = !mobileMenuOpen">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" class="h-6 w-6"><path v-if="!mobileMenuOpen" stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16" /><path v-else stroke-linecap="round" d="m5 5 14 14M19 5 5 19" /></svg>
        </button>
      </div>
    </div>

    <nav v-if="mobileMenuOpen" id="mobile-navigation" class="absolute left-0 right-0 top-[76px] flex flex-col gap-1 border-b border-brand-purple/15 bg-brand-dark px-5 py-4 shadow-card md:hidden" :aria-label="$t('nav.menu')">
      <button v-for="item in mobileLinks" :key="item.name" class="nav-link w-full text-left" :class="{ 'nav-link-active': route.name === item.name }" @click="navigate(item.name)">{{ $t(item.label) }}</button>
      <div class="mt-2 border-t border-brand-purple/15 pt-3 sm:hidden"><language-switcher /></div>
    </nav>
  </header>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import LanguageSwitcher from './LanguageSwitcher.vue'
import monkizzMark from '@/assets/monkizz-mark.svg'

const router = useRouter()
const route = useRoute()
const mobileMenuOpen = ref(false)
const savedTheme = localStorage.getItem('monkizz-theme')
const colorScheme = ref<'light' | 'dark'>(savedTheme === 'light' || savedTheme === 'dark'
  ? savedTheme
  : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

const mobileLinks = [
  { name: 'Home', label: 'nav.home' },
  { name: 'SoloQuiz', label: 'nav.solo' },
  { name: 'GroupMode', label: 'nav.group' },
  { name: 'CompetitiveMode', label: 'nav.competitive' },
  { name: 'Ranking', label: 'nav.ranking' },
  { name: 'Profile', label: 'nav.profile' },
]

watch(colorScheme, (value) => {
  document.documentElement.dataset.theme = value
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', value === 'dark' ? '#111827' : '#f7f6f1')
}, { immediate: true })

watch(() => route.path, () => { mobileMenuOpen.value = false })

function toggleTheme() {
  colorScheme.value = colorScheme.value === 'light' ? 'dark' : 'light'
  localStorage.setItem('monkizz-theme', colorScheme.value)
}

function navigate(name: string) {
  mobileMenuOpen.value = false
  router.push({ name })
}
</script>

<style scoped>
.nav-link { border-radius: 999px; padding: .65rem .9rem; color: rgb(var(--text-muted)); font-size: .86rem; font-weight: 700; transition: color .2s, background .2s; }
.nav-link:hover, .nav-link-active { color: rgb(var(--accent-primary)); background: rgb(var(--accent-primary) / .09); }
.icon-button { display: grid; width: 2.65rem; height: 2.65rem; place-items: center; border: 1px solid rgb(var(--accent-primary) / .2); border-radius: 50%; color: rgb(var(--text-primary)); transition: background .2s; }
.icon-button:hover { background: rgb(var(--accent-primary) / .1); }
:global(:root[data-theme='dark']) .dark-ink { color: rgb(var(--surface-page)); }
</style>
