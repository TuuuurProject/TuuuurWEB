<template>
  <section class="space-y-6">
    <header class="flex items-center justify-between">
      <h2 class="font-branding text-3xl text-brand-lightGray glow-text">
        <font-awesome-icon icon="lock" class="mr-2" /> {{ $t('auth.login.title') }}
      </h2>
      <div class="badge-info">{{ $t('auth.login.badge') }}</div>
    </header>

    <transition name="fade" mode="out-in">
      <div v-if="step === 1" class="max-w-lg gaming-card mx-auto">
        <overlay-block :loading="userStore.isLoading">
          <form class="space-y-5" @submit.prevent="loginUser">
            <div>
              <label class="block font-semibold mb-1 text-brand-lightGray" for="username">{{
                $t('auth.login.username')
              }}</label>
              <input
                id="username"
                data-testid="login-username"
                v-model="login"
                type="text"
                class="w-full rounded-2xl border border-brand-purple/30 bg-brand-darkGray/50 px-4 py-3 text-brand-lightGray focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple"
                :placeholder="$t('auth.login.usernamePlaceholder')"
              />
            </div>
            <div>
              <label class="block font-semibold mb-1 text-brand-lightGray" for="password">{{
                $t('auth.login.password')
              }}</label>
              <input
                id="password"
                data-testid="login-password"
                v-model="password"
                type="password"
                class="w-full rounded-2xl border border-brand-purple/30 bg-brand-darkGray/50 px-4 py-3 text-brand-lightGray focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple"
                :placeholder="$t('auth.login.passwordPlaceholder')"
              />
              <div class="mt-2 text-sm">
                <button type="button" class="pill hover:bg-brand-purple/10">
                  {{ $t('auth.login.forgotPassword') }}
                </button>
              </div>
            </div>
            <div class="pt-2 flex items-center justify-center gap-3">
              <button type="button" class="btn btn-secondary" @click="$emit('back')">
                {{ $t('common.cancel') }}
              </button>
              <button data-testid="login-submit" type="submit" class="btn btn-primary">
                {{ $t('auth.login.submit') }}
              </button>
            </div>
          </form>
          <div v-if="error" class="my-5">
            <div
              class="rounded-lg p-4 text-sm text-red-400 bg-red-900/10 border border-red-400"
              role="alert"
            >
              <template
                v-if="
                  typeof error === 'string' ||
                  (typeof error === 'object' && error?.name?.includes('Axios'))
                "
              >
                {{ error }}
              </template>
              <template v-else-if="error && typeof error === 'object'">
                <ul
                  v-for="field in Object.keys(error)"
                  :key="field"
                  class="mt-1 list-disc list-inside"
                >
                  <li v-for="(msg, idx) in error[field]" :key="idx">
                    {{ typeof msg === 'string' ? msg : msg?.description }}
                  </li>
                </ul>
              </template>
            </div>
          </div>

          <div class="mt-6 text-center space-y-4">
            <div class="flex items-center justify-center gap-4">
              <div class="h-px bg-brand-purple/30 flex-1"></div>
              <span class="text-sm text-brand-gray">{{ $t('common.or') }}</span>
              <div class="h-px bg-brand-purple/30 flex-1"></div>
            </div>

            <google-login :callback="handleGoogleLogin" />
          </div>

          <div class="mt-6 text-sm text-brand-gray text-center">
            {{ $t('auth.login.noAccount') }}
            <button class="pill hover:bg-brand-purple/10 ml-2" @click="$emit('goto-register')">
              {{ $t('auth.login.createAccount') }}
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
import { useI18n } from 'vue-i18n'
import useUserStore from '@/stores/user'
import OverlayBlock from '@/components/OverlayBlock.vue'
import router from '@/router'
import AuthCode from '@/components/auth/AuthCode.vue'

const { t } = useI18n()
const login = ref('')
const password = ref('')

interface ErrorMessage {
  description?: string
}

type ErrorField = string | ErrorMessage

const error = ref<Record<string, ErrorField[]> | null>(null)
const step = ref(1) // 1: login, 2: verify email

const userStore = useUserStore()

// Connect user
const loginUser = async () => {
  if (!login.value || !password.value) return
  error.value = await userStore.login({ login: login.value, password: password.value })
  if (typeof error.value === 'boolean' && error.value) {
    step.value = 2
  } else if (error.value === null) {
    // Login successful without email verification
    redirectAfterLogin()
  }
}

const verifyEmail = async (code: string) => {
  error.value = await userStore.verifyEmail({
    login: login.value,
    code: code,
  })
  // If token exists in error, redirect
  if (error.value && error.value.token) {
    redirectAfterLogin()
  }
}

// Google login handler
const handleGoogleLogin = (response: { credential?: string }) => {
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
    redirectAfterLogin()
  } else {
    error.value = result || [
      {
        code: 'Google',
        description: t('auth.googleError'),
      },
    ]
  }
}

// Fonction de redirection après connexion
const redirectAfterLogin = () => {
  if (userStore.comeFrom) {
    const destination = userStore.comeFrom
    userStore.comeFrom = null // Nettoyer après utilisation
    router.push(destination)
  } else {
    router.push({ name: 'Home' })
  }
}
</script>
