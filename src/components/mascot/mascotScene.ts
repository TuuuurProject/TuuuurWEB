/**
 * Rendu three.js de la mascotte Monkizz (src/assets/models/monkey.glb).
 * Ce module est chargé à la demande par MonkizzMascot.vue pour garder three.js hors du bundle principal.
 */
import {
  AnimationMixer,
  Clock,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PlaneGeometry,
  ShadowMaterial,
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

export type MascotPose = 'breath' | 'victory' | 'defeat' | 'walking'

const CLIP_NAMES: Record<MascotPose, string> = {
  breath: 'Breath',
  victory: 'Victory',
  defeat: 'Defeat',
  walking: 'Walking',
}

// Animations en boucle ; les autres (victoire, défaite) sont jouées une fois puis le singe repasse en respiration
const LOOPING_POSES: MascotPose[] = ['breath', 'walking']

// Durée du fondu entre deux animations, en secondes
const CROSSFADE = 0.4

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
    gltfPromise = loader
      .loadAsync(monkeyUrl)
      .then((gltf) => {
        softenMaterials(gltf.scene)
        return gltf
      })
      .catch((error) => {
        gltfPromise = null
        throw error
      })
  }
  return gltfPromise
}

/**
 * Le modèle exporté est très brillant (vernis, rugosité faible) : on le rend plus mat
 * pour qu'il se fonde dans l'interface. Matériaux partagés par toutes les instances.
 */
function softenMaterials(root: Object3D) {
  root.traverse((child) => {
    const mesh = child as Mesh
    if (!mesh.isMesh) return
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const material of materials) {
      if (!(material instanceof MeshStandardMaterial)) continue
      material.roughness = Math.max(material.roughness, 0.7)
      material.envMapIntensity = 0.6
      if ('clearcoat' in material && typeof material.clearcoat === 'number') {
        material.clearcoat = Math.min(material.clearcoat, 0.1)
      }
    }
  })
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
  renderer.toneMappingExposure = 0.85
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = PCFSoftShadowMap

  const scene = new Scene()
  const pmrem = new PMREMGenerator(renderer)
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = environment
  scene.environmentIntensity = 0.3
  pmrem.dispose()

  // Lumière douce et chaude de face, contre-jour violet pour détacher le singe du décor
  scene.add(new HemisphereLight(0xfff6ee, 0x2a2350, 0.45))
  const keyLight = new DirectionalLight(0xfff1e0, 1.1)
  keyLight.position.set(-1.5, 3.5, 3)
  keyLight.castShadow = true
  keyLight.shadow.mapSize.set(1024, 1024)
  keyLight.shadow.camera.left = -1.2
  keyLight.shadow.camera.right = 1.2
  keyLight.shadow.camera.top = 2
  keyLight.shadow.camera.bottom = -0.5
  keyLight.shadow.camera.near = 0.5
  keyLight.shadow.camera.far = 10
  keyLight.shadow.radius = 6
  keyLight.shadow.bias = -0.0005
  scene.add(keyLight)
  const rimLight = new DirectionalLight(0x8b7cf8, 1.4)
  rimLight.position.set(1.5, 2.5, -3)
  scene.add(rimLight)

  // Sol invisible qui ne garde que l'ombre portée du singe
  const floorGeometry = new PlaneGeometry(4, 4)
  const floorMaterial = new ShadowMaterial({ color: 0x1b1442, opacity: 0.28 })
  const floor = new Mesh(floorGeometry, floorMaterial)
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)

  const camera = new PerspectiveCamera(CAMERA_FOV, 1, 0.1, 50)
  const distance = FRAME_HEIGHT / 2 / Math.tan((CAMERA_FOV * Math.PI) / 360)
  camera.position.set(0, FRAME_CENTER_Y, distance)
  camera.lookAt(0, FRAME_CENTER_Y, 0)

  const model = cloneSkinned(gltf.scene) as Object3D
  model.traverse((child) => {
    if ((child as Mesh).isMesh) child.castShadow = true
  })
  const root = new Group()
  root.add(model)
  scene.add(root)

  const mixer = new AnimationMixer(model)
  const clips = new Map<string, AnimationClip>(gltf.animations.map((clip) => [clip.name, clip]))
  const clock = new Clock()

  let currentAction: AnimationAction | null = null
  let frameId = 0
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

  const play = (pose: MascotPose) => {
    const clip = clips.get(CLIP_NAMES[pose]) ?? gltf.animations[0]
    if (!clip) {
      render()
      return
    }

    const next = mixer.clipAction(clip)
    const looping = LOOPING_POSES.includes(pose)
    next.reset()
    next.setLoop(looping ? LoopRepeat : LoopOnce, looping ? Infinity : 1)
    next.clampWhenFinished = true

    if (currentAction && currentAction !== next) {
      next.crossFadeFrom(currentAction, CROSSFADE, false)
    }
    currentAction = next

    if (!options.animated) {
      // Pose figée : fin de l'animation pour victoire et défaite, début pour les boucles
      next.play()
      mixer.setTime(looping ? 0 : clip.duration)
      stopLoop()
      render()
      return
    }

    next.play()
    startLoop()
  }

  // Fin d'une animation jouée une fois : le singe reprend sa respiration
  mixer.addEventListener('finished', () => {
    if (disposed || !options.animated) return
    play('breath')
  })

  const setPose = (pose: MascotPose) => {
    options.pose = pose
    play(pose)
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
    mixer.stopAllAction()
    environment.dispose()
    floorGeometry.dispose()
    floorMaterial.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
  }

  setPose(options.pose)

  return { setPose, resize, setVisible, dispose }
}
