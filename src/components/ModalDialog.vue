<template>
  <Teleport to="body">
    <transition name="fade" appear>
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Backdrop avec blur avancé -->
        <div
          class="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm"
          @click="$emit('close')"
        ></div>
        <div
          class="relative z-10 w-[92vw] max-w-lg rounded-3xl bg-card-gradient backdrop-blur-sm border border-brand-purple/30 p-6 shadow-neon modal-enter-active"
        >
          <overlay-block :loading="loading">
            <header class="mb-4 flex items-start justify-between gap-4">
              <h3 class="font-display text-2xl text-brand-lightGray glow-text">{{ title }}</h3>
              <button
                class="pill hover:bg-brand-purple/20 hover:border-brand-purple/40 transition-all duration-200 hover:rotate-90"
                :aria-label="$t('common.close')"
                @click="$emit('close')"
              >
                ✕
              </button>
            </header>
            <div class="text-brand-gray">
              <slot />
            </div>
            <footer class="mt-6 flex items-center justify-end gap-3">
              <button class="btn btn-ghost" @click="$emit('close')">
                {{ $t('modal.cancel') }}
              </button>
              <button
                class="btn btn-primary"
                :disabled="props.disabledConfirm"
                @click="$emit('confirm')"
              >
                {{ $t('modal.confirm') }}
              </button>
            </footer>
          </overlay-block>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import OverlayBlock from '@/components/OverlayBlock.vue'

const props = withDefaults(
  defineProps<{ open: boolean; title?: string; loading?: boolean; disabledConfirm?: boolean }>(),
  {
    title: 'Confirmation',
    loading: false,
    disabledConfirm: false,
  },
)

defineEmits<{
  close: []
  confirm: []
}>()

onMounted(() => {
  if (props.open) {
    document.body.style.overflow = 'hidden'
    document.getElementById('app')?.classList.add('modal-open')
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
  document.getElementById('app')?.classList.remove('modal-open')
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 250ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Désactive les interactions sur l'app quand une modale est ouverte */
#app.modal-open {
  pointer-events: none;
}

/* La modale elle-même reste interactive */
.fixed.z-50 {
  pointer-events: auto;
}
</style>
