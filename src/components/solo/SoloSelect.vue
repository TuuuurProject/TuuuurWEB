<template>
  <section class="space-y-6">
    <header class="flex items-center justify-between">
      <h2 class="font-branding text-3xl text-brand-lightGray glow-text">
        <font-awesome-icon icon="bullseye" class="mr-2" /> Mode Solo
      </h2>
      <div v-if="userStore.isLogged" class="badge-success animate-pulse-slow">
        Sélectionnez au moins une catégorie
      </div>
    </header>

    <template v-if="userStore.isLogged">
      <div class="grid gap-6 md:grid-cols-3">
        <!-- Cartes gaming avec backdrop blur -->
        <div class="md:col-span-2 gaming-card">
          <h3 class="font-branding text-xl mb-2 text-brand-lightGray">
            <font-awesome-icon icon="gamepad" class="mr-2" /> Catégories
          </h3>
          <p class="text-brand-gray mb-4">
            Choisissez une ou plusieurs catégories pour votre aventure.
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
          <div class="mt-6">
            <label class="block font-semibold mb-2 text-brand-lightGray"
              >⚡ Catégories spécifiques (champ libre)</label
            >
            <input
              type="text"
              v-model="specifics"
              class="w-full rounded-2xl border border-brand-purple/30 bg-brand-darkGray/50 backdrop-blur px-4 py-3 shadow-card focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple text-brand-lightGray placeholder-brand-gray"
              placeholder="Ex: Capitales d'Afrique, Histoire de l'art moderne…"
            />
            <p class="text-xs text-brand-gray mt-1">
              Facultatif — ajoutez du contexte précis pour des questions personnalisées.
            </p>
          </div>
        </div>

        <!-- Sidebar des paramètres -->
        <div class="gaming-card">
          <h3 class="font-display text-xl mb-2 text-brand-lightGray">⚙️ Paramètres</h3>
          <div class="space-y-5">
            <div>
              <div class="flex items-center justify-between">
                <label class="font-semibold text-brand-lightGray">Nombre de questions</label>
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
            <label class="font-semibold mb-3 block text-brand-lightGray mt-6">
              <font-awesome-icon icon="fire" class="mr-2 text-brand-orange" />
              Difficulté
            </label>
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

      <footer class="flex flex-wrap items-center justify-end gap-3">
        <button class="btn btn-ghost" @click="emit('back')">← Retour</button>
        <button class="btn btn-primary" :disabled="canStartGame" @click="open = true">
          <font-awesome-icon icon="rocket" class="mr-2" /> Commencer l'aventure
        </button>
      </footer>
    </template>

    <div v-else class="gaming-card justify-self-center w-full">
      <logged-in-block message="Connectez ou créez vous un compte pour jouer en solo !" />
    </div>

    <ModalDialog
      :open="open"
      title="Démarrer le quiz"
      @close="open = false"
      @confirm="confirm"
      :loading="soloStore.isLoading"
    >
      <div class="space-y-3">
        <p class="flex items-center gap-2">
          <font-awesome-icon icon="bullseye" class="text-brand-purple" />
          <strong class="text-brand-lightGray">Catégories:</strong>
          <span class="text-brand-gray">{{
            Array.from(selected)
              .map((id) => themesMap.get(id)?.label)
              .join(', ')
          }}</span>
        </p>
        <p class="flex items-center gap-2">
          <font-awesome-icon icon="chart-bar" class="text-brand-orange" />
          <strong class="text-brand-lightGray">Questions:</strong>
          <span class="text-brand-gray">{{ questions }}</span>
        </p>
        <p v-if="specifics" class="flex items-start gap-2">
          <span class="text-brand-cyan">✨</span>
          <strong class="text-brand-lightGray">Spécifiques:</strong>
          <span class="text-brand-gray">{{ specifics }}</span>
        </p>
      </div>
    </ModalDialog>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import ModalDialog from '@/components/ModalDialog.vue'
import useUserStore from '@/stores/user.js'
import LoggedInBlock from '@/components/LoggedInBlock.vue'
import useThemeStore from '@/stores/theme.js'
import useSoloStore from '@/stores/solo.js'
import { useRouter } from 'vue-router'

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

const difficulties = [
  {
    id: 1,
    label: 'Facile',
    icon: 'seedling',
    colorClass: 'diff-easy',
    glowClass: 'glow-green',
  },
  {
    id: 2,
    label: 'Moyen',
    icon: 'bolt',
    colorClass: 'diff-medium',
    glowClass: 'glow-yellow',
  },
  {
    id: 3,
    label: 'Difficile',
    icon: 'fire',
    colorClass: 'diff-hard',
    glowClass: 'glow-orange',
  },
  {
    id: 4,
    label: 'Hardcore',
    icon: 'skull',
    colorClass: 'diff-hardcore',
    glowClass: 'glow-red',
  },
]

// Récupération des stores
onMounted(async () => {
  if (userStore.isLogged) await themeStore.loadThemes()
})

const themesList = computed<Array<Theme>>(() => {
  if (themeStore.isLoading || !themeStore.list) return []
  return themeStore.list
})

const themesMap = computed(() => new Map(themesList.value.map((c) => [c.id, c])))
const selected = reactive<Set<string>>(new Set())

const questions = ref(10)
const open = ref(false)
const specifics = ref('')

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
    selectedDifficulty.value = selectedDifficulty.value.filter((d) => d !== id)
  } else {
    selectedDifficulty.value.push(id)
  }
}

const canStartGame = computed(() => selected.size === 0 || selectedDifficulty.value.length === 0)

const emit = defineEmits<{
  (e: 'back'): void
}>()

const confirm = async () => {
  open.value = false

  await soloStore.createSoloParty({
    themes: Array.from(selected).map((id) => parseInt(id)),
    difficulties: Array.from(selectedDifficulty.value),
    nbQuestions: questions.value,
  })

  router.push({ name: 'SoloQuiz' })
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
.difficulty-button {
  position: relative;
  padding: 0.875rem 1rem;
  border-radius: 0.75rem;
  border: 2px solid rgba(255, 255, 255, 0.1);
  background: rgba(30, 30, 40, 0.5);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--brand-lightGray);
}

.difficulty-button:hover {
  transform: translateX(4px);
  border-color: rgba(255, 255, 255, 0.2);
}

.difficulty-button.selected {
  border-color: currentColor;
  background: rgba(30, 30, 40, 0.8);
  transform: translateX(4px);
}

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
  color: var(--diff-color);
}

.difficulty-button.selected {
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
