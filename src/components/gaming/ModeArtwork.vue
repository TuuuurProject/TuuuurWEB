<template>
  <div class="mode-art" :class="`mode-art--${variant}`" aria-hidden="true">
    <div class="art-orbit" />
    <template v-if="variant === 'solo'">
      <div class="art-target">
        <span><font-awesome-icon icon="bolt" /></span>
      </div>
      <span class="art-star art-star--one">+</span>
      <span class="art-star art-star--two">+</span>
    </template>
    <template v-else-if="variant === 'group'">
      <div class="art-friend art-friend--left"><MonkeyMascot portrait /></div>
      <div class="art-friend art-friend--right"><MonkeyMascot portrait /></div>
      <div class="art-friend art-friend--center"><MonkeyMascot portrait /></div>
    </template>
    <template v-else>
      <div class="art-podium" />
      <div class="art-trophy"><font-awesome-icon icon="trophy" /></div>
      <span class="art-star art-star--one">+</span>
      <span class="art-star art-star--two">+</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import MonkeyMascot from './MonkeyMascot.vue'

defineProps<{ variant: 'solo' | 'group' | 'ranked' }>()
</script>
