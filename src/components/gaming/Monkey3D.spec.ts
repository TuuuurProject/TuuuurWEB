import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import Monkey3D from './Monkey3D.vue'
import KnowledgeScene from './KnowledgeScene.vue'
import fr from '@/locales/fr.json'

const { scene, createScene } = vi.hoisted(() => {
  const scene = {
    resize: vi.fn(),
    turn: vi.fn(),
    celebrate: vi.fn(),
    setReducedMotion: vi.fn(),
    setActive: vi.fn(),
    dispose: vi.fn(),
  }
  return { scene, createScene: vi.fn(() => scene) }
})
vi.mock('./monkeyScene', () => ({ createMonkeyScene: createScene }))

const wrappers: Array<{ unmount: () => void }> = []
const disconnectResize = vi.fn()
const disconnectIntersection = vi.fn()
const removeMotion = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.stubGlobal('WebGL2RenderingContext', class {})
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn()
      disconnect = disconnectResize
    },
  )
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe = vi.fn()
      disconnect = disconnectIntersection
    },
  )
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: removeMotion,
  }))
})
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('3D mascot lifecycle', () => {
  it('loads 3D, respects reduced motion and releases resources when leaving', async () => {
    const wrapper = mount(Monkey3D)
    await flushPromises()
    expect(wrapper.attributes('data-state')).toBe('ready')
    expect(scene.setReducedMotion).toHaveBeenCalledWith(true)
    expect(wrapper.find('.monkey-mascot').exists()).toBe(false)
    wrapper.unmount()
    expect(scene.dispose).toHaveBeenCalledTimes(1)
    expect(disconnectResize).toHaveBeenCalledTimes(1)
    expect(disconnectIntersection).toHaveBeenCalledTimes(1)
    expect(removeMotion).toHaveBeenCalledTimes(1)
  })

  it('shows an explicit illustrated fallback on renderer failure', async () => {
    createScene.mockImplementationOnce(() => {
      throw new Error('GPU unavailable')
    })
    const wrapper = mount(Monkey3D)
    wrappers.push(wrapper)
    await flushPromises()
    expect(wrapper.attributes('data-state')).toBe('unavailable')
    expect(wrapper.find('.monkey-mascot').exists()).toBe(true)
    expect(wrapper.emitted('status')).toEqual([['unavailable']])
    expect(console.warn).toHaveBeenCalled()
  })

  it('releases the scene and restores the illustration on WebGL context loss', async () => {
    const wrapper = mount(Monkey3D)
    wrappers.push(wrapper)
    await flushPromises()
    await wrapper.get('canvas').trigger('webglcontextlost')
    expect(scene.dispose).toHaveBeenCalledTimes(1)
    expect(wrapper.attributes('data-state')).toBe('unavailable')
    expect(wrapper.find('.monkey-mascot').exists()).toBe(true)
  })

  it('connects accessible controls to rotation and the banana reaction', async () => {
    const wrapper = mount(KnowledgeScene, {
      global: {
        plugins: [createI18n({ legacy: false, locale: 'fr', messages: { fr } })],
        stubs: { FontAwesomeIcon: true },
      },
    })
    wrappers.push(wrapper)
    await flushPromises()
    await wrapper.get(`button[aria-label="${fr.arena.scene.turnLeft}"]`).trigger('click')
    await wrapper.get(`button[aria-label="${fr.arena.scene.turnRight}"]`).trigger('click')
    expect(scene.turn.mock.calls).toEqual([[-1], [1]])
    await wrapper.get('.character-react').trigger('click')
    expect(scene.celebrate).toHaveBeenCalledTimes(1)
    expect(wrapper.get('.character-speech').text()).toBe(fr.arena.scene.joke)
  })
})
