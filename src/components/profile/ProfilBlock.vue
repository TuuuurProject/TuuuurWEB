<template>
  <overlay-block :loading="userStore.isLoading">
    <!-- Profil utilisateur avec design gaming -->
    <div
      class="flex items-center gap-4 p-4 rounded-2xl bg-brand-purple/10 border border-brand-purple/20"
    >
      <div class="relative">
        <img
          v-if="userStore.userInfo?.avatar"
          :src="userStore.userInfo?.avatar"
          alt="avatar"
          class="h-16 w-16 rounded-full border-2 border-brand-purple shadow-neon object-cover"
        />
        <div
          v-else
          class="h-16 w-16 rounded-full border-2 border-brand-purple flex items-center justify-center"
        >
          <span class="text-2xl font-bold text-brand-purple">
            {{ userStore.userInfo?.nickName?.charAt(0).toUpperCase() || '?' }}
          </span>
        </div>
      </div>
      <div class="flex-1">
        <div class="font-branding text-2xl text-brand-lightGray">
          {{ userStore.userInfo?.nickName }}
        </div>
        <div class="text-sm text-brand-gray">{{ userStore.userInfo?.email }}</div>
      </div>
      <div class="text-right">
        <div class="pill bg-brand-orange/20 border-brand-orange/40 text-brand-orange font-bold">
          <font-awesome-icon icon="trophy" class="mr-1" /> Élo: 1210
        </div>
        <!-- <button class="btn btn-ghost mt-2 text-xs py-1 px-3" @click="openPicker = true">
          <font-awesome-icon icon="cog" class="mr-1" /> Modifier avatar
        </button> -->
      </div>
    </div>

    <div>
      <div class="mt-4 flex items-center justify-end">
        <button class="btn btn-ghost" @click="userStore.logout()">
          <font-awesome-icon icon="sign-out-alt" class="mr-2" /> Se déconnecter
        </button>
      </div>
    </div>
  </overlay-block>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import OverlayBlock from '@/components/OverlayBlock.vue'

import useUserStore from '@/stores/user.js'

const userStore = useUserStore()

onMounted(() => {
  // Get user info to display
  userStore.getUserInfo()
})
</script>
