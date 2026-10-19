<template>
  <section>
    <div v-if="step === 'mode'" class="flex flex-col gap-6">
      <header class="flex flex-col gap-2">
        <h2 class="text-3xl font-bold">{{ $t('group.title') }}</h2>
        <p class="max-w-2xl text-brand-muted">{{ $t('group.mode.intro') }}</p>
      </header>

      <div class="grid gap-6 md:grid-cols-2">
        <!-- Créer -->
        <section class="surface-card flex flex-col gap-5" aria-labelledby="group-create-title">
          <span
            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-purple/15 text-xl text-brand-purple"
          >
            <font-awesome-icon icon="gamepad" />
          </span>
          <div class="flex flex-col gap-2">
            <h3 id="group-create-title" class="text-2xl font-bold">
              {{ $t('group.create.title') }}
            </h3>
            <p class="text-brand-muted">{{ $t('group.mode.createText') }}</p>
          </div>
          <div class="mt-auto flex flex-col gap-2">
            <button
              data-testid="group-create"
              class="btn btn-primary w-full py-4"
              @click="setupGame"
            >
              <font-awesome-icon icon="play" class="mr-2" /> {{ $t('group.create.title') }}
            </button>
            <p v-if="!userStore.isLogged" class="text-sm text-brand-muted">
              {{ $t('group.mode.accountNeeded') }}
            </p>
          </div>
        </section>

        <!-- Rejoindre -->
        <section class="surface-card flex flex-col gap-5" aria-labelledby="group-join-title">
          <span
            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange/15 text-xl text-brand-orange"
          >
            <font-awesome-icon icon="door-open" />
          </span>
          <div class="flex flex-col gap-2">
            <h3 id="group-join-title" class="text-2xl font-bold">{{ $t('group.join.title') }}</h3>
            <p class="text-brand-muted">{{ $t('group.mode.joinText') }}</p>
          </div>
          <GroupJoin class="mt-auto" @joined="goLobbyFromJoin" />
        </section>
      </div>
    </div>

    <template v-else-if="step === 'lobby'">
      <template v-if="userStore.isLogged || userStore.isLoggedAsInvited">
        <overlay-block :loading="groupeStore.isLoadingCreationGroupe">
          <GroupLobby @go-to="goTo">
            <GroupCreate />
          </GroupLobby>
        </overlay-block>
      </template>

      <div v-else class="surface-card w-full">
        <logged-in-block :message="$t('group.notLoggedIn')" />
      </div>
    </template>

    <GroupQuiz v-else-if="step === 'game'" @exit="step = 'mode'" @go-to-lobby="goTo('lobby')" />
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import GroupCreate from './GroupCreate.vue'
import GroupJoin from './GroupJoin.vue'
import GroupLobby from './GroupLobby.vue'
import LoggedInBlock from '@/components/LoggedInBlock.vue'
import OverlayBlock from '@/components/OverlayBlock.vue'
import useUserStore from '@/stores/user.js'
import useGroupeStore from '@/stores/groupe.js'
import GroupQuiz from '@/components/group/GroupQuiz.vue'

const userStore = useUserStore()
const groupeStore = useGroupeStore()

const route = useRoute()

type Step = 'mode' | 'join' | 'lobby' | 'game'
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

onMounted(async () => {
  // Si un ID est présent dans l'URL, l'assigner au store
  const groupeId = route.params.id as string
  if (groupeId && groupeStore.groupeId === null) {
    groupeStore.groupeId = groupeId

    step.value = 'game'
  }
})
</script>
