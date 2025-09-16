<template>
  <section>
    <div v-if="step === 'mode'" class="space-y-8">
      <header class="flex items-center justify-between">
        <h2 class="font-branding text-3xl text-brand-lightGray glow-text">
          <font-awesome-icon icon="users" class="mr-2" /> Mode Groupe
        </h2>
        <div class="pill bg-brand-darkGray/80 border-brand-orange/30 text-brand-orange">
          <font-awesome-icon icon="home" class="mr-1" /> Local / Affichage uniquement
        </div>
      </header>

      <!-- Cartes interactives avec icônes gaming -->
      <div class="grid gap-6 md:grid-cols-2">
        <button
          class="gaming-card group p-8 text-left hover:shadow-neon transition-all duration-300"
          @click="step = 'create'"
        >
          <div class="flex items-start gap-4">
            <div
              class="w-12 h-12 rounded-2xl bg-brand-purple/20 flex items-center justify-center text-brand-purple text-2xl group-hover:bg-brand-purple group-hover:text-white transition-all duration-300"
            >
              <font-awesome-icon icon="gamepad" />
            </div>
            <div>
              <h3
                class="font-branding text-2xl mb-2 text-brand-lightGray group-hover:text-white transition-colors"
              >
                Créer une partie
              </h3>
              <p class="text-brand-gray group-hover:text-brand-lightGray transition-colors">
                Définissez les paramètres et partagez le code/QR avec vos amis.
              </p>
              <!-- Ligne d'accent animée -->
              <div
                class="w-0 h-0.5 bg-brand-purple mt-3 group-hover:w-full transition-all duration-500"
              ></div>
            </div>
          </div>
        </button>

        <button
          class="gaming-card group p-8 text-left hover:shadow-neon-orange transition-all duration-300"
          @click="step = 'join'"
        >
          <div class="flex items-start gap-4">
            <div
              class="w-12 h-12 rounded-2xl bg-brand-orange/20 flex items-center justify-center text-brand-orange text-2xl group-hover:bg-brand-orange group-hover:text-white transition-all duration-300"
            >
              <font-awesome-icon icon="rocket" />
            </div>
            <div>
              <h3
                class="font-branding text-2xl mb-2 text-brand-lightGray group-hover:text-white transition-colors"
              >
                Rejoindre une partie
              </h3>
              <p class="text-brand-gray group-hover:text-brand-lightGray transition-colors">
                Entrez un code pour rejoindre le lobby et commencer l'aventure.
              </p>
              <!-- Ligne d'accent animée -->
              <div
                class="w-0 h-0.5 bg-brand-orange mt-3 group-hover:w-full transition-all duration-500"
              ></div>
            </div>
          </div>
        </button>
      </div>

      <!-- Section de conseils avec style gaming -->
      <div class="gaming-card">
        <div class="flex items-start gap-4">
          <div
            class="w-10 h-10 rounded-xl bg-brand-green/20 flex items-center justify-center text-brand-green animate-pulse-slow"
          >
            <font-awesome-icon icon="lightbulb" />
          </div>
          <div>
            <h4 class="font-semibold text-brand-lightGray mb-2">
              <font-awesome-icon icon="bullseye" class="mr-2 text-brand-purple" /> Conseils pour une
              partie réussie
            </h4>
            <ul class="space-y-1 text-brand-gray text-sm">
              <li>• Choisissez des catégories que tous les joueurs apprécient</li>
              <li>• Utilisez le mélange de questions pour plus de surprise</li>
              <li>• Partagez le QR code pour un accès rapide</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <GroupCreate v-else-if="step === 'create'" @back="step = 'mode'" @created="goLobbyFromCreate" />
    <GroupJoin v-else-if="step === 'join'" @back="step = 'mode'" @joined="goLobbyFromJoin" />

    <GroupLobby
      v-else-if="step === 'lobby'"
      :code="lobby.code"
      :categories="lobby.categories"
      :questions="lobby.questions"
      :shuffle="lobby.shuffle"
      :players="lobby.players"
      :specifics="lobby.specifics"
      @back="step = 'mode'"
    />
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import GroupCreate from './GroupCreate.vue'
import GroupJoin from './GroupJoin.vue'
import GroupLobby from './GroupLobby.vue'

type Step = 'mode' | 'create' | 'join' | 'lobby'
const step = ref<Step>('mode')

const lobby = reactive({
  code: 'TUR-0000',
  categories: ['Général'],
  questions: 10,
  shuffle: true,
  specifics: '',
  players: [
    { id: 1, name: 'Alice', emoji: '🦊', status: 'Prêt' },
    { id: 2, name: 'Ben', emoji: '🐼', status: 'Prêt' },
  ],
})

function goLobbyFromCreate(payload: {
  categories: string[]
  questions: number
  shuffle: boolean
  specifics?: string
}) {
  lobby.categories = payload.categories
  lobby.questions = payload.questions
  lobby.shuffle = payload.shuffle
  lobby.specifics = payload.specifics || ''
  lobby.code = 'TUR-' + Math.floor(1000 + Math.random() * 9000)
  step.value = 'lobby'
}
function goLobbyFromJoin(payload: { code: string }) {
  lobby.code = payload.code || 'TUR-0000'
  step.value = 'lobby'
}
</script>
