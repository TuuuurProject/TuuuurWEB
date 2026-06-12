<template>
  <section class="space-y-8">
    <header class="flex items-center justify-between">
      <h2 class="font-branding text-3xl text-brand-lightGray glow-text">
        <font-awesome-icon icon="trophy" class="mr-2 text-brand-yellow" />
        {{ $t('leaderboard.title') }}
      </h2>
    </header>

    <!-- Not logged in -->
    <div v-if="!userStore.isLogged && !userStore.isLoggedAsInvited" class="gaming-card">
      <LoggedInBlock :message="$t('leaderboard.notLoggedIn')" />
    </div>

    <!-- Loading -->
    <div v-else-if="rankedStore.isRankingLoading" class="gaming-card text-center py-12">
      <font-awesome-icon icon="spinner" spin class="text-3xl text-brand-purple mb-4" />
      <p class="text-brand-gray">{{ $t('common.loading') }}</p>
    </div>

    <template v-else>
      <!-- Podium Top 3 -->
      <div class="gaming-card">
        <!-- Empty state -->
        <div v-if="sortedPlayers.length === 0" class="text-center py-8 text-brand-gray">
          <font-awesome-icon icon="trophy" class="text-4xl mb-3 opacity-30" />
          <p>{{ $t('leaderboard.empty') }}</p>
        </div>

        <template v-else>
          <!-- Podium -->
          <div class="mb-6">
            <div
              class="grid gap-4 max-w-3xl mx-auto items-end"
              :class="{
                'grid-cols-1 max-w-xs': sortedPlayers.length === 1,
                'grid-cols-3': sortedPlayers.length > 1,
              }"
            >
              <!-- 2nd place -->
              <div
                v-if="sortedPlayers[1]"
                class="text-center transform transition-all duration-300"
              >
                <div class="relative inline-block mb-3">
                  <div
                    class="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 bg-brand-darkGray/50 flex items-center justify-center mx-auto shadow-lg"
                    :class="
                      isCurrentUser(sortedPlayers[1])
                        ? 'border-brand-purple shadow-neon'
                        : 'border-brand-gray/40'
                    "
                  >
                    <img
                      v-if="sortedPlayers[1].avatar"
                      :src="sortedPlayers[1].avatar"
                      alt="avatar"
                      class="w-full h-full rounded-full object-cover"
                    />
                    <span v-else class="text-2xl sm:text-3xl font-bold text-brand-gray">
                      {{ sortedPlayers[1].nickName?.charAt(0).toUpperCase() || '?' }}
                    </span>
                  </div>
                  <div
                    class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-brand-gray/80 border-2 border-brand-dark flex items-center justify-center shadow-lg"
                  >
                    <span class="text-sm font-bold text-white">2</span>
                  </div>
                  <!-- "Vous" badge -->
                  <div
                    v-if="isCurrentUser(sortedPlayers[1])"
                    class="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-brand-purple text-white text-[10px] font-bold whitespace-nowrap"
                  >
                    {{ $t('leaderboard.you') }}
                  </div>
                </div>
                <div
                  class="font-semibold text-sm truncate px-2"
                  :class="
                    isCurrentUser(sortedPlayers[1]) ? 'text-brand-purple' : 'text-brand-lightGray'
                  "
                >
                  {{ sortedPlayers[1].nickName }}
                </div>
                <div class="text-2xl font-branding text-brand-gray mt-1">
                  {{ sortedPlayers[1].globalElo }}
                  <span class="text-sm font-sans text-brand-gray/60">{{
                    $t('leaderboard.eloLabel')
                  }}</span>
                </div>
                <div
                  class="mt-2 h-24 sm:h-32 bg-gradient-to-t from-brand-gray/30 to-brand-gray/10 border-2 border-brand-gray/30 rounded-t-xl"
                />
              </div>
              <!-- 2nd place empty slot -->
              <div v-else-if="sortedPlayers.length === 1" />

              <!-- 1st place -->
              <div
                v-if="sortedPlayers[0]"
                class="text-center transform transition-all duration-300"
              >
                <div class="relative inline-block mb-3">
                  <div
                    class="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-brand-yellow bg-brand-darkGray/50 flex items-center justify-center mx-auto shadow-neon animate-pulse-slow"
                    :class="
                      isCurrentUser(sortedPlayers[0])
                        ? 'ring-2 ring-brand-purple ring-offset-2 ring-offset-brand-dark'
                        : ''
                    "
                  >
                    <img
                      v-if="sortedPlayers[0].avatar"
                      :src="sortedPlayers[0].avatar"
                      alt="avatar"
                      class="w-full h-full rounded-full object-cover"
                    />
                    <span v-else class="text-3xl sm:text-4xl font-bold text-brand-yellow">
                      {{ sortedPlayers[0].nickName?.charAt(0).toUpperCase() || '?' }}
                    </span>
                  </div>
                  <div
                    class="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-brand-yellow border-2 border-brand-dark flex items-center justify-center shadow-lg"
                  >
                    <font-awesome-icon icon="crown" class="text-sm text-brand-dark" />
                  </div>
                  <div
                    class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-brand-yellow border-2 border-brand-dark flex items-center justify-center shadow-lg"
                  >
                    <span class="text-sm font-bold text-brand-dark">1</span>
                  </div>
                  <!-- "Vous" badge -->
                  <div
                    v-if="isCurrentUser(sortedPlayers[0])"
                    class="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-brand-purple text-white text-[10px] font-bold whitespace-nowrap"
                  >
                    {{ $t('leaderboard.you') }}
                  </div>
                </div>
                <div
                  class="font-bold truncate px-2"
                  :class="
                    isCurrentUser(sortedPlayers[0]) ? 'text-brand-purple' : 'text-brand-lightGray'
                  "
                >
                  {{ sortedPlayers[0].nickName }}
                </div>
                <div class="text-3xl font-branding text-brand-yellow mt-1 glow-text">
                  {{ sortedPlayers[0].globalElo }}
                  <span class="text-sm font-sans text-brand-yellow/60">{{
                    $t('leaderboard.eloLabel')
                  }}</span>
                </div>
                <div
                  class="mt-2 h-32 sm:h-40 bg-gradient-to-t from-brand-yellow/30 to-brand-yellow/10 border-2 border-brand-yellow/40 rounded-t-xl"
                />
              </div>
              <!-- 1st place empty slot -->
              <div v-else class="text-center">
                <div
                  class="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-dashed border-brand-yellow/30 bg-brand-darkGray/20 flex items-center justify-center mx-auto"
                >
                  <span class="text-3xl font-bold text-brand-yellow/30">?</span>
                </div>
              </div>

              <!-- 3rd place -->
              <div
                v-if="sortedPlayers[2]"
                class="text-center transform transition-all duration-300"
              >
                <div class="relative inline-block mb-3">
                  <div
                    class="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 bg-brand-darkGray/50 flex items-center justify-center mx-auto shadow-lg"
                    :class="
                      isCurrentUser(sortedPlayers[2])
                        ? 'border-brand-purple shadow-neon'
                        : 'border-brand-orange/40'
                    "
                  >
                    <img
                      v-if="sortedPlayers[2].avatar"
                      :src="sortedPlayers[2].avatar"
                      alt="avatar"
                      class="w-full h-full rounded-full object-cover"
                    />
                    <span v-else class="text-2xl sm:text-3xl font-bold text-brand-orange">
                      {{ sortedPlayers[2].nickName?.charAt(0).toUpperCase() || '?' }}
                    </span>
                  </div>
                  <div
                    class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-brand-orange/80 border-2 border-brand-dark flex items-center justify-center shadow-lg"
                  >
                    <span class="text-sm font-bold text-white">3</span>
                  </div>
                  <!-- "Vous" badge -->
                  <div
                    v-if="isCurrentUser(sortedPlayers[2])"
                    class="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-brand-purple text-white text-[10px] font-bold whitespace-nowrap"
                  >
                    {{ $t('leaderboard.you') }}
                  </div>
                </div>
                <div
                  class="font-semibold text-sm truncate px-2"
                  :class="
                    isCurrentUser(sortedPlayers[2]) ? 'text-brand-purple' : 'text-brand-lightGray'
                  "
                >
                  {{ sortedPlayers[2].nickName }}
                </div>
                <div class="text-2xl font-branding text-brand-orange mt-1">
                  {{ sortedPlayers[2].globalElo }}
                  <span class="text-sm font-sans text-brand-orange/60">{{
                    $t('leaderboard.eloLabel')
                  }}</span>
                </div>
                <div
                  class="mt-2 h-20 sm:h-28 bg-gradient-to-t from-brand-orange/30 to-brand-orange/10 border-2 border-brand-orange/30 rounded-t-xl"
                />
              </div>
            </div>
          </div>

          <!-- Remaining players (rank 4+) -->
          <div v-if="sortedPlayers.length > 3" class="mt-6 space-y-2">
            <div
              v-for="(player, index) in sortedPlayers.slice(3)"
              :key="player.id"
              class="flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200"
              :class="
                isCurrentUser(player)
                  ? 'border-brand-purple/60 bg-brand-purple/10'
                  : 'border-brand-purple/10 bg-brand-darkGray/20 hover:border-brand-purple/30'
              "
            >
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <span
                  class="font-bold text-sm w-6 text-center shrink-0"
                  :class="isCurrentUser(player) ? 'text-brand-purple' : 'text-brand-gray'"
                >
                  {{ index + 4 }}
                </span>
                <div
                  class="w-10 h-10 rounded-full border-2 bg-brand-darkGray/50 flex items-center justify-center shrink-0"
                  :class="isCurrentUser(player) ? 'border-brand-purple' : 'border-brand-purple/30'"
                >
                  <img
                    v-if="player.avatar"
                    :src="player.avatar"
                    alt="avatar"
                    class="w-full h-full rounded-full object-cover"
                  />
                  <span
                    v-else
                    class="text-lg font-bold"
                    :class="isCurrentUser(player) ? 'text-brand-purple' : 'text-brand-purple'"
                  >
                    {{ player.nickName?.charAt(0).toUpperCase() || '?' }}
                  </span>
                </div>
                <span
                  class="font-semibold truncate"
                  :class="isCurrentUser(player) ? 'text-brand-purple' : 'text-brand-lightGray'"
                >
                  {{ player.nickName }}
                </span>
                <span
                  v-if="isCurrentUser(player)"
                  class="shrink-0 px-2 py-0.5 rounded-full bg-brand-purple text-white text-[10px] font-bold"
                >
                  {{ $t('leaderboard.you') }}
                </span>
              </div>
              <div
                class="font-branding text-xl shrink-0 ml-3"
                :class="isCurrentUser(player) ? 'text-brand-purple' : 'text-brand-purple'"
              >
                {{ player.globalElo }}
                <span class="text-xs font-sans text-brand-purple/60">{{
                  $t('leaderboard.eloLabel')
                }}</span>
              </div>
            </div>
          </div>

          <!-- Current user pinned at bottom when not in visible list -->
          <template v-if="!currentUserInList && rankedStore.rankingData">
            <div
              class="flex items-center justify-center py-1 text-brand-gray/40 text-lg tracking-widest select-none"
            >
              ···
            </div>
            <div
              class="flex items-center justify-between px-4 py-3 rounded-xl border border-brand-purple/60 bg-brand-purple/10"
            >
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <span class="text-brand-purple font-bold text-sm w-6 text-center shrink-0">
                  {{
                    rankedStore.rankingData.userRanking > 0
                      ? rankedStore.rankingData.userRanking
                      : '—'
                  }}
                </span>
                <div
                  class="w-10 h-10 rounded-full border-2 border-brand-purple bg-brand-darkGray/50 flex items-center justify-center shrink-0"
                >
                  <img
                    v-if="userStore.userInfo?.avatar"
                    :src="userStore.userInfo.avatar"
                    alt="avatar"
                    class="w-full h-full rounded-full object-cover"
                  />
                  <span v-else class="text-lg font-bold text-brand-purple">
                    {{ userStore.userInfo?.nickName?.charAt(0).toUpperCase() || '?' }}
                  </span>
                </div>
                <span class="font-semibold text-brand-purple truncate">
                  {{ userStore.userInfo?.nickName }}
                </span>
                <span
                  class="shrink-0 px-2 py-0.5 rounded-full bg-brand-purple text-white text-[10px] font-bold"
                >
                  {{ $t('leaderboard.you') }}
                </span>
              </div>
              <div class="font-branding text-xl shrink-0 ml-3 text-brand-purple">
                {{ rankedStore.rankingData.userElo }}
                <span class="text-xs font-sans text-brand-purple/60">{{
                  $t('leaderboard.eloLabel')
                }}</span>
              </div>
            </div>
          </template>
        </template>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import useRankedStore from '@/stores/ranked'
import useUserStore from '@/stores/user'
import LoggedInBlock from '@/components/LoggedInBlock.vue'

const rankedStore = useRankedStore()
const userStore = useUserStore()

const currentUserId = computed(() =>
  userStore.isLogged
    ? userStore.userId
    : userStore.isLoggedAsInvited
      ? userStore.userIdInvited
      : null,
)

const isCurrentUser = (player: { id: string }) => player.id === currentUserId.value

const sortedPlayers = computed(() => {
  const users = rankedStore.rankingData?.users ?? []
  return [...users].sort((a, b) => b.globalElo - a.globalElo)
})

const currentUserInList = computed(
  () =>
    currentUserId.value !== null && sortedPlayers.value.some((p) => p.id === currentUserId.value),
)

onMounted(async () => {
  userStore.getUserInfo()
  await rankedStore.loadRanking()
})
</script>
