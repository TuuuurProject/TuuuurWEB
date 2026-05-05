<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <online-mode @back="router.push({ name: 'Home' })" />
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import OnlineMode from '@/components/online/OnlineMode.vue'

const router = useRouter()
</script>
