<template>
  <section class="flex flex-col gap-6">
    <header class="flex flex-col gap-2">
      <h2 class="text-3xl font-bold">{{ $t('solo.title') }}</h2>
      <p class="max-w-2xl text-brand-gray">{{ $t('game.setup.soloIntro') }}</p>
    </header>

    <template v-if="userStore.isLogged">
      <game-setup
        v-model:selected-themes="selectedThemes"
        v-model:difficulties="selectedDifficulties"
        v-model:questions="questions"
        :themes="themesList"
      >
        <template #actions>
          <p class="text-sm text-brand-gray">
            {{ startHint }}
          </p>
          <button
            data-testid="solo-start"
            class="btn btn-primary w-full py-4 text-lg"
            :disabled="!canStartGame || soloStore.isLoading"
            @click="start"
          >
            <font-awesome-icon
              :icon="soloStore.isLoading ? 'circle-notch' : 'play'"
              :class="{ 'animate-spin': soloStore.isLoading }"
              class="mr-2"
            />
            {{ $t('game.setup.start') }}
          </button>
          <button class="btn btn-ghost w-full" @click="$router.go(-1)">
            <font-awesome-icon icon="arrow-left" class="mr-2" /> {{ $t('common.back') }}
          </button>
        </template>
      </game-setup>
    </template>

    <div v-else class="surface-card w-full">
      <logged-in-block :message="$t('solo.notLoggedIn')" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import GameSetup, { type SetupTheme } from '@/components/game/GameSetup.vue'
import LoggedInBlock from '@/components/LoggedInBlock.vue'
import useUserStore from '@/stores/user.js'
import useThemeStore from '@/stores/theme.js'
import useSoloStore from '@/stores/solo.js'

const { t } = useI18n()
const router = useRouter()
const soloStore = useSoloStore()
const userStore = useUserStore()
const themeStore = useThemeStore()

const selectedThemes = ref<string[]>([])
const selectedDifficulties = ref<number[]>([2]) // Moyen par défaut
const questions = ref(10)

onMounted(async () => {
  if (userStore.isLogged) await themeStore.loadThemes()
})

const themesList = computed<SetupTheme[]>(() => {
  if (themeStore.isLoading || !themeStore.list) return []
  return themeStore.list
})

const canStartGame = computed(
  () => selectedThemes.value.length > 0 && selectedDifficulties.value.length > 0,
)

const startHint = computed(() => {
  if (selectedThemes.value.length === 0) return t('game.setup.pickTheme')
  if (selectedDifficulties.value.length === 0) return t('game.setup.pickDifficulty')
  return t('game.setup.ready', { count: questions.value }, questions.value)
})

const start = async () => {
  if (!canStartGame.value) return

  soloStore.setPartySetup({
    themes: selectedThemes.value.map((id) => Number.parseInt(id)),
    difficulties: [...selectedDifficulties.value],
    nbQuestions: questions.value,
  })

  await soloStore.createSoloParty()

  router.replace({ name: 'SoloQuiz', params: { id: soloStore.partyId } })
}
</script>
