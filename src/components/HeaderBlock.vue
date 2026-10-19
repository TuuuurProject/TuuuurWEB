<template>
  <header
    class="sticky top-0 z-20 h-[75px] border-b border-brand-line bg-brand-surface/90 backdrop-blur-xl"
  >
    <div class="mx-auto flex h-full max-w-6xl items-center gap-6 px-6">
      <router-link
        :to="{ name: 'Home' }"
        class="shrink-0 rounded-xl font-display text-2xl font-extrabold text-brand-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40"
        :aria-label="$t('nav.home')"
      >
        Monk<span class="text-brand-purple">izz</span>
      </router-link>

      <!-- Navigation principale (desktop) -->
      <nav class="hidden flex-1 items-center gap-1 lg:flex" :aria-label="$t('nav.main')">
        <router-link
          v-for="link in links"
          :key="link.name"
          :to="{ name: link.name }"
          class="nav-link"
          :class="{ 'is-active': isActive(link.name) }"
          :aria-current="isActive(link.name) ? 'page' : undefined"
        >
          <font-awesome-icon :icon="link.icon" class="text-sm" />
          {{ $t(link.label) }}
        </router-link>
      </nav>

      <div class="ml-auto flex items-center gap-2">
        <div class="hidden items-center gap-2 lg:flex">
          <language-switcher />
          <color-mode-switcher />
        </div>

        <!-- Compte -->
        <router-link
          v-if="userStore.isLogged"
          :to="{ name: 'Profile' }"
          class="flex items-center gap-2 rounded-full border-2 border-transparent py-1 pl-1 pr-3 transition-colors hover:border-brand-line"
          :class="{ 'border-brand-purple/40': isActive('Profile') }"
          :aria-label="$t('nav.profile')"
        >
          <player-avatar
            :name="userStore.userInfo?.nickName"
            :avatar="userStore.userInfo?.avatar"
            size="sm"
          />
          <span class="hidden max-w-[10rem] truncate font-semibold sm:inline">
            {{ userStore.userInfo?.nickName ?? $t('nav.profile') }}
          </span>
        </router-link>
        <router-link
          v-else-if="!isAuthPage"
          :to="{ name: 'Login' }"
          class="btn btn-primary px-4 py-2 text-sm"
        >
          {{ $t('auth.login.submit') }}
        </router-link>

        <!-- Menu mobile -->
        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-full text-brand-ink transition-colors hover:bg-brand-surface2 lg:hidden"
          :aria-label="$t('nav.menu')"
          :aria-expanded="mobileMenuOpen"
          aria-controls="mobile-menu"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <font-awesome-icon :icon="mobileMenuOpen ? 'xmark' : 'bars'" class="text-lg" />
        </button>
      </div>
    </div>
  </header>

  <!-- Panneau mobile (fixé hors du header pour éviter les conflits de z-index) -->
  <transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 -translate-y-2"
    leave-active-class="transition duration-150 ease-in"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <nav
      v-if="mobileMenuOpen"
      id="mobile-menu"
      class="fixed left-0 right-0 top-[75px] z-30 flex flex-col gap-1 border-b border-brand-line bg-brand-surface px-6 py-4 shadow-card lg:hidden"
      :aria-label="$t('nav.main')"
    >
      <router-link
        v-for="link in mobileLinks"
        :key="link.name"
        :to="{ name: link.name }"
        class="nav-link py-3 text-base"
        :class="{ 'is-active': isActive(link.name) }"
        :aria-current="isActive(link.name) ? 'page' : undefined"
      >
        <font-awesome-icon :icon="link.icon" class="w-5" />
        {{ $t(link.label) }}
      </router-link>
      <div class="mt-2 flex items-center gap-2 border-t border-brand-line pt-4">
        <language-switcher />
        <color-mode-switcher />
      </div>
    </nav>
  </transition>
</template>

<script lang="ts" setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import LanguageSwitcher from './LanguageSwitcher.vue'
import ColorModeSwitcher from './ColorModeSwitcher.vue'
import PlayerAvatar from './game/PlayerAvatar.vue'
import useUserStore from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()
const mobileMenuOpen = ref(false)

const links = [
  { name: 'SoloQuiz', label: 'nav.solo', icon: 'bullseye' },
  { name: 'GroupMode', label: 'nav.group', icon: 'users' },
  { name: 'CompetitiveMode', label: 'nav.competitive', icon: 'bolt' },
  { name: 'Ranking', label: 'nav.ranking', icon: 'ranking-star' },
]

const mobileLinks = [{ name: 'Home', label: 'nav.home', icon: 'home' }, ...links]

const isActive = (name: string) => route.name === name

const isAuthPage = computed(() => route.name === 'Login' || route.name === 'Register')

// Avatar et pseudo du joueur connecté
const loadUser = () => {
  if (userStore.isLogged && !userStore.userInfo) userStore.getUserInfo()
}
onMounted(loadUser)
watch(() => userStore.isLogged, loadUser)

watch(
  () => route.fullPath,
  () => {
    mobileMenuOpen.value = false
  },
)
</script>

<style scoped>
.nav-link {
  @apply flex items-center gap-2 rounded-full px-4 py-2 font-semibold text-brand-muted transition-colors hover:bg-brand-surface2 hover:text-brand-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40;
}
.nav-link.is-active {
  @apply bg-brand-purple/10 text-brand-purple;
}
</style>
