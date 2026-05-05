<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <auth-register
      @back="router.push({ name: 'Profile' })"
      @goto-login="router.push({ name: 'Login' })"
    />
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import AuthRegister from '@/components/auth/AuthRegister.vue'

const router = useRouter()
</script>
