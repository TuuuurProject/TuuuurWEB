<template>
  <section>
    <div v-if="step === 'mode'" class="space-y-8">
      <header class="flex items-center justify-between">
        <h2 class="font-branding text-3xl text-brand-lightGray glow-text">
          <font-awesome-icon icon="users" class="mr-2" /> {{ $t('group.title') }}
        </h2>
      </header>

      <template v-if="userStore.isLogged">
        <!-- Cartes interactives avec icônes gaming -->
        <div class="grid gap-6 md:grid-cols-2">
          <button
            data-testid="group-create"
            class="gaming-card group p-8 text-left hover:shadow-neon transition-all duration-300"
            @click="setupGame"
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
                  {{ $t('group.create.title') }}
                </h3>
                <p class="text-brand-gray group-hover:text-brand-lightGray transition-colors">
                  {{ $t('group.create.subtitle') }}
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
                  {{ $t('group.join.title') }}
                </h3>
                <p class="text-brand-gray group-hover:text-brand-lightGray transition-colors">
                  {{ $t('group.join.subtitle') }}
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
        <logged-in-block :message="$t('group.notLoggedIn')" />
      </div>
    </div>

    <template v-else-if="step === 'lobby'">
      <overlay-block :loading="groupeStore.isLoadingCreationGroupe">
        <GroupCreate />
        <GroupLobby @back="step = 'mode'" @go-to="goTo" />
      </overlay-block>
    </template>

    <GroupJoin v-else-if="step === 'join'" @back="step = 'mode'" @joined="goLobbyFromJoin" />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GroupCreate from './GroupCreate.vue'
import GroupJoin from './GroupJoin.vue'
import GroupLobby from './GroupLobby.vue'
import LoggedInBlock from '@/components/LoggedInBlock.vue'
import OverlayBlock from '@/components/OverlayBlock.vue'
import useUserStore from '@/stores/user.js'
import useGroupeStore from '@/stores/groupe.js'

const userStore = useUserStore()
const groupeStore = useGroupeStore()

type Step = 'mode' | 'join' | 'lobby'
const step = ref<Step>('mode')

const setupGame = () => {
  step.value = 'lobby'
  groupeStore.createGroupe()
}

function goTo(newStep: Step) {
  step.value = newStep
}

function goLobbyFromJoin() {
  step.value = 'lobby'
}
</script>
