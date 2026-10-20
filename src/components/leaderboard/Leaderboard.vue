<template>
  <section class="flex flex-col gap-6">
    <header class="flex flex-col gap-2">
      <h2 class="text-3xl font-bold">{{ $t('leaderboard.title') }}</h2>
      <p class="max-w-2xl text-brand-muted">{{ $t('leaderboard.intro') }}</p>
    </header>

    <!-- Pas connecté -->
    <div v-if="!userStore.isLogged && !userStore.isLoggedAsInvited" class="surface-card">
      <LoggedInBlock :message="$t('leaderboard.notLoggedIn')" />
    </div>

    <!-- Chargement -->
    <div v-else-if="rankedStore.isRankingLoading" class="surface-card py-12 text-center">
      <font-awesome-icon icon="circle-notch" spin class="mb-4 text-3xl text-brand-purple" />
      <p class="text-brand-muted">{{ $t('common.loading') }}</p>
    </div>

    <!-- Personne n'est classé -->
    <div
      v-else-if="entries.length === 0"
      class="surface-card flex flex-col items-center gap-5 py-10 text-center"
    >
      <mascot-speech :message="$t('leaderboard.empty')" :size="180" />
      <router-link :to="{ name: 'CompetitiveMode' }" class="btn btn-primary">
        <font-awesome-icon icon="bolt" class="mr-2" /> {{ $t('leaderboard.playRanked') }}
      </router-link>
    </div>

    <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <results-podium
        class="min-w-0"
        :entries="entries"
        :title="$t('leaderboard.topPlayers')"
        :me-id="currentUserId"
        :unit="$t('leaderboard.eloLabel')"
      />

      <!-- Position du joueur, toujours visible -->
      <aside
        class="surface-card order-first flex flex-col gap-4 lg:sticky lg:top-24 lg:order-none"
        aria-labelledby="leaderboard-me-title"
      >
        <h3 id="leaderboard-me-title" class="text-xl font-bold">
          {{ $t('leaderboard.yourPosition') }}
        </h3>
        <div class="flex items-center gap-3">
          <player-avatar
            :name="userStore.userInfo?.nickName"
            :avatar="userStore.userInfo?.avatar"
            size="lg"
          />
          <span class="min-w-0 truncate text-lg font-bold">{{ userStore.userInfo?.nickName }}</span>
        </div>
        <dl class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1 rounded-2xl bg-brand-surface2/60 p-3">
            <dt class="text-sm font-semibold text-brand-muted">{{ $t('home.progress.rank') }}</dt>
            <dd class="font-display text-3xl font-extrabold tabular-nums">
              {{ myRanking > 0 ? `#${myRanking}` : '—' }}
            </dd>
          </div>
          <div class="flex flex-col gap-1 rounded-2xl bg-brand-surface2/60 p-3">
            <dt class="text-sm font-semibold text-brand-muted">{{ $t('home.progress.elo') }}</dt>
            <dd class="font-display text-3xl font-extrabold tabular-nums">
              {{ rankedStore.rankingData?.userElo ?? '—' }}
            </dd>
          </div>
        </dl>
        <p class="text-sm text-brand-muted">
          <template v-if="myRanking > 0">
            {{ $t('home.progress.rankTotal', { total: rankedStore.rankingData?.totalUsers }) }}
          </template>
          <template v-else>{{ $t('leaderboard.unrankedHint') }}</template>
        </p>
        <router-link :to="{ name: 'CompetitiveMode' }" class="btn btn-primary w-full">
          <font-awesome-icon icon="bolt" class="mr-2" /> {{ $t('leaderboard.playRanked') }}
        </router-link>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import useRankedStore from '@/stores/ranked'
import useUserStore from '@/stores/user'
import LoggedInBlock from '@/components/LoggedInBlock.vue'
import ResultsPodium from '@/components/game/ResultsPodium.vue'
import PlayerAvatar from '@/components/game/PlayerAvatar.vue'
import MascotSpeech from '@/components/mascot/MascotSpeech.vue'
import type { RankingEntry } from '@/components/game/LiveRanking.vue'

const rankedStore = useRankedStore()
const userStore = useUserStore()

const currentUserId = computed(() =>
  userStore.isLogged
    ? userStore.userId
    : userStore.isLoggedAsInvited
      ? userStore.userIdInvited
      : null,
)

const entries = computed<RankingEntry[]>(() =>
  (rankedStore.rankingData?.users ?? []).map((user) => ({
    id: user.id,
    name: user.nickName,
    avatar: user.avatar,
    score: user.globalElo,
  })),
)

const myRanking = computed(() => rankedStore.rankingData?.userRanking ?? 0)

onMounted(async () => {
  userStore.getUserInfo()
  await rankedStore.loadRanking()
})
</script>
