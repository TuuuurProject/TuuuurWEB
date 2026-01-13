<template>
  <div class="relative">
    <button
      class="pill hover:bg-brand-purple/20 hover:border-brand-purple/40 flex items-center gap-2"
      @click="toggleDropdown"
    >
      <span>{{ currentLocaleLabel }}</span>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <transition name="fade">
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-32 rounded-2xl bg-brand-darkGray/95 backdrop-blur-xl border border-brand-purple/30 shadow-neon overflow-hidden z-50"
      >
        <button
          v-for="locale in availableLocales"
          :key="locale.code"
          class="w-full px-4 py-2 text-left hover:bg-brand-purple/20 transition-colors text-brand-lightGray"
          :class="{ 'bg-brand-purple/10': locale.code === currentLocale }"
          @click="changeLocale(locale.code)"
        >
          {{ locale.name }}
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const isOpen = ref(false)

const availableLocales = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
]

const currentLocale = computed(() => locale.value)

const currentLocaleLabel = computed(() => {
  const current = availableLocales.find((l) => l.code === currentLocale.value)
  return current?.name || 'Français'
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const changeLocale = (newLocale: string) => {
  locale.value = newLocale
  isOpen.value = false
  // Save to localStorage
  localStorage.setItem('locale', newLocale)
}

// Close dropdown when clicking outside
if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.relative')) {
      isOpen.value = false
    }
  })
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
