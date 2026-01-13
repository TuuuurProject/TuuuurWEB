<template>
  <overlay-block :loading="isLoading">
    <div class="space-y-10">
      <!-- Header with stats -->
      <div class="flex items-center justify-between">
        <h3 class="text-xl font-bold text-brand-lightGray">
          <font-awesome-icon icon="clock-rotate-left" class="mr-2 text-brand-purple" />
          {{ $t('profile.matchHistory.title') }}
        </h3>
        <div class="flex gap-3">
          <div class="pill bg-brand-purple/20 border-brand-purple/40 text-brand-purple">
            <font-awesome-icon icon="gamepad" class="mr-1" />
            {{ $t('profile.matchHistory.parties', { count: historyStore.nbParties || 0 }) }}
          </div>
          <div
            v-if="stats.avgPercent !== null"
            class="pill bg-brand-green/20 border-brand-green/40 text-brand-green"
          >
            <font-awesome-icon icon="percent" class="mr-1" />
            {{ $t('profile.matchHistory.successRate', { percent: stats.avgPercent }) }}
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex gap-2">
        <button
          v-for="filter in filters"
          :key="filter.value"
          :class="[
            'pill text-sm',
            selectedFilter === filter.value
              ? 'bg-brand-purple/30 border-brand-purple text-brand-purple'
              : 'bg-brand-darkGray/50 border-brand-gray/30 text-brand-gray hover:bg-brand-purple/10',
          ]"
          @click="selectedFilter = filter.value"
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- Match history list -->
      <div class="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar relative">
        <div
          v-for="match in filteredMatches"
          :key="match.filterKey"
          class="match-item p-3 mx-1 rounded-lg border cursor-pointer bg-brand-darkGray/30 border-brand-purple/20"
          :class="{ 'opacity-50 pointer-events-none': historyStore.isLoading }"
          @click="showMatchDetails(match)"
        >
          <div class="flex items-center gap-3">
            <!-- Score badge -->
            <div
              class="flex-shrink-0 w-16 h-16 rounded-lg flex flex-col items-center justify-center font-bold border-2 bg-gradient-to-br"
              :class="getScoreColor(match.percent)"
            >
              <div class="text-xl">{{ match.score }}</div>
              <div class="text-[10px] opacity-80">pts</div>
            </div>

            <!-- Match info -->
            <div class="flex-1 space-y-2">
              <!-- Header line -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-brand-lightGray text-base">
                    {{ match.partyType.label }}
                  </span>
                  <span
                    v-if="!match.finish"
                    class="pill text-xs py-1 px-2 bg-brand-cyan/20 border-brand-cyan/40 text-brand-cyan animate-pulse"
                  >
                    <font-awesome-icon icon="hourglass-half" class="mr-1" />
                    {{ $t('profile.matchHistory.inProgress') }}
                  </span>
                  <span
                    v-if="match.partyDifficulty.length > 0"
                    class="pill text-xs py-1 px-2"
                    :class="match.difficultyColor"
                  >
                    {{ match.partyDifficulty[0].difficulty.label }}
                  </span>
                </div>
                <div class="text-sm text-brand-gray">{{ match.formattedDate }}</div>
              </div>

              <!-- Stats line -->
              <div class="flex items-center gap-4 text-sm">
                <div class="flex items-center gap-1.5">
                  <font-awesome-icon icon="circle-question" class="text-brand-purple" />
                  <span class="text-brand-gray">{{ $t('profile.matchHistory.questions') }}</span>
                  <span class="font-bold text-brand-lightGray">
                    {{ match.nbQuestions }}
                  </span>
                </div>
                <div v-if="match.percent !== undefined" class="flex items-center gap-1.5">
                  <font-awesome-icon icon="percent" class="text-brand-cyan" />
                  <span class="text-brand-gray">{{ $t('profile.matchHistory.success') }}</span>
                  <span
                    class="font-bold"
                    :class="
                      match.percent >= 70
                        ? 'text-brand-green'
                        : match.percent >= 50
                          ? 'text-brand-orange'
                          : 'text-brand-red'
                    "
                  >
                    {{ match.percent }}%
                  </span>
                </div>
                <div v-if="match.time !== undefined" class="flex items-center gap-1.5">
                  <font-awesome-icon icon="clock" class="text-brand-orange" />
                  <span class="text-brand-gray">{{ $t('profile.matchHistory.time') }}</span>
                  <span class="font-bold text-brand-lightGray">
                    {{ formatTime(match.time) }}
                  </span>
                </div>
              </div>

              <!-- Themes line -->
              <div class="flex items-center gap-1.5 flex-wrap">
                <font-awesome-icon icon="tags" class="text-brand-purple text-xs" />
                <span
                  v-for="partyTheme in match.partyTheme"
                  :key="partyTheme.id"
                  class="pill text-xs py-0.5 px-2 bg-brand-purple/10 border-brand-purple/30 text-brand-purple"
                >
                  <font-awesome-icon :icon="partyTheme.theme.icon" class="mr-1" />
                  {{ partyTheme.theme.label }}
                </span>
              </div>
            </div>

            <!-- Arrow icon -->
            <div class="flex-shrink-0 text-brand-purple opacity-50">
              <font-awesome-icon icon="chevron-right" class="text-lg" />
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-if="filteredMatches.length === 0"
          class="text-center py-12 text-brand-gray border border-brand-gray/20 rounded-xl"
        >
          <font-awesome-icon icon="inbox" class="text-4xl mb-3 opacity-50" />
          <p>{{ $t('profile.matchHistory.noMatches') }}</p>
        </div>
      </div>

      <!-- Pagination info -->
      <div v-if="historyStore.totalPages > 0" class="text-center text-sm text-brand-gray mb-4">
        {{
          $t('profile.matchHistory.pagination.showing', {
            from: (historyStore.currentPage - 1) * 10 + 1,
            to: Math.min(historyStore.currentPage * 10, historyStore.nbParties || 0),
            total: historyStore.nbParties || 0,
          })
        }}
      </div>

      <!-- Pagination -->
      <div
        v-if="historyStore.totalPages > 1"
        class="flex flex-wrap items-center justify-center gap-2"
      >
        <!-- First page -->
        <button
          class="pill text-sm"
          :disabled="historyStore.currentPage === 1 || historyStore.isLoading"
          :class="
            historyStore.currentPage === 1 || historyStore.isLoading
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-brand-purple/10'
          "
          @click="goToPage(1)"
          :title="$t('profile.matchHistory.pagination.firstPage')"
        >
          <font-awesome-icon icon="angles-left" />
        </button>

        <!-- Previous page -->
        <button
          class="pill text-sm"
          :disabled="historyStore.currentPage === 1 || historyStore.isLoading"
          :class="
            historyStore.currentPage === 1 || historyStore.isLoading
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-brand-purple/10'
          "
          @click="goToPage(historyStore.currentPage - 1)"
          :title="$t('profile.matchHistory.pagination.previousPage')"
        >
          <font-awesome-icon icon="chevron-left" />
        </button>

        <!-- Page numbers -->
        <div class="flex items-center gap-2">
          <template v-for="page in visiblePages" :key="page">
            <span v-if="page === -1" class="pill text-sm min-w-[2.5rem] opacity-50 cursor-default">
              ...
            </span>
            <button
              v-else
              class="pill text-sm min-w-[2.5rem]"
              :disabled="historyStore.isLoading"
              :class="
                page === historyStore.currentPage
                  ? 'bg-brand-purple/30 border-brand-purple text-brand-purple'
                  : 'hover:bg-brand-purple/10'
              "
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </template>
        </div>

        <!-- Next page -->
        <button
          class="pill text-sm"
          :disabled="historyStore.currentPage === historyStore.totalPages || historyStore.isLoading"
          :class="
            historyStore.currentPage === historyStore.totalPages || historyStore.isLoading
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-brand-purple/10'
          "
          @click="goToPage(historyStore.currentPage + 1)"
          :title="$t('profile.matchHistory.pagination.nextPage')"
        >
          <font-awesome-icon icon="chevron-right" />
        </button>

        <!-- Last page -->
        <button
          class="pill text-sm"
          :disabled="historyStore.currentPage === historyStore.totalPages || historyStore.isLoading"
          :class="
            historyStore.currentPage === historyStore.totalPages || historyStore.isLoading
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-brand-purple/10'
          "
          @click="goToPage(historyStore.totalPages)"
          :title="$t('profile.matchHistory.pagination.lastPage')"
        >
          <font-awesome-icon icon="angles-right" />
        </button>
      </div>
    </div>
  </overlay-block>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import router from '@/router'
import OverlayBlock from '@/components/OverlayBlock.vue'
import useHistoryStore from '@/stores/history'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/fr'
import type { Match } from '@/stores/history'

const { t } = useI18n()
dayjs.extend(relativeTime)
dayjs.locale('fr')

// Cache pour les dates formatées
const dateCache = new Map<string, string>()

// Cache pour les couleurs de difficulté
const difficultyColorMap: Record<string, string> = {
  facile: 'bg-[#10b981]/20 border-[#10b981]/40 text-[#10b981]',
  moyen: 'bg-[#f59e0b]/20 border-[#f59e0b]/40 text-[#f59e0b]',
  difficile: 'bg-[#f97316]/20 border-[#f97316]/40 text-[#f97316]',
  hardcore: 'bg-[#ef4444]/20 border-[#ef4444]/40 text-[#ef4444]',
}

const isLoading = ref(false)
const selectedFilter = ref('all')
const historyStore = useHistoryStore()

const filters = computed(() => [
  { label: t('profile.matchHistory.filters.all'), value: 'all' },
  { label: t('profile.matchHistory.filters.solo'), value: 'solo' },
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
  difficultyColor: string
  filterKey: string
}

const filteredMatches = computed(() => {
  let filtered = matches.value

  // Filtrage
  if (selectedFilter.value === 'solo') {
    filtered = filtered.filter((m: Match) => m.partyType.label === 'Solo')
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
        formattedDate = dayjs(match.dt).fromNow()
        dateCache.set(match.dt, formattedDate)
      }

      // Obtenir la couleur de difficulté
      const difficulty = match.partyDifficulty[0]?.difficulty.label.toLowerCase() || ''
      const difficultyColor =
        difficultyColorMap[difficulty] || 'bg-brand-gray/20 border-brand-gray/40 text-brand-gray'

      return {
        ...match,
        formattedDate,
        difficultyColor,
        filterKey: `${match.id}-${match.dt}`,
      }
    })

  return sortedAndEnriched
})

const getScoreColor = (percent?: number) => {
  if (percent === undefined) {
    // Couleur par défaut si pas de pourcentage
    return 'from-brand-purple/20 to-brand-purple/10 border-brand-purple text-brand-purple'
  }

  if (percent >= 80) {
    return 'from-brand-green/20 to-brand-green/10 border-brand-green text-brand-green'
  } else if (percent >= 60) {
    return 'from-brand-cyan/20 to-brand-cyan/10 border-brand-cyan text-brand-cyan'
  } else if (percent >= 40) {
    return 'from-brand-orange/20 to-brand-orange/10 border-brand-orange text-brand-orange'
  } else {
    return 'from-red-500/20 to-red-500/10 border-red-500 text-red-500'
  }
}

const formatTime = (seconds: number) => {
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
}

// Calcul des pages visibles pour la pagination (toujours 3 éléments)
const visiblePages = computed(() => {
  const current = historyStore.currentPage
  const total = historyStore.totalPages
  const pages: number[] = []

  if (total <= 3) {
    // Si 3 pages ou moins, afficher toutes les pages
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // Afficher toujours 3 pages
    if (current === 1) {
      // Au début : 1, 2, 3
      pages.push(1, 2, 3)
    } else if (current === total) {
      // À la fin : total-2, total-1, total
      pages.push(total - 2, total - 1, total)
    } else {
      // Au milieu : current-1, current, current+1
      pages.push(current - 1, current, current + 1)
    }
  }

  return pages
})

const showMatchDetails = (match: Match) => {
  router.push({ name: 'SoloQuizId', params: { id: match.id } })
}

const goToPage = async (page: number) => {
  if (page < 1 || page > historyStore.totalPages || historyStore.isLoading) return

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
.custom-scrollbar {
  /* Optimisation du scroll avec will-change */
  will-change: scroll-position;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(28, 28, 40, 0.3);
  border-radius: 9999px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(108, 92, 231, 0.5);
  border-radius: 9999px;
  transition: background 0.2s ease;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(108, 92, 231, 0.7);
}

/* Optimisation du hover avec GPU acceleration */
.match-item {
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
  will-change: border-color, background-color;
}

.match-item:hover {
  border-color: rgba(108, 92, 231, 0.4);
  background-color: rgba(108, 92, 231, 0.05);
}

/* Force GPU acceleration pour les animations */
.match-item,
.custom-scrollbar {
  transform: translateZ(0);
  backface-visibility: hidden;
}
</style>
