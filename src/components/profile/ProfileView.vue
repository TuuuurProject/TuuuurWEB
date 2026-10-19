<template>
  <section class="flex flex-col gap-6">
    <header class="flex flex-col gap-2">
      <h2 class="text-3xl font-bold">{{ $t('profile.title') }}</h2>
    </header>

    <div
      v-if="userStore.isLogged"
      data-testid="profile-logged"
      class="grid grid-cols-1 gap-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start"
    >
      <aside class="surface-card min-w-0 lg:sticky lg:top-24">
        <profil-block />
      </aside>
      <section data-testid="profile-history" class="surface-card min-w-0">
        <match-history-block />
      </section>
    </div>

    <div v-else class="surface-card w-full">
      <logged-in-block :message="$t('profile.notLoggedIn')" />
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
