<template>
  <section>
    <!-- Landing: search button only -->
    <div v-if="step === 'idle'" class="space-y-6">
      <header class="flex items-center justify-between">
        <h2 class="font-branding text-3xl text-brand-lightGray glow-text">
          <font-awesome-icon icon="fire" class="mr-2 text-brand-orange" />
          {{ $t('competitive.ranked.title') }}
        </h2>
        <div class="badge-info animate-pulse-slow">{{ $t('competitive.ranked.badge') }}</div>
      </header>

      <div class="gaming-card">
        <div class="flex items-start gap-4 mb-6">
          <div class="w-12 h-12 rounded-2xl bg-brand-orange/20 flex items-center justify-center text-brand-orange text-2xl animate-float shrink-0">
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

        <!-- Info band -->
        <div class="p-4 rounded-2xl bg-brand-orange/10 border border-brand-orange/20 mb-6">
          <div class="flex items-center gap-2 mb-2">
            <font-awesome-icon icon="bolt" class="text-brand-orange" />
            <span class="text-sm font-semibold text-brand-orange">{{ $t('competitive.info.title') }}</span>
          </div>
          <p class="text-sm text-brand-gray">{{ $t('competitive.info.description') }}</p>
          <div class="flex items-center gap-4 mt-3 text-xs flex-wrap">
            <div class="flex items-center gap-1">
              <span class="w-2 h-2 bg-brand-green rounded-full"></span>
              <span class="text-brand-gray">{{ $t('competitive.info.balancedMatchmaking') }}</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="w-2 h-2 bg-brand-purple rounded-full"></span>
              <span class="text-brand-gray">{{ $t('competitive.info.dynamicRank') }}</span>
            </div>
            <div v-if="userStore.userInfo" class="flex items-center gap-1">
              <span class="w-2 h-2 bg-brand-yellow rounded-full"></span>
              <span class="text-brand-gray">{{ $t('competitive.ranked.eloInfo', { value: userInfo?.globalElo ?? '—' }) }}</span>
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <button class="btn btn-secondary" :disabled="connectionLoading" @click="startSearch">
            <font-awesome-icon v-if="connectionLoading" icon="circle-notch" class="animate-spin mr-1" />
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
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'
import rankedSignalrService, { RankedEvent } from '@/services/rankedSignalrService'
import useRankedStore from '@/stores/ranked'
import useUserStore from '@/stores/user'
import type { RankedUser } from '@/stores/ranked'
import RankedMatchmaking from './RankedMatchmaking.vue'
import RankedQuiz from './RankedQuiz.vue'

const { t } = useI18n()
const rankedStore = useRankedStore()
const userStore = useUserStore()

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
  rankedStore.opponent = opponent
  step.value = 'found'
  firstCountdownReceived = false
}

function onCountdown(seconds: number) {
  if (step.value === 'found' && !firstCountdownReceived) {
    firstCountdownReceived = true
    initialCountdown.value = seconds
    step.value = 'game'
    // Remove this listener once game started (RankedQuiz will handle it)
    rankedSignalrService.off(RankedEvent.Countdown, onCountdown as any)
  }
}

function onError(message: string) {
  toast.error(message)
  if (step.value === 'search') {
    step.value = 'idle'
  }
}

// ─── Actions ──────────────────────────────────────────────────────────────────
async function startSearch() {
  connectionLoading.value = true
  try {
    if (!rankedSignalrService.isConnected()) {
      await rankedSignalrService.connect(userStore.token || '')
    }

    rankedStore.reset()
    step.value = 'search'
    firstCountdownReceived = false
    initialCountdown.value = null

    await rankedSignalrService.invoke(RankedEvent.JoinSearchOpponent)
  } catch (e) {
    toast.error(t('group.lobby.connectionError'))
    step.value = 'idle'
    await rankedSignalrService.disconnect()
  } finally {
    connectionLoading.value = false
  }
}

async function handleCancel() {
  try {
    if (rankedSignalrService.isConnected()) {
      await rankedSignalrService.invoke(RankedEvent.LeaveSearchOpponent)
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
  if (!skipDisconnect && rankedSignalrService.isConnected()) {
    await rankedSignalrService.disconnect()
  }
  rankedStore.reset()
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(async () => {
  // Fetch user info if not already loaded
  if (!userStore.userInfo) {
    try {
      await userStore.getUserInfo()
    } catch (_) {}
  }

  rankedSignalrService.on(RankedEvent.OpponentFound, onOpponentFound as any)
  rankedSignalrService.on(RankedEvent.Countdown, onCountdown as any)
  rankedSignalrService.on(RankedEvent.Error, onError as any)
})

onBeforeUnmount(async () => {
  rankedSignalrService.off(RankedEvent.OpponentFound, onOpponentFound as any)
  rankedSignalrService.off(RankedEvent.Countdown, onCountdown as any)
  rankedSignalrService.off(RankedEvent.Error, onError as any)

  if (step.value === 'search') {
    try {
      await rankedSignalrService.invoke(RankedEvent.LeaveSearchOpponent)
    } catch (_) {}
  }

  if (step.value !== 'game') {
    await cleanup()
  }
})
</script>
