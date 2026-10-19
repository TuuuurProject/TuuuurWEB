import { describe, expect, it, vi } from 'vitest'
import { Box3, Mesh } from 'three'
import { createMonkeyModel, disposeMonkeyModel } from './monkeyModel'

describe('Original Moki 3D model', () => {
  it('builds a volumetric character with a banana phone and expressive accessories', () => {
    const { root, head, arm } = createMonkeyModel()
    const box = new Box3().setFromObject(root)
    expect(box.max.x - box.min.x).toBeGreaterThan(3)
    expect(box.max.z - box.min.z).toBeGreaterThan(1)
    expect(box.max.y - box.min.y).toBeGreaterThan(3)
    for (const name of ['banana-phone', 'curly-tail', 'tongue', 'crooked-cap', 'sneaker']) {
      expect(root.getObjectByName(name)).toBeDefined()
    }
    expect(head.parent).toBe(root)
    expect(arm.parent).toBe(root)
    disposeMonkeyModel(root)
  })

  it('disposes shared geometry and materials once and keeps instances independent', () => {
    const first = createMonkeyModel()
    const second = createMonkeyModel()
    const body = first.root.getObjectByName('body')
    const otherBody = second.root.getObjectByName('body')
    if (!(body instanceof Mesh) || !(otherBody instanceof Mesh))
      throw new Error('Missing model body')
    expect(body.geometry).not.toBe(otherBody.geometry)
    const disposeGeometry = vi.spyOn(body.geometry, 'dispose')
    const material = Array.isArray(body.material) ? body.material[0] : body.material
    if (!material) throw new Error('Missing body material')
    const disposeMaterial = vi.spyOn(material, 'dispose')
    disposeMonkeyModel(first.root)
    expect(disposeGeometry).toHaveBeenCalledTimes(1)
    expect(disposeMaterial).toHaveBeenCalledTimes(1)
    disposeMonkeyModel(second.root)
  })
})
