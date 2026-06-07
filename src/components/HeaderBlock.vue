<template>
  <header
    class="sticky top-0 z-10 bg-brand-darkGray/80 backdrop-blur-xl border-b border-brand-purple/20 h-[75px]"
  >
    <div class="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between h-full">
      <button
        class="inline-flex items-center gap-2 text-brand-lightGray hover:text-brand-purple transition group"
        @click="router.push({ name: 'Home' })"
      >
        <img
          src="@/assets/logo.png"
          alt="Tuuuur Logo"
          width="50"
          height="50"
          class="group-hover:animate-glow"
        />
        <span class="font-display text-2xl">Tuuuur</span>
      </button>

      <!-- Desktop nav -->
      <nav class="hidden sm:flex gap-3">
        <button
          class="pill hover:bg-brand-purple/20 hover:border-brand-purple/40"
          @click="router.push({ name: 'Home' })"
        >
          {{ $t('nav.home') }}
        </button>
        <button
          class="pill hover:bg-brand-purple/20 hover:border-brand-purple/40"
          @click="router.push({ name: 'Profile' })"
        >
          {{ $t('nav.profile') }}
        </button>
        <mode-switcher />
        <language-switcher />
      </nav>

      <!-- Burger button (mobile only) -->
      <button
        class="sm:hidden flex flex-col gap-1.5 p-2 text-brand-lightGray hover:text-brand-purple transition"
        :aria-label="$t('nav.menu')"
        :aria-expanded="mobileMenuOpen"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <span
          class="block w-6 h-0.5 bg-current transition-all duration-300"
          :class="mobileMenuOpen ? 'rotate-45 translate-y-2' : ''"
        />
        <span
          class="block w-6 h-0.5 bg-current transition-all duration-300"
          :class="mobileMenuOpen ? 'opacity-0' : ''"
        />
        <span
          class="block w-6 h-0.5 bg-current transition-all duration-300"
          :class="mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''"
        />
      </button>
    </div>

  </header>

  <!-- Mobile menu dropdown (fixed hors du header pour éviter les conflits de z-index) -->
  <transition
    enter-active-class="transition-all duration-200 ease-out"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <nav
      v-if="mobileMenuOpen"
      class="sm:hidden fixed top-[75px] left-0 right-0 z-50 bg-brand-darkGray/95 backdrop-blur-xl border-b border-brand-purple/20 px-6 py-4 flex flex-col gap-3"
    >
      <button
        class="pill w-full text-left hover:bg-brand-purple/20 hover:border-brand-purple/40"
        @click="navigate('Home')"
      >
        {{ $t('nav.home') }}
      </button>
      <button
        class="pill w-full text-left hover:bg-brand-purple/20 hover:border-brand-purple/40"
        @click="navigate('Profile')"
      >
        {{ $t('nav.profile') }}
      </button>
      <div class="flex gap-3">
        <mode-switcher />
        <language-switcher />
      </div>
    </nav>
  </transition>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import LanguageSwitcher from './LanguageSwitcher.vue'
import ModeSwitcher from './ModeSwitcher.vue'

const router = useRouter()
const route = useRoute()
const mobileMenuOpen = ref(false)

watch(
  () => route.path,
  () => { mobileMenuOpen.value = false },
)

function navigate(name: string) {
  router.push({ name })
}
</script>
