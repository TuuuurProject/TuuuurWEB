<template>
  <div id="home-page-section" class="mx-auto max-w-6xl px-6 py-10 md:py-14 flex flex-col gap-14">
    <!-- Hero : action immédiate pour le joueur occasionnel -->
    <section class="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div class="flex flex-col items-start gap-6">
        <h1 class="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl leading-[1.05]">
          <template v-if="userStore.isLogged && userStore.userInfo?.nickName">
            {{ $t('home.heroTitleLogged', { name: userStore.userInfo.nickName }) }}
          </template>
          <template v-else>{{ $t('home.heroTitle') }}</template>
        </h1>
        <p class="max-w-xl text-brand-muted text-lg">{{ $t('home.subtitle') }}</p>
        <div class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <button
            data-testid="home-solo"
            class="btn btn-primary w-full text-lg py-4 px-7 sm:w-auto"
            @click="router.push({ name: 'SoloQuiz' })"
          >
            <font-awesome-icon icon="play" class="mr-2" /> {{ $t('home.playSolo') }}
          </button>
          <button
            data-testid="home-group"
            class="btn btn-ghost w-full text-lg py-4 px-7 sm:w-auto"
            @click="router.push({ name: 'GroupMode' })"
          >
            <font-awesome-icon icon="users" class="mr-2" /> {{ $t('home.playGroup') }}
          </button>
        </div>
      </div>

      <!-- Joueur connecté : la mascotte l'accueille avec un mot sur sa dernière partie -->
      <div
        v-if="userStore.isLogged"
        class="flex flex-col items-center gap-3"
        data-testid="home-mascot"
      >
        <p
          class="mascot-bubble relative max-w-sm rounded-3xl bg-brand-surface border border-brand-line px-6 py-4 text-lg font-semibold shadow-card"
        >
          {{ mascotMessage }}
        </p>
        <monkizz-mascot :size="280" animated class="w-56 lg:w-72" />
      </div>

      <!-- Visiteur : un exemple de question montre le jeu (décoratif) -->
      <div v-else class="surface-card flex flex-col gap-4" aria-hidden="true">
        <div class="flex items-center justify-between gap-3">
          <span class="text-sm font-semibold text-brand-muted">
            {{ $t('home.preview.label') }}
          </span>
          <div class="flex gap-2">
            <span class="rounded-full bg-brand-surface2 px-3 py-1 text-xs font-semibold">
              {{ $t('home.preview.theme') }}
            </span>
            <span
              class="rounded-full bg-diff-medium/15 text-diff-medium px-3 py-1 text-xs font-semibold"
            >
              {{ $t('home.preview.difficulty') }}
            </span>
          </div>
        </div>
        <div class="h-2 rounded-full bg-brand-surface2 overflow-hidden">
          <div class="h-full w-3/5 rounded-full bg-brand-green"></div>
        </div>
        <p class="font-branding text-2xl font-bold leading-snug">
          {{ $t('home.preview.question') }}
        </p>
        <div class="grid gap-3 sm:grid-cols-2">
          <div
            v-for="(answer, index) in previewAnswers"
            :key="answer"
            class="flex items-center gap-3 rounded-2xl border-2 px-4 py-3 font-semibold"
            :class="
              index === 1
                ? 'border-brand-green bg-brand-green/10 text-brand-ink'
                : 'border-brand-line text-brand-ink'
            "
          >
            <span
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
              :class="
                index === 1 ? 'bg-brand-green text-brand-bg' : 'bg-brand-surface2 text-brand-muted'
              "
            >
              <font-awesome-icon v-if="index === 1" icon="check" />
              <template v-else>{{ index + 1 }}</template>
            </span>
            {{ answer }}
          </div>
        </div>
        <p class="text-sm font-bold text-brand-green">
          <font-awesome-icon icon="check-circle" class="mr-1" /> {{ $t('home.preview.correct') }}
        </p>
      </div>
    </section>

    <!-- Modes de jeu -->
    <section class="flex flex-col gap-5" aria-labelledby="home-modes-title">
      <h2 id="home-modes-title" class="text-2xl font-bold">{{ $t('home.modes.title') }}</h2>
      <div class="grid gap-4 md:grid-cols-3">
        <button
          v-for="mode in modes"
          :key="mode.key"
          :data-testid="`home-mode-${mode.key}`"
          class="menu-card group flex flex-col items-start gap-4 text-left"
          @click="router.push({ name: mode.route })"
        >
          <span
            class="flex h-12 w-12 items-center justify-center rounded-2xl text-xl"
            :class="mode.iconClass"
          >
            <font-awesome-icon :icon="mode.icon" />
          </span>
          <span class="flex flex-col gap-1">
            <span class="font-branding text-xl font-bold">{{
              $t(`home.modes.${mode.key}.title`)
            }}</span>
            <span class="text-brand-muted">{{ $t(`home.modes.${mode.key}.description`) }}</span>
          </span>
          <span class="mt-auto flex w-full items-center justify-between text-sm font-semibold">
            <span class="text-brand-muted">{{ $t(`home.modes.${mode.key}.meta`) }}</span>
            <font-awesome-icon
              icon="chevron-right"
              class="text-brand-muted transition-transform group-hover:translate-x-1 group-hover:text-brand-purple"
            />
          </span>
        </button>
      </div>
    </section>

    <!-- Progression : ce que le joueur régulier vient chercher -->
    <section
      v-if="userStore.isLogged"
      class="flex flex-col gap-5"
      aria-labelledby="home-progress-title"
    >
      <h2 id="home-progress-title" class="text-2xl font-bold">{{ $t('home.progress.title') }}</h2>
      <div class="grid gap-4 md:grid-cols-3">
        <div class="surface-card flex flex-col gap-1">
          <span class="text-sm font-semibold text-brand-muted">
            <font-awesome-icon icon="trophy" class="mr-1 text-brand-yellow" />
            {{ $t('home.progress.elo') }}
          </span>
          <span class="font-display text-4xl font-extrabold tabular-nums">
            {{ userStore.userInfo?.globalElo ?? rankedStore.rankingData?.userElo ?? '—' }}
          </span>
        </div>
        <div class="surface-card flex flex-col gap-1">
          <span class="text-sm font-semibold text-brand-muted">
            <font-awesome-icon icon="ranking-star" class="mr-1 text-brand-purple" />
            {{ $t('home.progress.rank') }}
          </span>
          <template v-if="rankedStore.rankingData?.userRanking">
            <span class="font-display text-4xl font-extrabold tabular-nums">
              #{{ rankedStore.rankingData.userRanking }}
            </span>
            <span class="text-sm text-brand-muted">
              {{ $t('home.progress.rankTotal', { total: rankedStore.rankingData.totalUsers }) }}
            </span>
          </template>
          <span v-else class="font-semibold text-brand-muted">{{
            $t('home.progress.unranked')
          }}</span>
        </div>
        <div class="surface-card flex flex-col gap-1">
          <span class="text-sm font-semibold text-brand-muted">
            <font-awesome-icon icon="clock-rotate-left" class="mr-1 text-brand-green" />
            {{ $t('home.progress.lastGame') }}
          </span>
          <template v-if="lastGame">
            <span class="font-display text-4xl font-extrabold tabular-nums">
              {{ $t('home.progress.points', { score: lastGame.score }) }}
            </span>
            <span class="text-sm text-brand-muted">
              {{
                $t('home.progress.lastGameMeta', {
                  mode: modeLabel(lastGame.partyType?.id, 'name'),
                  date: lastGameDate,
                })
              }}
            </span>
          </template>
          <span v-else class="font-semibold text-brand-muted">{{ $t('home.progress.noGame') }}</span>
        </div>
      </div>
      <div class="flex flex-wrap gap-3">
        <button
          data-testid="home-profile"
          class="btn btn-ghost"
          @click="router.push({ name: 'Profile' })"
        >
          <font-awesome-icon icon="user" class="mr-2" /> {{ $t('home.progress.seeProfile') }}
        </button>
        <button class="btn btn-ghost" @click="router.push({ name: 'Ranking' })">
          <font-awesome-icon icon="ranking-star" class="mr-2" />
          {{ $t('home.progress.seeRanking') }}
        </button>
      </div>
    </section>

    <!-- Invitation à créer un compte -->
    <section
      v-else
      class="surface-card flex flex-col gap-6 md:flex-row md:items-center md:justify-between"
    >
      <div class="flex flex-col gap-2">
        <h2 class="text-2xl font-bold">{{ $t('home.guest.title') }}</h2>
        <p class="max-w-2xl text-brand-muted">{{ $t('home.guest.text') }}</p>
      </div>
      <div class="flex flex-wrap gap-3 md:shrink-0">
        <button class="btn btn-primary" @click="router.push({ name: 'Register' })">
          <font-awesome-icon icon="user-plus" class="mr-2" /> {{ $t('home.guest.register') }}
        </button>
        <button
          data-testid="home-profile"
          class="btn btn-ghost"
          @click="router.push({ name: 'Profile' })"
        >
          <font-awesome-icon icon="sign-in-alt" class="mr-2" /> {{ $t('home.guest.login') }}
        </button>
      </div>
    </section>

    <footer class="text-center text-xs text-brand-muted">
      {{ $t('home.footer', { year: currentYear, version: packageJson.version }) }}
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import packageJson from '../../package.json'
import useUserStore from '@/stores/user'
import useRankedStore from '@/stores/ranked'
import useHistoryStore from '@/stores/history'
import MonkizzMascot from '@/components/mascot/MonkizzMascot.vue'
import { partyModeKey } from '@/services/partyTypes'

dayjs.extend(relativeTime)
dayjs.extend(utc)

const router = useRouter()
const { t, locale } = useI18n()
const userStore = useUserStore()
const rankedStore = useRankedStore()
const historyStore = useHistoryStore()
const currentYear = new Date().getFullYear()

const previewAnswers = computed(() => [
  t('home.preview.answer1'),
  t('home.preview.answer2'),
  t('home.preview.answer3'),
  t('home.preview.answer4'),
])

const modes = [
  {
    key: 'solo',
    route: 'SoloQuiz',
    icon: 'bullseye',
    iconClass: 'bg-brand-purple/15 text-brand-purple',
  },
  {
    key: 'group',
    route: 'GroupMode',
    icon: 'users',
    iconClass: 'bg-brand-orange/15 text-brand-orange',
  },
  {
    key: 'ranked',
    route: 'CompetitiveMode',
    icon: 'bolt',
    iconClass: 'bg-brand-green/15 text-brand-green',
  },
]

const lastGame = computed(() => historyStore.historyList?.[0] ?? null)

const lastGameDate = computed(() => {
  if (!lastGame.value) return ''
  return dayjs.utc(lastGame.value.dt).local().locale(locale.value).fromNow()
})

const modeLabel = (id: number | undefined, form: 'name' | 'inline') =>
  t(`home.partyModes.${form}.${partyModeKey(id)}`)

const mascotMessage = computed(() => {
  if (!lastGame.value) return t('home.mascot.firstGame')
  return t('home.mascot.lastGame', {
    score: lastGame.value.score,
    mode: modeLabel(lastGame.value.partyType?.id, 'inline'),
  })
})

const loadProgress = () => {
  if (!userStore.isLogged) return
  userStore.getUserInfo()
  rankedStore.loadRanking(1, 1)
  historyStore.getHistory(1, 1)
}

onMounted(loadProgress)
watch(() => userStore.isLogged, loadProgress)
</script>

<style scoped>
.mascot-bubble::after {
  content: '';
  position: absolute;
  bottom: -9px;
  left: 50%;
  width: 18px;
  height: 18px;
  transform: translateX(-50%) rotate(45deg);
  background: rgb(var(--c-surface));
  border-right: 1px solid rgb(var(--c-line));
  border-bottom: 1px solid rgb(var(--c-line));
}
</style>
