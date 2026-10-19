<template>
  <section data-testid="group-lobby" class="flex flex-col gap-6">
    <header class="flex flex-wrap items-center gap-3">
      <h2 class="text-3xl font-bold">{{ $t('group.lobby.title') }}</h2>
      <span class="badge-green">
        {{ currentUserIsHost ? $t('group.lobby.hostBadge') : $t('group.lobby.waitingBadge') }}
      </span>
      <button class="btn btn-ghost ml-auto" @click="leaveGroupe">
        <font-awesome-icon icon="arrow-left" class="mr-2" /> {{ $t('group.lobby.leave') }}
      </button>
    </header>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start">
      <!-- Invitation : le code doit être visible tout de suite -->
      <section
        class="surface-card flex min-w-0 flex-col items-center gap-4 text-center"
        aria-labelledby="lobby-invite-title"
      >
        <h3 id="lobby-invite-title" class="text-xl font-bold">
          {{ $t('group.lobby.inviteTitle') }}
        </h3>
        <p class="text-sm text-brand-gray">{{ $t('group.lobby.inviteText') }}</p>
        <button
          type="button"
          class="group flex items-center gap-3 rounded-2xl px-4 py-2 transition-colors hover:bg-brand-surface2"
          :aria-label="$t('group.lobby.copyCode')"
          :title="$t('group.lobby.copyCode')"
          @click="copyCode"
        >
          <span
            class="font-display text-4xl font-extrabold tracking-[0.15em] tabular-nums sm:text-5xl"
          >
            {{ groupeStore.groupePartyInfo?.code }}
          </span>
          <font-awesome-icon icon="copy" class="text-brand-gray group-hover:text-brand-purple" />
        </button>
        <QRPreview :code="groupeStore.groupePartyInfo?.code || ''" />
        <button type="button" class="btn btn-ghost w-full" @click="copyLink">
          <font-awesome-icon icon="copy" class="mr-2" /> {{ $t('group.lobby.copyLink') }}
        </button>
      </section>

      <!-- Joueurs et lancement -->
      <section
        class="surface-card flex min-w-0 flex-col gap-5"
        aria-labelledby="lobby-players-title"
      >
        <div class="flex items-center justify-between gap-3">
          <h3 id="lobby-players-title" class="text-xl font-bold">
            {{ $t('group.lobby.players') }}
          </h3>
          <span class="pill text-sm font-semibold">
            {{ $t('group.lobby.playersConnected', { count: players.length }, players.length) }}
          </span>
        </div>

        <ul class="grid gap-3 sm:grid-cols-2">
          <li
            v-for="p in players"
            :key="String(p.id)"
            class="flex items-center gap-3 rounded-2xl border-2 border-brand-line px-3 py-2"
          >
            <player-avatar :name="p.user?.nickName" :avatar="p.user?.avatar" />
            <span class="flex min-w-0 flex-1 flex-col">
              <span class="truncate font-semibold">
                {{ p.user?.nickName }}
                <span v-if="isMe(p)" class="text-sm font-normal text-brand-gray">
                  {{ $t('game.status.you') }}
                </span>
              </span>
              <span v-if="isHost(p)" class="text-sm font-semibold text-brand-yellow">
                <font-awesome-icon icon="crown" class="mr-1" /> {{ $t('group.lobby.host') }}
              </span>
            </span>
            <button
              v-if="currentUserIsHost && !isMe(p)"
              type="button"
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-brand-gray transition-colors hover:bg-brand-orange/10 hover:text-brand-orange"
              :aria-label="$t('group.lobby.expelNamed', { name: p.user?.nickName })"
              :title="$t('group.lobby.expelPlayer')"
              @click="handleExpelPlayer(p)"
            >
              <font-awesome-icon icon="xmark" />
            </button>
          </li>
        </ul>

        <div class="flex flex-col gap-3 border-t border-brand-line pt-5">
          <template v-if="currentUserIsHost">
            <p class="text-sm text-brand-gray">{{ startHint }}</p>
            <button
              data-testid="lobby-start"
              class="btn btn-primary w-full py-4 text-lg sm:w-auto sm:self-start sm:px-10"
              :disabled="canCreateGame"
              @click="confirmStartGame"
            >
              <font-awesome-icon icon="play" class="mr-2" /> {{ $t('group.lobby.start') }}
            </button>
          </template>
          <p v-else class="flex items-center gap-2 font-semibold text-brand-gray">
            <font-awesome-icon icon="hourglass-half" /> {{ $t('group.lobby.waitingHost') }}
          </p>
        </div>
      </section>
    </div>

    <!-- Réglages (hôte) ou récapitulatif (invités) -->
    <slot />
  </section>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave } from 'vue-router'
import QRPreview from './QRPreview.vue'
import PlayerAvatar from '@/components/game/PlayerAvatar.vue'
import useGroupeStore from '@/stores/groupe'
import signalrService, { GroupEvent } from '@/services/signalrService'
import useUserStore from '@/stores/user'
import { useGroupLifecycle } from '@/composables/useGroupLifecycle'

const { t } = useI18n()
const emit = defineEmits<{
  (e: 'goTo', newStep: 'mode' | 'join' | 'lobby' | 'game'): void
}>()

const groupeStore = useGroupeStore()
const userStore = useUserStore()
const { connectSignalR, cleanupGroup } = useGroupLifecycle()

const instance = getCurrentInstance()
const proxy = instance?.proxy

const gameStarted = ref(false)

const currentUserIsHost = computed(
  () => groupeStore.groupePartyInfo?.idUserHost === userStore.userId,
)

const copyCode = async () => {
  navigator.clipboard.writeText(groupeStore?.groupePartyInfo?.code || '').then(() => {
    proxy?.$toast.success(t('group.lobby.copySuccess'))
  })
}

const copyLink = async () => {
  const link = `${globalThis.location.origin}${globalThis.location.pathname}?code=${groupeStore.groupePartyInfo?.code ?? ''}`
  navigator.clipboard.writeText(link).then(() => {
    proxy?.$toast.success(t('group.lobby.copySuccess'))
  })
}

const players = computed(() => groupeStore.groupePartyInfo?.partyUsers ?? [])

const playerId = (p: any) => p?.user?.idUser ?? p?.user?.id

const isMe = (p: any) => {
  const id = playerId(p)
  return (
    (userStore.isLogged && id === userStore.userId) ||
    (userStore.isLoggedAsInvited && id === userStore.userIdInvited)
  )
}

const isHost = (p: any) => playerId(p) === groupeStore.groupePartyInfo?.idUserHost

const startHint = computed(() => {
  if ((groupeStore.groupePartyInfo?.partyTheme.length ?? 0) < 1) return t('game.setup.pickTheme')
  if ((groupeStore.groupePartyInfo?.partyDifficulty.length ?? 0) < 1)
    return t('game.setup.pickDifficulty')
  return t('group.lobby.readyHint')
})

const leaveGroupe = async () => {
  // Nettoyage complet de groupe
  await cleanupGroup()
  emit('goTo', 'mode')
}

// Start game when :
// The current user is the host
// There is at least one more player in the lobby
// There is at least one theme selected
// There is at least one difficulty selected
const canCreateGame = computed(() => {
  return (
    !currentUserIsHost.value ||
    (groupeStore?.groupePartyInfo?.partyUsers.length ?? 0) < 1 ||
    (groupeStore?.groupePartyInfo?.partyTheme.length ?? 0) < 1 ||
    (groupeStore?.groupePartyInfo?.partyDifficulty.length ?? 0) < 1
  )
})

// SignalR event handlers
const handleJoinEvent = (data: any) => {
  // Refresh group info when someone joins
  if (groupeStore.groupeId) {
    groupeStore?.groupePartyInfo?.partyUsers.push({
      id: data.id,
      user: { ...data, idUser: data.id },
    } as any)
    proxy?.$toast.info(t('group.lobby.userJoined', { name: data.nickName }))
  }
}

const handleLeaveEvent = (data: any) => {
  // Refresh group info when someone leaves
  if (groupeStore.groupeId) {
    groupeStore.groupePartyInfo!.partyUsers = groupeStore.groupePartyInfo!.partyUsers.filter(
      (u: any) => (u.user.idUser ?? u.user.id) !== data.id,
    )
    proxy?.$toast.info(t('group.lobby.userLeft', { name: data.nickName }))
  }
}

const handleStartEvent = (data: any) => {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.log('Game started:', data)
  gameStarted.value = true
  groupeStore.groupePartyInfo = data
  emit('goTo', 'game')
}

const handleDeleteEvent = async () => {
  // Only handle this event if the game hasn't started yet (we're still in lobby)
  if (gameStarted.value) return

  proxy?.$toast.warning(t('group.lobby.lobbyDeleted'))
  // Clear store and navigate away using the composable
  await cleanupGroup(true) // Skip API call since party is already deleted
  emit('goTo', 'mode')
}

const handlePartyUpdateEvent = (data: any) => {
  // Update party info
  if (groupeStore.groupePartyInfo !== null) {
    groupeStore.groupePartyInfo.partyDifficulty = data.partyDifficulty
    groupeStore.groupePartyInfo.nbQuestions = data.nbQuestions
    groupeStore.groupePartyInfo.partyTheme = data.partyTheme
    groupeStore.groupePartyInfo.scoreEachRound = data.scoreEachRound
  }
}

const handleExpelPlayer = async (player: any) => {
  try {
    const playerId = player.user.idUser ?? player.user.id
    await groupeStore.expelledPlayer(playerId)
  } catch (error) {
    console.error('Failed to expel player:', error)
    proxy?.$toast.error(t('group.lobby.expelError'))
  }
}

const confirmStartGame = async () => {
  if (signalrService.isConnected()) {
    await signalrService.send(GroupEvent.StartGroupParty)
  } else {
    proxy?.$toast.error(t('group.lobby.connectionError'))
  }
}

const handleOnError = (error: any) => {
  console.error('SignalR error:', error)
  proxy?.$toast.error(error)
}

const handlePlayerExpelledEvent = async (data: any) => {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.log('Player expelled:', data)
  // Si c'est le joueur actuel qui a été expulsé, nettoyer et retourner au mode sélection
  if (
    (data.id === userStore.userId && userStore.isLogged) ||
    (data.id === userStore.userIdInvited && userStore.isLoggedAsInvited)
  ) {
    proxy?.$toast.warning(t('group.lobby.youWereExpelled'))
    await cleanupGroup()
    emit('goTo', 'mode')
  } else if (groupeStore.groupePartyInfo) {
    // Retirer le joueur expulsé de la liste
    groupeStore.groupePartyInfo.partyUsers = groupeStore.groupePartyInfo.partyUsers.filter(
      (u: any) => {
        const userId = u.user.idUser ?? u.user.id
        return userId !== data.id
      },
    )
    proxy?.$toast.info(t('group.lobby.playerExpelled', { name: data.nickName }))
  }
}

const allEvents = [
  { name: GroupEvent.PlayerJoined, handler: handleJoinEvent },
  { name: GroupEvent.PlayerLeft, handler: handleLeaveEvent },
  { name: GroupEvent.PartyStarted, handler: handleStartEvent },
  { name: GroupEvent.PartyDeleted, handler: handleDeleteEvent },
  { name: GroupEvent.PartyUpdated, handler: handlePartyUpdateEvent },
  { name: GroupEvent.PlayerExepelled, handler: handlePlayerExpelledEvent },
  { name: GroupEvent.Error, handler: handleOnError },
]

// Gestionnaire de fermeture de page
const handleBeforeUnload = () => {
  if (groupeStore.groupeId) {
    // Utiliser la méthode synchrone du store qui utilise fetch + keepalive
    groupeStore.leaveGroupeSync()
  }
}

// Setup SignalR connection
onMounted(async () => {
  try {
    await connectSignalR()

    // Nettoyer les anciens listeners avant d'en ajouter de nouveaux
    allEvents.forEach((event) => {
      signalrService.off(event.name) // Retire TOUS les handlers pour cet event
    })

    // Maintenant, ajouter nos nouveaux listeners
    allEvents.forEach((event) => {
      signalrService.on(event.name, (data: unknown) => {
        event.handler(data)
      })
    })

    globalThis.addEventListener('beforeunload', handleBeforeUnload)
  } catch (error) {
    console.error('Failed to connect to SignalR:', error)
    proxy?.$toast.error(t('group.lobby.connectionError'))
  }
})

// Gérer la navigation (bouton retour du navigateur, changement de route)
onBeforeRouteLeave(async (to, from, next) => {
  // Si l'utilisateur appuie sur retour, nettoyer le groupe et revenir au mode de sélection
  if (groupeStore.groupeId) {
    await cleanupGroup()
  }
  emit('goTo', 'mode')

  next(false) // Bloquer la navigation pour rester dans le composant parent
})

// Cleanup SignalR listeners only (keep connection alive for the game)
onBeforeUnmount(() => {
  // Retirer le gestionnaire de fermeture de page
  globalThis.removeEventListener('beforeunload', handleBeforeUnload)

  // Nettoyer uniquement les écouteurs SignalR du lobby
  // La connexion reste active pour GroupQuiz
  allEvents.forEach((event) => {
    signalrService.off(event.name, event.handler)
  })

  // NE PAS appeler cleanupGroup() ici car on peut passer au jeu
  // Le cleanup sera fait par GroupQuiz ou par le bouton "Leave"
})
</script>

<style scoped>
@keyframes aura {
  0% {
    transform: scale(0.9);
    opacity: 0.45;
  }
  70% {
    transform: scale(1.4);
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
}
.player-aura {
  background: radial-gradient(closest-side, rgb(var(--c-primary) / 0.25), transparent 70%);
  animation: aura 1.6s ease-out infinite;
}
</style>
