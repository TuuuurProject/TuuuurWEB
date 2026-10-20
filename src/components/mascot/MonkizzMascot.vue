<template>
  <div
    ref="root"
    class="monkizz-mascot relative"
    :style="{ width: `${size}px` }"
    role="img"
    :aria-label="$t('mascot.alt')"
  >
    <!-- Secours si WebGL ou le modèle 3D ne sont pas disponibles -->
    <monkizz-mascot-fallback
      v-if="failed"
      :size="size"
      :animated="animated"
      class="absolute inset-x-0 bottom-0 mx-auto"
    />
    <canvas
      v-else
      ref="canvas"
      class="h-full w-full transition-opacity duration-500"
      :class="ready ? 'opacity-100' : 'opacity-0'"
      aria-hidden="true"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import MonkizzMascotFallback from './MonkizzMascotFallback.vue'
import type { MascotPose, MascotSceneHandle } from './mascotScene'

const props = withDefaults(
  defineProps<{
    /** Largeur en pixels (la hauteur suit, format 5:6) */
    size?: number
    /** Animation de la mascotte */
    pose?: MascotPose
    /** false : pose figée (la préférence « réduire les animations » force aussi ce mode) */
    animated?: boolean
  }>(),
  { size: 200, pose: 'breath', animated: true },
)

const root = ref<HTMLDivElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const ready = ref(false)
const failed = ref(false)

let handle: MascotSceneHandle | null = null
let resizeObserver: ResizeObserver | null = null
let visibilityObserver: IntersectionObserver | null = null
let unmounted = false

const prefersReducedMotion = () =>
  globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

const fit = () => {
  if (!handle || !root.value) return
  const { width, height } = root.value.getBoundingClientRect()
  handle.resize(width, height)
}

onMounted(async () => {
  if (!canvas.value) return
  try {
    // three.js n'est chargé qu'au premier affichage d'une mascotte
    const { createMascotScene } = await import('./mascotScene')
    if (unmounted || !canvas.value) return
    handle = await createMascotScene(canvas.value, {
      pose: props.pose,
      animated: props.animated && !prefersReducedMotion(),
    })
    if (unmounted) {
      handle.dispose()
      return
    }
    fit()
    ready.value = true

    resizeObserver = new ResizeObserver(fit)
    if (root.value) resizeObserver.observe(root.value)

    // Pas de rendu quand la mascotte est hors de l'écran
    visibilityObserver = new IntersectionObserver(([entry]) => {
      handle?.setVisible(Boolean(entry?.isIntersecting))
    })
    if (root.value) visibilityObserver.observe(root.value)
  } catch (error) {
    if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.warn('Mascotte 3D indisponible :', error)
    failed.value = true
  }
})

watch(
  () => props.pose,
  (pose) => handle?.setPose(pose),
)

onBeforeUnmount(() => {
  unmounted = true
  resizeObserver?.disconnect()
  visibilityObserver?.disconnect()
  handle?.dispose()
  handle = null
})
</script>

<style scoped>
.monkizz-mascot {
  max-width: 100%;
  aspect-ratio: 5 / 6;
}
</style>
