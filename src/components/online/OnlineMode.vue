<template>
  <section>
    <template v-if="userStore.isLogged">
      <!-- Lancement : niveau du joueur, règles en bref, bouton de recherche -->
      <div v-if="step === 'idle'" class="flex flex-col gap-6">
        <header class="flex flex-col gap-2">
          <h2 class="text-3xl font-bold">{{ $t('competitive.lobby.title') }}</h2>
          <p class="max-w-2xl text-brand-muted">{{ $t('competitive.lobby.intro') }}</p>
        </header>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
          <div class="flex min-w-0 flex-col gap-6">
            <section
              class="surface-card grid grid-cols-2 gap-3 sm:gap-4"
              aria-labelledby="ranked-level-title"
            >
              <h3 id="ranked-level-title" class="sr-only">{{ $t('competitive.lobby.level') }}</h3>
              <div class="flex flex-col gap-1 rounded-2xl bg-brand-surface2/60 p-4">
                <span class="text-sm font-semibold text-brand-muted">
                  <font-awesome-icon icon="trophy" class="mr-1 text-brand-yellow" />
                  {{ $t('home.progress.elo') }}
                </span>
                <span class="font-display text-4xl font-extrabold tabular-nums">
                  {{ currentUser?.globalElo || rankedStore.rankingData?.userElo || '—' }}
                </span>
              </div>
              <div class="flex flex-col gap-1 rounded-2xl bg-brand-surface2/60 p-4">
                <span class="text-sm font-semibold text-brand-muted">
                  <font-awesome-icon icon="ranking-star" class="mr-1 text-brand-purple" />
                  {{ $t('home.progress.rank') }}
                </span>
                <template v-if="rankedStore.rankingData?.userRanking">
                  <span class="font-display text-4xl font-extrabold tabular-nums">
                    #{{ rankedStore.rankingData.userRanking }}
                  </span>
                  <span class="text-sm text-brand-muted">
                    {{
                      $t('home.progress.rankTotal', { total: rankedStore.rankingData.totalUsers })
                    }}
                  </span>
                </template>
                <span v-else class="pt-2 font-semibold text-brand-muted">
                  {{ $t('home.progress.unranked') }}
                </span>
              </div>
            </section>

            <section class="surface-card flex flex-col gap-4" aria-labelledby="ranked-rules-title">
              <h3 id="ranked-rules-title" class="text-xl font-bold">
                {{ $t('competitive.lobby.rulesTitle') }}
              </h3>
              <ol class="flex flex-col gap-4">
                <li v-for="rule in rules" :key="rule.key" class="flex items-start gap-3">
                  <span
                    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-surface2 text-brand-purple"
                  >
                    <font-awesome-icon :icon="rule.icon" />
                  </span>
                  <span class="flex flex-col">
                    <span class="font-semibold">{{
                      $t(`competitive.lobby.rules.${rule.key}.title`)
                    }}</span>
                    <span class="text-sm text-brand-muted">
                      {{ $t(`competitive.lobby.rules.${rule.key}.text`) }}
                    </span>
                  </span>
                </li>
              </ol>
            </section>
          </div>

          <section
            class="surface-card order-first flex flex-col items-center gap-5 text-center lg:sticky lg:top-24 lg:order-none"
          >
            <mascot-speech
              :message="$t('competitive.lobby.mascot')"
              :size="180"
              mascot-class="w-36"
            />
            <button
              data-testid="ranked-search"
              class="btn btn-primary w-full py-4 text-lg"
              :disabled="connectionLoading"
              @click="startSearch"
            >
              <font-awesome-icon
                :icon="connectionLoading ? 'circle-notch' : 'magnifying-glass'"
                :class="{ 'animate-spin': connectionLoading }"
                class="mr-2"
              />
              {{ $t('competitive.ranked.searchOpponent') }}
            </button>
            <router-link
              :to="{ name: 'Ranking' }"
              class="text-sm font-bold text-brand-purple hover:underline"
            >
              {{ $t('home.progress.seeRanking') }}
            </router-link>
          </section>
        </div>
      </div>

      <!-- Searching / Found -->
      <RankedMatchmaking
        v-else-if="step === 'search' || step === 'found'"
        :state="step"
        :opponent="rankedStore.opponent"
        :current-user="currentUser"
        @cancel="handleCancel"
      />

      <!-- Quiz -->
      <RankedQuiz
        v-else-if="step === 'game'"
        :opponent="rankedStore.opponent ?? undefined"
        :current-user="currentUser"
        :initial-countdown="initialCountdown ?? undefined"
        :history-mode="isHistoryMode"
        @home="handleHome"
        @replay="handleReplay"
      />
    </template>

    <div v-else class="surface-card w-full">
      <logged-in-block :message="$t('competitive.notLoggedIn')" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'
import signalrService, { RankedEvent } from '@/services/signalrService'
import useRankedStore from '@/stores/ranked'
import useUserStore from '@/stores/user'
import type { RankedUser } from '@/stores/ranked'
import { useRankedLifecycle } from '@/composables/useRankedLifecycle'
import RankedMatchmaking from './RankedMatchmaking.vue'
import RankedQuiz from './RankedQuiz.vue'
import LoggedInBlock from '@/components/LoggedInBlock.vue'
import MascotSpeech from '@/components/mascot/MascotSpeech.vue'

const rules = [
  { key: 'match', icon: 'users' },
  { key: 'play', icon: 'bolt' },
  { key: 'elo', icon: 'chart-line' },
]

const { t } = useI18n()
const rankedStore = useRankedStore()
const userStore = useUserStore()
const { cleanupRanked, connectSignalR } = useRankedLifecycle()

type Step = 'idle' | 'search' | 'found' | 'game'
const step = ref<Step>('idle')
const connectionLoading = ref(false)
const initialCountdown = ref<number | null>(null)
const isHistoryMode = ref(false)
let firstCountdownReceived = false

// ─── Build a RankedUser from userStore info ───────────────────────────────────
const currentUser = computed<RankedUser | null>(() => {
  if (!userStore.userInfo) return null
  return {
    id: String(userStore.userId),
    nickName: userStore.userInfo.nickName,
    email: userStore.userInfo.email,
    avatar: userStore.userInfo.avatar ?? null,
    isAdmin: false,
    isNew: false,
    isGoogleUser: userStore.userInfo.isGoogleUser,
    isInvitedUser: false,
    elo: [],
    globalElo: userStore.userInfo.globalElo ?? 0,
  }
})

// ─── SignalR handlers ─────────────────────────────────────────────────────────
function onOpponentFound(opponent: RankedUser) {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.log('[SignalR] Opponent found:', opponent)
  rankedStore.opponent = opponent
  step.value = 'found'
  firstCountdownReceived = false
}

function onCountdown(seconds: number) {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG)
    console.log('[SignalR] Countdown (OnlineMode):', seconds)
  // Transition vers le jeu au premier countdown reçu après OnOpponentFound.
  // RankedQuiz prendra le relais pour les countdowns suivants.
  if (step.value === 'found' && !firstCountdownReceived) {
    firstCountdownReceived = true
    initialCountdown.value = seconds
    step.value = 'game'
    signalrService.off(RankedEvent.Countdown, onCountdown)
  }
}

function onError(message: string) {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.error('[SignalR] Error:', message)
  toast.error(message)
  if (step.value === 'search') {
    step.value = 'idle'
  }
}

const allEvents = [
  { name: RankedEvent.OpponentFound, handler: onOpponentFound },
  { name: RankedEvent.Countdown, handler: onCountdown },
  { name: RankedEvent.Error, handler: onError },
]

// ─── Actions ──────────────────────────────────────────────────────────────────
async function startSearch() {
  connectionLoading.value = true
  try {
    // Connexion centralisée via le composable (identique au pattern groupe)
    await connectSignalR()

    // Re-enregistrer les handlers après un éventuel disconnect (replay)
    // disconnect() vide this.handlers, donc on doit les réenregistrer
    allEvents.forEach((event) => signalrService.off(event.name))
    allEvents.forEach((event) => signalrService.on(event.name, event.handler))

    rankedStore.reset()
    step.value = 'search'
    firstCountdownReceived = false
    initialCountdown.value = null

    await signalrService.invoke(RankedEvent.JoinSearchOpponent)
  } catch {
    toast.error(t('group.lobby.connectionError'))
    step.value = 'idle'
    await cleanupRanked()
  } finally {
    connectionLoading.value = false
  }
}

async function handleCancel() {
  // Quitter la file proprement avant de déconnecter
  try {
    if (signalrService.isConnected()) {
      await signalrService.invoke(RankedEvent.LeaveSearchOpponent)
    }
  } catch (e) {
    if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.warn('Failed to leave search queue:', e)
  }

  await cleanupRanked()
  step.value = 'idle'
}

// "Home" depuis l'écran de fin : RankedQuiz gère sa propre déconnexion dans
// onBeforeUnmount, OnlineMode revient juste à l'état idle.
function handleHome() {
  step.value = 'idle'
}

// "Replay" : cleanupRanked() d'abord (déconnecte), puis changement de step
// (RankedQuiz démonte, voit la connexion déjà fermée), puis nouvelle recherche.
// Évite la race condition entre la déconnexion et la reconnexion.
async function handleReplay() {
  await cleanupRanked()
  step.value = 'idle'
  await startSearch()
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(async () => {
  if (!userStore.userInfo) {
    try {
      await userStore.getUserInfo()
    } catch (e) {
      if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.warn('Failed to fetch user info:', e)
    }
  }

  // Niveau du joueur affiché sur l'écran de lancement
  rankedStore.loadRanking(1, 1)

  // History mode: partyId set from route param by CompetitiveModePage
  if (rankedStore.partyId) {
    isHistoryMode.value = true
    await rankedStore.loadPartyInfo()
    step.value = 'game'
    return
  }

  // Même pattern que GroupLobby : nettoyer tous les handlers existants pour ces
  // événements avant d'enregistrer les nôtres (évite les doublons au remontage).
  allEvents.forEach((event) => signalrService.off(event.name))
  allEvents.forEach((event) => signalrService.on(event.name, event.handler))
})

onBeforeUnmount(async () => {
  // Retirer nos handlers (le composant est détruit)
  allEvents.forEach((event) => signalrService.off(event.name, event.handler))

  // Si on était encore en recherche, informer le serveur
  if (step.value === 'search') {
    try {
      await signalrService.invoke(RankedEvent.LeaveSearchOpponent)
    } catch (e) {
      if (import.meta.env.VITE_DEBUG_CONSOLE_LOG)
        console.warn('Failed to leave search queue on unmount:', e)
    }
  }

  // Ne pas déconnecter si on passe au jeu : RankedQuiz garde la connexion vivante
  // et gérera lui-même la déconnexion dans son onBeforeUnmount.
  if (step.value !== 'game') {
    await cleanupRanked()
  }
})
</script>
