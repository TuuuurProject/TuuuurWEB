<template>
  <section>
    <template v-if="userStore.isLogged || userStore.isLoggedAsInvited">
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
        :opponent="rankedStore.opponent!"
        :current-user="currentUser"
        :initial-countdown="initialCountdown ?? undefined"
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
import { ref, computed, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'
import signalrService, { RankedEvent } from '@/services/signalrService'
import useRankedStore from '@/stores/ranked'
import useUserStore from '@/stores/user'
import type { RankedUser } from '@/stores/ranked'
import RankedMatchmaking from './RankedMatchmaking.vue'
import RankedQuiz from './RankedQuiz.vue'
import LoggedInBlock from '@/components/LoggedInBlock.vue'

const { t } = useI18n()
const rankedStore = useRankedStore()
const userStore = useUserStore()
const instance = getCurrentInstance()
const proxy = instance?.proxy

type Step = 'idle' | 'search' | 'found' | 'game'
const step = ref<Step>('idle')
const connectionLoading = ref(false)
const initialCountdown = ref<number | null>(null)
let firstCountdownReceived = false

// ─── Build a RankedUser from userStore info ───────────────────────────────────
const userInfo = computed<RankedUser | null>(() => {
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

const currentUser = computed(() => userInfo.value)

// ─── SignalR handlers ─────────────────────────────────────────────────────────
function onOpponentFound(opponent: RankedUser) {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.log('[SignalR] Opponent found:', opponent)
  rankedStore.opponent = opponent
  step.value = 'found'
  firstCountdownReceived = false
}

function onCountdown(seconds: number) {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.log('[SignalR] Countdown:', seconds)
  if (step.value === 'found' && !firstCountdownReceived) {
    firstCountdownReceived = true
    initialCountdown.value = seconds
    step.value = 'game'
    // Remove this listener once game started (RankedQuiz will handle it)
    signalrService.off(RankedEvent.Countdown, onCountdown as any)
  }
}

function onError(message: string) {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.error('[SignalR] Error:', message)
  toast.error(message)
  if (step.value === 'search') {
    step.value = 'idle'
  }
}

// ─── Actions ──────────────────────────────────────────────────────────────────
async function startSearch() {
  connectionLoading.value = true
  try {
    if (!signalrService.isConnected()) {
      await signalrService.connect(userStore.token || '', true)
    }

    rankedStore.reset()
    step.value = 'search'
    firstCountdownReceived = false
    initialCountdown.value = null

    await signalrService.invoke(RankedEvent.JoinSearchOpponent)
  } catch (e) {
    toast.error(t('group.lobby.connectionError'))
    step.value = 'idle'
    await signalrService.disconnect()
  } finally {
    connectionLoading.value = false
  }
}

async function handleCancel() {
  try {
    if (signalrService.isConnected()) {
      await signalrService.invoke(RankedEvent.LeaveSearchOpponent)
    }
  } catch (_) {
    // ignore
  }
  step.value = 'idle'
}

async function handleHome() {
  await cleanup()
  step.value = 'idle'
}

async function handleReplay() {
  rankedStore.reset()
  step.value = 'idle'
  await startSearch()
}

async function cleanup(skipDisconnect = false) {
  if (!skipDisconnect && signalrService.isConnected()) {
    await signalrService.disconnect()
  }
  rankedStore.reset()
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
const allEvents = [
  { name: RankedEvent.OpponentFound, handler: onOpponentFound },
  { name: RankedEvent.Countdown, handler: onCountdown },
  { name: RankedEvent.Error, handler: onError },
]

onMounted(async () => {
  // Fetch user info if not already loaded
  if (!userStore.userInfo) {
    try {
      await userStore.getUserInfo()
    } catch (_) {}
  }

  try {
    allEvents.forEach((event) => {
      signalrService.off(event.name)
    })

    allEvents.forEach((event) => {
      signalrService.on(event.name, (data: unknown) => {
        event.handler(data)
      })
    })
  } catch (error) {
    console.error('Failed to connect to SignalR:', error)
    proxy?.$toast.error(t('group.lobby.connectionError'))
  }
})

onBeforeUnmount(async () => {
  allEvents.forEach((event) => {
    signalrService.off(event.name)
  })

  if (step.value === 'search') {
    try {
      await signalrService.invoke(RankedEvent.LeaveSearchOpponent)
    } catch (_) {}
  }

  if (step.value !== 'game') {
    await cleanup()
  }
})
</script>
