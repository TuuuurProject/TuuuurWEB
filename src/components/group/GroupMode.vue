<template>
  <section>
    <div v-if="step === 'mode'" class="space-y-8">
      <header class="flex items-center justify-between">
        <h2 class="font-branding text-3xl text-brand-lightGray glow-text">
          <font-awesome-icon icon="users" class="mr-2" /> Mode Groupe
        </h2>
      </header>

      <template v-if="userStore.isLogged">
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
      </template>

      <div v-else class="gaming-card justify-self-center w-full">
        <logged-in-block message="Connectez ou créez vous un compte pour accéder à votre profil" />
      </div>
    </div>

    <GroupCreate v-else-if="step === 'create'" @back="step = 'mode'" @created="goLobbyFromCreate" />
    <GroupJoin v-else-if="step === 'join'" @back="step = 'mode'" @joined="goLobbyFromJoin" />

    <GroupLobby v-else-if="step === 'lobby'" @back="step = 'mode'" />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GroupCreate from './GroupCreate.vue'
import GroupJoin from './GroupJoin.vue'
import GroupLobby from './GroupLobby.vue'
import LoggedInBlock from '@/components/LoggedInBlock.vue'
import useUserStore from '@/stores/user.js'
import useGroupeStore from '@/stores/groupe'

const userStore = useUserStore()
const groupeStore = useGroupeStore()

type Step = 'mode' | 'create' | 'join' | 'lobby'
const step = ref<Step>('mode')

function goLobbyFromCreate() {
  step.value = 'lobby'
}

function goLobbyFromJoin() {
  step.value = 'lobby'
}
</script>
