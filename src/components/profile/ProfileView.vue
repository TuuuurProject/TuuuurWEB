<template>
  <section class="space-y-6">
    <header class="flex items-center">
      <h2 class="font-display text-3xl text-brand-lightGray glow-text">
        <font-awesome-icon icon="user" /> {{ $t('profile.title') }}
      </h2>
    </header>

    <div class="gaming-card justify-self-center w-full">
      <!-- Logged in -->
      <div data-testid="profile-logged" v-if="userStore.isLogged" class="space-y-6">
        <profil-block />
      </div>
      <!-- Not logged in -->
      <logged-in-block v-else :message="$t('profile.notLoggedIn')" />
    </div>

    <!-- Match History -->
    <div
      data-testid="profile-history"
      v-if="userStore.isLogged"
      class="gaming-card justify-self-center w-full"
    >
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
