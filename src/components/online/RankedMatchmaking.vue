<template>
  <section class="space-y-6">
    <!-- Header -->
    <header class="flex items-center justify-between">
      <h2 class="font-branding text-2xl sm:text-3xl text-brand-lightGray glow-text">
        <font-awesome-icon icon="fire" class="mr-2 text-brand-orange" />
        {{ $t('competitive.ranked.title') }}
      </h2>
    </header>

    <!-- Matchmaking visual -->
    <Transition name="state-switch" mode="out-in">

      <!-- ── SEARCHING ────────────────────────────────────────── -->
      <div v-if="state === 'search'" key="search" class="flex flex-col items-center gap-8 py-4">

        <!-- Radar -->
        <div class="radar">
          <!-- Ambient glow -->
          <div class="radar-glow"></div>

          <!-- Static concentric rings -->
          <div class="radar-ring radar-ring--outer"></div>
          <div class="radar-ring radar-ring--mid"></div>
          <div class="radar-ring radar-ring--inner"></div>

          <!-- Cross-hair lines -->
          <div class="radar-line radar-line--h"></div>
          <div class="radar-line radar-line--v"></div>

          <!-- Rotating sweep -->
          <div class="radar-sweep-wrap">
            <div class="radar-sweep"></div>
          </div>

          <!-- Blip dots scattered on the radar -->
          <div class="blip" style="top: 22%; left: 58%"></div>
          <div class="blip" style="top: 65%; left: 30%; animation-delay: 1.1s"></div>
          <div class="blip" style="top: 40%; left: 72%; animation-delay: 0.5s"></div>
          <div class="blip" style="top: 72%; left: 62%; animation-delay: 1.8s"></div>

          <!-- Center dot -->
          <div class="radar-center">
            <div class="radar-dot"></div>
            <div class="radar-dot-ping"></div>
          </div>
        </div>

        <!-- Status text -->
        <div class="text-center space-y-2">
          <p class="font-branding text-xl text-brand-lightGray tracking-wide">
            {{ $t('competitive.matchmaking.searching') }}
          </p>
          <p class="text-sm text-brand-gray max-w-xs mx-auto">
            {{ $t('competitive.matchmaking.searchingMessage') }}
          </p>
          <div class="flex gap-1.5 justify-center pt-1">
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

        <!-- Cancel -->
        <button class="btn btn-ghost" @click="$emit('cancel')">
          <font-awesome-icon icon="xmark" class="mr-1.5" />
          {{ $t('competitive.matchmaking.cancel') }}
        </button>
      </div>

      <!-- ── FOUND ───────────────────────────────────────────── -->
      <div v-else key="found" class="flex flex-col items-center gap-6 py-4 w-full">

        <!-- Match found badge -->
        <div class="found-badge">
          <font-awesome-icon icon="bolt" class="mr-1.5" />
          {{ $t('competitive.matchmaking.found') }}
        </div>

        <!-- Players face-off -->
        <div class="matchup">

          <!-- You -->
          <div class="player player--you">
            <div class="avatar-ring avatar-ring--purple">
              <div class="avatar-inner">
                <img
                  v-if="currentUser?.avatar"
                  :src="currentUser.avatar"
                  class="w-full h-full object-cover"
                  alt=""
                />
                <span v-else class="avatar-initial avatar-initial--purple">
                  {{ currentUser?.nickName?.charAt(0).toUpperCase() || '?' }}
                </span>
              </div>
            </div>
            <p class="player-nick">
              {{ currentUser?.nickName ?? $t('competitive.matchmaking.you') }}
            </p>
            <div class="player-elo">
              <font-awesome-icon icon="star" class="text-brand-yellow text-xs" />
              <span>{{ currentUser?.globalElo ?? '—' }}</span>
            </div>
          </div>

          <!-- VS -->
          <div class="vs-block">
            <span class="vs-text">VS</span>
          </div>

          <!-- Opponent -->
          <div class="player player--opponent">
            <div class="avatar-ring avatar-ring--orange">
              <div class="avatar-inner">
                <img
                  v-if="opponent?.avatar"
                  :src="opponent.avatar"
                  class="w-full h-full object-cover"
                  alt=""
                />
                <span v-else class="avatar-initial avatar-initial--orange">
                  {{ opponent?.nickName?.charAt(0).toUpperCase() || '?' }}
                </span>
              </div>
            </div>
            <p class="player-nick">
              {{ opponent?.nickName ?? $t('competitive.matchmaking.opponent') }}
            </p>
            <div class="player-elo">
              <font-awesome-icon icon="star" class="text-brand-yellow text-xs" />
              <span>{{ opponent?.globalElo ?? '—' }}</span>
            </div>
          </div>
        </div>

        <!-- Starting soon -->
        <p class="text-sm text-brand-gray text-center animate-pulse">
          <font-awesome-icon icon="hourglass-half" class="mr-1.5 text-brand-green" />
          {{ $t('competitive.matchmaking.gameStartingSoon') }}
        </p>
      </div>

    </Transition>
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
/* ── RADAR ─────────────────────────────────────────────────── */

.radar {
  position: relative;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: #1a1b2e;
  border: 1px solid rgba(108, 92, 231, 0.35);
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(108, 92, 231, 0.08),
    0 0 40px rgba(108, 92, 231, 0.18),
    inset 0 0 40px rgba(108, 92, 231, 0.06);
  flex-shrink: 0;
}

@media (min-width: 640px) {
  .radar {
    width: 280px;
    height: 280px;
  }
}

/* Ambient radial glow */
.radar-glow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle at center, rgba(108, 92, 231, 0.14) 0%, transparent 65%);
  pointer-events: none;
}

/* Static concentric rings */
.radar-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(108, 92, 231, 0.18);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.radar-ring--outer { width: 88%;  height: 88%; }
.radar-ring--mid   { width: 62%;  height: 62%; }
.radar-ring--inner { width: 36%;  height: 36%; }

/* Cross-hair */
.radar-line {
  position: absolute;
  background: rgba(108, 92, 231, 0.14);
}
.radar-line--h {
  width: 100%;
  height: 1px;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
}
.radar-line--v {
  width: 1px;
  height: 100%;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
}

/* Rotating sweep (conic-gradient) */
.radar-sweep-wrap {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  animation: radar-rotate 3s linear infinite;
}
.radar-sweep {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    transparent 275deg,
    rgba(108, 92, 231, 0.06) 305deg,
    rgba(108, 92, 231, 0.22) 338deg,
    rgba(108, 92, 231, 0.45) 360deg
  );
}

@keyframes radar-rotate {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* Center dot */
.radar-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
}
.radar-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6c5ce7;
  box-shadow: 0 0 10px rgba(108, 92, 231, 0.9);
  position: relative;
  z-index: 1;
}
.radar-dot-ping {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6c5ce7;
  animation: radar-ping 2.2s ease-out infinite;
}
@keyframes radar-ping {
  0%   { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
  100% { transform: translate(-50%, -50%) scale(6); opacity: 0; }
}

/* Blip dots */
.blip {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #6c5ce7;
  box-shadow: 0 0 6px rgba(108, 92, 231, 0.8);
  animation: blip-pulse 2.4s ease-in-out infinite;
}
@keyframes blip-pulse {
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50%       { opacity: 0.9; transform: scale(1.3); }
}

/* ── FOUND STATE ────────────────────────────────────────────── */

.found-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 1.125rem;
  border-radius: 9999px;
  background: rgba(0, 208, 132, 0.14);
  border: 1px solid rgba(0, 208, 132, 0.45);
  color: #00d084;
  font-size: 0.875rem;
  font-weight: 600;
  animation: badge-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@keyframes badge-pop {
  from { transform: scale(0.6); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}

/* Players row */
.matchup {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 100%;
}
@media (min-width: 480px) {
  .matchup { gap: 1.75rem; }
}
@media (min-width: 640px) {
  .matchup { gap: 2.5rem; }
}

.player {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
  max-width: 110px;
}
@media (min-width: 640px) {
  .player { max-width: 140px; }
}

/* Slide-in animations */
.player--you {
  animation: slide-from-left 0.5s cubic-bezier(0.34, 1.4, 0.64, 1) both;
}
.player--opponent {
  animation: slide-from-right 0.5s cubic-bezier(0.34, 1.4, 0.64, 1) 0.08s both;
}
@keyframes slide-from-left {
  from { transform: translateX(-28px); opacity: 0; }
  to   { transform: translateX(0);     opacity: 1; }
}
@keyframes slide-from-right {
  from { transform: translateX(28px); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}

/* Avatar ring */
.avatar-ring {
  padding: 3px;
  border-radius: 50%;
}
.avatar-ring--purple {
  background: linear-gradient(135deg, #6c5ce7, #8b7cf8);
  box-shadow: 0 0 18px rgba(108, 92, 231, 0.55), 0 0 36px rgba(108, 92, 231, 0.2);
}
.avatar-ring--orange {
  background: linear-gradient(135deg, #ff6b35, #ff8c5a);
  box-shadow: 0 0 18px rgba(255, 107, 53, 0.55), 0 0 36px rgba(255, 107, 53, 0.2);
}

.avatar-inner {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #1a1b2e;
  border: 2px solid #1a1b2e;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
@media (min-width: 640px) {
  .avatar-inner { width: 88px; height: 88px; }
}

.avatar-initial {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}
.avatar-initial--purple { color: #6c5ce7; }
.avatar-initial--orange { color: #ff6b35; }

/* Player text */
.player-nick {
  font-size: 0.8rem;
  font-weight: 600;
  color: #e1e5e9;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}
@media (min-width: 640px) {
  .player-nick { font-size: 0.875rem; }
}

.player-elo {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #8b9aa8;
  font-weight: 500;
}

/* VS block */
.vs-block {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  animation: vs-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
}
.vs-text {
  font-family: 'Baloo 2', cursive;
  font-size: 2rem;
  font-weight: 800;
  color: #ff6b35;
  letter-spacing: 0.05em;
  text-shadow:
    0 0 16px rgba(255, 107, 53, 0.7),
    0 0 40px rgba(255, 107, 53, 0.3);
}
@media (min-width: 640px) {
  .vs-text { font-size: 2.75rem; }
}
@keyframes vs-pop {
  from { transform: scale(0.2) rotate(-20deg); opacity: 0; }
  to   { transform: scale(1)   rotate(0deg);   opacity: 1; }
}

/* ── STATE SWITCH TRANSITION ────────────────────────────────── */

.state-switch-enter-active,
.state-switch-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.state-switch-enter-from {
  opacity: 0;
  transform: scale(0.96) translateY(8px);
}
.state-switch-leave-to {
  opacity: 0;
  transform: scale(1.03) translateY(-8px);
}
</style>
