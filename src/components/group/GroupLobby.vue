<template>
  <section data-testid="group-lobby" class="space-y-6 mt-6">
    <div class="grid gap-6 md:grid-cols-12">
      <!-- Players focus panel -->
      <div class="md:col-span-8 gaming-card">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="font-branding text-xl text-brand-lightGray">
            {{ $t('group.lobby.players') }}
          </h3>
          <span class="pill">{{
            $t('group.lobby.playersConnected', {
              count: groupeStore.groupePartyInfo?.partyUsers?.length || 0,
            })
          }}</span>
        </div>
        <ul
          class="grid gap-4 lg:grid-cols-[repeat(auto-fit,minmax(220px,0.5fr))] grid-cols-1 sm:grid-cols-2"
        >
          <li
            v-for="p in groupeStore.groupePartyInfo?.partyUsers || []"
            :key="String(p.id)"
            class="rounded-2xl border border-brand-purple/20 bg-brand-darkGray/30 p-4 items-start hover:shadow-neon transition duration-250 overflow-hidden grid grid-cols-[auto_1fr] gap-4 items-center"
          >
            <div class="relative shrink-0">
              <div
                class="rounded-full bg-brand-purple/20 flex items-center justify-center text-brand-purple"
              >
                <img
                  v-if="p?.user?.avatar"
                  :src="p.user.avatar"
                  alt="avatar"
                  class="h-12 w-12 rounded-full border-2 border-brand-purple shadow-neon object-cover"
                />
                <div
                  v-else
                  class="h-12 w-12 rounded-full border-2 border-brand-purple flex items-center justify-center"
                >
                  <span class="text-2xl font-bold text-brand-purple">
                    {{ p?.user?.nickName?.charAt(0).toUpperCase() || '?' }}
                  </span>
                </div>
              </div>
            </div>
            <div class="min-w-0">
              <div class="font-semibold leading-tight truncate text-brand-lightGray">
                {{ p.user?.nickName }}
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Right rail with QR and actions -->
      <aside class="md:col-span-4 space-y-4">
        <div class="gaming-card">
          <h3 class="font-branding text-xl mb-3 text-brand-lightGray">
            {{ $t('group.lobby.joinSection') }} !
          </h3>
          <div
            class="text-center font-branding text-2xl tracking-wider text-brand-lightGray hover:underline cursor-pointer mb-4"
            type="button"
            @click.prevent.stop="copyCode"
          >
            {{ groupeStore?.groupePartyInfo?.code }}
          </div>

          <div class="flex justify-center">
            <QRPreview :code="groupeStore?.groupePartyInfo?.code || ''" />
          </div>
        </div>
      </aside>
    </div>

    <div class="flex flex-wrap items-center justify-end gap-3">
      <button class="btn btn-ghost" @click="leaveGroupe">
        <font-awesome-icon icon="arrow-left" class="mr-2" /> {{ $t('group.lobby.leave') }}
      </button>

      <button
        v-if="currentUserIsHost"
        class="btn btn-primary"
        :disabled="canCreateGame"
        @click="openModalStartGame = true"
      >
        <font-awesome-icon icon="rocket" class="mr-2" /> {{ $t('group.lobby.start') }}
      </button>
    </div>

    <ModalDialog
      :open="openModalStartGame"
      :title="$t('group.create.modal.title')"
      :loading="groupeStore.isLoading"
      @confirm="confirmStartGame"
      @close="openModalStartGame = false"
    >
      <div class="space-y-3">
        <p class="flex items-center gap-2">
          <font-awesome-icon icon="bullseye" class="text-brand-purple" />
          <strong class="text-brand-lightGray">{{ $t('group.create.modal.categories') }}</strong>
          <span class="text-brand-gray">{{
            Array.from(groupeStore?.groupePartyInfo?.partyTheme || [])
              .map((theme: any) => theme?.theme?.label)
              .join(', ')
          }}</span>
        </p>
        <p class="flex items-center gap-2">
          <font-awesome-icon icon="chart-bar" class="text-brand-orange" />
          <strong class="text-brand-lightGray">{{ $t('group.create.modal.questions') }}</strong>
          <span class="text-brand-gray">{{ groupeStore?.groupePartyInfo?.nbQuestions }}</span>
        </p>

        <p class="flex items-center gap-2">
          <font-awesome-icon icon="fire" class="text-brand-orange" />
          <strong class="text-brand-lightGray">{{ $t('group.create.modal.difficulties') }} </strong>
          <span class="text-brand-gray">
            {{
              Array.from(groupeStore?.groupePartyInfo?.partyDifficulty || [])
                .map((difficulty: any) => difficulty?.difficulty?.label)
                .join(', ')
            }}</span
          >
        </p>
      </div>
    </ModalDialog>
  </section>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave } from 'vue-router'
import QRPreview from './QRPreview.vue'
import ModalDialog from '@/components/ModalDialog.vue'
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

const openModalStartGame = ref(false)
const gameStarted = ref(false)

const currentUserIsHost = computed(
  () => groupeStore.groupePartyInfo?.idUserHost === userStore.userId,
)

const copyCode = async () => {
  navigator.clipboard.writeText(groupeStore?.groupePartyInfo?.code || '').then(() => {
    proxy?.$toast.success(t('group.lobby.copySuccess'))
  })
}

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

const confirmStartGame = async () => {
  if (signalrService.isConnected()) {
    await signalrService.send(GroupEvent.StartGroupParty)
    openModalStartGame.value = false
  } else {
    proxy?.$toast.error(t('group.lobby.connectionError'))
  }
}

const handleOnError = (error: any) => {
  console.error('SignalR error:', error)
  proxy?.$toast.error(error)
}

const allEvents = [
  { name: GroupEvent.PlayerJoined, handler: handleJoinEvent },
  { name: GroupEvent.PlayerLeft, handler: handleLeaveEvent },
  { name: GroupEvent.PartyStarted, handler: handleStartEvent },
  { name: GroupEvent.PartyDeleted, handler: handleDeleteEvent },
  { name: GroupEvent.PartyUpdated, handler: handlePartyUpdateEvent },
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

    allEvents.forEach((event) => {
      signalrService.on(event.name, (data: unknown) => {
        event.handler(data)
      })
    })

    // Ajouter le gestionnaire de fermeture de page
    window.addEventListener('beforeunload', handleBeforeUnload)
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
  window.removeEventListener('beforeunload', handleBeforeUnload)

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
  background: radial-gradient(closest-side, rgba(195, 122, 62, 0.25), transparent 70%);
  animation: aura 1.6s ease-out infinite;
}
</style>
