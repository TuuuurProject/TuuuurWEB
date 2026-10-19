<template>
  <section class="space-y-6">
    <header class="flex items-center justify-between">
      <h2 class="font-branding text-3xl text-brand-lightGray">
        <font-awesome-icon icon="bullseye" class="mr-2" /> {{ $t('solo.title') }}
      </h2>
    </header>

    <template v-if="userStore.isLogged">
      <div class="grid gap-6 md:grid-cols-3">
        <!-- Cartes gaming avec backdrop blur -->
        <div class="md:col-span-2 surface-card">
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
        </div>

        <!-- Sidebar des paramètres -->
        <div class="surface-card">
          <h3 class="font-display text-xl mb-2 text-brand-lightGray">
            <font-awesome-icon icon="gear" /> {{ $t('solo.settings.title') }}
          </h3>
          <div class="space-y-5">
            <div>
              <div class="flex items-center justify-between">
                <div class="font-semibold text-brand-lightGray">
                  {{ $t('solo.settings.questionsCount') }}
                </div>
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
                  class="w-full h-2 bg-brand-surface2 rounded-lg appearance-none cursor-pointer slider-purple"
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
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer class="flex flex-wrap items-center justify-end gap-3">
        <button class="btn btn-ghost" @click="$router.go(-1)">
          <font-awesome-icon icon="arrow-left" class="mr-2" /> {{ $t('common.back') }}
        </button>
        <button
          data-testid="solo-start"
          class="btn btn-primary"
          :disabled="canStartGame"
          @click="open = true"
        >
          <font-awesome-icon icon="rocket" class="mr-2" /> {{ $t('solo.startAdventure') }}
        </button>
      </footer>
    </template>

    <div v-else class="surface-card justify-self-center w-full">
      <logged-in-block :message="$t('solo.notLoggedIn')" />
    </div>

    <ModalDialog
      :open="open"
      :title="$t('solo.startQuizModal.title')"
      @close="open = false"
      @confirm="confirm"
      :loading="soloStore.isLoading"
    >
      <div data-testid="solo-confirm-modal" class="space-y-3">
        <p class="flex items-center gap-2">
          <font-awesome-icon icon="bullseye" class="text-brand-purple" />
          <strong class="text-brand-lightGray">{{ $t('solo.startQuizModal.categories') }}</strong>
          <span class="text-brand-gray">{{
            Array.from(selected)
              .map((id) => themesMap.get(id)?.label)
              .join(', ')
          }}</span>
        </p>
        <p class="flex items-center gap-2">
          <font-awesome-icon icon="chart-bar" class="text-brand-orange" />
          <strong class="text-brand-lightGray">{{ $t('solo.startQuizModal.questions') }}</strong>
          <span class="text-brand-gray">{{ questions }}</span>
        </p>
      </div>
    </ModalDialog>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ModalDialog from '@/components/ModalDialog.vue'
import useUserStore from '@/stores/user.js'
import LoggedInBlock from '@/components/LoggedInBlock.vue'
import useThemeStore from '@/stores/theme.js'
import useSoloStore from '@/stores/solo.js'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()
const soloStore = useSoloStore()
const userStore = useUserStore()
const themeStore = useThemeStore()

const selectedDifficulty = ref([2]) // Moyen par défaut

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

// Récupération des stores
onMounted(async () => {
  if (userStore.isLogged) await themeStore.loadThemes()
})

const themesList = computed<Array<Theme>>(() => {
  if (themeStore.isLoading || !themeStore.list) return []
  return themeStore.list
})

const themesMap = computed(() => new Map(themesList.value.map((c: Theme) => [c.id, c])))
const selected = reactive<Set<string>>(new Set())

const questions = ref(10)
const open = ref(false)

const toggle = (id: string) => {
  if (selected.has(id)) selected.delete(id)
  else selected.add(id)
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

const canStartGame = computed(() => selected.size === 0 || selectedDifficulty.value.length === 0)

const confirm = async () => {
  open.value = false

  soloStore.setPartySetup({
    themes: Array.from(selected).map((id) => Number.parseInt(id as string)),
    difficulties: Array.from(selectedDifficulty.value),
    nbQuestions: questions.value,
  })

  await soloStore.createSoloParty()

  router.replace({ name: 'SoloQuiz', params: { id: soloStore.partyId } })
}
</script>
