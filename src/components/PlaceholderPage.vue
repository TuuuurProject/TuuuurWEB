<template>
  <section class="gaming-card">
    <div class="flex items-start gap-4">
      <!-- Icône 3D avec effets de flottement -->
      <span
        class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-purple/20 text-brand-purple animate-float shadow-neon"
      >
        <svg viewBox="0 0 24 24" class="h-6 w-6" fill="currentColor">
          <path
            d="M12 2 2 7l10 5 10-5-10-5Zm0 7L2 4v13a1 1 0 0 0 .55.89L12 23l9.45-5.11A1 1 0 0 0 22 17V4l-10 5Z"
          />
        </svg>
      </span>
      <div>
        <h2 class="font-display text-3xl mb-2 text-brand-lightGray glow-text">{{ title }}</h2>
        <p class="text-brand-gray">{{ description }}</p>

        <!-- Roadmap visuelle avec badges de statut -->
        <div class="mt-6 flex flex-wrap gap-3">
          <span class="badge-success animate-pulse-slow">
            <span class="w-2 h-2 rounded-full bg-brand-green"></span>Design System Gaming
          </span>
          <span class="badge-info">
            <span class="w-2 h-2 rounded-full bg-brand-cyan"></span>Animations Fluides
          </span>
          <span class="badge-warning">
            <span class="w-2 h-2 rounded-full bg-brand-orange"></span>En Développement
          </span>
        </div>

        <!-- Section de conseils avec style gaming -->
        <div class="mt-6 p-4 rounded-2xl bg-brand-purple/10 border border-brand-purple/20">
          <div class="flex items-center gap-2 mb-2">
            <font-awesome-icon icon="gamepad" class="text-brand-purple" />
            <span class="text-sm font-semibold text-brand-purple">Gaming Experience</span>
          </div>
          <p class="text-sm text-brand-gray">
            Cette page adopte le nouveau design gaming avec des effets visuels modernes et une
            palette de couleurs énergique.
          </p>
        </div>

        <div class="mt-8">
          <button class="btn btn-ghost hover:shadow-glow" @click="$emit('back')">← Retour</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ title: string; description: string }>()
</script>
