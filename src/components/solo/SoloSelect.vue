<template>
  <section class="space-y-6">
    <header class="flex items-center justify-between">
      <h2 class="font-branding text-3xl text-brand-lightGray glow-text">
        <font-awesome-icon icon="bullseye" class="mr-2" /> Mode Solo
      </h2>
      <div class="badge-success animate-pulse-slow">Sélectionnez au moins une catégorie</div>
    </header>

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
            v-for="cat in categories"
            :key="cat.id"
            @click="toggle(cat.id)"
            class="category-button group inline-flex items-center gap-2 px-4 py-3 font-semibold"
            :class="selected.has(cat.id) ? 'selected' : ''"
          >
            <font-awesome-icon :icon="cat.icon" class="text-lg" />
            <span>{{ cat.name }}</span>
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

          <!-- Checkbox custom avec effets néon -->
          <label class="flex items-center gap-3 cursor-pointer group">
            <div class="relative">
              <input type="checkbox" v-model="shuffle" class="sr-only" />
              <div
                class="w-5 h-5 rounded border-2 border-brand-purple/40 bg-brand-darkGray/50 transition-all duration-200"
                :class="
                  shuffle
                    ? 'bg-brand-purple border-brand-purple shadow-neon'
                    : 'group-hover:border-brand-purple/60'
                "
              >
                <svg
                  v-if="shuffle"
                  class="w-3 h-3 text-white absolute top-0.5 left-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </div>
            </div>
            <span class="text-brand-lightGray group-hover:text-brand-purple transition-colors">
              <font-awesome-icon icon="dice" class="mr-2" /> Mélanger les questions
            </span>
          </label>
        </div>
      </div>
    </div>

    <footer class="flex flex-wrap items-center justify-end gap-3">
      <button class="btn btn-ghost" @click="$emit('back')">← Retour</button>
      <button class="btn btn-primary" :disabled="selected.size === 0" @click="open = true">
        <font-awesome-icon icon="rocket" class="mr-2" /> Commencer l'aventure
      </button>
    </footer>

    <ModalDialog :open="open" title="Démarrer le quiz" @close="open = false" @confirm="confirm">
      <div class="space-y-3">
        <p class="flex items-center gap-2">
          <font-awesome-icon icon="bullseye" class="text-brand-purple" />
          <strong class="text-brand-lightGray">Catégories:</strong>
          <span class="text-brand-gray">{{
            Array.from(selected)
              .map((id) => categoriesMap.get(id)?.name)
              .join(', ')
          }}</span>
        </p>
        <p class="flex items-center gap-2">
          <font-awesome-icon icon="chart-bar" class="text-brand-orange" />
          <strong class="text-brand-lightGray">Questions:</strong>
          <span class="text-brand-gray">{{ questions }}</span>
        </p>
        <p class="flex items-center gap-2">
          <font-awesome-icon icon="cog" class="text-brand-green" />
          <strong class="text-brand-lightGray">Options:</strong>
          <span class="text-brand-gray">{{ shuffle ? '🔀 Mélangées' : '📋 Ordre fixe' }}</span>
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
import { reactive, ref, computed } from 'vue'
import ModalDialog from '../ModalDialog.vue'

interface Category {
  id: string
  name: string
  icon: string
}

const categories = reactive<Category[]>([
  { id: 'general', name: 'Général', icon: 'wand-magic-sparkles' },
  { id: 'histoire', name: 'Histoire', icon: 'university' },
  { id: 'science', name: 'Science', icon: 'flask' },
  { id: 'sport', name: 'Sport', icon: 'medal' },
  { id: 'musique', name: 'Musique', icon: 'music' },
  { id: 'cinema', name: 'Cinéma', icon: 'film' },
  { id: 'art', name: 'Art', icon: 'palette' },
  { id: 'geo', name: 'Géographie', icon: 'globe' },
  { id: 'tech', name: 'Technologie', icon: 'laptop-code' },
  { id: 'jeux', name: 'Jeux vidéo', icon: 'gamepad' },
])

const categoriesMap = computed(() => new Map(categories.map((c) => [c.id, c])))
const selected = reactive<Set<string>>(new Set(['general']))

const questions = ref(10)
const shuffle = ref(true)
const open = ref(false)
const specifics = ref('')

function toggle(id: string) {
  if (selected.has(id)) selected.delete(id)
  else selected.add(id)
}
function inc() {
  questions.value = Math.min(20, questions.value + 5)
}
function dec() {
  questions.value = Math.max(5, questions.value - 5)
}

const emit = defineEmits<{
  (e: 'start', payload: { categories: string[]; questions: number; shuffle: boolean }): void
  (e: 'back'): void
}>()

function confirm() {
  open.value = false
  emit('start', {
    categories: Array.from(selected),
    questions: questions.value,
    shuffle: shuffle.value,
  })
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
</style>
