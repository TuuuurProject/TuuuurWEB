import {
  ACESFilmicToneMapping,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  TorusGeometry,
  WebGLRenderer,
} from 'three'
import { createMonkeyModel, disposeMonkeyModel } from './monkeyModel'

export function createMonkeyScene(canvas: HTMLCanvasElement) {
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = PCFSoftShadowMap
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.3
  const scene = new Scene()
  const camera = new PerspectiveCamera(33, 1, 0.1, 30)
  camera.position.set(0, 2.65, 9)
  camera.lookAt(0, 1.8, 0)
  scene.add(new HemisphereLight('#fff4d8', '#675497', 3))
  const key = new DirectionalLight('#fff1d9', 4.5)
  key.position.set(-3, 6, 5)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  key.shadow.camera.left = -3
  key.shadow.camera.right = 3
  key.shadow.camera.top = 5
  key.shadow.camera.bottom = -3
  key.shadow.normalBias = 0.035
  scene.add(key)
  const rim = new DirectionalLight('#c6a4ff', 4)
  rim.position.set(3, 3, -3)
  scene.add(rim)
  const model = createMonkeyModel()
  scene.add(model.root)
  const stage = new Group()
  const platform = new Mesh(
    new CylinderGeometry(1.85, 1.73, 0.24, 64),
    new MeshStandardMaterial({ color: '#554078', roughness: 0.65 }),
  )
  platform.position.y = -0.05
  platform.receiveShadow = true
  stage.add(platform)
  const ring = new Mesh(
    new TorusGeometry(1.8, 0.027, 8, 80),
    new MeshStandardMaterial({
      color: '#cfb0ff',
      emissive: new Color('#9965ff'),
      emissiveIntensity: 1.2,
    }),
  )
  ring.rotation.x = Math.PI / 2
  ring.position.y = 0.08
  stage.add(ring)
  scene.add(stage)

  let frame = 0
  let active = true
  let reducedMotion = false
  let disposed = false
  let targetRotation = -0.16
  let currentRotation = targetRotation
  let reactionStart: number | null = null

  function render(now: number) {
    frame = 0
    if (disposed || !active) return
    currentRotation += (targetRotation - currentRotation) * (reducedMotion ? 1 : 0.14)
    const elapsed = reactionStart === null ? 2 : (now - reactionStart) / 1000
    const reacting = elapsed < 1.4 && !reducedMotion
    const bounce = reacting
      ? Math.sin(elapsed * Math.PI * 4) * Math.sin((elapsed / 1.4) * Math.PI)
      : 0
    model.root.rotation.y = currentRotation
    model.root.position.y = Math.abs(bounce) * 0.12
    model.head.rotation.z = -0.09 + bounce * 0.11
    model.arm.rotation.z = bounce * 0.25
    model.eyes.scale.y = reacting && elapsed > 0.4 && elapsed < 0.52 ? 0.15 : 1
    renderer.render(scene, camera)
    if (reacting || Math.abs(targetRotation - currentRotation) > 0.001) requestRender()
  }
  function requestRender() {
    if (!frame && active && !disposed) frame = requestAnimationFrame(render)
  }
  function resize(width: number, height: number) {
    if (width <= 0 || height <= 0 || disposed) return
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    // Keep ears, banana and platform in frame on narrow portrait screens.
    camera.position.z = Math.max(8.5, 7.5 / camera.aspect)
    camera.updateProjectionMatrix()
    requestRender()
  }
  return {
    resize,
    turn(direction: number) {
      targetRotation = Math.max(-0.75, Math.min(0.75, targetRotation + direction * 0.3))
      requestRender()
    },
    celebrate() {
      reactionStart = performance.now()
      requestRender()
    },
    setReducedMotion(value: boolean) {
      reducedMotion = value
      reactionStart = null
      requestRender()
    },
    setActive(value: boolean) {
      active = value
      if (active) requestRender()
      else {
        cancelAnimationFrame(frame)
        frame = 0
        reactionStart = null
      }
    },
    dispose() {
      disposed = true
      cancelAnimationFrame(frame)
      disposeMonkeyModel(model.root)
      disposeMonkeyModel(stage)
      renderer.dispose()
    },
  }
}

export type MonkeyScene = ReturnType<typeof createMonkeyScene>
