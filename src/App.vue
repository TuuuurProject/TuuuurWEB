<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PlaceholderPage from './components/PlaceholderPage.vue'
import SoloSelect from './components/solo/SoloSelect.vue'
import SoloQuiz from './components/solo/SoloQuiz.vue'
import GroupMode from './components/group/GroupMode.vue'
import OnlineMode from './components/online/OnlineMode.vue'
import AuthLogin from './components/auth/AuthLogin.vue'
import AuthRegister from './components/auth/AuthRegister.vue'
import ProfileView from './components/profile/ProfileView.vue'
import Leaderboard from './components/leaderboard/Leaderboard.vue'

type View =
  | 'home'
  | 'solo'
  | 'solo-quiz'
  | 'groupe'
  | 'en-ligne'
  | 'profil'
  | 'classement'
  | 'login'
  | 'register'

const view = ref<View>('home')
const toast = ref('')
const soloParams = ref<{ categories: string[]; questions: number; shuffle: boolean } | null>(null)

function startSolo(p: { categories: string[]; questions: number; shuffle: boolean }) {
  soloParams.value = p
  setView('solo-quiz')
}

const setView = (v: View) => {
  view.value = v
  window.location.hash = v
}

onMounted(() => {
  const hash = window.location.hash.replace('#', '') as View
  if (hash) view.value = hash
  window.addEventListener('hashchange', () => {
    const h = window.location.hash.replace('#', '') as View
    if (h) view.value = h
  })

  setInterval(() => {
    if (toast.value) toast.value = ''
  }, 2500)

  if (view.value === 'solo-quiz' && !soloParams.value) {
    setView('solo')
  }
})
</script>

<template>
  <div class="min-h-screen bg-brand-dark text-brand-lightGray">
    <div
      v-if="view === 'home'"
      class="relative min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-gaming-gradient overflow-hidden"
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
            @click="setView('solo')"
          >
            <font-awesome-icon icon="bullseye" class="mr-2" /> Jouer en solo
          </button>
          <button
            class="btn btn-secondary text-lg py-4 shadow-neon-orange hover:shadow-glow-hover"
            @click="setView('groupe')"
          >
            <font-awesome-icon icon="users" class="mr-2" /> Jouer en groupe
          </button>
          <button class="btn btn-ghost text-lg py-4" @click="setView('en-ligne')">
            <font-awesome-icon icon="fire" class="mr-2" /> Mode compétitif
          </button>
        </div>

        <!-- Cartes de navigation redesignées -->
        <div class="mt-10 grid grid-cols-2 sm:grid-cols-2 gap-3 max-w-4xl mx-auto">
          <button class="gaming-card group" @click="setView('profil')">
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
          <button class="gaming-card group" @click="setView('classement')">
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

    <div v-else>
      <div class="min-h-screen bg-brand-dark">
        <!-- Header redesigné avec backdrop blur -->
        <header
          class="sticky top-0 z-10 bg-brand-darkGray/80 backdrop-blur-xl border-b border-brand-purple/20"
        >
          <div class="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
            <button
              class="inline-flex items-center gap-2 text-brand-lightGray hover:text-brand-purple transition group"
              @click="setView('home')"
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
                @click="setView('solo')"
              >
                Solo
              </button>
              <button
                class="pill hover:bg-brand-purple/20 hover:border-brand-purple/40"
                @click="setView('groupe')"
              >
                Groupe
              </button>
              <button
                class="pill hover:bg-brand-purple/20 hover:border-brand-purple/40"
                @click="setView('en-ligne')"
              >
                Compétitif
              </button>
            </nav>
          </div>
        </header>

        <main class="mx-auto max-w-5xl px-6 py-10">
          <SoloSelect v-if="view === 'solo'" @back="setView('home')" @start="startSolo" />
          <SoloQuiz
            v-else-if="view === 'solo-quiz' && soloParams"
            :categories="soloParams.categories"
            :questions="soloParams.questions"
            :shuffle="soloParams.shuffle"
            @exit="setView('home')"
          />
          <GroupMode v-else-if="view === 'groupe'" />
          <OnlineMode v-else-if="view === 'en-ligne'" @back="setView('home')" />
          <ProfileView
            v-else-if="view === 'profil'"
            @goto-login="setView('login')"
            @goto-register="setView('register')"
          />
          <AuthLogin
            v-else-if="view === 'login'"
            @back="setView('profil')"
            @goto-register="setView('register')"
          />
          <AuthRegister
            v-else-if="view === 'register'"
            @back="setView('profil')"
            @goto-login="setView('login')"
          />
          <Leaderboard v-else-if="view === 'classement'" />

          <!-- Toast notification redesigné -->
          <transition name="fade">
            <div
              v-if="toast"
              class="fixed bottom-6 left-1/2 -translate-x-1/2 pill shadow-neon bg-brand-darkGray/90 backdrop-blur-lg border border-brand-purple/30"
            >
              {{ toast }}
            </div>
          </transition>
        </main>
      </div>
    </div>
  </div>
</template>
