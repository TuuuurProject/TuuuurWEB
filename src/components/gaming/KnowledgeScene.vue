<template>
  <section class="character-showcase" :aria-label="$t('arena.scene.label')">
    <div class="character-backdrop" aria-hidden="true">
      <div class="character-orbit" />
      <span class="character-wordmark">MONKIZZ</span>
      <span class="character-star character-star--one">✦</span>
      <span class="character-star character-star--two">✧</span>
      <span class="character-stamp">{{ $t('arena.scene.stamp') }}</span>
    </div>
    <div class="character-speech" aria-live="polite">
      {{ $t(reacted ? 'arena.scene.joke' : 'arena.scene.greeting') }}
    </div>
    <div class="character-viewport" role="img" :aria-label="$t('arena.scene.description')">
      <Monkey3D ref="monkey" @status="state = $event" />
    </div>
    <div class="character-nameplate">
      <span class="character-name">Moki<span>✦</span></span>
      <span>{{ $t('arena.scene.caption') }}</span>
    </div>
    <div class="character-controls">
      <template v-if="state === 'ready'">
        <button type="button" :aria-label="$t('arena.scene.turnLeft')" @click="monkey?.turn(-1)">
          <span aria-hidden="true">↶</span>
        </button>
        <button type="button" class="character-react" @click="react">
          <font-awesome-icon icon="bolt" aria-hidden="true" />
          {{ $t('arena.scene.react') }}
        </button>
        <button type="button" :aria-label="$t('arena.scene.turnRight')" @click="monkey?.turn(1)">
          <span aria-hidden="true">↷</span>
        </button>
      </template>
      <p v-else role="status">{{ $t(`arena.scene.${state}`) }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Monkey3D from './Monkey3D.vue'

const monkey = ref<InstanceType<typeof Monkey3D>>()
const state = ref<'loading' | 'ready' | 'unavailable'>('loading')
const reacted = ref(false)
function react() {
  reacted.value = !reacted.value
  monkey.value?.celebrate()
}
</script>

<style scoped>
.character-showcase {
  position: relative;
  min-width: 0;
  height: 540px;
  isolation: isolate;
}
.character-backdrop {
  position: absolute;
  inset: 20px 0 63px;
  overflow: hidden;
  border-radius: 46% 46% 28px 28px;
  background:
    radial-gradient(ellipse at 35% 20%, #b5a0ef66, transparent 65%),
    linear-gradient(160deg, #665184, #352a51 65%, #282136);
  border: 1px solid #e5ceff23;
}
.character-backdrop::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(#eedfff24 1px, transparent 1px);
  background-size: 16px 16px;
  mask-image: linear-gradient(transparent 20%, #000);
}
.character-orbit {
  position: absolute;
  width: 90%;
  height: 76%;
  left: 5%;
  top: 8%;
  border: 1px solid #e0caff24;
  border-radius: 50%;
  box-shadow:
    0 0 0 28px #d8beff08,
    0 0 0 56px #d8beff04;
}
.character-wordmark {
  position: absolute;
  top: 47px;
  left: 0;
  width: 100%;
  text-align: center;
  font-size: clamp(48px, 6vw, 82px);
  letter-spacing: -0.07em;
  font-weight: 950;
  color: #e3d1ff17;
  transform: rotate(-9deg);
}
.character-viewport {
  position: absolute;
  inset: 26px -15px 76px;
}
.character-speech {
  position: absolute;
  top: 16px;
  right: 8px;
  z-index: 2;
  max-width: 210px;
  padding: 14px 18px;
  border-radius: 18px 18px 18px 4px;
  transform: rotate(7deg);
  background: #fff4db;
  color: #332443;
  box-shadow:
    0 5px 0 #d2c0a9,
    0 14px 24px #15101c40;
  font-size: 0.85rem;
  font-weight: 800;
  line-height: 1.5;
}
.character-star {
  position: absolute;
  color: #d6f776;
  font-size: 38px;
}
.character-star--one {
  top: 26%;
  left: 7%;
  transform: rotate(-12deg);
}
.character-star--two {
  right: 6%;
  bottom: 26%;
  font-size: 46px;
}
.character-stamp {
  position: absolute;
  left: 18px;
  bottom: 23px;
  color: #eadbffb0;
  font-size: 0.55rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
}
.character-nameplate {
  position: absolute;
  bottom: 70px;
  right: 24px;
  display: grid;
  gap: 2px;
  transform: rotate(-5deg);
  padding: 12px 22px;
  background: #d5f57b;
  color: #24311a;
  border-radius: 12px;
  box-shadow: 0 5px 0 #758e3e;
}
.character-name {
  font-size: 1.5rem;
  font-weight: 900;
  line-height: 1;
}
.character-name > span {
  margin-left: 22px;
  font-size: 1rem;
}
.character-nameplate > span:last-child {
  font-size: 0.65rem;
  font-weight: 650;
}
.character-controls {
  position: absolute;
  bottom: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 44px;
}
.character-controls button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 44px;
  min-height: 44px;
  border: 1px solid #c2acff30;
  border-radius: 50%;
  background: #242032;
  color: #e3d5ff;
  transition: background 0.2s;
}
.character-controls button:hover {
  background: #49365f;
}
.character-controls button > span {
  font-size: 1.4rem;
}
.character-controls .character-react {
  border-radius: 24px;
  padding: 0 18px;
  font-weight: 650;
  font-size: 0.72rem;
}
.character-controls p {
  font-size: 0.7rem;
  color: #b9accd;
  text-align: center;
}
@media (max-width: 1023px) and (min-width: 768px) {
  .character-showcase {
    height: 470px;
  }
  .character-speech {
    font-size: 0.73rem;
    max-width: 180px;
  }
}
@media (max-width: 767px) {
  .character-showcase {
    width: min(100%, 460px);
    height: 470px;
    margin: 24px auto 0;
  }
  .character-wordmark {
    font-size: 66px;
  }
}
@media (max-width: 380px) {
  .character-showcase {
    height: 425px;
  }
  .character-speech {
    right: 0;
    max-width: 170px;
    font-size: 0.73rem;
  }
  .character-nameplate {
    right: 12px;
    bottom: 67px;
    padding: 10px 16px;
  }
  .character-viewport {
    inset-inline: -10px;
  }
  .character-wordmark {
    font-size: 54px;
  }
}
</style>
