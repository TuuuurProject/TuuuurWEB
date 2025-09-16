<template>
  <section class="space-y-8">
    <header class="flex items-center justify-between">
      <h2 class="font-display text-3xl text-brand-lightGray glow-text">🏆 Classement Gaming</h2>
      <div class="badge-warning animate-pulse-slow">Top 20 Légendes</div>
    </header>

    <!-- Podium top 3 avec effets gaming -->
    <div class="grid gap-4 md:grid-cols-3 items-end">
      <!-- 2ème place -->
      <div
        class="order-2 md:order-1 gaming-card flex flex-col items-center transform hover:scale-105 transition-transform"
      >
        <div class="text-brand-orange mb-3 animate-bounce-slow">
          <svg viewBox="0 0 24 24" class="h-8 w-8" fill="currentColor">
            <path
              d="M17 3h4v4a5 5 0 0 1-5 5h-1.28A6 6 0 0 1 7 7V3h4a1 1 0 0 0 1-1h4a1 1 0 0 0 1 1Z"
            />
          </svg>
        </div>
        <div class="relative">
          <img
            :src="avatar(top[1].name)"
            :alt="top[1].name"
            class="h-16 w-16 rounded-full border-2 border-brand-orange shadow-neon-orange mb-3 bg-brand-darkGray"
          />
          <div
            class="absolute -top-1 -right-1 w-6 h-6 bg-brand-orange rounded-full flex items-center justify-center text-white text-xs font-bold"
          >
            2
          </div>
        </div>
        <div class="font-display text-2xl text-brand-lightGray">#2 {{ top[1].name }}</div>
        <div
          class="pill bg-brand-orange/20 border-brand-orange/40 text-brand-orange font-bold mt-2"
        >
          🔥 {{ top[1].elo }} Élo
        </div>
      </div>

      <!-- 1ère place -->
      <div
        class="order-1 md:order-2 gaming-card flex flex-col items-center scale-110 shadow-neon transform hover:scale-115 transition-transform"
      >
        <div class="text-brand-yellow mb-3 animate-float">
          <svg viewBox="0 0 24 24" class="h-12 w-12" fill="currentColor">
            <path
              d="M17 3h4v4a5 5 0 0 1-5 5h-1.28A6 6 0 0 1 7 7V3h4a1 1 0 0 0 1-1h4a1 1 0 0 0 1 1Z"
            />
          </svg>
        </div>
        <div class="relative">
          <img
            :src="avatar(top[0].name)"
            :alt="top[0].name"
            class="h-20 w-20 rounded-full border-4 border-brand-yellow shadow-glow mb-3 bg-brand-darkGray"
          />
          <div
            class="absolute -top-2 -right-2 w-8 h-8 bg-brand-yellow rounded-full flex items-center justify-center text-brand-dark text-sm font-bold animate-pulse-slow"
          >
            1
          </div>
          <div
            class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-brand-green rounded-full border-2 border-brand-darkGray"
          >
            <span class="text-xs">👑</span>
          </div>
        </div>
        <div class="font-display text-3xl text-brand-lightGray glow-text">#1 {{ top[0].name }}</div>
        <div
          class="pill bg-brand-yellow/20 border-brand-yellow/40 text-brand-yellow font-bold mt-2"
        >
          ⭐ {{ top[0].elo }} Élo
        </div>
      </div>

      <!-- 3ème place -->
      <div
        class="order-3 gaming-card flex flex-col items-center transform hover:scale-105 transition-transform"
      >
        <div class="text-brand-gray mb-3 animate-wiggle">
          <svg viewBox="0 0 24 24" class="h-7 w-7" fill="currentColor">
            <path
              d="M17 3h4v4a5 5 0 0 1-5 5h-1.28A6 6 0 0 1 7 7V3h4a1 1 0 0 0 1-1h4a1 1 0 0 0 1 1Z"
            />
          </svg>
        </div>
        <div class="relative">
          <img
            :src="avatar(top[2].name)"
            :alt="top[2].name"
            class="h-14 w-14 rounded-full border-2 border-brand-gray shadow-card mb-3 bg-brand-darkGray"
          />
          <div
            class="absolute -top-1 -right-1 w-6 h-6 bg-brand-gray rounded-full flex items-center justify-center text-brand-dark text-xs font-bold"
          >
            3
          </div>
        </div>
        <div class="font-display text-xl text-brand-lightGray">#3 {{ top[2].name }}</div>
        <div class="pill bg-brand-gray/20 border-brand-gray/40 text-brand-gray font-bold mt-2">
          🥉 {{ top[2].elo }} Élo
        </div>
      </div>
    </div>

    <!-- Liste du classement avec style gaming -->
    <div class="gaming-card">
      <div class="flex items-center gap-3 mb-4 pb-4 border-b border-brand-purple/20">
        <div
          class="w-8 h-8 rounded-xl bg-brand-purple/20 flex items-center justify-center text-brand-purple"
        >
          📊
        </div>
        <h3 class="font-display text-xl text-brand-lightGray">Classement Complet</h3>
        <div class="ml-auto badge-info">Mise à jour en temps réel</div>
      </div>

      <ul class="space-y-2">
        <li
          v-for="p in rest"
          :key="p.rank"
          class="group py-3 px-4 flex items-center gap-4 hover:bg-brand-purple/10 rounded-2xl transition-all duration-200 hover:shadow-card border border-transparent hover:border-brand-purple/20"
        >
          <div class="w-12 h-8 flex items-center justify-center">
            <span
              class="font-display text-lg font-bold"
              :class="p.rank <= 10 ? 'text-brand-purple' : 'text-brand-gray'"
            >
              #{{ p.rank }}
            </span>
          </div>
          <div class="relative">
            <img
              :src="avatar(p.name)"
              :alt="p.name"
              class="h-10 w-10 rounded-full border border-brand-purple/30 bg-brand-darkGray group-hover:border-brand-purple/60 transition-colors"
            />
            <div
              v-if="p.rank <= 5"
              class="absolute -top-1 -right-1 w-4 h-4 bg-brand-green rounded-full flex items-center justify-center"
            >
              <span class="text-xs">🔥</span>
            </div>
          </div>
          <div class="flex-1">
            <div
              class="font-semibold text-brand-lightGray group-hover:text-white transition-colors truncate"
            >
              {{ p.name }}
            </div>
            <div v-if="p.rank <= 5" class="text-xs text-brand-green">Champion actuel</div>
            <div v-else-if="p.rank <= 10" class="text-xs text-brand-orange">Challenger</div>
            <div v-else class="text-xs text-brand-gray">Joueur confirmé</div>
          </div>
          <div
            class="pill font-bold"
            :class="
              p.rank <= 5
                ? 'bg-brand-green/20 border-brand-green/40 text-brand-green'
                : p.rank <= 10
                  ? 'bg-brand-orange/20 border-brand-orange/40 text-brand-orange'
                  : 'bg-brand-purple/20 border-brand-purple/40 text-brand-purple'
            "
          >
            ⚡ {{ p.elo }}
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

function avatar(name: string) {
  const seed = encodeURIComponent(name)
  return `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${seed}`
}

interface Player {
  rank: number
  name: string
  elo: number
}
const players: Player[] = Array.from({ length: 20 }, (_, i) => ({
  rank: i + 1,
  name: [
    'Ava',
    'Liam',
    'Emma',
    'Noah',
    'Mia',
    'Lucas',
    'Zoé',
    'Leo',
    'Luna',
    'Hugo',
    'Chloé',
    'Nina',
    'Evan',
    'Jade',
    'Axel',
    'Léa',
    'Sacha',
    'Maël',
    'Eva',
    'Yanis',
  ][i],
  elo: 1400 + Math.round((20 - i) * 12 + Math.random() * 25),
}))

const top = computed(() => players.slice(0, 3))
const rest = computed(() => players.slice(3))
</script>
