<template>
  <section class="space-y-6">
    <!-- Top header with code emphasis -->
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <font-awesome-icon icon="users" class="text-2xl text-brand-purple" />
        <h2 class="font-branding text-3xl text-brand-lightGray">{{ $t('group.lobby.title') }}</h2>
        <span class="badge-green">
          <template v-if="currentUserIsHost">
            {{ $t('group.lobby.hostBadge') }}
          </template>
          <template v-else>
            {{ $t('group.lobby.waitingBadge') }}
          </template>
        </span>
      </div>
    </header>

    <template v-if="!currentUserIsHost">
      <div class="flex flex-wrap gap-2 items-center">
        <h3 class="font-branding text-xl text-brand-lightGray">
          <font-awesome-icon icon="gamepad" class="mr-2" /> {{ $t('solo.categories.title') }} :
        </h3>

        <template v-if="selectedThemes.length === 0">
          <div class="text-brand-gray">{{ $t('group.lobby.noThemeSelected') }}</div>
        </template>
        <div v-else class="flex flex-wrap gap-3">
          <div
            v-for="cat in selectedThemes"
            :key="cat.id"
            class="category-button group inline-flex items-center gap-2 px-4 py-3 font-semibold"
          >
            <font-awesome-icon :icon="cat.icon" class="text-lg" />
            <span>{{ cat.label }}</span>
          </div>
        </div>
      </div>
      <div class="flex flex-wrap gap-2 items-center mb-4 mt-4">
        <h3 class="font-branding text-xl text-brand-lightGray">
          <font-awesome-icon icon="fire" class="mr-2 text-brand-orange" />
          {{ $t('solo.settings.difficulty') }} :
        </h3>
        <template v-if="selectedDifficultyList.length === 0">
          <div class="text-brand-gray">{{ $t('group.lobby.noDifficultySelected') }}</div>
        </template>
        <div v-else class="flex flex-wrap gap-3">
          <div
            v-for="diff in selectedDifficultyList"
            :key="diff.id"
            class="difficulty-button group inline-flex items-center gap-2 px-4 py-3 font-semibold"
            :class="[diff.colorClass]"
          >
            <font-awesome-icon :icon="diff.icon" class="text-lg" />
            <span>{{ diff.label }}</span>
          </div>
        </div>
      </div>
      <div>
        <h3 class="font-branding text-xl text-brand-lightGray">
          <font-awesome-icon icon="gear" class="mr-2" /> {{ $t('solo.settings.questionsCount') }} :
          {{ questions }}
        </h3>
      </div>
      <div>
        <h3 class="font-branding text-xl text-brand-lightGray">
          <font-awesome-icon icon="trophy" class="mr-2" /> {{ $t('group.lobby.scoreEachRound') }} :
          {{ scoreEachRound ? $t('common.yes') : $t('common.no') }}
        </h3>
      </div>
    </template>

    <div v-if="currentUserIsHost" class="grid gap-6 md:grid-cols-3">
      <!-- Cartes gaming avec backdrop blur -->
      <div class="md:col-span-2 gaming-card">
        <h3 class="font-branding text-xl mb-2 text-brand-lightGray">
          <font-awesome-icon icon="gamepad" class="mr-2" /> {{ $t('solo.categories.title') }}
        </h3>
        <p class="text-brand-gray mb-4">
          {{ $t('solo.categories.subtitle') }}
        </p>
        <div class="flex flex-wrap gap-3">
          <button
            v-for="cat in themesList"
            :key="cat.id"
            @click="toggle(cat.id)"
            class="category-button group inline-flex items-center gap-2 px-4 py-3 font-semibold"
            :class="selected.has(cat.id) ? 'selected' : ''"
          >
            <font-awesome-icon :icon="cat.icon" class="text-lg" />
            <span>{{ cat.label }}</span>
          </button>
        </div>

        <div>
          <div class="font-semibold mb-3 block text-brand-lightGray mt-6">
            <font-awesome-icon icon="trophy" class="mr-2 text-brand-purple" />
            {{ $t('group.lobby.scoreEachRound') }}
          </div>
          <div
            class="select-none flex items-center justify-between p-4 rounded-lg bg-brand-darkGray/50 border border-brand-lightGray/10 cursor-pointer hover:border-brand-purple/30 transition-all"
            @click="scoreEachRound = !scoreEachRound"
          >
            <div class="flex-1">
              <p class="text-brand-lightGray text-sm">
                {{ $t('group.lobby.scoreEachRoundDescription') }}
              </p>
            </div>
            <div class="relative inline-flex items-center ml-4">
              <input type="checkbox" v-model="scoreEachRound" class="sr-only peer" />
              <div
                class="w-11 h-6 bg-brand-darkGray rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-purple peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-purple pointer-events-none"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar des paramètres -->
      <div class="gaming-card">
        <h3 class="font-display text-xl mb-2 text-brand-lightGray">
          <font-awesome-icon icon="gear" /> {{ $t('solo.settings.title') }}
        </h3>
        <div class="space-y-5">
          <div>
            <div class="flex items-center justify-between">
              <div class="font-semibold text-brand-lightGray">{{
                $t('solo.settings.questionsCount')
              }}</div>
              <span class="pill font-bold text-brand-purple">{{ questions }}</span>
            </div>
            <div class="mt-3 flex items-center gap-3">
              <button
                class="pill hover:bg-brand-purple/20 hover:border-brand-purple/40 transition-all"
                @click="dec()"
              >
                −
              </button>
              <!-- Slider personnalisé avec accents colorés -->
              <input
                type="range"
                class="w-full h-2 bg-brand-darkGray rounded-lg appearance-none cursor-pointer slider-purple"
                min="5"
                max="20"
                step="5"
                v-model.number="questions"
              />
              <button
                class="pill hover:bg-brand-purple/20 hover:border-brand-purple/40 transition-all"
                @click="inc()"
              >
                ＋
              </button>
            </div>
          </div>
        </div>

        <div>
          <div class="font-semibold mb-3 block text-brand-lightGray mt-6">
            <font-awesome-icon icon="fire" class="mr-2 text-brand-orange" />
            {{ $t('solo.settings.difficulty') }}
          </div>
          <div class="space-y-2">
            <button
              v-for="diff in difficulties"
              :key="diff.id"
              @click="toggleDifficulty(diff.id)"
              class="difficulty-button w-full group relative overflow-hidden"
              :class="[selectedDifficulty.includes(diff.id) ? 'selected' : '', diff.colorClass]"
            >
              <div class="flex items-center justify-between relative z-10">
                <div class="flex items-center gap-2">
                  <font-awesome-icon :icon="diff.icon" class="text-base" />
                  <span class="font-semibold">{{ diff.label }}</span>
                </div>
                <div v-if="selectedDifficulty.includes(diff.id)" class="check-icon">
                  <font-awesome-icon icon="check-circle" />
                </div>
              </div>
              <!-- Effet de glow au survol -->
              <div class="difficulty-glow" :class="diff.glowClass"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import useThemeStore from '@/stores/theme'
import useGroupeStore, { type PartyDifficulty, type PartyTheme } from '@/stores/groupe'
import useUserStore from '@/stores/user'

const { t } = useI18n()
const themeStore = useThemeStore()
const groupeStore = useGroupeStore()
const userStore = useUserStore()

const selectedDifficulty = ref<number[]>([]) // Moyen par défaut

interface Theme {
  id: string
  label: string
  icon: string
}

const difficulties = computed(() => [
  {
    id: 1,
    label: t('solo.difficulties.easy'),
    icon: 'seedling',
    colorClass: 'diff-easy',
    glowClass: 'glow-green',
  },
  {
    id: 2,
    label: t('solo.difficulties.medium'),
    icon: 'bolt',
    colorClass: 'diff-medium',
    glowClass: 'glow-yellow',
  },
  {
    id: 3,
    label: t('solo.difficulties.hard'),
    icon: 'fire',
    colorClass: 'diff-hard',
    glowClass: 'glow-orange',
  },
  {
    id: 4,
    label: t('solo.difficulties.hardcore'),
    icon: 'skull',
    colorClass: 'diff-hardcore',
    glowClass: 'glow-red',
  },
])

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
const selected = reactive<Set<string>>(new Set())
const selectedThemes = computed(() => {
  return Array.from(selected)
    .map((id) => themesMap.value.get(id))
    .filter((t) => t !== undefined)
})

const selectedDifficultyList = computed(() => {
  return difficulties.value.filter((d) => selectedDifficulty.value.includes(d.id))
})

const questions = ref(10)

const scoreEachRound = ref(false)

function applyPartyInfo(newInfo: NonNullable<typeof groupeStore.groupePartyInfo>) {
  if (newInfo.partyTheme && Array.isArray(newInfo.partyTheme)) {
    selected.clear()
    newInfo.partyTheme.forEach((theme: PartyTheme) => selected.add(theme.idTheme as string))
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

const toggle = (id: string) => {
  if (selected.has(id)) {
    selected.delete(id)
  } else {
    selected.add(id)
  }
}

const groupSettingsComputed = computed(() => {
  return {
    themes: Array.from(selected),
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

const inc = () => {
  questions.value = Math.min(20, questions.value + 5)
}

const dec = () => {
  questions.value = Math.max(5, questions.value - 5)
}

const toggleDifficulty = (id: number) => {
  if (selectedDifficulty.value.includes(id)) {
    selectedDifficulty.value = selectedDifficulty.value.filter((d: number) => d !== id)
  } else {
    selectedDifficulty.value.push(id)
  }
}
</script>

<style scoped>
/* Slider personnalisé */
.slider-purple::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6c5ce7 0%, #5a4fcf 100%);
  cursor: pointer;
  box-shadow: 0 0 10px rgba(108, 92, 231, 0.5);
}

.slider-purple::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6c5ce7 0%, #5a4fcf 100%);
  cursor: pointer;
  border: none;
  box-shadow: 0 0 10px rgba(108, 92, 231, 0.5);
}

/* Boutons de difficulté */
/* Couleurs par difficulté */
.diff-easy {
  --diff-color: #10b981;
}
.diff-medium {
  --diff-color: #f59e0b;
}
.diff-hard {
  --diff-color: #f97316;
}
.diff-hardcore {
  --diff-color: #ef4444;
}

.difficulty-button {
  position: relative;
  padding: 0.875rem 1rem;
  border-radius: 0.75rem;
  border: 2px solid rgba(255, 255, 255, 0.1);
  background: rgba(30, 30, 40, 0.5);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--diff-color);
}

.difficulty-button:hover {
  transform: translateX(4px);
  border-color: rgba(255, 255, 255, 0.2);
}

.difficulty-button.selected {
  border-color: currentColor;
  background: rgba(30, 30, 40, 0.8);
  transform: translateX(4px);
  box-shadow: 0 0 20px rgba(var(--diff-color-rgb), 0.3);
}

/* Effet de glow animé */
.difficulty-glow {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 0.75rem;
}

.difficulty-button:hover .difficulty-glow {
  opacity: 0.1;
}

.difficulty-button.selected .difficulty-glow {
  opacity: 0.15;
  animation: pulse-glow 2s ease-in-out infinite;
}

.glow-green {
  background: radial-gradient(circle, #10b981 0%, transparent 70%);
}
.glow-yellow {
  background: radial-gradient(circle, #f59e0b 0%, transparent 70%);
}
.glow-orange {
  background: radial-gradient(circle, #f97316 0%, transparent 70%);
}
.glow-red {
  background: radial-gradient(circle, #ef4444 0%, transparent 70%);
}

@keyframes pulse-glow {
  0%,
  100% {
    opacity: 0.15;
  }
  50% {
    opacity: 0.25;
  }
}

.check-icon {
  font-size: 1.125rem;
  animation: check-pop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes check-pop {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}
</style>
