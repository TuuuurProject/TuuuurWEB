<template>
  <section class="space-y-6">
    <header class="flex items-center">
      <h2 class="font-display text-3xl text-brand-lightGray glow-text">👤 Profil Joueur</h2>
    </header>

    <div class="gaming-card justify-self-center w-full">
      <!-- Logged in -->
      <div v-if="userStore.isLogged" class="space-y-6">
        <profil-block />
      </div>
      <!-- Not logged in -->
      <logged-in-block
        v-else
        message="Connectez ou créez vous un compte pour accéder à votre profil"
      />
    </div>

    <!-- Match History -->
    <div v-if="userStore.isLogged" class="gaming-card justify-self-center w-full">
      <match-history-block />
    </div>
  </section>
</template>

<script setup lang="ts">
import LoggedInBlock from '@/components/LoggedInBlock.vue'
import ProfilBlock from '@/components/profile/ProfilBlock.vue'
import MatchHistoryBlock from '@/components/profile/MatchHistoryBlock.vue'
import useUserStore from '@/stores/user.js'

const userStore = useUserStore()
</script>
