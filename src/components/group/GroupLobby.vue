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
      <span class="pill">Catégories: {{ categories.join(', ') }}</span>
      <span class="pill">Questions: {{ questions }}</span>
      <span class="pill">Mélanger: {{ shuffle ? 'Oui' : 'Non' }}</span>
      <span v-if="specifics" class="pill">Spécifiques: {{ specifics }}</span>
    </div>

    <div class="grid gap-6 md:grid-cols-12">
      <!-- Players focus panel -->
      <div class="md:col-span-8 gaming-card">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="font-branding text-xl text-brand-lightGray">Joueurs</h3>
          <span class="pill">{{ players.length }} connectés</span>
        </div>
        <ul class="grid gap-4 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
          <li
            v-for="p in players"
            :key="p.id"
            class="rounded-2xl border border-brand-purple/20 bg-brand-darkGray/30 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 hover:shadow-neon transition duration-250 overflow-hidden"
          >
            <div class="relative shrink-0">
              <div class="player-aura absolute inset-0 -z-10 rounded-full" aria-hidden="true"></div>
              <div
                class="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-brand-purple/20 flex items-center justify-center text-2xl shadow-neon text-brand-purple"
              >
                {{ p.emoji }}
              </div>
            </div>
            <div class="min-w-0">
              <div class="font-semibold leading-tight truncate text-brand-lightGray">
                {{ p.name }}
              </div>
              <div class="text-xs text-brand-gray truncate">ID #{{ p.id }}</div>
            </div>
            <span class="sm:ml-auto mt-2 sm:mt-0 pill">{{ p.status }}</span>
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
            {{ code }}
          </div>

          <div class="flex justify-center">
            <QRPreview :text="code" :size="180" />
          </div>
        </div>
      </aside>
    </div>

    <div class="flex flex-wrap items-center justify-end gap-3">
      <button class="btn btn-ghost" @click="$emit('back')">← Quitter</button>
      <button class="btn btn-primary" :disabled="canCreateGame" @click="open = true">
        <font-awesome-icon icon="rocket" class="mr-2" /> Lancer la partie
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import QRPreview from './QRPreview.vue'

const props = withDefaults(
  defineProps<{
    code: string
    categories: string[]
    questions: number
    shuffle: boolean
    players: { id: number; name: string; emoji: string; status: string }[]
    specifics?: string
  }>(),
  {
    code: 'TUR000',
    categories: () => ['Général'],
    questions: 10,
    shuffle: true,
    players: () => [
      { id: 1, name: 'Alice', emoji: '🦊', status: 'Prêt' },
      { id: 2, name: 'Ben', emoji: '🐼', status: 'Prêt' },
      { id: 3, name: 'Chloé', emoji: '🦁', status: 'Prêt' },
    ],
  },
)

const instance = getCurrentInstance()
const proxy = instance?.proxy

const copyCode = async () => {
  navigator.clipboard.writeText(props.code).then(() => {
    proxy?.$toast.success('Copié dans le presse-papier')
  })
}

const canCreateGame = computed(() => {
  return props.players.length < 1
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
