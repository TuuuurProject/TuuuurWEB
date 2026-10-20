<template>
  <section
    class="mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_28rem]"
  >
    <!-- La mascotte accueille le joueur (grand écran uniquement, le formulaire reste prioritaire) -->
    <div class="hidden justify-center lg:flex">
      <mascot-speech :message="mascotMessage" :size="240" />
    </div>

    <div class="surface-card flex min-w-0 flex-col gap-6 md:p-8">
      <header class="flex flex-col gap-2">
        <h2 class="text-3xl font-bold">{{ title }}</h2>
        <p v-if="subtitle" class="text-brand-muted">{{ subtitle }}</p>
      </header>
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import MascotSpeech from '@/components/mascot/MascotSpeech.vue'

defineProps<{
  title: string
  subtitle?: string
  mascotMessage: string
}>()
</script>
