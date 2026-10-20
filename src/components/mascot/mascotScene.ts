/**
 * Rendu three.js de la mascotte Monkizz (src/assets/models/monkey.glb).
 * Ce module est chargé à la demande par MonkizzMascot.vue pour garder three.js hors du bundle principal.
 */
import {
  AnimationMixer,
  Clock,
  Group,
  HemisphereLight,
  DirectionalLight,
  LoopOnce,
  LoopRepeat,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  ACESFilmicToneMapping,
  WebGLRenderer,
  type AnimationAction,
  type AnimationClip,
  type Object3D,
} from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'
import monkeyUrl from '@/assets/models/monkey.glb?url'

export type MascotPose = 'victory' | 'defeat' | 'walking'

const CLIP_NAMES: Record<MascotPose, string> = {
  victory: 'Victory',
  defeat: 'Defeat',
  walking: 'Walking',
}

// Délai entre deux répétitions d'une animation jouée une seule fois (victoire, défaite)
const REPLAY_DELAY_MS = 5000

// Cadrage : le modèle mesure ~1,7 unité, pieds en y = 0
const FRAME_HEIGHT = 1.95
const FRAME_CENTER_Y = 0.86
const CAMERA_FOV = 30

let gltfPromise: Promise<GLTF> | null = null

/** Charge le modèle une seule fois pour toute l'application */
function loadMonkey(): Promise<GLTF> {
  if (!gltfPromise) {
    const draco = new DRACOLoader()
    // Décodeur Draco copié depuis three/examples/jsm/libs/draco/gltf (le chemin intégré à three
    // casse en dev avec le pré-bundling de Vite). À recopier si three.js est mis à jour.
    draco.setDecoderPath(`${import.meta.env.BASE_URL}draco/gltf/`)
    draco.setDecoderConfig({ type: 'wasm' })
    const loader = new GLTFLoader()
    loader.setDRACOLoader(draco)
    gltfPromise = loader.loadAsync(monkeyUrl).catch((error) => {
      gltfPromise = null
      throw error
    })
  }
  return gltfPromise
}

export interface MascotSceneOptions {
  pose: MascotPose
  /** false : pose figée sur la dernière image de l'animation */
  animated: boolean
}

export interface MascotSceneHandle {
  setPose(pose: MascotPose): void
  resize(width: number, height: number): void
  setVisible(visible: boolean): void
  dispose(): void
}

/** Monte la mascotte dans `canvas`. Rejette si WebGL ou le modèle ne sont pas disponibles. */
export async function createMascotScene(
  canvas: HTMLCanvasElement,
  options: MascotSceneOptions,
): Promise<MascotSceneHandle> {
  const gltf = await loadMonkey()

  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  const scene = new Scene()
  const pmrem = new PMREMGenerator(renderer)
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = environment
  pmrem.dispose()

  scene.add(new HemisphereLight(0xffffff, 0x6c5ce7, 0.6))
  const keyLight = new DirectionalLight(0xffffff, 1.4)
  keyLight.position.set(2, 3, 4)
  scene.add(keyLight)

  const camera = new PerspectiveCamera(CAMERA_FOV, 1, 0.1, 50)
  const distance = FRAME_HEIGHT / 2 / Math.tan((CAMERA_FOV * Math.PI) / 360)
  camera.position.set(0, FRAME_CENTER_Y, distance)
  camera.lookAt(0, FRAME_CENTER_Y, 0)

  const model = cloneSkinned(gltf.scene) as Object3D
  const root = new Group()
  root.add(model)
  scene.add(root)

  const mixer = new AnimationMixer(model)
  const clips = new Map<string, AnimationClip>(gltf.animations.map((clip) => [clip.name, clip]))
  const clock = new Clock()

  let currentAction: AnimationAction | null = null
  let frameId = 0
  let replayTimer: ReturnType<typeof setTimeout> | null = null
  let visible = true
  let disposed = false
  let playing = false

  const render = () => renderer.render(scene, camera)

  const loop = () => {
    frameId = 0
    if (disposed || !visible || !playing) return
    mixer.update(clock.getDelta())
    render()
    frameId = requestAnimationFrame(loop)
  }

  const startLoop = () => {
    playing = true
    clock.getDelta()
    if (!frameId && visible) frameId = requestAnimationFrame(loop)
  }

  const stopLoop = () => {
    playing = false
    if (frameId) cancelAnimationFrame(frameId)
    frameId = 0
  }

  const clearReplay = () => {
    if (replayTimer) clearTimeout(replayTimer)
    replayTimer = null
  }

  // Fin d'une animation jouée une fois : on garde la dernière image puis on la rejoue plus tard
  mixer.addEventListener('finished', () => {
    stopLoop()
    render()
    if (!options.animated || disposed) return
    clearReplay()
    replayTimer = setTimeout(() => {
      if (disposed || !currentAction) return
      currentAction.reset().play()
      startLoop()
    }, REPLAY_DELAY_MS)
  })

  const setPose = (pose: MascotPose) => {
    options.pose = pose
    clearReplay()
    const clip = clips.get(CLIP_NAMES[pose]) ?? gltf.animations[0]
    if (!clip) {
      render()
      return
    }

    const next = mixer.clipAction(clip)
    const looping = pose === 'walking'
    next.reset()
    next.setLoop(looping ? LoopRepeat : LoopOnce, looping ? Infinity : 1)
    next.clampWhenFinished = true

    if (currentAction && currentAction !== next) {
      next.crossFadeFrom(currentAction, 0.3, false)
    }
    currentAction = next

    if (!options.animated) {
      // Pose figée : on se place sur la fin de l'animation et on dessine une seule image
      next.play()
      mixer.setTime(looping ? 0 : clip.duration)
      stopLoop()
      render()
      return
    }

    next.play()
    startLoop()
  }

  const resize = (width: number, height: number) => {
    if (width <= 0 || height <= 0) return
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    render()
  }

  const setVisible = (isVisible: boolean) => {
    visible = isVisible
    if (visible && playing && !frameId) {
      clock.getDelta()
      frameId = requestAnimationFrame(loop)
    }
  }

  const dispose = () => {
    disposed = true
    stopLoop()
    clearReplay()
    mixer.stopAllAction()
    environment.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
  }

  setPose(options.pose)

  return { setPose, resize, setVisible, dispose }
}
