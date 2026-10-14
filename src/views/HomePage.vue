<template>
  <div id="home-page-section" class="home-shell px-5 py-10 sm:px-8 lg:py-16">
    <div class="mx-auto max-w-6xl">
      <div class="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
        <div class="max-w-2xl">
          <span class="eyebrow"><span class="eyebrow-dot" /> {{ $t('home.eyebrow') }}</span>
          <h1 class="mt-7 font-display text-[clamp(3.5rem,7vw,6.5rem)] font-bold leading-[0.99] tracking-[-0.075em] text-brand-lightGray">
            {{ $t('home.headlineFirst') }}<br />
            <span class="text-brand-orange">{{ $t('home.headlineSecond') }}</span>
          </h1>
          <p class="mt-7 max-w-lg text-lg leading-relaxed text-brand-gray sm:text-xl">
            {{ $t('home.subtitle') }}
          </p>
          <div class="mt-9 flex flex-wrap gap-3">
            <button data-testid="home-solo" class="btn btn-primary gap-3" @click="router.push({ name: 'SoloQuiz' })">
              {{ $t('home.playSolo') }} <font-awesome-icon icon="arrow-right-from-bracket" class="-rotate-45 text-sm" />
            </button>
            <button data-testid="home-group" class="btn btn-ghost" @click="router.push({ name: 'GroupMode' })">
              {{ $t('home.playGroup') }}
            </button>
          </div>
          <div class="mt-12 flex items-center gap-4 border-t border-brand-purple/20 pt-6 text-sm font-medium text-brand-gray">
            <span class="flex h-9 w-9 items-center justify-center rounded-full bg-brand-green/15 text-brand-green"><font-awesome-icon icon="lightbulb" /></span>
            {{ $t('home.tagline') }}
          </div>
        </div>

        <div class="showcase relative mx-auto w-full max-w-[490px]" aria-hidden="true">
          <div class="showcase-orbit showcase-orbit-outer" />
          <div class="showcase-orbit showcase-orbit-inner" />
          <span class="showcase-spark showcase-spark-one">✳</span>
          <span class="showcase-spark showcase-spark-two">✦</span>
          <div class="showcase-portrait"><img :src="monkizzMark" alt="" class="w-[68%] drop-shadow-xl" /></div>
          <div class="showcase-chip showcase-chip-top"><span class="text-brand-orange">✦</span> {{ $t('home.chipCuriosity') }}</div>
          <div class="showcase-chip showcase-chip-bottom"><span class="text-brand-green">●</span> {{ $t('home.chipChallenge') }}</div>
        </div>
      </div>

      <div class="mt-16 border-t border-brand-purple/20 pt-7 lg:mt-20">
        <div class="mb-5 flex items-center justify-between gap-4">
          <h2 class="font-display text-xl font-bold tracking-tight text-brand-lightGray">{{ $t('home.explore') }}</h2>
          <span class="text-xs font-bold uppercase tracking-[0.2em] text-brand-gray">{{ $t('home.chooseMode') }}</span>
        </div>
        <div class="grid gap-4 md:grid-cols-3">
          <button class="mode-card group" @click="router.push({ name: 'SoloQuiz' })">
            <span class="mode-card-number">01 / {{ $t('nav.solo') }}</span>
            <span class="mode-card-icon bg-brand-purple/15 text-brand-purple"><font-awesome-icon icon="bullseye" /></span>
            <span class="mode-card-title">{{ $t('home.soloTitle') }}</span>
            <span class="mode-card-description">{{ $t('home.soloDescription') }}</span>
            <span class="mode-card-arrow">↗</span>
          </button>
          <button class="mode-card group" @click="router.push({ name: 'GroupMode' })">
            <span class="mode-card-number">02 / {{ $t('nav.group') }}</span>
            <span class="mode-card-icon bg-brand-orange/15 text-brand-orange"><font-awesome-icon icon="users" /></span>
            <span class="mode-card-title">{{ $t('home.groupTitle') }}</span>
            <span class="mode-card-description">{{ $t('home.groupDescription') }}</span>
            <span class="mode-card-arrow">↗</span>
          </button>
          <button class="mode-card group" @click="router.push({ name: 'CompetitiveMode' })">
            <span class="mode-card-number">03 / {{ $t('nav.competitive') }}</span>
            <span class="mode-card-icon bg-brand-green/15 text-brand-green"><font-awesome-icon icon="trophy" /></span>
            <span class="mode-card-title">{{ $t('home.duelTitle') }}</span>
            <span class="mode-card-description">{{ $t('home.duelDescription') }}</span>
            <span class="mode-card-arrow">↗</span>
          </button>
        </div>
      </div>

      <footer class="mt-12 flex flex-wrap justify-between gap-4 border-t border-brand-purple/15 pt-6 text-xs text-brand-gray">
        <span>{{ $t('home.footer', { year: currentYear }) }}</span>
        <div class="flex gap-5">
          <button data-testid="home-profile" class="hover:text-brand-purple" @click="router.push({ name: 'Profile' })">{{ $t('nav.profile') }}</button>
          <button class="hover:text-brand-purple" @click="router.push({ name: 'Ranking' })">{{ $t('nav.ranking') }}</button>
          <span>V.{{ packageJson.version }}</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import monkizzMark from '@/assets/monkizz-mark.svg'
import packageJson from '../../package.json'

const router = useRouter()
const currentYear = new Date().getFullYear()
</script>

<style scoped>
.home-shell { background: radial-gradient(circle at 78% 20%, rgb(var(--accent-coral) / .09), transparent 35%), rgb(var(--surface-page)); }
.eyebrow { display: inline-flex; align-items: center; gap: .7rem; color: rgb(var(--accent-primary)); font-size: .73rem; font-weight: 800; text-transform: uppercase; letter-spacing: .19em; }
.eyebrow-dot { width: .6rem; height: .6rem; background: rgb(var(--accent-coral)); border-radius: 50%; }
.showcase { aspect-ratio: 1; display: grid; place-items: center; isolation: isolate; }
.showcase::before { content: ''; position: absolute; inset: 10%; border-radius: 35% 65% 51% 49% / 50% 42% 58% 50%; background: rgb(var(--accent-green) / .13); transform: rotate(-17deg); }
.showcase-orbit { position: absolute; border: 1px solid rgb(var(--accent-primary) / .2); border-radius: 50%; }
.showcase-orbit-outer { inset: 2%; transform: rotate(-25deg) scaleY(.78); }
.showcase-orbit-inner { inset: 13%; transform: rotate(35deg) scaleY(.81); }
.showcase-portrait { width: 64%; aspect-ratio: 1; display: grid; place-items: center; border-radius: 38% 62% 56% 44% / 48% 45% 55% 52%; background: #f4b191; transform: rotate(-9deg); box-shadow: 18px 22px 0 rgb(var(--accent-primary) / .13); }
.showcase-portrait img { transform: rotate(9deg); }
.showcase-chip { position: absolute; z-index: 1; display: flex; align-items: center; gap: .6rem; border: 1px solid rgb(var(--accent-primary) / .14); border-radius: 999px; padding: .65rem 1rem; background: rgb(var(--surface-card)); box-shadow: 0 12px 30px rgb(var(--shadow-color) / .12); color: rgb(var(--text-primary)); font: 700 .8rem 'DM Sans', sans-serif; }
.showcase-chip-top { top: 17%; right: -1%; transform: rotate(7deg); }
.showcase-chip-bottom { bottom: 14%; left: -2%; transform: rotate(-6deg); }
.showcase-spark { position: absolute; color: rgb(var(--accent-coral)); font-size: 2rem; }
.showcase-spark-one { top: 12%; left: 13%; }.showcase-spark-two { bottom: 13%; right: 10%; color: rgb(var(--accent-green)); }
.mode-card { position: relative; display: flex; min-height: 240px; flex-direction: column; align-items: flex-start; text-align: left; padding: 1.5rem; border: 1px solid rgb(var(--accent-primary) / .15); border-radius: 1.5rem; background: rgb(var(--surface-card)); color: rgb(var(--text-primary)); transition: transform .2s, border-color .2s, box-shadow .2s; }
.mode-card:hover { transform: translateY(-4px); border-color: rgb(var(--accent-primary) / .45); box-shadow: 0 16px 36px rgb(var(--shadow-color) / .1); }
.mode-card-number { color: rgb(var(--text-muted)); font-size: .7rem; font-weight: 800; text-transform: uppercase; letter-spacing: .13em; }
.mode-card-icon { display: grid; place-items: center; width: 2.8rem; height: 2.8rem; margin-top: 1.3rem; border-radius: .95rem; font-size: 1.15rem; }
.mode-card-title { margin-top: .8rem; font: 700 1.45rem 'Space Grotesk', sans-serif; letter-spacing: -.04em; }
.mode-card-description { margin-top: .3rem; max-width: 15rem; color: rgb(var(--text-muted)); font-size: .87rem; line-height: 1.5; }
.mode-card-arrow { position: absolute; right: 1.5rem; bottom: 1.5rem; color: rgb(var(--accent-primary)); font-size: 1.4rem; }
@media (max-width: 1023px) { .showcase { max-width: 340px; } }
</style>
