<template>
  <overlay-block :loading="historyStore.isLoading">
    <div class="space-y-4 sm:space-y-5">
      <!-- Header with stats -->
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h3 class="flex items-center text-lg sm:text-xl font-bold text-brand-lightGray">
          <font-awesome-icon
            icon="clock-rotate-left"
            class="mr-2 text-brand-purple text-sm sm:text-base"
          />
          <span class="truncate">{{ $t('profile.matchHistory.title') }}</span>
        </h3>
        <div class="flex gap-2 flex-wrap">
          <div
            class="pill bg-brand-purple/20 border-brand-purple/40 text-brand-purple text-xs sm:text-sm"
          >
            <font-awesome-icon icon="gamepad" class="mr-1" />
            {{ $t('profile.matchHistory.parties', { count: historyStore.nbParties || 0 }) }}
          </div>
          <div
            v-if="stats.avgPercent !== null"
            class="pill bg-brand-green/20 border-brand-green/40 text-brand-green text-xs sm:text-sm"
          >
            <font-awesome-icon icon="percent" class="mr-1" />
            {{ $t('profile.matchHistory.successRate', { percent: stats.avgPercent }) }}
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="filter in filters"
          :key="filter.value"
          :class="[
            'pill text-xs sm:text-sm whitespace-nowrap',
            selectedFilter === filter.id
              ? 'bg-brand-purple/30 border-brand-purple text-brand-purple'
              : 'bg-brand-darkGray/50 border-brand-gray/30 text-brand-gray hover:bg-brand-purple/10',
          ]"
          @click="selectedFilter = filter.id"
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- Match history list -->
      <div class="space-y-2 relative">
        <div
          v-for="match in filteredMatches"
          :key="match.filterKey"
          class="match-item p-2 sm:p-3 rounded-lg border cursor-pointer bg-brand-darkGray/30 border-brand-purple/20"
          :class="{ 'opacity-50 pointer-events-none': historyStore.isLoading }"
          @click="showMatchDetails(match)"
        >
          <div class="flex items-start gap-2 sm:gap-3">
            <!-- Score badge -->
            <div
              class="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex flex-col items-center justify-center font-bold border-2 bg-gradient-to-br"
              :class="getScoreColor(match.percent)"
            >
              <div class="text-base sm:text-xl">{{ match.score }}</div>
              <div class="text-[9px] sm:text-[10px] opacity-80">pts</div>
            </div>

            <!-- Match info -->
            <div class="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
              <!-- Header line -->
              <div
                class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2"
              >
                <div class="flex flex-col gap-1">
                  <div class="flex gap-2 items-center flex-wrap">
                    <span class="font-bold text-brand-lightGray text-sm sm:text-base truncate">
                      {{ match.partyType.label }}
                    </span>
                    <span
                      v-if="!match.finish"
                      class="pill text-[10px] sm:text-xs py-0.5 sm:py-1 px-1.5 sm:px-2 bg-brand-cyan/20 border-brand-cyan/40 text-brand-cyan animate-pulse whitespace-nowrap"
                    >
                      <font-awesome-icon icon="hourglass-half" class="mr-1" />
                      <span class="hidden xs:inline">{{
                        $t('profile.matchHistory.inProgress')
                      }}</span>
                      <span class="xs:hidden">En cours</span>
                    </span>
                  </div>

                  <div class="flex gap-1 sm:gap-2 flex-wrap">
                    <template v-if="match.partyDifficulty.length > 0">
                      <span
                        v-for="pd in match.partyDifficulty"
                        :key="pd.id"
                        class="pill text-[10px] sm:text-xs py-0.5 sm:py-1 px-1.5 sm:px-2 whitespace-nowrap"
                        :class="match.difficultiesColor[pd.idDifficulty]"
                      >
                        {{ pd.difficulty.label }}
                      </span>
                    </template>
                  </div>
                </div>
                <div class="text-xs sm:text-sm text-brand-gray whitespace-nowrap">
                  {{ match.formattedDate }}
                </div>
              </div>

              <!-- Stats line -->
              <div class="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm flex-wrap">
                <div class="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap">
                  <font-awesome-icon icon="circle-question" class="text-brand-purple text-xs" />
                  <span class="text-brand-gray hidden xs:inline">{{
                    $t('profile.matchHistory.questions')
                  }}</span>
                  <span class="font-bold text-brand-lightGray">
                    {{ match.nbQuestions }}
                  </span>
                </div>
                <div
                  v-if="match.percent !== undefined"
                  class="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap"
                >
                  <font-awesome-icon icon="percent" class="text-brand-cyan text-xs" />
                  <span class="text-brand-gray hidden xs:inline">{{
                    $t('profile.matchHistory.success')
                  }}</span>
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
                    {{ (match.percent ?? 0).toFixed(2) }}%
                  </span>
                </div>
                <div
                  v-if="match.time !== undefined"
                  class="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap"
                >
                  <font-awesome-icon icon="clock" class="text-brand-orange text-xs" />
                  <span class="text-brand-gray hidden xs:inline">{{
                    $t('profile.matchHistory.time')
                  }}</span>
                  <span class="font-bold text-brand-lightGray">
                    {{ formatTime(match.time) }}
                  </span>
                </div>
              </div>

              <!-- Themes line -->
              <div
                v-if="match.partyTheme && match.partyTheme.length > 0"
                class="flex items-center gap-1 sm:gap-1.5"
              >
                <font-awesome-icon
                  icon="tags"
                  class="text-brand-purple text-xs mt-0.5 flex-shrink-0"
                />
                <div class="flex items-center gap-1 sm:gap-1.5 flex-wrap min-w-0">
                  <span
                    v-for="partyTheme in getVisibleThemes(match.partyTheme)"
                    :key="partyTheme.id"
                    class="pill text-[10px] sm:text-xs py-0.5 px-1.5 sm:px-2 bg-brand-purple/10 border-brand-purple/30 text-brand-purple whitespace-nowrap flex items-center"
                  >
                    <font-awesome-icon :icon="partyTheme.theme.icon" class="mr-1" />
                    <span class="truncate max-w-[80px] sm:max-w-none inline-block">{{
                      partyTheme.theme.label
                    }}</span>
                  </span>
                  <span
                    v-if="getRemainingThemesCount(match.partyTheme) > 0"
                    class="pill text-[10px] sm:text-xs py-0.5 px-1.5 sm:px-2 bg-brand-purple/10 border-brand-purple/30 text-brand-purple cursor-help whitespace-nowrap flex items-center"
                    :title="getRemainingThemesNames(match.partyTheme)"
                  >
                    +{{ getRemainingThemesCount(match.partyTheme) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Arrow icon -->
            <div class="flex-shrink-0 text-brand-purple opacity-50 hidden xs:block">
              <font-awesome-icon icon="chevron-right" class="text-base sm:text-lg" />
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
      <div
        v-if="historyStore.totalPages > 0"
        class="text-center text-xs sm:text-sm text-brand-gray mb-3 sm:mb-4 px-2"
      >
        {{ paginationText }}
      </div>

      <!-- Pagination -->
      <div
        v-if="historyStore.totalPages > 1"
        class="flex items-center justify-center gap-1 sm:gap-2 px-2"
      >
        <!-- First page - Hidden on very small screens if many pages -->
        <button
          v-if="showExtendedPagination"
          class="hidden xs:inline-flex pill text-xs sm:text-sm min-w-[2rem] sm:min-w-[2.5rem]"
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
          class="pill text-xs sm:text-sm min-w-[2rem] sm:min-w-[2.5rem]"
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

        <!-- Page numbers - Simplified on mobile -->
        <div class="flex items-center gap-1 sm:gap-2">
          <!-- Mobile: only current page (< 480px) - Utilise un span au lieu de div -->
          <span
            class="pill text-xs min-w-[2rem] bg-brand-purple/30 border-brand-purple text-brand-purple xs:hidden"
          >
            {{ historyStore.currentPage }}
          </span>

          <!-- Desktop: page range (>= 480px) -->
          <template v-for="page in visiblePages" :key="page">
            <span
              v-if="page === -1"
              class="hidden xs:inline-flex pill text-xs sm:text-sm min-w-[2rem] sm:min-w-[2.5rem] opacity-50 cursor-default"
            >
              ...
            </span>
            <button
              v-else
              class="hidden xs:inline-flex pill text-xs sm:text-sm min-w-[2rem] sm:min-w-[2.5rem]"
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
          class="pill text-xs sm:text-sm min-w-[2rem] sm:min-w-[2.5rem]"
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

        <!-- Last page - Hidden on very small screens if many pages -->
        <button
          v-if="showExtendedPagination"
          class="hidden xs:inline-flex pill text-xs sm:text-sm min-w-[2rem] sm:min-w-[2.5rem]"
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import router from '@/router'
import OverlayBlock from '@/components/OverlayBlock.vue'
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

// Cache pour les couleurs de difficulté
const difficultyColorMap: Record<string, string> = {
  facile: 'bg-[#10b981]/20 border-[#10b981]/40 text-[#10b981]',
  moyen: 'bg-[#f59e0b]/20 border-[#f59e0b]/40 text-[#f59e0b]',
  difficile: 'bg-[#f97316]/20 border-[#f97316]/40 text-[#f97316]',
  hardcore: 'bg-[#ef4444]/20 border-[#ef4444]/40 text-[#ef4444]',
  extreme: 'bg-[#ef4444]/20 border-[#ef4444]/40 text-[#ef4444]',
}

const selectedFilter = ref(0) // 'all' by default
const historyStore = useHistoryStore()

// Nombre maximum de thèmes à afficher (responsive)
const maxVisibleThemes = ref(3)

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
  difficultiesColor: string[]
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

      // Get difficulty colors
      return {
        ...match,
        formattedDate,
        difficultiesColor: match.partyDifficulty
          .sort((a, b) => a.idDifficulty - b.idDifficulty)
          .map((pd) => {
            const diff = pd.difficulty.label.toLowerCase()
            return (
              difficultyColorMap[diff] || 'bg-brand-gray/20 border-brand-gray/40 text-brand-gray'
            )
          }),
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

// Afficher les boutons first/last uniquement si plus de 3 pages
const showExtendedPagination = computed(() => historyStore.totalPages > 3)

// Calcul correct du texte de pagination basé sur les données réelles
const paginationText = computed(() => {
  const totalItems = historyStore.nbParties || 0
  const currentItems = historyStore.historyList?.length || 0

  if (currentItems === 0 || totalItems === 0) {
    return t('profile.matchHistory.pagination.showing', {
      from: 0,
      to: 0,
      total: totalItems,
    })
  }

  // Calculer l'index réel de début basé sur les pages précédentes
  // On doit compter combien d'éléments ont été affichés avant cette page
  const itemsPerPage = 7 // Correspond au size par défaut du store
  const fromIndex = (historyStore.currentPage - 1) * itemsPerPage + 1
  const toIndex = fromIndex + currentItems - 1

  return t('profile.matchHistory.pagination.showing', {
    from: fromIndex,
    to: toIndex,
    total: totalItems,
  })
})

const showMatchDetails = (match: Match) => {
  // Rediriger vers la page de détails du match en fonction du type de partie
  if (match.partyType.label === 'Solo') {
    router.push({ name: 'SoloQuiz', params: { id: match.id } })
  } else if (match.partyType.label === 'Groupe') {
    router.push({ name: 'GroupMode', params: { id: match.id } })
  } else if (match.partyType.label === 'Classée') {
    router.push({ name: 'CompetitiveMode', params: { id: match.id } })
  }
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

// Fonctions pour gérer l'affichage responsive des thèmes
const getVisibleThemes = (partyTheme: any[]) => {
  return partyTheme.slice(0, maxVisibleThemes.value)
}

const getRemainingThemesCount = (partyTheme: any[]) => {
  return Math.max(0, partyTheme.length - maxVisibleThemes.value)
}

const getRemainingThemesNames = (partyTheme: any[]) => {
  const remaining = partyTheme.slice(maxVisibleThemes.value)
  return remaining.map((pt) => pt.theme.label).join(', ')
}

// Ajuster le nombre de thèmes visibles selon la largeur de l'écran
const updateMaxVisibleThemes = () => {
  const width = globalThis.innerWidth
  if (width >= 1024) {
    // Desktop: afficher 4 thèmes
    maxVisibleThemes.value = 4
  } else if (width >= 640) {
    // Tablet/sm: afficher 3 thèmes
    maxVisibleThemes.value = 3
  } else if (width >= 380) {
    // Mobile: afficher 2 thèmes
    maxVisibleThemes.value = 2
  } else {
    // Très petit écran: afficher 1 thème seulement
    maxVisibleThemes.value = 1
  }
}

onMounted(async () => {
  // Initialiser le nombre de thèmes visibles
  updateMaxVisibleThemes()

  // Écouter les changements de taille d'écran
  globalThis.addEventListener('resize', updateMaxVisibleThemes)

  // First page of history
  await historyStore.getHistory()
})

onUnmounted(() => {
  // Nettoyer le listener
  globalThis.removeEventListener('resize', updateMaxVisibleThemes)
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
  border-color: rgba(108, 92, 231, 0.4);
  background-color: rgba(108, 92, 231, 0.05);
}

/* Empêcher le débordement des flex containers */
.match-item .flex-1 {
  min-width: 0;
}
</style>
