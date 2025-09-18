<template>
  <main class="min-h-screen bg-brand-dark text-brand-lightGray">
    <header-block />

    <section id="body-block" class="bg-brand-dark">
      <router-view id="content_page" v-slot="{ Component }">
        <transition name="slide-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </section>
  </main>
</template>

<script setup lang="ts">
import HeaderBlock from './components/HeaderBlock.vue'
</script>

<style>
/* Styles pour le contenu */
.content {
  transition: margin-left 0.5s;

  overflow: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/*

Enter and leave animations can use different
durations and timing functions.

*/

.slide-fade-enter-active {
  transition: all 0.2s ease-out;

  overflow: hidden !important;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);

  overflow: hidden !important;
}

.slide-fade-enter-from {
  transform: translateX(20px);

  opacity: 0;

  overflow: hidden !important;
}

.slide-fade-leave-to {
  transform: translateX(-20px);

  opacity: 0;

  overflow: hidden !important;
}

.slide-fade-reverse-enter-active {
  transition: all 0.2s ease-out;
  overflow: hidden !important;
}

.slide-fade-reverse-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
  overflow: hidden !important;
}

.slide-fade-reverse-enter-from {
  transform: translateX(-20px);
  opacity: 0;
  overflow: hidden !important;
}

.slide-fade-reverse-leave-to {
  transform: translateX(20px);
  opacity: 0;
  overflow: hidden !important;
}
</style>

<style scoped>
section#body-block {
  min-height: calc(100vh - 75px);
}
</style>
