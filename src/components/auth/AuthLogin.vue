<template>
  <section class="space-y-6">
    <header class="flex items-center justify-between">
      <h2 class="font-branding text-3xl text-brand-lightGray glow-text">
        <font-awesome-icon icon="lock" class="mr-2" /> Connexion
      </h2>
      <div class="badge-info">Pseudo + mot de passe</div>
    </header>

    <transition name="fade" mode="out-in">
      <div v-if="step === 1" class="max-w-lg gaming-card mx-auto">
        <overlay-block :loading="userStore.isLoading">
          <form class="space-y-5" @submit.prevent="loginUser">
            <div>
              <label class="block font-semibold mb-1 text-brand-lightGray" for="username"
                >Pseudo</label
              >
              <input
                id="username"
                v-model="login"
                type="text"
                class="w-full rounded-2xl border border-brand-purple/30 bg-brand-darkGray/50 px-4 py-3 text-brand-lightGray focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple"
                placeholder="Votre pseudo"
              />
            </div>
            <div>
              <label class="block font-semibold mb-1 text-brand-lightGray" for="password"
                >Mot de passe</label
              >
              <input
                id="password"
                v-model="password"
                type="password"
                class="w-full rounded-2xl border border-brand-purple/30 bg-brand-darkGray/50 px-4 py-3 text-brand-lightGray focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple"
                placeholder="••••••••"
              />
              <div class="mt-2 text-sm">
                <button type="button" class="pill hover:bg-brand-purple/10">
                  Mot de passe oublié ?
                </button>
              </div>
            </div>
            <div class="pt-2 flex items-center justify-center gap-3">
              <button type="button" class="btn btn-secondary" @click="$emit('back')">
                Annuler
              </button>
              <button type="submit" class="btn btn-primary">Se connecter</button>
            </div>
          </form>
          <div v-if="error" class="my-5">
            <div
              class="rounded-lg p-4 text-sm text-red-400 bg-red-900/10 border border-red-400"
              role="alert"
            >
              <ul
                v-for="field in Object.keys(error)"
                :key="field"
                class="mt-1 list-disc list-inside"
              >
                <li>{{ error[field]?.description }}</li>
              </ul>
            </div>
          </div>

          <div class="mt-6 text-center space-y-4">
            <div class="flex items-center justify-center gap-4">
              <div class="h-px bg-brand-purple/30 flex-1"></div>
              <span class="text-sm text-brand-gray">OU</span>
              <div class="h-px bg-brand-purple/30 flex-1"></div>
            </div>

            <google-login :callback="handleGoogleLogin" />
          </div>

          <div class="mt-6 text-sm text-brand-gray text-center">
            Pas de compte ?
            <button class="pill hover:bg-brand-purple/10 ml-2" @click="$emit('goto-register')">
              Créer un compte
            </button>
          </div>
        </overlay-block>
      </div>
      <div v-else class="max-w-lg gaming-card mx-auto">
        <auth-code :loading="userStore.isLoading" @verification="verifyEmail" />
      </div>
    </transition>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import useUserStore from '@/stores/user'
import OverlayBlock from '@/components/OverlayBlock.vue'
import router from '@/router'
import AuthCode from '@/components/auth/AuthCode.vue'

const login = ref('')
const password = ref('')
const error = ref<Record<string, string[]> | null>(null)
const step = ref(1) // 1: login, 2: verify email

const userStore = useUserStore()

// Connect user
const loginUser = async () => {
  if (!login.value || !password.value) return
  error.value = await userStore.login({ login: login.value, password: password.value })
  if (typeof error.value === 'boolean' && error.value) step.value = 2
}

const verifyEmail = async (code: string) => {
  error.value = await userStore.verifyEmail({
    login: login.value,
    code: code,
  })
  // If token exists in error, redirect to home
  if (error.value && error.value.token && userStore.comeFrom) router.push(userStore.comeFrom)
  else if (error.value && error.value.token) router.push({ name: 'Home' })
}

// Google login handler
const handleGoogleLogin = (response: any) => {
  // The backend expects the credential (ID token), not the access token
  const idToken = response.credential
  if (idToken) {
    loginWithGoogle(idToken)
  }
}

const loginWithGoogle = async (token: string) => {
  const result = await userStore.googleLogin(token)

  if (result && result.token) {
    // Successfully logged in, redirect
    if (userStore.comeFrom) {
      router.push(userStore.comeFrom)
    } else {
      router.push({ name: 'Home' })
    }
  } else {
    error.value = result || [
      {
        code: 'Google',
        description: 'Erreur lors de la connexion avec Google',
      },
    ]
  }
}
</script>
