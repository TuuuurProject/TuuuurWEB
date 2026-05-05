<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <auth-login
      @back="router.push({ name: 'Profile' })"
      @goto-register="router.push({ name: 'Register' })"
    />
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import AuthLogin from '@/components/auth/AuthLogin.vue'

const router = useRouter()
</script>
