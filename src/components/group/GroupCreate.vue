<template>
  <section class="space-y-6">
    <header class="flex items-center justify-between">
      <h2 class="font-branding text-3xl text-brand-lightGray">Créer une partie</h2>
      <div class="pill">Partagez le code avec vos amis</div>
    </header>

    <div class="grid gap-6 md:grid-cols-3">
      <!-- Left: quiz settings (like solo) -->
      <div class="md:col-span-2 gaming-card">
        <h3 class="font-branding text-xl mb-2 text-brand-lightGray">Paramètres du quiz</h3>
        <p class="text-brand-gray mb-4">Choisissez les options pour la partie.</p>

        <div class="space-y-6">
          <div>
            <h4 class="font-semibold mb-3 text-brand-lightGray">Catégories</h4>
            <div class="flex flex-wrap gap-3">
              <button
                v-for="cat in categories"
                :key="cat.id"
                class="group inline-flex items-center gap-2 rounded-2xl px-4 py-2 border transition duration-250"
                :class="
                  selected.has(cat.id)
                    ? 'bg-brand-purple text-white border-brand-purple shadow-neon'
                    : 'bg-brand-darkGray/50 text-brand-lightGray border-brand-purple/30 hover:bg-brand-purple/20 hover:border-brand-purple'
                "
                @click="toggle(cat.id)"
              >
                <font-awesome-icon :icon="cat.icon" class="text-lg" />
                <span class="font-semibold">{{ cat.name }}</span>
              </button>
            </div>
          </div>

          <div class="grid gap-6 sm:grid-cols-2">
            <div>
              <div class="flex items-center justify-between">
                <label class="font-semibold text-brand-lightGray">Nombre de questions</label>
                <span class="pill">{{ questions }}</span>
              </div>
              <div class="mt-3 flex items-center gap-3">
                <button class="pill" @click="dec()">−</button>
                <input
                  type="range"
                  class="w-full accent-brand-purple"
                  min="5"
                  max="20"
                  step="5"
                  v-model.number="questions"
                />
                <button class="pill" @click="inc()">＋</button>
              </div>
            </div>

            <label class="flex items-center gap-3">
              <input type="checkbox" v-model="shuffle" class="accent-brand-purple" />
              <span class="text-brand-lightGray">Mélanger les questions</span>
            </label>

            <div class="sm:col-span-2">
              <label class="block font-semibold mb-2 text-brand-lightGray"
                >Catégories spécifiques (champ libre)</label
              >
              <input
                type="text"
                v-model="specifics"
                class="w-full rounded-2xl border border-brand-purple/30 bg-brand-darkGray/50 px-4 py-3 shadow-neon text-brand-lightGray focus:outline-none focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple"
                placeholder="Ex: Mythologie nordique, Programmation fonctionnelle…"
              />
              <p class="text-xs text-brand-gray mt-1">Facultatif — visible par les joueurs.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: room info -->
      <aside class="gaming-card space-y-4">
        <h3 class="font-branding text-xl text-brand-lightGray">Salon</h3>
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-brand-gray">Code</div>
            <div class="font-branding text-2xl tracking-wider text-brand-lightGray">{{ code }}</div>
          </div>
          <button class="btn btn-secondary">Copier</button>
        </div>
        <QRPreview :text="code" :size="180" />

        <div>
          <h4 class="font-semibold mb-2 text-brand-lightGray">Joueurs connectés</h4>
          <ul class="space-y-2">
            <li v-for="p in players" :key="p.id" class="flex items-center gap-3">
              <div
                class="h-9 w-9 rounded-full bg-brand-purple/20 flex items-center justify-center font-bold text-brand-purple"
              >
                {{ p.emoji }}
              </div>
              <span class="font-semibold text-brand-lightGray">{{ p.name }}</span>
              <span class="ml-auto pill">Prêt</span>
            </li>
          </ul>
        </div>

        <div class="pt-2 flex items-center justify-end gap-3">
          <button class="btn btn-secondary" @click="$emit('back')">Retour</button>
          <button
            class="btn btn-primary"
            @click="
              $emit('created', {
                categories: Array.from(selected),
                questions: questions.value,
                shuffle: shuffle.value,
                specifics,
              })
            "
          >
            Créer
          </button>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import QRPreview from './QRPreview.vue'

interface Category {
  id: string
  name: string
  icon: string
}
const categories: Category[] = [
  { id: 'general', name: 'Général', icon: 'wand-magic-sparkles' },
  { id: 'histoire', name: 'Histoire', icon: 'university' },
  { id: 'science', name: 'Science', icon: 'flask' },
  { id: 'sport', name: 'Sport', icon: 'medal' },
  { id: 'musique', name: 'Musique', icon: 'music' },
  { id: 'cinema', name: 'Cinéma', icon: 'film' },
]

const selected = reactive<Set<string>>(new Set(['general']))
const questions = ref(10)
const shuffle = ref(true)
const specifics = ref('')

function toggle(id: string) {
  selected.has(id) ? selected.delete(id) : selected.add(id)
}
function inc() {
  questions.value = Math.min(20, questions.value + 5)
}
function dec() {
  questions.value = Math.max(5, questions.value - 5)
}

const code = 'TUR-' + Math.floor(1000 + Math.random() * 9000)
const players = reactive([
  { id: 1, name: 'Alice', emoji: '🦊' },
  { id: 2, name: 'Ben', emoji: '🐼' },
])

// Payload construit dans l'événement du bouton (UI only)
</script>
