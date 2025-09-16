<template>
  <section class="space-y-6">
    <!-- Top header with code emphasis -->
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <h2 class="font-branding text-3xl text-brand-lightGray">Lobby</h2>
        <span class="badge-green">En attente d'hôte</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="pill">Code</span>
        <span
          class="font-branding text-2xl tracking-widest rounded-2xl bg-brand-darkGray/50 border border-brand-purple/30 px-3 py-1 shadow-neon text-brand-lightGray"
          >{{ code }}</span
        >
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
          <h3 class="font-branding text-xl mb-3 text-brand-lightGray">Rejoindre via code</h3>
          <div class="mb-4 flex items-center justify-between">
            <div>
              <div class="text-sm text-brand-gray">Code</div>
              <div class="font-branding text-3xl tracking-wider text-brand-lightGray">
                {{ code }}
              </div>
            </div>
            <button class="btn btn-secondary">Copier</button>
          </div>
          <QRPreview :text="code" :size="220" />
        </div>

        <div class="gaming-card">
          <h3 class="font-branding text-xl mb-3 text-brand-lightGray">Actions</h3>
          <div class="flex items-center justify-end gap-3">
            <button class="btn btn-secondary" @click="$emit('back')">Quitter</button>
            <button class="btn btn-primary" disabled>Lancer la partie</button>
          </div>
          <p class="text-xs text-brand-gray mt-2">
            Lecture seule (démo) — l'hôte peut lancer lorsqu'il sera prêt.
          </p>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import QRPreview from './QRPreview.vue'
withDefaults(
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
