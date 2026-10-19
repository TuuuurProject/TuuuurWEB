<template>
  <auth-layout :title="title" :subtitle="subtitle" :mascot-message="$t('auth.login.mascot')">
    <transition name="fade" mode="out-in">
      <auth-forgot-password
        v-if="step === 0"
        @back="step = 1"
        @success="handleForgotPasswordSuccess"
      />

      <overlay-block v-else-if="step === 1" :loading="userStore.isLoading">
        <div class="flex flex-col gap-6">
          <form class="flex flex-col gap-5" @submit.prevent="loginUser">
            <div>
              <label class="field-label" for="username">{{ $t('auth.login.username') }}</label>
              <input
                id="username"
                v-model="login"
                data-testid="login-username"
                type="text"
                autocomplete="username"
                class="field-input"
                :placeholder="$t('auth.login.usernamePlaceholder')"
              />
            </div>
            <div>
              <div class="flex items-baseline justify-between gap-3">
                <label class="field-label" for="password">{{ $t('auth.login.password') }}</label>
                <button type="button" class="text-link text-sm" @click="step = 0">
                  {{ $t('auth.login.forgotPassword') }}
                </button>
              </div>
              <input
                id="password"
                v-model="password"
                data-testid="login-password"
                type="password"
                autocomplete="current-password"
                class="field-input"
                :placeholder="$t('auth.login.passwordPlaceholder')"
              />
            </div>

            <div v-if="error" class="form-error" role="alert">
              <template
                v-if="
                  typeof error === 'string' ||
                  (typeof error === 'object' && error?.name?.includes('Axios'))
                "
              >
                {{ error }}
              </template>
              <ul v-else-if="error && typeof error === 'object'" class="flex flex-col gap-1">
                <template v-for="field in Object.keys(error)" :key="field">
                  <li v-for="(msg, idx) in error[field]" :key="idx">
                    {{ typeof msg === 'string' ? msg : msg?.description }}
                  </li>
                </template>
              </ul>
            </div>

            <button
              data-testid="login-submit"
              type="submit"
              class="btn btn-primary w-full py-4"
              :disabled="!login || !password"
            >
              {{ $t('auth.login.submit') }}
            </button>
          </form>

          <div class="flex items-center gap-4" aria-hidden="true">
            <span class="h-px flex-1 bg-brand-line"></span>
            <span class="text-sm text-brand-muted">{{ $t('common.or') }}</span>
            <span class="h-px flex-1 bg-brand-line"></span>
          </div>

          <div class="flex justify-center">
            <google-login :callback="handleGoogleLogin" />
          </div>

          <p class="text-center text-sm text-brand-muted">
            {{ $t('auth.login.noAccount') }}
            <button type="button" class="text-link ml-1" @click="$emit('goto-register')">
              {{ $t('auth.login.createAccount') }}
            </button>
          </p>
        </div>
      </overlay-block>

      <auth-code v-else :loading="userStore.isLoading" @verification="verifyEmail" />
    </transition>
  </auth-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import useUserStore from '@/stores/user'
import OverlayBlock from '@/components/OverlayBlock.vue'
import router from '@/router'
import AuthCode from '@/components/auth/AuthCode.vue'
import AuthForgotPassword from '@/components/auth/AuthForgotPassword.vue'
import AuthLayout from '@/components/auth/AuthLayout.vue'

defineEmits<{ back: []; 'goto-register': [] }>()

const { t } = useI18n()
const login = ref('')
const password = ref('')

interface ErrorMessage {
  description?: string
}

type ErrorField = string | ErrorMessage

const error = ref<Record<string, ErrorField[]> | null>(null)
const step = ref(1) // 0: forgot password, 1: login, 2: verify email

const userStore = useUserStore()

const title = computed(() => {
  if (step.value === 0) return t('auth.forgotPassword.title')
  if (step.value === 2) return t('auth.verification.title')
  return t('auth.login.title')
})

const subtitle = computed(() => {
  if (step.value === 0) return t('auth.forgotPassword.description')
  if (step.value === 2) return t('auth.verification.message')
  return t('auth.login.subtitle')
})

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

// Handle forgot password success
const handleForgotPasswordSuccess = () => {
  step.value = 1
}
</script>

<style scoped>
/* Transition rapide entre les étapes */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
