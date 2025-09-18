<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <profile-view
      @goto-login="router.push({ name: 'Login' })"
      @goto-register="router.push({ name: 'Register' })"
    />
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import ProfileView from '@/components/profile/ProfileView.vue'

const router = useRouter()
</script>
