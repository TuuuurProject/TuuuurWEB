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
      <div class="art-pawn art-pawn--left"><span /><i /></div>
      <div class="art-pawn art-pawn--right"><span /><i /></div>
      <div class="art-pawn art-pawn--center"><span /><i /></div>
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
defineProps<{ variant: 'solo' | 'group' | 'ranked' }>()
</script>
