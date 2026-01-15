<template>
  <div class="relative">
    <button
      class="pill hover:bg-brand-purple/20 hover:border-brand-purple/40 flex items-center gap-2"
      @click="toggleDropdown"
    >
      <span>{{ $t('nav.modes') }}</span>
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
          v-for="mode in availableModes"
          :key="mode.name"
          class="w-full px-4 py-2 text-left hover:bg-brand-purple/20 transition-colors text-brand-lightGray"
          :class="{ 'bg-brand-purple/10': mode.id === currentModeId }"
          @click="goTo(mode.id, mode.routerName)"
        >
          {{ mode.name }}
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const router = useRouter()
const { t } = useI18n()

const isOpen = ref(false)
const currentModeId = ref(0)

const availableModes = [
  { id: 1, name: t('nav.solo'), routerName: 'SoloQuiz' },
  { id: 2, name: t('nav.group'), routerName: 'GroupMode' },
  { id: 3, name: t('nav.competitive'), routerName: 'CompetitiveMode' },
]

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const goTo = (id: number, routerName: string) => {
  isOpen.value = false
  currentModeId.value = id
  router.push({ name: routerName })
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
