import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, type Pinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createMemoryHistory, createRouter } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import HeaderBlock from '@/components/HeaderBlock.vue'
import KnowledgeScene from './KnowledgeScene.vue'
import SoloQuiz from '@/components/solo/SoloQuiz.vue'
import useUserStore from '@/stores/user'
import useSoloStore from '@/stores/solo'
import useThemeStore from '@/stores/theme'
import fr from '@/locales/fr.json'
import en from '@/locales/en.json'

const wrappers: Array<{ unmount: () => void }> = []

async function setup(
  component: typeof HomePage | typeof HeaderBlock | typeof SoloQuiz,
  configure?: (pinia: Pinia) => void,
) {
  const pinia = createPinia()
  const i18n = createI18n({
    legacy: false,
    locale: 'fr',
    messages: { fr, en },
  })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'Home', component: HomePage },
      ...[
        ['solo', 'SoloQuiz'],
        ['groupe', 'GroupMode'],
        ['competitif', 'CompetitiveMode'],
        ['classement', 'Ranking'],
        ['profil', 'Profile'],
        ['connexion', 'Login'],
      ].map(([path, name]) => ({
        path: `/${path}`,
        name,
        component: { template: '<div />' },
      })),
    ],
  })
  await router.push('/')
  await router.isReady()
  configure?.(pinia)
  const wrapper = mount(component, {
    global: {
      plugins: [pinia, router, i18n],
      stubs: { FontAwesomeIcon: true },
    },
  })
  wrappers.push(wrapper)
  return { wrapper, router, i18n, pinia }
}

beforeEach(() => {
  localStorage.clear()
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  vi.restoreAllMocks()
})

describe('Gaming hub', () => {
  it('keeps all existing modes and profile reachable through real links', async () => {
    const { wrapper } = await setup(HomePage)
    expect(wrapper.get('[data-testid="home-solo"]').attributes('href')).toBe('/solo')
    expect(wrapper.get('[data-testid="home-group"]').attributes('href')).toBe('/groupe')
    expect(wrapper.get('[data-testid="home-ranked"]').attributes('href')).toBe('/competitif')
    expect(wrapper.get('[data-testid="home-profile"]').attributes('href')).toBe('/profil')
    expect(wrapper.get('.ranking-banner a').attributes('href')).toBe('/classement')
    expect(wrapper.get('.btn-play').attributes('href')).toBe('/solo')
    expect(wrapper.get('.hero-secondary').attributes('href')).toBe('#game-modes')
    expect(wrapper.findAll('h1')).toHaveLength(1)
  })

  it('translates mode content and calls to action reactively', async () => {
    const { wrapper, i18n } = await setup(HomePage)
    expect(wrapper.get('h1').text()).toContain(fr.arena.title)
    i18n.global.locale.value = 'en'
    await wrapper.vm.$nextTick()
    expect(wrapper.get('h1').text()).toContain(en.arena.title)
    expect(wrapper.get('[data-testid="home-group"]').text()).toContain(en.arena.group.title)
    expect(wrapper.get('.btn-play').text()).toContain(en.arena.play)
    expect(wrapper.get('#how-to-play').text()).toContain(en.arena.steps.answer.description)
    expect(wrapper.get('.topic-strip').text()).toContain(en.arena.topics.science)
    expect(wrapper.get('.character-speech').text()).toContain(en.arena.scene.greeting)
    expect(Object.keys(fr.arena).sort()).toEqual(Object.keys(en.arena).sort())
  })

  it('labels the mascot and keeps decorative artwork free of focusable elements', async () => {
    const { wrapper } = await setup(HomePage)
    const scene = wrapper.getComponent(KnowledgeScene)
    expect(scene.attributes('aria-label')).toBe(fr.arena.scene.label)
    expect(scene.get('[role="img"]').attributes('aria-label')).toBe(fr.arena.scene.description)
    expect(scene.get('canvas').attributes('aria-hidden')).toBe('true')
    expect(scene.get('.character-backdrop').findAll('button, a, input, [tabindex]')).toHaveLength(0)
    expect(wrapper.findAll('.mode-art[aria-hidden="true"]')).toHaveLength(3)
    expect(scene.findAll('.monkey-3d .monkey-mascot')).toHaveLength(1)
    expect(wrapper.findAll('.monkey-mascot[aria-hidden="true"][focusable="false"]')).toHaveLength(4)
  })

  it('gives every mascot unique gradient references when used together', async () => {
    const { wrapper } = await setup(HomePage)
    const ids = wrapper.findAll('.monkey-mascot [id]').map((node) => node.attributes('id'))
    expect(ids.length).toBeGreaterThan(0)
    expect(new Set(ids).size).toBe(ids.length)
    for (const node of wrapper.findAll('.monkey-mascot [fill^="url("]')) {
      const id = node.attributes('fill')?.slice(5, -1)
      expect(ids).toContain(id)
    }
  })

  it('explains the three existing game steps without pretending topics are controls', async () => {
    const { wrapper } = await setup(HomePage)
    expect(wrapper.findAll('#how-to-play ol li')).toHaveLength(3)
    expect(wrapper.findAll('.topic-chip')).toHaveLength(6)
    expect(wrapper.findAll('.topic-strip button, .topic-strip a')).toHaveLength(0)
    expect(wrapper.get('.hub-footer').text()).toContain('Monkizz')
  })
})

describe('Gaming navigation', () => {
  it('uses the Monkizz identity and links to the instructions from any page', async () => {
    const { wrapper } = await setup(HeaderBlock)
    expect(wrapper.get('.brand-lockup').attributes('aria-label')).toBe('Monkizz')
    expect(wrapper.get('.brand-lockup').attributes('href')).toBe('/')
    expect(wrapper.get('.brand-wordmark').text()).toBe('monkizz.')
    expect(wrapper.get('.desktop-nav a[href="/#how-to-play"]').text()).toBe(fr.arena.howToPlay)
  })
  it('offers login to visitors and profile to authenticated players', async () => {
    const { wrapper, pinia } = await setup(HeaderBlock)
    expect(wrapper.get('.header-account').attributes('href')).toBe('/connexion')
    const payload = btoa(JSON.stringify({ id: 'ui-test', exp: Date.now() / 1000 + 3600 }))
    useUserStore(pinia).token = `header.${payload}.signature`
    await wrapper.vm.$nextTick()
    expect(wrapper.get('.header-account').attributes('href')).toBe('/profil')
  })

  describe('Solo round presentation', () => {
    function party(revealed = false, correct = false) {
      return {
        nbQuestions: 2,
        score: correct ? 100 : 0,
        finish: false,
        partyDifficulty: [],
        partyTheme: [],
        partyQuestions: [
          {
            question: {
              label: 'Combien font 2 + 2 ?',
              answer: [
                { id: 1, value: '4', valid: revealed ? true : null },
                { id: 2, value: '5', valid: revealed ? false : null },
              ],
            },
            userPartyQuestion: { correct, idAnswer: revealed ? (correct ? 1 : 2) : null },
          },
        ],
      }
    }

    async function setupQuiz() {
      const result = await setup(SoloQuiz, (pinia) => {
        useThemeStore(pinia).list = []
        const solo = useSoloStore(pinia)
        solo.partyId = 'presentation-test'
        solo.partyInfo = party()
        vi.spyOn(solo, 'loadPartyInfo').mockResolvedValue(undefined)
        vi.spyOn(solo, 'loadAnswerById').mockImplementation(async (answerId) => {
          solo.partyInfo = party(true, answerId === 1)
        })
      })
      await flushPromises()
      return result
    }

    it('renders the question, answer choices, actual round count and accessible timer', async () => {
      const { wrapper } = await setupQuiz()
      expect(wrapper.get('.quiz-question-card h3').text()).toBe('Combien font 2 + 2 ?')
      expect(wrapper.findAll('.quiz-answer')).toHaveLength(2)
      expect(wrapper.findAll('.quiz-round-progress > span')).toHaveLength(2)
      expect(wrapper.findAll('.quiz-round-progress .is-current')).toHaveLength(1)
      expect(wrapper.get('[role="progressbar"]').attributes('aria-valuemax')).toBe('15')
      expect(wrapper.get('.quiz-feedback').text()).toBe('')
    })

    it.each([0, 1])(
      'locks answers and exposes non-color feedback for choice %i',
      async (choice) => {
        const { wrapper, pinia } = await setupQuiz()
        await wrapper.findAll('.quiz-answer')[choice].trigger('click')
        await flushPromises()
        expect(useSoloStore(pinia).loadAnswerById).toHaveBeenCalledOnce()
        expect(useSoloStore(pinia).loadAnswerById).toHaveBeenCalledWith(choice + 1)
        expect(wrapper.findAll('.quiz-answer:disabled')).toHaveLength(2)
        expect(wrapper.findAll('.quiz-answer')[0].text()).toContain(fr.arena.answerCorrect)
        if (choice === 1) {
          expect(wrapper.findAll('.quiz-answer')[1].text()).toContain(fr.arena.answerIncorrect)
        }
        expect(wrapper.get('.quiz-feedback').text()).not.toBe('')
        expect(wrapper.get('.quiz-arena-header').text()).toContain(choice === 0 ? '100' : '0')
      },
    )
  })

  it('opens the mobile menu with direct access to all game modes and closes on Escape', async () => {
    const { wrapper } = await setup(HeaderBlock)
    const toggle = wrapper.get('.mobile-menu-toggle')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(wrapper.findAll('#mobile-navigation a')).toHaveLength(6)
    await wrapper.get('header').trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('#mobile-navigation').exists()).toBe(false)
    expect(toggle.attributes('aria-expanded')).toBe('false')
  })

  it('closes the mobile menu when the route changes', async () => {
    const { wrapper, router } = await setup(HeaderBlock)
    await wrapper.get('.mobile-menu-toggle').trigger('click')
    await router.push('/solo')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('#mobile-navigation').exists()).toBe(false)
  })

  it('switches language through a labelled native select and saves the preference', async () => {
    const { wrapper, i18n } = await setup(HeaderBlock)
    const select = wrapper.get('select')
    expect(select.attributes('aria-label')).toBe('Langue')
    await select.setValue('en')
    expect(i18n.global.locale.value).toBe('en')
    expect(localStorage.getItem('locale')).toBe('en')
    expect(select.attributes('aria-label')).toBe('Language')
    expect(wrapper.get('.desktop-nav').text()).toContain('Play')
  })
})
