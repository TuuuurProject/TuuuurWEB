<template>
  <overlay-block :loading="historyStore.isLoading">
    <div class="flex flex-col gap-5">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <h3 class="text-xl font-bold">{{ $t('profile.matchHistory.title') }}</h3>
        <dl class="flex gap-6">
          <div class="flex flex-col">
            <dt class="text-sm font-semibold text-brand-muted">
              {{ $t('profile.matchHistory.played') }}
            </dt>
            <dd class="font-display text-2xl font-extrabold tabular-nums">
              {{ historyStore.nbParties || 0 }}
            </dd>
          </div>
          <div v-if="stats.avgPercent !== null" class="flex flex-col">
            <dt class="text-sm font-semibold text-brand-muted">
              {{ $t('game.results.successRate') }}
            </dt>
            <dd class="font-display text-2xl font-extrabold tabular-nums text-brand-green">
              {{ stats.avgPercent }} %
            </dd>
          </div>
        </dl>
      </div>

      <!-- Filtres par mode -->
      <div
        class="segmented sm:max-w-md"
        role="group"
        :aria-label="$t('profile.matchHistory.filterLabel')"
      >
        <button
          v-for="filter in filters"
          :key="filter.value"
          type="button"
          role="radio"
          :aria-checked="selectedFilter === filter.id"
          class="text-sm"
          @click="selectedFilter = filter.id"
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- Parties -->
      <ul class="flex flex-col divide-y divide-brand-line">
        <li v-for="match in filteredMatches" :key="match.filterKey">
          <button
            type="button"
            class="match-item -mx-3 flex w-[calc(100%+1.5rem)] items-center gap-4 rounded-2xl px-3 py-4 text-left"
            :class="{ 'pointer-events-none opacity-50': historyStore.isLoading }"
            @click="showMatchDetails(match)"
          >
            <span
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg"
              :class="modeIconClass[partyModeKey(match.partyType.id)]"
            >
              <font-awesome-icon :icon="PARTY_MODE_ICON[partyModeKey(match.partyType.id)]" />
            </span>

            <span class="flex min-w-0 flex-1 flex-col gap-1">
              <span class="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span class="font-bold">
                  {{ $t(`home.partyModes.name.${partyModeKey(match.partyType.id)}`) }}
                </span>
                <span
                  v-for="pd in match.partyDifficulty"
                  :key="pd.id"
                  class="rounded-full px-2 py-0.5 text-xs font-semibold"
                  :class="difficultyChip[pd.idDifficulty] ?? 'bg-brand-surface2 text-brand-muted'"
                >
                  {{ pd.difficulty.label }}
                </span>
                <span
                  v-if="!match.finish"
                  class="rounded-full bg-brand-purple/15 px-2 py-0.5 text-xs font-semibold text-brand-purple"
                >
                  {{ $t('profile.matchHistory.inProgress') }}
                </span>
              </span>
              <span class="truncate text-sm text-brand-muted">
                {{ themesLabel(match.partyTheme) }}
              </span>
              <span class="text-sm text-brand-muted">{{ metaLine(match) }}</span>
            </span>

            <span class="flex shrink-0 flex-col items-end">
              <span class="font-display text-2xl font-extrabold tabular-nums">
                {{ match.score }}
                <span class="text-sm font-semibold text-brand-muted">{{
                  $t('game.hud.points')
                }}</span>
              </span>
              <span
                v-if="match.percent !== undefined"
                class="text-sm font-bold tabular-nums"
                :class="percentClass(match.percent)"
              >
                {{ Math.round(match.percent ?? 0) }} %
              </span>
            </span>
            <font-awesome-icon
              icon="chevron-right"
              class="hidden shrink-0 text-brand-muted sm:block"
            />
          </button>
        </li>
      </ul>

      <p
        v-if="filteredMatches.length === 0"
        class="rounded-2xl border-2 border-dashed border-brand-line p-8 text-center text-brand-muted"
      >
        {{ $t('profile.matchHistory.noMatches') }}
      </p>

      <!-- Pagination -->
      <nav
        v-if="historyStore.totalPages > 1"
        class="flex items-center justify-between gap-3"
        :aria-label="$t('profile.matchHistory.pagination.label')"
      >
        <button
          type="button"
          class="btn btn-ghost px-4 py-2"
          :disabled="historyStore.currentPage === 1 || historyStore.isLoading"
          @click="goToPage(historyStore.currentPage - 1)"
        >
          <font-awesome-icon icon="chevron-left" class="mr-2" />
          {{ $t('profile.matchHistory.pagination.previousPage') }}
        </button>
        <span class="text-sm font-semibold text-brand-muted tabular-nums">
          {{
            $t('profile.matchHistory.pagination.pageOf', {
              page: historyStore.currentPage,
              total: historyStore.totalPages,
            })
          }}
        </span>
        <button
          type="button"
          class="btn btn-ghost px-4 py-2"
          :disabled="historyStore.currentPage === historyStore.totalPages || historyStore.isLoading"
          @click="goToPage(historyStore.currentPage + 1)"
        >
          {{ $t('profile.matchHistory.pagination.nextPage') }}
          <font-awesome-icon icon="chevron-right" class="ml-2" />
        </button>
      </nav>
    </div>
  </overlay-block>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import router from '@/router'
import OverlayBlock from '@/components/OverlayBlock.vue'
import { PARTY_MODE_ICON, partyModeKey, type PartyModeKey } from '@/services/partyTypes'
import useHistoryStore from '@/stores/history'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import 'dayjs/locale/fr'
import type { Match } from '@/stores/history'

const { t } = useI18n()
dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.locale('fr')

// Cache pour les dates formatées
const dateCache = new Map<string, string>()

const selectedFilter = ref(0) // 'all' by default
const historyStore = useHistoryStore()

const filters = computed(() => [
  { label: t('profile.matchHistory.filters.all'), value: 'all', id: 0 },
  { label: t('profile.matchHistory.filters.solo'), value: 'solo', id: 3 },
  { label: t('profile.matchHistory.filters.group'), value: 'groupe', id: 1 },
  { label: t('profile.matchHistory.filters.ranked'), value: 'ranked', id: 2 },
])

const matches = computed(() => {
  if (!historyStore.historyList) return []
  try {
    return historyStore.historyList as Match[]
  } catch {
    return []
  }
})

const stats = computed(() => {
  const finishedMatches = matches.value.filter((m: Match) => m.finish)
  const totalMatches = finishedMatches.length

  // Calcul du pourcentage moyen si les données percent sont disponibles
  const matchesWithPercent = finishedMatches.filter((m: Match) => m.percent !== undefined)
  let avgPercent: number | null = null

  if (matchesWithPercent.length > 0) {
    const totalPercent = matchesWithPercent.reduce(
      (sum: number, m: Match) => sum + (m.percent || 0),
      0,
    )
    avgPercent = Math.round(totalPercent / matchesWithPercent.length)
  }

  return {
    totalMatches,
    avgPercent,
  }
})

// Type enrichi pour les matches avec données précalculées
interface EnrichedMatch extends Match {
  formattedDate: string
  filterKey: string
}

const filteredMatches = computed(() => {
  let filtered = matches.value

  // Filtrage
  if (selectedFilter.value === 3) {
    filtered = filtered.filter((m: Match) => m.partyType.id === 3)
  } else if (selectedFilter.value === 1) {
    filtered = filtered.filter((m: Match) => m.partyType.id === 1)
  } else if (selectedFilter.value === 2) {
    filtered = filtered.filter((m: Match) => m.partyType.id === 2)
  }

  // Tri et enrichissement des données en une seule passe
  const sortedAndEnriched = [...filtered]
    .sort((a: Match, b: Match) => {
      // Trier: parties en cours en premier, puis les plus récentes
      if (a.finish !== b.finish) {
        return a.finish ? 1 : -1
      }
      return new Date(b.dt).getTime() - new Date(a.dt).getTime()
    })
    .map((match: Match): EnrichedMatch => {
      // Formater la date avec cache
      let formattedDate = dateCache.get(match.dt)
      if (!formattedDate) {
        formattedDate = dayjs.utc(match.dt).local().fromNow()
        dateCache.set(match.dt, formattedDate)
      }

      return {
        ...match,
        formattedDate,
        partyDifficulty: [...match.partyDifficulty].sort((a, b) => a.idDifficulty - b.idDifficulty),
        filterKey: `${match.id}-${match.dt}`,
      }
    })

  return sortedAndEnriched
})

const percentClass = (percent: number) => {
  if (percent >= 70) return 'text-brand-green'
  if (percent >= 40) return 'text-brand-orange'
  return 'text-brand-red'
}

const modeIconClass: Record<PartyModeKey, string> = {
  solo: 'bg-brand-purple/15 text-brand-purple',
  group: 'bg-brand-orange/15 text-brand-orange',
  ranked: 'bg-brand-green/15 text-brand-green',
}

const difficultyChip: Record<number, string> = {
  1: 'bg-diff-easy/15 text-diff-easy',
  2: 'bg-diff-medium/15 text-diff-medium',
  3: 'bg-diff-hard/15 text-diff-hard',
  4: 'bg-diff-hardcore/15 text-diff-hardcore',
}

const themesLabel = (partyTheme: Match['partyTheme']) =>
  partyTheme.length > 0
    ? partyTheme.map((pt) => pt.theme.label).join(', ')
    : t('group.quiz.allThemes')

const formatTime = (seconds: number) => {
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
}

const metaLine = (match: EnrichedMatch) =>
  match.time === undefined
    ? match.formattedDate
    : `${match.formattedDate}, ${t('profile.matchHistory.duration', { time: formatTime(match.time) })}`

const showMatchDetails = (match: Match) => {
  // Rediriger vers le récapitulatif de la partie selon son type
  const routeByMode: Record<PartyModeKey, string> = {
    solo: 'SoloQuiz',
    group: 'GroupMode',
    ranked: 'CompetitiveMode',
  }
  router.push({ name: routeByMode[partyModeKey(match.partyType.id)], params: { id: match.id } })
}

const goToPage = async (page: number) => {
  // Validation stricte pour éviter les pages invalides
  if (
    page < 1 ||
    page > historyStore.totalPages ||
    historyStore.isLoading ||
    page === historyStore.currentPage
  ) {
    return
  }

  // Vider le cache des dates lors du changement de page
  dateCache.clear()

  // Charger la nouvelle page
  await historyStore.getHistory(page)
}

onMounted(async () => {
  // First page of history
  await historyStore.getHistory()
})
</script>

<style scoped>
/* Optimisation du hover */
.match-item {
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.match-item:hover {
  border-color: rgb(var(--c-primary) / 0.4);
  background-color: rgb(var(--c-primary) / 0.05);
}

/* Empêcher le débordement des flex containers */
.match-item .flex-1 {
  min-width: 0;
}
</style>
