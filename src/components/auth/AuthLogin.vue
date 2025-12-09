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
          {{ error }}

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

            <button
              type="button"
              @click="handleGoogleLogin"
              class="w-full flex items-center justify-center gap-3 rounded-2xl border border-brand-purple/30 bg-white px-4 py-3 font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuer avec Google
            </button>
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
import { googleTokenLogin } from 'vue3-google-login'

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
const handleGoogleLogin = () => {
  googleTokenLogin()
    .then((response: any) => {
      // The backend expects the credential (ID token), not the access token
      const idToken = response.credential || response.access_token
      if (idToken) {
        loginWithGoogle(idToken)
      }
    })
    .catch((error) => {
      console.error('Google login error:', error)
      error.value = [{ code: 'Google', description: 'Erreur lors de la connexion avec Google' }]
    })
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
