<template>
  <div id="home-page-section" class="home-hub">
    <section class="home-hero" aria-labelledby="home-title">
      <div class="hero-copy">
        <p class="eyebrow"><span class="status-dot" /> {{ $t('arena.eyebrow') }}</p>
        <h1 id="home-title">
          {{ $t('arena.title') }}<br />
          <span>{{ $t('arena.titleAccent') }}</span>
        </h1>
        <p class="hero-description">{{ $t('arena.description') }}</p>
        <div class="hero-actions">
          <router-link :to="{ name: 'SoloQuiz' }" class="btn btn-play">
            <font-awesome-icon icon="play" aria-hidden="true" />
            {{ $t('arena.play') }}
            <font-awesome-icon icon="chevron-right" aria-hidden="true" />
          </router-link>
          <a href="#game-modes" class="hero-secondary">
            {{ $t('arena.explore') }}
            <font-awesome-icon icon="arrow-down" aria-hidden="true" />
          </a>
        </div>
        <div class="hero-footnote">
          <span class="hero-mini-icons" aria-hidden="true">
            <font-awesome-icon icon="bolt" />
            <font-awesome-icon icon="lightbulb" />
            <font-awesome-icon icon="star" />
          </span>
          <span>{{ $t('arena.footnote') }}</span>
        </div>
      </div>
      <KnowledgeScene />
    </section>

    <div class="topic-strip">
      <span class="topic-strip-label">{{ $t('arena.topicsLabel') }}</span>
      <span v-for="topic in topics" :key="topic.key" class="topic-chip">
        <font-awesome-icon :icon="topic.icon" aria-hidden="true" />
        {{ $t(`arena.topics.${topic.key}`) }}
      </span>
    </div>

    <section id="game-modes" class="mode-section" aria-labelledby="modes-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">{{ $t('arena.modesEyebrow') }}</p>
          <h2 id="modes-title">{{ $t('arena.modesTitle') }}</h2>
        </div>
        <span class="section-aside">{{ $t('arena.modesAside') }}</span>
      </div>
      <div class="mode-grid">
        <router-link
          v-for="mode in modes"
          :key="mode.id"
          :to="{ name: mode.route }"
          :data-testid="`home-${mode.id}`"
          class="mode-card"
          :class="`mode-card--${mode.id}`"
        >
          <div class="mode-card-top">
            <span class="mode-label">{{ $t(`arena.${mode.id}.tag`) }}</span>
            <span class="mode-number" aria-hidden="true">{{ mode.number }}</span>
          </div>
          <ModeArtwork :variant="mode.id" />
          <div class="mode-card-copy">
            <p class="mode-meta">{{ $t(`arena.${mode.id}.meta`) }}</p>
            <h3>{{ $t(`arena.${mode.id}.title`) }}</h3>
            <p class="mode-description">{{ $t(`arena.${mode.id}.description`) }}</p>
            <div class="mode-card-action">
              <span>{{ $t(mode.action) }}</span>
              <span class="mode-arrow">
                <font-awesome-icon icon="chevron-right" aria-hidden="true" />
              </span>
            </div>
          </div>
        </router-link>
      </div>
    </section>

    <section id="how-to-play" class="how-to-play" aria-labelledby="how-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">{{ $t('arena.howEyebrow') }}</p>
          <h2 id="how-title">{{ $t('arena.howTitle') }}</h2>
        </div>
        <span class="section-aside">{{ $t('arena.howAside') }}</span>
      </div>
      <ol class="how-grid">
        <li v-for="(step, index) in steps" :key="step">
          <span class="how-number" aria-hidden="true">0{{ index + 1 }}</span>
          <div>
            <h3>{{ $t(`arena.steps.${step}.title`) }}</h3>
            <p>{{ $t(`arena.steps.${step}.description`) }}</p>
          </div>
        </li>
      </ol>
    </section>

    <section class="ranking-banner" aria-labelledby="ranking-title">
      <div class="ranking-medal" aria-hidden="true">
        <font-awesome-icon icon="trophy" />
      </div>
      <div class="ranking-banner-copy">
        <p class="eyebrow">{{ $t('arena.rankingEyebrow') }}</p>
        <h2 id="ranking-title">{{ $t('arena.rankingTitle') }}</h2>
        <p>{{ $t('arena.rankingDescription') }}</p>
      </div>
      <router-link :to="{ name: 'Ranking' }" class="btn btn-ghost">
        {{ $t('arena.viewRanking') }}
        <font-awesome-icon icon="chevron-right" aria-hidden="true" />
      </router-link>
    </section>

    <footer class="hub-footer">
      <span>{{ $t('home.footer', { year: currentYear }) }} · V.{{ packageJson.version }}</span>
      <span class="footer-motto">{{ $t('arena.footer') }}</span>
      <router-link data-testid="home-profile" :to="{ name: 'Profile' }">
        <font-awesome-icon icon="user" aria-hidden="true" /> {{ $t('nav.profile') }}
      </router-link>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import KnowledgeScene from '@/components/gaming/KnowledgeScene.vue'
import ModeArtwork from '@/components/gaming/ModeArtwork.vue'
import packageJson from '../../package.json'

const currentYear = new Date().getFullYear()
const topics = [
  { key: 'science', icon: 'flask' },
  { key: 'cinema', icon: 'film' },
  { key: 'history', icon: 'university' },
  { key: 'music', icon: 'music' },
  { key: 'sport', icon: 'medal' },
  { key: 'art', icon: 'palette' },
] as const
const steps = ['choose', 'answer', 'replay'] as const
const modes = [
  { id: 'solo', number: '01', route: 'SoloQuiz', action: 'home.playSolo' },
  { id: 'group', number: '02', route: 'GroupMode', action: 'home.playGroup' },
  { id: 'ranked', number: '03', route: 'CompetitiveMode', action: 'home.competitiveMode' },
] as const
</script>
