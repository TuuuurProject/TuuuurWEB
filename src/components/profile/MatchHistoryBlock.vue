<template>
  <overlay-block :loading="isLoading">
    <div class="space-y-10">
      <!-- Header with stats -->
      <div class="flex items-center justify-between">
        <h3 class="text-xl font-bold text-brand-lightGray">
          <font-awesome-icon icon="clock-rotate-left" class="mr-2 text-brand-purple" />
          Historique des parties
        </h3>
        <div class="flex gap-3">
          <div class="pill bg-brand-purple/20 border-brand-purple/40 text-brand-purple">
            <font-awesome-icon icon="gamepad" class="mr-1" />
            {{ stats.totalMatches }} Partie{{ stats.totalMatches > 1 ? 's' : '' }}
          </div>
          <!-- <div class="pill bg-brand-green/20 border-brand-green/40 text-brand-green">
            <font-awesome-icon icon="percent" class="mr-1" /> {{ stats.successRate }}% Réussite
          </div> -->
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
      <div class="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
        <div
          v-for="match in filteredMatches"
          :key="match.id"
          class="p-3 mx-1 rounded-lg border transition-all duration-200 cursor-pointer bg-brand-darkGray/30 border-brand-purple/20 hover:border-brand-purple/40 hover:bg-brand-purple/5"
          @click="showMatchDetails(match)"
        >
          <div class="flex items-center gap-3">
            <!-- Score badge -->
            <div
              class="flex-shrink-0 w-16 h-16 rounded-lg flex flex-col items-center justify-center font-bold border-2 bg-gradient-to-br"
              :class="getScoreColor()"
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
                    En cours
                  </span>
                  <span
                    v-if="match.partyDifficulty.length > 0"
                    class="pill text-xs py-1 px-2"
                    :class="getDifficultyColor(match.partyDifficulty[0].difficulty.label)"
                  >
                    {{ match.partyDifficulty[0].difficulty.label }}
                  </span>
                </div>
                <div class="text-sm text-brand-gray">{{ formatDate(match.dt) }}</div>
              </div>

              <!-- Stats line -->
              <div class="flex items-center gap-4 text-sm">
                <div class="flex items-center gap-1.5">
                  <font-awesome-icon icon="circle-question" class="text-brand-purple" />
                  <span class="text-brand-gray">Questions:</span>
                  <span class="font-bold text-brand-lightGray">
                    {{ match.nbQuestions }}
                  </span>
                </div>
                <!-- <div class="flex items-center gap-1.5">
                  <font-awesome-icon icon="percent" class="text-brand-cyan" />
                  <span class="text-brand-gray">Réussite:</span>
                  <span
                    class="font-bold"
                    :class="
                      getSuccessRate(match.score, match.nbQuestions) >= 70
                        ? 'text-brand-green'
                        : getSuccessRate(match.score, match.nbQuestions) >= 50
                          ? 'text-brand-orange'
                          : 'text-brand-red'
                    "
                  >
                    {{ getSuccessRate(match.score, match.nbQuestions) }}%
                  </span>
                </div> -->
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
          <p>Aucune partie trouvée</p>
        </div>
      </div>

      <!-- Pagination -->
      <!-- <div v-if="totalPages > 1" class="flex items-center justify-center gap-2">
        <button
          class="pill text-sm"
          :disabled="currentPage === 1"
          :class="currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand-purple/10'"
          @click="currentPage--"
        >
          <font-awesome-icon icon="chevron-left" />
        </button>
        <span class="text-brand-gray text-sm">Page {{ currentPage }} / {{ totalPages }}</span>
        <button
          class="pill text-sm"
          :disabled="currentPage === totalPages"
          :class="
            currentPage === totalPages
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-brand-purple/10'
          "
          @click="currentPage++"
        >
          <font-awesome-icon icon="chevron-right" />
        </button>
      </div> -->
    </div>
  </overlay-block>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import router from '@/router'
import OverlayBlock from '@/components/OverlayBlock.vue'
import useHistoryStore from '@/stores/history'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/fr'
import type { Match } from '@/stores/history'

dayjs.extend(relativeTime)
dayjs.locale('fr')

const isLoading = ref(false)
const currentPage = ref(1)
const selectedFilter = ref('all')
const historyStore = useHistoryStore()

const filters = [
  { label: 'Toutes', value: 'all' },
  { label: 'Solo', value: 'solo' },
]

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
  const totalQuestions = finishedMatches.reduce((sum: number, m: Match) => sum + m.nbQuestions, 0)
  const totalScore = finishedMatches.reduce((sum: number, m: Match) => sum + m.score, 0)

  // Estimation du taux de réussite basé sur le score moyen par question
  // En supposant qu'une bonne réponse vaut ~100 points
  const avgScorePerQuestion = totalQuestions > 0 ? totalScore / totalQuestions : 0
  const successRate = Math.min(100, Math.round(avgScorePerQuestion))

  return {
    totalMatches,
    successRate,
  }
})

const filteredMatches = computed(() => {
  let filtered = matches.value

  switch (selectedFilter.value) {
    case 'solo':
      filtered = filtered.filter((m: Match) => m.partyType.label === 'Solo')
      break
    case 'all':
      break
  }

  // Trier: parties en cours en premier, puis les plus récentes
  return filtered.sort((a: Match, b: Match) => {
    if (a.finish !== b.finish) {
      return a.finish ? 1 : -1
    }
    return new Date(b.dt).getTime() - new Date(a.dt).getTime()
  })
})

const formatDate = (date: string) => {
  return dayjs(date).fromNow()
}

// const getSuccessRate = (score: number, nbQuestions: number) => {
//   if (nbQuestions === 0) return 0
//   // Estimation: une question parfaite vaut ~100 points
//   const maxPossibleScore = nbQuestions * 100
//   return Math.min(100, Math.round((score / maxPossibleScore) * 100))
// }

// const getScoreColor = (score: number, nbQuestions: number) => {
//   const rate = getSuccessRate(score, nbQuestions)
//   if (rate >= 80) {
//     return 'from-brand-green/20 to-brand-green/10 border-brand-green text-brand-green'
//   } else if (rate >= 60) {
//     return 'from-brand-cyan/20 to-brand-cyan/10 border-brand-cyan text-brand-cyan'
//   } else if (rate >= 40) {
//     return 'from-brand-orange/20 to-brand-orange/10 border-brand-orange text-brand-orange'
//   } else {
//     return 'from-red-500/20 to-red-500/10 border-red-500 text-red-500'
//   }
// }

const getScoreColor = () => {
  return 'from-brand-green/20 to-brand-green/10 border-brand-green text-brand-green'
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'facile':
      return 'bg-[#10b981]/20 border-[#10b981]/40 text-[#10b981]'
    case 'moyen':
      return 'bg-[#f59e0b]/20 border-[#f59e0b]/40 text-[#f59e0b]'
    case 'difficile':
      return 'bg-[#f97316]/20 border-[#f97316]/40 text-[#f97316]'
    case 'hardcore':
      return 'bg-[#ef4444]/20 border-[#ef4444]/40 text-[#ef4444]'
    default:
      return 'bg-brand-gray/20 border-brand-gray/40 text-brand-gray'
  }
}

const showMatchDetails = (match: Match) => {
  router.push({ name: 'SoloQuizId', params: { id: match.id } })
}

onMounted(async () => {
  // First page of history
  await historyStore.getHistory()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar-track {
  @apply bg-brand-darkGray/30 rounded-full;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-brand-purple/50 rounded-full hover:bg-brand-purple/70;
}
</style>
