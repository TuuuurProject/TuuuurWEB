<template>
  <header class="site-header" @keydown.esc="closeMenu">
    <a class="skip-link" href="#body-block">{{ $t('arena.skipContent') }}</a>
    <div class="header-inner">
      <router-link class="brand-lockup" :to="{ name: 'Home' }" aria-label="Monkizz">
        <MonkeyMascot portrait class="brand-mascot" />
        <span class="brand-wordmark">monkizz<span>.</span></span>
      </router-link>

      <nav class="desktop-nav" :aria-label="$t('arena.navigation')">
        <router-link :to="{ name: 'Home' }" class="nav-link" exact-active-class="nav-link--active">
          <font-awesome-icon icon="gamepad" aria-hidden="true" /> {{ $t('arena.navPlay') }}
        </router-link>
        <router-link :to="{ name: 'Ranking' }" class="nav-link" active-class="nav-link--active">
          <font-awesome-icon icon="trophy" aria-hidden="true" /> {{ $t('nav.ranking') }}
        </router-link>
        <router-link :to="{ name: 'Home', hash: '#how-to-play' }" class="nav-link">
          {{ $t('arena.howToPlay') }}
        </router-link>
      </nav>

      <div class="header-actions">
        <language-switcher />
        <router-link
          class="header-account"
          :to="{ name: userStore.isLogged ? 'Profile' : 'Login' }"
          :aria-label="$t(userStore.isLogged ? 'nav.profile' : 'auth.login.submit')"
        >
          <font-awesome-icon
            :icon="userStore.isLogged ? 'user' : 'sign-in-alt'"
            aria-hidden="true"
          />
          <span>{{ $t(userStore.isLogged ? 'nav.profile' : 'auth.login.submit') }}</span>
        </router-link>
        <button
          ref="menuButton"
          class="mobile-menu-toggle"
          :aria-label="$t('nav.menu')"
          :aria-expanded="mobileMenuOpen"
          aria-controls="mobile-navigation"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <font-awesome-icon v-if="mobileMenuOpen" icon="xmark" aria-hidden="true" />
          <span v-else class="menu-lines" aria-hidden="true"><i /><i /><i /></span>
        </button>
      </div>
    </div>
    <nav
      v-if="mobileMenuOpen"
      id="mobile-navigation"
      class="mobile-navigation"
      :aria-label="$t('arena.navigation')"
    >
      <router-link
        v-for="link in mobileLinks"
        :key="link.route"
        :to="{ name: link.route }"
        @click="mobileMenuOpen = false"
      >
        <font-awesome-icon :icon="link.icon" aria-hidden="true" /> {{ $t(link.label) }}
      </router-link>
    </nav>
  </header>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import useUserStore from '@/stores/user'
import LanguageSwitcher from './LanguageSwitcher.vue'
import MonkeyMascot from './gaming/MonkeyMascot.vue'

const userStore = useUserStore()
const route = useRoute()
const mobileMenuOpen = ref(false)
const menuButton = ref<HTMLButtonElement | null>(null)
const mobileLinks = [
  { route: 'Home', label: 'nav.home', icon: 'home' },
  { route: 'SoloQuiz', label: 'home.playSolo', icon: 'bolt' },
  { route: 'GroupMode', label: 'home.playGroup', icon: 'users' },
  { route: 'CompetitiveMode', label: 'home.competitiveMode', icon: 'fire' },
  { route: 'Ranking', label: 'nav.ranking', icon: 'trophy' },
  { route: 'Profile', label: 'nav.profile', icon: 'user' },
]

function closeMenu() {
  if (!mobileMenuOpen.value) return
  mobileMenuOpen.value = false
  menuButton.value?.focus()
}

watch(
  () => route.path,
  () => {
    mobileMenuOpen.value = false
  },
)
</script>
