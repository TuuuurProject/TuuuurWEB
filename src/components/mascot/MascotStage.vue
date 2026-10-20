<template>
  <!--
    Scène de la mascotte : aplat coloré, décor au trait et socle, comme un personnage
    posé dans l'interface plutôt qu'un objet 3D flottant. La couleur suit le ton du moment.
  -->
  <div
    class="mascot-stage relative isolate w-full overflow-hidden rounded-3xl"
    :class="`mascot-stage--${tone}`"
    :style="{ height: `${height}px` }"
  >
    <svg
      class="stage-decor absolute inset-0 h-full w-full"
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <circle cx="200" cy="170" r="132" fill="none" stroke-width="2" stroke-dasharray="4 10" />
      <circle cx="200" cy="170" r="96" fill="none" stroke-width="1.5" opacity="0.6" />
      <path class="sparkle" d="M64 92 l6 16 16 6 -16 6 -6 16 -6 -16 -16 -6 16 -6z" />
      <path class="sparkle" d="M336 64 l4 11 11 4 -11 4 -4 11 -4 -11 -11 -4 11 -4z" />
      <path class="sparkle" d="M330 238 l5 13 13 5 -13 5 -5 13 -5 -13 -13 -5 13 -5z" />
      <circle class="dot" cx="92" cy="252" r="5" />
      <circle class="dot" cx="300" cy="140" r="4" />
    </svg>

    <!-- Socle sur lequel le singe se tient -->
    <div class="stage-platform absolute left-1/2 -translate-x-1/2" aria-hidden="true"></div>

    <monkizz-mascot
      class="absolute left-1/2 -translate-x-1/2"
      :style="{ bottom: `${-height * 0.03}px` }"
      :size="mascotWidth"
      :pose="pose"
      :animated="animated"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MonkizzMascot from './MonkizzMascot.vue'
import type { MascotPose } from './mascotScene'

const props = withDefaults(
  defineProps<{
    /** Hauteur de la scène en pixels (la largeur suit le conteneur) */
    height?: number
    /** Couleur de la scène : marque, victoire ou défaite */
    tone?: 'brand' | 'win' | 'lose'
    pose?: MascotPose
    animated?: boolean
  }>(),
  { height: 320, tone: 'brand', pose: 'breath', animated: true },
)

// Le singe occupe 90 % de la hauteur, au format 5:6 de MonkizzMascot
const mascotWidth = computed(() => Math.round(props.height * 0.9 * (5 / 6)))
</script>

<style scoped>
.mascot-stage {
  --stage: var(--c-primary);
  background:
    radial-gradient(90% 70% at 50% 38%, rgb(var(--stage) / 0.28), transparent 70%),
    linear-gradient(180deg, rgb(var(--stage) / 0.08), rgb(var(--stage) / 0.22));
}

.mascot-stage--win {
  --stage: var(--c-green);
}

.mascot-stage--lose {
  --stage: var(--c-orange);
}

.stage-decor {
  color: rgb(var(--stage));
  stroke: currentColor;
  opacity: 0.35;
}

.stage-decor .sparkle,
.stage-decor .dot {
  fill: currentColor;
  stroke: none;
}

.stage-platform {
  bottom: 4%;
  width: 62%;
  height: 12%;
  border-radius: 50%;
  background:
    radial-gradient(
      closest-side,
      rgb(var(--stage) / 0.35),
      rgb(var(--stage) / 0.18) 70%,
      transparent
    ),
    rgb(var(--stage) / 0.06);
}
</style>
