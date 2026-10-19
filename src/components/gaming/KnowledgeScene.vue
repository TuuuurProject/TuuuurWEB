<template>
  <div class="knowledge-scene" aria-hidden="true">
    <div class="scene-grid" />
    <div class="scene-orbit scene-orbit--outer" />
    <div class="scene-orbit scene-orbit--inner" />
    <span class="scene-spark scene-spark--one">+</span>
    <span class="scene-spark scene-spark--two">+</span>
    <span class="scene-dot scene-dot--one" />
    <span class="scene-dot scene-dot--two" />
    <div class="jungle-halo" />
    <div class="jungle-platform"><span /></div>
    <div class="jungle-leaf jungle-leaf--left" />
    <div class="jungle-leaf jungle-leaf--right" />
    <div class="mascot-stage"><MonkeyMascot /></div>
    <div class="mascot-sticker">{{ $t('arena.scene.greeting') }} <span>✦</span></div>
    <div class="cube-shadow" />
    <div class="cube-stage">
      <div class="knowledge-cube">
        <div class="cube-face cube-front"><span>?</span><i /><i /><i /><i /></div>
        <div class="cube-face cube-back"><span>?</span></div>
        <div class="cube-face cube-right"><font-awesome-icon icon="bolt" /></div>
        <div class="cube-face cube-left"><font-awesome-icon icon="star" /></div>
        <div class="cube-face cube-top"><font-awesome-icon icon="lightbulb" /></div>
        <div class="cube-face cube-bottom" />
      </div>
    </div>
    <div class="satellite satellite--science">
      <font-awesome-icon icon="flask" />
      <span>{{ $t('arena.scene.science') }}</span>
    </div>
    <div class="satellite satellite--cinema">
      <font-awesome-icon icon="film" />
      <span>{{ $t('arena.scene.cinema') }}</span>
    </div>
    <div class="satellite satellite--history">
      <font-awesome-icon icon="university" />
      <span>{{ $t('arena.scene.history') }}</span>
    </div>
    <div class="scene-caption"><span /> {{ $t('arena.scene.caption') }}</div>
  </div>
</template>

<script setup lang="ts">
import MonkeyMascot from './MonkeyMascot.vue'
</script>
