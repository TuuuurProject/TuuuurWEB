<template>
  <section class="min-h-[60vh] flex flex-col items-center justify-center text-center">
    <div class="relative h-72 w-72">
      <div class="absolute inset-0 rounded-full bg-brand-light/20 blur-xl animate-pulse"></div>
      <div class="ring-wrap absolute inset-0 flex items-center justify-center">
        <div class="ring ring1"></div>
        <div class="ring ring2"></div>
        <div class="ring ring3"></div>
      </div>
      <div
        class="relative z-10 h-72 w-72 rounded-full bg-white/80 border border-brand-dark/10 shadow-soft flex items-center justify-center"
      >
        <div v-if="state === 'search'" class="flex flex-col items-center gap-2">
          <svg viewBox="0 0 24 24" class="h-10 w-10 text-brand-dark/80" fill="currentColor">
            <path
              d="M21 19.6 17.65 16a8 8 0 1 0-1.41 1.41L19.6 21 21 19.6ZM4 10a6 6 0 1 1 6 6 6 6 0 0 1-6-6Z"
            />
          </svg>
          <div class="font-display text-2xl">{{ $t('competitive.matchmaking.searching') }}</div>
          <p class="text-brand-dark/70">{{ $t('competitive.matchmaking.searchingMessage') }}</p>
        </div>
        <div v-else class="flex flex-col items-center gap-3">
          <div class="flex items-center gap-3">
            <div
              class="h-12 w-12 rounded-full bg-brand-light/20 flex items-center justify-center text-2xl"
            >
              🦊
            </div>
            <span class="font-semibold">{{ $t('competitive.matchmaking.you') }}</span>
          </div>
          <div class="font-display text-3xl">{{ $t('competitive.matchmaking.vs') }}</div>
          <div class="flex items-center gap-3">
            <div
              class="h-12 w-12 rounded-full bg-brand-orange/20 flex items-center justify-center text-2xl"
            >
              🐯
            </div>
            <span class="font-semibold">{{ $t('competitive.matchmaking.opponent') }}</span>
          </div>
          <p class="text-brand-dark/70">{{ $t('competitive.matchmaking.found') }}</p>
        </div>
      </div>
    </div>

    <div class="mt-8 flex items-center gap-3">
      <button class="btn btn-secondary" @click="$emit('back')">
        {{ $t('competitive.matchmaking.cancel') }}
      </button>
      <button class="btn btn-primary" :disabled="state === 'search'" @click="$emit('duel')">
        {{ $t('competitive.matchmaking.startDuel') }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ state: 'search' | 'found' }>(), { state: 'search' })
</script>

<style scoped>
.ring {
  position: absolute;
  height: 100%;
  width: 100%;
  border-radius: 9999px;
  border: 2px solid rgba(195, 122, 62, 0.35);
  animation: wave 2.4s ease-out infinite;
}
.ring2 {
  animation-delay: 0.6s;
}
.ring3 {
  animation-delay: 1.2s;
}
@keyframes wave {
  0% {
    transform: scale(0.5);
    opacity: 0.7;
  }
  70% {
    transform: scale(1.2);
    opacity: 0.15;
  }
  100% {
    opacity: 0;
  }
}
</style>
