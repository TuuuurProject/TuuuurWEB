<template>
  <section class="space-y-6">
    <!-- Header -->
    <header class="flex items-center justify-between">
      <h2 class="font-branding text-3xl text-brand-lightGray glow-text">
        <font-awesome-icon icon="fire" class="mr-2 text-brand-orange" />
        {{ $t('competitive.ranked.title') }}
      </h2>
    </header>

    <!-- Matchmaking visual -->
    <div class="flex flex-col items-center justify-center py-8 gap-8">
      <div class="relative h-72 w-72">
        <!-- Glow background -->
        <div
          class="absolute inset-0 rounded-full blur-2xl animate-pulse transition-colors duration-500"
          :class="state === 'search' ? 'bg-brand-purple/15' : 'bg-brand-green/20'"
        ></div>

        <!-- Animated rings -->
        <div class="ring-wrap absolute inset-0 flex items-center justify-center">
          <div class="ring" :class="state === 'found' ? 'ring-found' : 'ring-search'"></div>
          <div class="ring ring2" :class="state === 'found' ? 'ring-found' : 'ring-search'"></div>
          <div class="ring ring3" :class="state === 'found' ? 'ring-found' : 'ring-search'"></div>
        </div>

        <!-- Center card -->
        <div
          class="relative z-10 h-72 w-72 rounded-full bg-brand-darkGray border shadow-neon flex items-center justify-center transition-all duration-500"
          :class="state === 'search' ? 'border-brand-purple/30' : 'border-brand-green/50'"
        >
          <!-- Searching state -->
          <Transition name="fade" mode="out-in">
            <div
              v-if="state === 'search'"
              key="search"
              class="flex flex-col items-center gap-3 px-8 text-center"
            >
              <div
                class="w-16 h-16 rounded-full bg-brand-purple/20 flex items-center justify-center relative"
              >
                <font-awesome-icon icon="magnifying-glass" class="text-2xl text-brand-purple" />
                <span
                  class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-purple animate-ping opacity-75"
                ></span>
              </div>
              <p class="font-branding text-xl text-brand-lightGray">
                {{ $t('competitive.matchmaking.searching') }}
              </p>
              <p class="text-sm text-brand-gray">
                {{ $t('competitive.matchmaking.searchingMessage') }}
              </p>
              <div class="flex gap-1.5 mt-1">
                <span
                  class="w-2 h-2 rounded-full bg-brand-purple animate-bounce"
                  style="animation-delay: 0s"
                ></span>
                <span
                  class="w-2 h-2 rounded-full bg-brand-purple animate-bounce"
                  style="animation-delay: 0.15s"
                ></span>
                <span
                  class="w-2 h-2 rounded-full bg-brand-purple animate-bounce"
                  style="animation-delay: 0.3s"
                ></span>
              </div>
            </div>

            <!-- Found state -->
            <div v-else key="found" class="flex flex-col items-center gap-3 px-6 text-center">
              <div class="badge-green text-xs mb-1">{{ $t('competitive.matchmaking.found') }}</div>

              <div class="flex items-center gap-4">
                <!-- Current user -->
                <div class="flex flex-col items-center gap-1">
                  <div
                    class="w-14 h-14 rounded-full bg-brand-purple/20 border-2 border-brand-purple overflow-hidden flex items-center justify-center"
                  >
                    <img
                      v-if="currentUser?.avatar"
                      :src="currentUser.avatar"
                      class="w-full h-full object-cover"
                      alt=""
                    />
                    <div v-else class="h-16 w-16 flex items-center justify-center">
                      <span id="user-nickname" class="text-2xl font-bold text-brand-purple">
                        {{ currentUser?.nickName?.charAt(0).toUpperCase() || '?' }}
                      </span>
                    </div>
                  </div>
                  <span class="text-xs font-semibold text-brand-lightGray leading-tight">{{
                    currentUser?.nickName ?? $t('competitive.matchmaking.you')
                  }}</span>
                  <span class="text-xs text-brand-gray"
                    >{{ currentUser?.globalElo ?? '—' }} ELO</span
                  >
                </div>

                <!-- VS -->
                <div class="font-branding text-2xl text-brand-orange glow-text">VS</div>

                <!-- Opponent -->
                <div class="flex flex-col items-center gap-1">
                  <div
                    class="w-14 h-14 rounded-full bg-brand-orange/20 border-2 border-brand-orange overflow-hidden flex items-center justify-center"
                  >
                    <img
                      v-if="opponent?.avatar"
                      :src="opponent.avatar"
                      class="w-full h-full object-cover"
                      alt=""
                    />
                    <div v-else class="h-16 w-16 flex items-center justify-center">
                      <span id="opponent-nickname" class="text-2xl font-bold text-brand-orange">
                        {{ opponent?.nickName?.charAt(0).toUpperCase() || '?' }}
                      </span>
                    </div>
                  </div>
                  <span class="text-xs font-semibold text-brand-lightGray leading-tight">{{
                    opponent?.nickName ?? $t('competitive.matchmaking.opponent')
                  }}</span>
                  <span class="text-xs text-brand-gray">{{ opponent?.globalElo ?? '—' }} ELO</span>
                </div>
              </div>

              <p class="text-xs text-brand-gray mt-1">
                {{ $t('competitive.matchmaking.gameStartingSoon') }}
              </p>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Cancel button -->
      <button v-if="state === 'search'" class="btn btn-ghost" @click="$emit('cancel')">
        <font-awesome-icon icon="xmark" class="mr-1" />
        {{ $t('competitive.matchmaking.cancel') }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { RankedUser } from '@/stores/ranked'

defineProps<{
  state: 'search' | 'found'
  opponent?: RankedUser | null
  currentUser?: RankedUser | null
}>()

defineEmits<{ cancel: [] }>()
</script>

<style scoped>
.ring {
  position: absolute;
  height: 100%;
  width: 100%;
  border-radius: 9999px;
  border: 2px solid;
  animation: wave 2.4s ease-out infinite;
}
.ring2 {
  animation-delay: 0.6s;
}
.ring3 {
  animation-delay: 1.2s;
}
.ring-search {
  border-color: rgba(108, 92, 231, 0.35);
}
.ring-found {
  border-color: #00b56f;
}

@keyframes wave {
  0% {
    transform: scale(0.5);
    opacity: 0.7;
  }
  70% {
    transform: scale(1.25);
    opacity: 0.1;
  }
  100% {
    opacity: 0;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
