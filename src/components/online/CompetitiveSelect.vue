<template>
  <section class="space-y-6">
    <header class="flex items-center justify-between">
      <h2 class="font-branding text-3xl text-brand-lightGray glow-text">
        <font-awesome-icon icon="fire" class="mr-2" /> {{ $t('competitive.title') }}
      </h2>
      <div class="badge-info animate-pulse-slow">{{ $t('competitive.badge') }}</div>
    </header>

    <div class="gaming-card">
      <div class="flex items-start gap-4 mb-6">
        <div
          class="w-12 h-12 rounded-2xl bg-brand-orange/20 flex items-center justify-center text-brand-orange text-2xl animate-float"
        >
          <font-awesome-icon icon="bullseye" />
        </div>
        <div>
          <h3 class="font-branding text-xl mb-2 text-brand-lightGray">
            <font-awesome-icon icon="trophy" class="mr-2" />
            {{ $t('competitive.categories.title') }}
          </h3>
          <p class="text-brand-gray">
            {{ $t('competitive.categories.subtitle') }}
          </p>
        </div>
      </div>

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

      <!-- Section d'information compétitive -->
      <div class="mt-6 p-4 rounded-2xl bg-brand-orange/10 border border-brand-orange/20">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-brand-orange">⚡</span>
          <span class="text-sm font-semibold text-brand-orange">{{
            $t('competitive.info.title')
          }}</span>
        </div>
        <p class="text-sm text-brand-gray">
          {{ $t('competitive.info.description') }}
        </p>
        <div class="flex items-center gap-4 mt-3 text-xs">
          <div class="flex items-center gap-1">
            <span class="w-2 h-2 bg-brand-green rounded-full"></span>
            <span class="text-brand-gray">{{ $t('competitive.info.balancedMatchmaking') }}</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="w-2 h-2 bg-brand-purple rounded-full"></span>
            <span class="text-brand-gray">{{ $t('competitive.info.dynamicRank') }}</span>
          </div>
        </div>
      </div>

      <div class="mt-8 flex items-center justify-end gap-3">
        <button class="btn btn-ghost" @click="$emit('back')">← {{ $t('common.back') }}</button>
        <button class="btn btn-secondary" :disabled="selected.size === 0" @click="proceed">
          🔍 {{ $t('competitive.startSearch') }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

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
  { id: 'art', name: 'Art', icon: 'palette' },
  { id: 'geo', name: 'Géographie', icon: 'globe' },
]

const selected = reactive<Set<string>>(new Set(['general']))

function toggle(id: string) {
  selected.has(id) ? selected.delete(id) : selected.add(id)
}

const emit = defineEmits<{
  (e: 'search', payload: { categories: string[] }): void
  (e: 'back'): void
}>()
function proceed() {
  emit('search', { categories: Array.from(selected) })
}
</script>
