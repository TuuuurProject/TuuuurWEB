<template>
  <div ref="host" class="monkey-3d" :data-state="state">
    <MonkeyMascot v-if="state !== 'ready'" class="monkey-3d-fallback" />
    <canvas
      v-show="state === 'ready'"
      ref="canvas"
      class="monkey-3d-canvas"
      aria-hidden="true"
      @webglcontextlost="onContextLost"
    />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import MonkeyMascot from './MonkeyMascot.vue'
import type { MonkeyScene } from './monkeyScene'

const emit = defineEmits<{ status: [value: 'loading' | 'ready' | 'unavailable'] }>()
const host = ref<HTMLDivElement>()
const canvas = ref<HTMLCanvasElement>()
const state = ref<'loading' | 'ready' | 'unavailable'>('loading')
let scene: MonkeyScene | undefined
let resizeObserver: ResizeObserver | undefined
let intersectionObserver: IntersectionObserver | undefined
let motion: MediaQueryList | undefined
let unmounted = false
let visible = true

function updateActivity() {
  scene?.setActive(visible && !document.hidden)
}
function updateMotion() {
  scene?.setReducedMotion(motion?.matches ?? false)
}
function unavailable(error: unknown) {
  console.warn('[Monkizz] 3D mascot unavailable; showing illustrated mascot.', error)
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  motion?.removeEventListener('change', updateMotion)
  document.removeEventListener('visibilitychange', updateActivity)
  scene?.dispose()
  scene = undefined
  state.value = 'unavailable'
  emit('status', 'unavailable')
}
function onContextLost(event: Event) {
  event.preventDefault()
  unavailable(new Error('WebGL context lost'))
}

onMounted(async () => {
  if (typeof window.WebGL2RenderingContext === 'undefined') {
    unavailable(new Error('WebGL2 is not supported'))
    return
  }
  try {
    const { createMonkeyScene } = await import('./monkeyScene')
    if (unmounted || !canvas.value || !host.value) return
    scene = createMonkeyScene(canvas.value)
    motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    updateMotion()
    motion.addEventListener('change', updateMotion)
    resizeObserver = new ResizeObserver(([entry]) => {
      if (entry) scene?.resize(entry.contentRect.width, entry.contentRect.height)
    })
    resizeObserver.observe(host.value)
    intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false
      updateActivity()
    })
    intersectionObserver.observe(host.value)
    document.addEventListener('visibilitychange', updateActivity)
    updateActivity()
    scene.resize(host.value.clientWidth, host.value.clientHeight)
    state.value = 'ready'
    emit('status', 'ready')
  } catch (error) {
    if (!unmounted) unavailable(error)
  }
})
onBeforeUnmount(() => {
  unmounted = true
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  motion?.removeEventListener('change', updateMotion)
  document.removeEventListener('visibilitychange', updateActivity)
  scene?.dispose()
})
defineExpose({
  turn: (direction: number) => scene?.turn(direction),
  celebrate: () => scene?.celebrate(),
})
</script>

<style scoped>
.monkey-3d,
.monkey-3d-canvas {
  width: 100%;
  height: 100%;
}
.monkey-3d-canvas {
  display: block;
}
.monkey-3d-fallback {
  width: 72%;
  height: 90%;
  margin: auto;
  object-fit: contain;
}
</style>
