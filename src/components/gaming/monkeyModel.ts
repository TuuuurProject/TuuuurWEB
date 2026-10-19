import {
  CatmullRomCurve3,
  Group,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from 'three'

type Point = [number, number, number]

/** Original toy-like character, built locally from reusable geometry. */
export function createMonkeyModel() {
  const root = new Group()
  root.name = 'monkizz'
  const sphere = new SphereGeometry(1, 32, 24)
  const palette = {
    fur: '#b9652d',
    tuft: '#75401e',
    face: '#ffcf90',
    ear: '#ed956c',
    white: '#fff9e9',
    dark: '#2c1825',
    purple: '#8961ee',
    lilac: '#b89aff',
    lime: '#d3f567',
    yellow: '#ffcf36',
    pink: '#f57896',
  }
  const materials = Object.fromEntries(
    Object.entries(palette).map(([key, color]) => [
      key,
      new MeshStandardMaterial({ color, roughness: 0.48, metalness: 0 }),
    ]),
  ) as Record<keyof typeof palette, MeshStandardMaterial>

  function blob(parent: Group, name: string, color: keyof typeof palette, at: Point, size: Point) {
    const mesh = new Mesh(sphere, materials[color])
    mesh.name = name
    mesh.position.set(...at)
    mesh.scale.set(...size)
    mesh.castShadow = true
    mesh.receiveShadow = true
    parent.add(mesh)
    return mesh
  }

  function tube(
    parent: Group,
    name: string,
    color: keyof typeof palette,
    points: Point[],
    radius: number,
  ) {
    const curve = new CatmullRomCurve3(points.map((point) => new Vector3(...point)))
    const mesh = new Mesh(new TubeGeometry(curve, 40, radius, 10, false), materials[color])
    mesh.name = name
    mesh.castShadow = true
    parent.add(mesh)
    return mesh
  }

  tube(
    root,
    'curly-tail',
    'fur',
    [
      [0.42, 0.8, -0.25],
      [1.08, 0.68, -0.3],
      [1.62, 1.04, -0.23],
      [1.64, 1.65, -0.17],
      [1.28, 1.8, -0.12],
      [1.12, 1.5, -0.08],
      [1.35, 1.36, -0.05],
    ],
    0.105,
  )
  blob(root, 'body', 'purple', [0, 1.21, 0], [0.62, 0.73, 0.44])
  blob(root, 'hood', 'lilac', [0, 1.75, -0.04], [0.67, 0.25, 0.48])
  blob(root, 'pocket', 'lilac', [0, 1.02, 0.42], [0.32, 0.18, 0.06])
  for (const side of [-1, 1]) {
    blob(root, 'leg', 'fur', [side * 0.34, 0.57, 0], [0.24, 0.39, 0.24])
    blob(root, 'sneaker-sole', 'white', [side * 0.4, 0.22, 0.22], [0.34, 0.12, 0.46])
    blob(root, 'sneaker', 'lime', [side * 0.4, 0.34, 0.2], [0.33, 0.21, 0.42])
    for (let lace = 0; lace < 3; lace++) {
      blob(
        root,
        'lace',
        'white',
        [side * 0.4, 0.5 - lace * 0.025, 0.23 + lace * 0.09],
        [0.19, 0.027, 0.027],
      )
    }
    tube(
      root,
      'hood-string',
      'white',
      [
        [side * 0.19, 1.72, 0.42],
        [side * 0.16, 1.5, 0.46],
        [side * 0.2, 1.34, 0.47],
      ],
      0.025,
    )
  }
  const arm = new Group()
  arm.name = 'banana-arm'
  arm.position.set(-0.52, 1.55, 0)
  root.add(arm)
  tube(
    arm,
    'sleeve',
    'purple',
    [
      [0, 0, 0],
      [-0.36, -0.22, 0.03],
      [-0.64, 0.15, 0.15],
    ],
    0.19,
  )
  blob(arm, 'hand', 'face', [-0.65, 0.3, 0.17], [0.23, 0.26, 0.2])
  tube(
    arm,
    'banana-phone',
    'yellow',
    [
      [-0.67, 0.12, 0.4],
      [-0.9, 0.34, 0.38],
      [-1, 0.66, 0.34],
      [-0.95, 0.99, 0.3],
      [-0.76, 1.22, 0.26],
    ],
    0.135,
  )
  blob(arm, 'banana-tip', 'tuft', [-0.76, 1.22, 0.26], [0.085, 0.1, 0.09])
  blob(arm, 'banana-tip', 'tuft', [-0.67, 0.12, 0.4], [0.09, 0.085, 0.09])
  for (let finger = 0; finger < 3; finger++) {
    blob(arm, 'finger', 'face', [-0.78, 0.25 + finger * 0.1, 0.48], [0.14, 0.055, 0.09])
  }
  tube(
    root,
    'right-sleeve',
    'purple',
    [
      [0.52, 1.54, 0],
      [0.78, 1.18, 0],
      [0.69, 0.94, 0.3],
    ],
    0.2,
  )
  blob(root, 'right-hand', 'face', [0.65, 0.95, 0.42], [0.23, 0.22, 0.18])

  const head = new Group()
  head.name = 'head'
  head.position.set(0, 2.43, 0.03)
  head.rotation.z = -0.09
  root.add(head)
  for (const side of [-1, 1]) {
    blob(head, 'ear', 'fur', [side * 1.03, 0.04, -0.04], [0.43, 0.48, 0.23])
    blob(head, 'inner-ear', 'ear', [side * 1.06, 0.05, 0.14], [0.28, 0.32, 0.11])
  }
  blob(head, 'head-fur', 'fur', [0, 0, 0], [0.93, 0.88, 0.65])
  blob(head, 'left-face', 'face', [-0.32, 0.04, 0.48], [0.45, 0.58, 0.23])
  blob(head, 'right-face', 'face', [0.32, 0.04, 0.48], [0.45, 0.58, 0.23])
  blob(head, 'muzzle', 'face', [0, -0.36, 0.53], [0.68, 0.38, 0.26])
  const eyes = new Group()
  eyes.name = 'eyes'
  head.add(eyes)
  for (const side of [-1, 1]) {
    const height = side === -1 ? 0.31 : 0.27
    blob(eyes, 'eye-white', 'white', [side * 0.32, 0.17, 0.69], [0.255, height, 0.125])
    blob(eyes, 'pupil', 'dark', [side * 0.27, 0.14, 0.803], [0.105, 0.15, 0.055])
    blob(eyes, 'eye-glint', 'white', [side * 0.27 - 0.025, 0.195, 0.852], [0.034, 0.04, 0.018])
    tube(
      head,
      'eyebrow',
      'tuft',
      [
        [side * 0.15, 0.54, 0.61],
        [side * 0.31, side === -1 ? 0.63 : 0.55, 0.61],
        [side * 0.5, 0.5, 0.58],
      ],
      0.052,
    )
    blob(head, 'cheek', 'ear', [side * 0.54, -0.23, 0.738], [0.115, 0.067, 0.027])
  }
  blob(head, 'nose', 'fur', [0, -0.16, 0.82], [0.18, 0.105, 0.1])
  for (const side of [-1, 1]) {
    blob(head, 'nostril', 'tuft', [side * 0.067, -0.175, 0.91], [0.031, 0.022, 0.014])
  }
  const mouth = blob(head, 'grin', 'dark', [0.06, -0.43, 0.77], [0.33, 0.19, 0.055])
  mouth.rotation.z = 0.12
  blob(head, 'tooth', 'white', [-0.055, -0.33, 0.817], [0.086, 0.065, 0.025])
  blob(head, 'tooth', 'white', [0.12, -0.32, 0.817], [0.086, 0.06, 0.025])
  const tongue = blob(head, 'tongue', 'pink', [0.19, -0.55, 0.827], [0.12, 0.14, 0.05])
  tongue.rotation.z = 0.3
  tube(
    head,
    'tongue-groove',
    'ear',
    [
      [0.17, -0.48, 0.875],
      [0.195, -0.55, 0.879],
    ],
    0.012,
  )

  const cap = new Group()
  cap.name = 'crooked-cap'
  cap.position.set(0.04, 0.66, -0.02)
  cap.rotation.set(-0.18, -0.22, -0.2)
  head.add(cap)
  blob(cap, 'cap-crown', 'purple', [0, 0, 0], [0.76, 0.38, 0.62])
  blob(cap, 'cap-band', 'lilac', [0, -0.08, 0.23], [0.74, 0.09, 0.43])
  blob(cap, 'cap-visor', 'purple', [0.55, -0.04, -0.35], [0.7, 0.065, 0.43])
  blob(cap, 'cap-button', 'lime', [0, 0.38, 0], [0.09, 0.06, 0.09])
  blob(cap, 'cap-badge', 'lime', [0, 0.04, 0.605], [0.16, 0.13, 0.03])
  for (const side of [-1, 1]) {
    blob(cap, 'badge-dot', 'purple', [side * 0.05, 0.05, 0.635], [0.025, 0.04, 0.012])
  }
  return { root, head, arm, eyes }
}

export function disposeMonkeyModel(root: Group) {
  const geometries = new Set<Mesh['geometry']>()
  const materials = new Set<MeshStandardMaterial>()
  root.traverse((object) => {
    if (object instanceof Mesh) {
      geometries.add(object.geometry)
      const list = Array.isArray(object.material) ? object.material : [object.material]
      for (const material of list) materials.add(material)
    }
  })
  geometries.forEach((geometry) => geometry.dispose())
  materials.forEach((material) => material.dispose())
}
