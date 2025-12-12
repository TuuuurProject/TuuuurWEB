<template>
  <section class="space-y-6">
    <!-- Top header with code emphasis -->
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <h2 class="font-branding text-3xl text-brand-lightGray">Lobby</h2>
        <span class="badge-green">En attente d'hôte</span>
      </div>
    </header>

    <!-- Readonly quiz parameters as quick chips -->
    <div class="flex flex-wrap gap-2">
      <span class="pill">
        Catégories: {{ groupeStore?.groupePartyInfo?.partyDifficulty.join(', ') }}
      </span>
      <span class="pill">
        Questions: {{ groupeStore?.groupePartyInfo?.partyQuestions.join(', ') }}
      </span>
    </div>

    <div class="grid gap-6 md:grid-cols-12">
      <!-- Players focus panel -->
      <div class="md:col-span-8 gaming-card">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="font-branding text-xl text-brand-lightGray">Joueurs</h3>
          <span class="pill"
            >{{ groupeStore.groupePartyInfo?.partyUsers.length }} connecté{{
              (groupeStore?.groupePartyInfo?.partyUsers?.length ?? 0) > 1 ? 's' : ''
            }}</span
          >
        </div>
        <ul class="grid gap-4 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
          <li
            v-for="p in groupeStore.groupePartyInfo?.partyUsers || []"
            :key="String(p.id)"
            class="rounded-2xl border border-brand-purple/20 bg-brand-darkGray/30 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 hover:shadow-neon transition duration-250 overflow-hidden"
          >
            <div class="relative shrink-0">
              <div
                class="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-brand-purple/10 flex items-center justify-center text-2xl text-brand-purple"
              >
                <img
                  v-if="p?.user?.avatar"
                  :src="p.user.avatar"
                  alt="avatar"
                  class="h-16 w-16 rounded-full border-2 border-brand-purple shadow-neon object-cover"
                />
                <div
                  v-else
                  class="h-16 w-16 rounded-full border-2 border-brand-purple flex items-center justify-center"
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
          <h3 class="font-branding text-xl mb-3 text-brand-lightGray">Pour rejoindre</h3>
          <div
            class="text-center font-branding text-2xl tracking-wider text-brand-lightGray hover:underline cursor-pointer mb-4"
            type="button"
            @click.prevent.stop="copyCode"
          >
            {{ groupeStore?.groupePartyInfo?.code }}
          </div>

          <div class="flex justify-center">
            <QRPreview :text="groupeStore?.groupePartyInfo?.code || ''" :size="180" />
          </div>
        </div>
      </aside>
    </div>

    <div class="flex flex-wrap items-center justify-end gap-3">
      <button class="btn btn-ghost" @click="leaveGroupe">← Quitter</button>
      <button class="btn btn-primary" :disabled="canCreateGame">
        <font-awesome-icon icon="rocket" class="mr-2" /> Lancer la partie
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import QRPreview from './QRPreview.vue'
import useGroupeStore from '@/stores/groupe'

const groupeStore = useGroupeStore()

const instance = getCurrentInstance()
const proxy = instance?.proxy

const copyCode = async () => {
  navigator.clipboard.writeText(groupeStore?.groupePartyInfo?.code || '').then(() => {
    proxy?.$toast.success('Copié dans le presse-papier')
  })
}

const canCreateGame = computed(() => {
  return (groupeStore?.groupePartyInfo?.partyUsers.length ?? 0) < 1
})

const leaveGroupe = async () => {
  await groupeStore.leaveGroupe()
}
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
