<template>
  <section>
    <template v-if="userStore.isLogged">
      <!-- Landing: search button only -->
      <div v-if="step === 'idle'" class="space-y-6">
        <header class="flex items-center justify-between">
          <h2 class="font-branding text-3xl text-brand-lightGray glow-text">
            <font-awesome-icon icon="fire" class="mr-2 text-brand-orange" />
            {{ $t('competitive.ranked.title') }}
          </h2>
        </header>

        <div class="gaming-card">
          <div class="flex items-start gap-4 mb-6">
            <div
              class="w-12 h-12 rounded-2xl bg-brand-orange/20 flex items-center justify-center text-brand-orange text-2xl shrink-0"
            >
              <font-awesome-icon icon="bullseye" />
            </div>
            <div>
              <h3 class="font-branding text-xl mb-2 text-brand-lightGray">
                <font-awesome-icon icon="trophy" class="mr-2" />
                {{ $t('competitive.ranked.subtitle') }}
              </h3>
              <p class="text-brand-gray">{{ $t('competitive.ranked.description') }}</p>
            </div>
          </div>

          <div class="flex justify-center">
            <button class="btn btn-secondary" :disabled="connectionLoading" @click="startSearch">
              <font-awesome-icon
                v-if="connectionLoading"
                icon="circle-notch"
                class="animate-spin mr-1"
              />
              <font-awesome-icon v-else icon="magnifying-glass" class="mr-1" />
              {{ $t('competitive.ranked.searchOpponent') }}
            </button>
          </div>
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

    <div v-else class="gaming-card justify-self-center w-full">
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
    globalElo: 0,
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
