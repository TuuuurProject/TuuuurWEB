<template>
  <div class="text-center p-6 text-brand-gray">
    <p class="mb-4">Vous n'êtes pas connecté.</p>
    <div class="flex items-center justify-center gap-6">
      <button class="btn btn-primary" @click="router.push({ name: 'Login' })">
        <font-awesome-icon icon="lock" class="mr-2" /> Se connecter
      </button>

      <button class="btn btn-secondary ml-2" @click="router.push({ name: 'Register' })">
        <font-awesome-icon icon="user-plus" class="mr-2" /> Créer un compte
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>
