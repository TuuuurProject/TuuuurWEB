<template>
  <div data-testid="profile-not-logged" class="text-center p-6 text-brand-gray">
    <p class="mb-4">{{ props.message }}</p>
    <div class="flex items-center justify-center gap-6">
      <button id="btnSeConnecter" class="btn btn-primary" @click="router.push({ name: 'Login' })">
        <font-awesome-icon icon="lock" class="mr-2" /> {{ $t('auth.login.submit') }}
      </button>

      <button class="btn btn-secondary ml-2" @click="router.push({ name: 'Register' })">
        <font-awesome-icon icon="user-plus" class="mr-2" /> {{ $t('auth.login.createAccount') }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import useUserStore from '@/stores/user.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()

const props = defineProps<{
  message?: string
  comeFrom?: string
}>()

// Store the current route to redirect after login
// Seulement si on a un comeFrom explicite via props et qu'il n'existe pas déjà
onMounted(() => {
  if (!userStore.comeFrom && props.comeFrom) {
    userStore.comeFrom = props.comeFrom
  }
})
</script>
