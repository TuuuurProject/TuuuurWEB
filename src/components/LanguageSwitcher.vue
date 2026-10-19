<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="flex h-10 items-center gap-2 rounded-full border-2 border-brand-line px-3 text-sm font-bold text-brand-lightGray transition-colors hover:border-brand-purple/50"
      :aria-label="$t('nav.language')"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      @click="isOpen = !isOpen"
    >
      <font-awesome-icon icon="globe" class="text-brand-gray" />
      {{ currentLocale.toUpperCase() }}
    </button>

    <transition name="fade">
      <ul
        v-if="isOpen"
        role="listbox"
        :aria-label="$t('nav.language')"
        class="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-2xl border border-brand-line bg-brand-darkGray py-1 shadow-card"
      >
        <li v-for="lang in availableLocales" :key="lang.code">
          <button
            type="button"
            role="option"
            :aria-selected="lang.code === currentLocale"
            class="flex w-full items-center justify-between px-4 py-2 text-left font-semibold transition-colors hover:bg-brand-surface2"
            :class="lang.code === currentLocale ? 'text-brand-purple' : 'text-brand-lightGray'"
            @click="changeLocale(lang.code)"
          >
            {{ lang.name }}
            <font-awesome-icon v-if="lang.code === currentLocale" icon="check" />
          </button>
        </li>
      </ul>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const isOpen = ref(false)
const root = ref<HTMLElement | null>(null)

const availableLocales = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
]

const currentLocale = computed(() => locale.value)

const changeLocale = (newLocale: string) => {
  locale.value = newLocale
  isOpen.value = false
  try {
    localStorage.setItem('locale', newLocale)
  } catch {
    // Préférence non mémorisée
  }
}

// Fermer la liste au clic en dehors
const onDocumentClick = (event: MouseEvent) => {
  if (root.value && !root.value.contains(event.target as Node)) isOpen.value = false
}
onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
</script>
