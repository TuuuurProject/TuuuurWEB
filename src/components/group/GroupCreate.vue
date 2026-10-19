<template>
  <section class="flex flex-col gap-6">
    <!-- Invité : récapitulatif des réglages choisis par l'hôte -->
    <div v-if="!currentUserIsHost" class="surface-card">
      <party-summary
        :themes="selectedThemes"
        :difficulties="selectedDifficultyList"
        :questions="questions"
      >
        <div class="flex flex-col gap-1">
          <dt class="text-sm font-semibold text-brand-gray">
            {{ $t('group.lobby.scoreEachRound') }}
          </dt>
          <dd class="font-bold">{{ scoreEachRound ? $t('common.yes') : $t('common.no') }}</dd>
        </div>
      </party-summary>
    </div>

    <!-- Hôte : réglages de la partie -->
    <game-setup
      v-else
      v-model:selected-themes="selected"
      v-model:difficulties="selectedDifficulty"
      v-model:questions="questions"
      :themes="themesList"
    >
      <template #options>
        <label
          class="flex cursor-pointer select-none items-start justify-between gap-4 rounded-2xl border border-brand-line p-4 transition-colors hover:border-brand-purple/50"
        >
          <span class="flex flex-col gap-1">
            <span class="font-bold">{{ $t('group.lobby.scoreEachRound') }}</span>
            <span class="text-sm text-brand-gray">
              {{ $t('group.lobby.scoreEachRoundDescription') }}
            </span>
          </span>
          <span class="relative mt-1 inline-flex shrink-0 items-center">
            <input v-model="scoreEachRound" type="checkbox" class="peer sr-only" />
            <span
              class="h-6 w-11 rounded-full bg-brand-surface2 transition-colors after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-soft after:transition-all after:content-[''] peer-checked:bg-brand-purple peer-checked:after:translate-x-full peer-focus-visible:ring-2 peer-focus-visible:ring-brand-purple/40"
            ></span>
          </span>
        </label>
      </template>
    </game-setup>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import useThemeStore from '@/stores/theme'
import useGroupeStore, { type PartyDifficulty, type PartyTheme } from '@/stores/groupe'
import useUserStore from '@/stores/user'
import GameSetup from '@/components/game/GameSetup.vue'
import PartySummary from '@/components/game/PartySummary.vue'
import { useDifficulties } from '@/composables/useDifficulties'

const themeStore = useThemeStore()
const groupeStore = useGroupeStore()
const userStore = useUserStore()

const selectedDifficulty = ref<number[]>([])

interface Theme {
  id: string
  label: string
  icon: string
}

const { difficulties } = useDifficulties()

const currentUserIsHost = computed(
  () => groupeStore.groupePartyInfo?.idUserHost === userStore.userId,
)

onMounted(async () => {
  // Récupération des thèmes
  await themeStore.loadThemes()
})

const themesList = computed<Array<Theme>>(() => {
  if (themeStore.isLoading || !themeStore.list) return []
  return themeStore.list
})

const themesMap = computed(() => new Map(themesList.value.map((c: Theme) => [c.id, c])))
const selected = ref<string[]>([])
const selectedThemes = computed(() => {
  return selected.value.map((id) => themesMap.value.get(id)).filter((t) => t !== undefined)
})

const selectedDifficultyList = computed(() => {
  return difficulties.value.filter((d) => selectedDifficulty.value.includes(d.id))
})

const questions = ref(10)

const scoreEachRound = ref(false)

function applyPartyInfo(newInfo: NonNullable<typeof groupeStore.groupePartyInfo>) {
  if (newInfo.partyTheme && Array.isArray(newInfo.partyTheme)) {
    selected.value = newInfo.partyTheme.map((theme: PartyTheme) => String(theme.idTheme))
  }
  if (newInfo.partyDifficulty && Array.isArray(newInfo.partyDifficulty)) {
    selectedDifficulty.value = newInfo.partyDifficulty.map(
      (d: PartyDifficulty) => d.idDifficulty as number,
    )
  }
  if (newInfo.scoreEachRound !== undefined) scoreEachRound.value = newInfo.scoreEachRound
  if (newInfo.nbQuestions) questions.value = newInfo.nbQuestions
}

watch(
  () => groupeStore.groupePartyInfo,
  (newInfo) => {
    if (!newInfo) return
    if (currentUserIsHost.value && !groupeStore.comeFromEndOfQuizGame) return

    const isReturningHost = currentUserIsHost.value && groupeStore.comeFromEndOfQuizGame

    applyPartyInfo(newInfo)

    if (isReturningHost) {
      groupeStore.comeFromEndOfQuizGame = false
    }
  },
  { deep: true, immediate: true },
)

const groupSettingsComputed = computed(() => {
  return {
    themes: [...selected.value],
    difficulties: selectedDifficulty.value,
    nbQuestions: questions.value,
    scoreEachRound: scoreEachRound.value,
  }
})

let updateTimerId = null as unknown as ReturnType<typeof setTimeout>

watch(
  groupSettingsComputed,
  () => {
    if (!currentUserIsHost.value) return
    clearTimeout(updateTimerId)
    updateTimerId = setTimeout(() => {
      updateSettingsGroupe()
    }, 300)
  },
  { deep: true },
)

const updateSettingsGroupe = async () => {
  await groupeStore.updateSettings(groupSettingsComputed.value)
}
</script>
