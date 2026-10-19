<template>
  <auth-layout
    :title="step === 1 ? $t('auth.register.title') : $t('auth.verification.title')"
    :subtitle="step === 1 ? $t('auth.register.subtitle') : $t('auth.verification.message')"
    :mascot-message="$t('auth.register.mascot')"
  >
    <transition name="fade" mode="out-in">
      <overlay-block v-if="step === 1" :loading="userStore.isLoading">
        <div class="flex flex-col gap-6">
          <form class="flex flex-col gap-5" @submit.prevent="registerAuth">
            <div class="flex flex-col gap-2">
              <div>
                <label class="field-label" for="nickName">{{ $t('auth.register.nickname') }}</label>
                <input
                  id="nickName"
                  v-model="registerData.nickName"
                  type="text"
                  maxlength="50"
                  autocomplete="nickname"
                  class="field-input"
                  :placeholder="$t('auth.register.nicknamePlaceholder')"
                  required
                />
              </div>
              <field-rules v-if="registerData.nickName" :rules="nicknameRuleList" />
            </div>

            <div>
              <label class="field-label" for="email">{{ $t('auth.register.email') }}</label>
              <input
                id="email"
                v-model="registerData.email"
                type="email"
                autocomplete="email"
                class="field-input"
                :placeholder="$t('auth.register.emailPlaceholder')"
                required
              />
            </div>

            <div class="flex flex-col gap-2">
              <div>
                <label class="field-label" for="password">{{ $t('auth.register.password') }}</label>
                <input
                  id="password"
                  v-model="registerData.password"
                  type="password"
                  autocomplete="new-password"
                  class="field-input"
                  :placeholder="$t('auth.register.passwordPlaceholder')"
                  required
                />
              </div>
              <field-rules v-if="registerData.password" :rules="passwordRuleList" />
            </div>

            <div class="flex flex-col gap-2">
              <div>
                <label class="field-label" for="confirmPassword">
                  {{ $t('auth.register.confirmPassword') }}
                </label>
                <input
                  id="confirmPassword"
                  v-model="registerData.confirmPassword"
                  type="password"
                  autocomplete="new-password"
                  class="field-input"
                  :placeholder="$t('auth.register.confirmPasswordPlaceholder')"
                  required
                />
              </div>
              <field-rules
                v-if="registerData.confirmPassword"
                :rules="[
                  { ok: passwordRules.passwordsMatch, label: $t('auth.register.passwordsMatch') },
                ]"
              />
            </div>

            <div v-if="error" class="form-error" role="alert">
              <ul class="flex flex-col gap-1">
                <template v-for="field in Object.keys(error)" :key="field">
                  <li v-for="(msg, idx) in error[field]" :key="idx">
                    {{ typeof msg === 'string' ? msg : msg?.description }}
                  </li>
                </template>
              </ul>
            </div>

            <button type="submit" class="btn btn-primary w-full py-4" :disabled="!isFormValid">
              {{ $t('auth.register.submit') }}
            </button>
          </form>

          <p class="text-center text-sm text-brand-muted">
            {{ $t('auth.register.alreadyRegistered') }}
            <button type="button" class="text-link ml-1" @click="$emit('goto-login')">
              {{ $t('auth.register.signIn') }}
            </button>
          </p>
        </div>
      </overlay-block>

      <auth-code v-else :loading="userStore.isLoading" @verification="verifyEmail" />
    </transition>
  </auth-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import useUserStore from '@/stores/user'
import OverlayBlock from '@/components/OverlayBlock.vue'
import AuthCode from '@/components/auth/AuthCode.vue'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import FieldRules from '@/components/auth/FieldRules.vue'
import { useI18n } from 'vue-i18n'

defineEmits<{ back: []; 'goto-login': [] }>()

const { t } = useI18n()

const userStore = useUserStore()
const router = useRouter()

const step = ref(1)

const registerData = ref<{
  nickName: string
  email: string
  password: string
  confirmPassword: string
}>({
  nickName: '',
  email: '',
  password: '',
  confirmPassword: '',
})

interface ErrorMessage {
  description?: string
}

type ErrorField = string | ErrorMessage

const error = ref<Record<string, ErrorField[]> | null>(null)

const NICKNAME_REGEX = /^[a-zA-Z0-9\- ]+$/

// Nickname validation rules
const nicknameRules = computed(() => {
  const trimmed = registerData.value.nickName.trim()
  return {
    maxLength: trimmed.length > 0 && trimmed.length <= 50,
    validFormat: trimmed.length > 0 && NICKNAME_REGEX.test(trimmed),
  }
})

// Password validation rules
const passwordRules = computed(() => ({
  minLength: registerData.value.password.length >= 8,
  hasLowercase: /[a-z]/.test(registerData.value.password),
  hasUppercase: /[A-Z]/.test(registerData.value.password),
  hasNumber: /\d/.test(registerData.value.password),
  passwordsMatch:
    registerData.value.password === registerData.value.confirmPassword &&
    registerData.value.password.length > 0 &&
    registerData.value.confirmPassword.length > 0,
}))

const nicknameRuleList = computed(() => [
  { ok: nicknameRules.value.maxLength, label: t('auth.register.nicknameMaxLength') },
  { ok: nicknameRules.value.validFormat, label: t('auth.register.nicknameFormat') },
])

const passwordRuleList = computed(() => [
  { ok: passwordRules.value.minLength, label: t('auth.register.passwordMinLength') },
  { ok: passwordRules.value.hasLowercase, label: t('auth.register.passwordLowercase') },
  { ok: passwordRules.value.hasUppercase, label: t('auth.register.passwordUppercase') },
  { ok: passwordRules.value.hasNumber, label: t('auth.register.passwordNumber') },
])

// Check if the form is valid
const isFormValid = computed(() => {
  return (
    nicknameRules.value.maxLength &&
    nicknameRules.value.validFormat &&
    registerData.value.email.trim() !== '' &&
    passwordRules.value.minLength &&
    passwordRules.value.hasLowercase &&
    passwordRules.value.hasUppercase &&
    passwordRules.value.hasNumber &&
    passwordRules.value.passwordsMatch
  )
})

const registerAuth = async () => {
  if (!isFormValid.value) {
    return
  }

  error.value = await userStore.register(registerData.value)
  if (typeof error.value === 'boolean' && error.value) step.value = 2
}

const verifyEmail = async (code: string) => {
  error.value = await userStore.verifyEmail({
    login: registerData.value.email,
    code: code,
  })
  // If token exists in error, redirect
  if (error.value && error.value.token) {
    if (userStore.comeFrom) {
      const destination = userStore.comeFrom
      userStore.comeFrom = null // Nettoyer après utilisation
      router.push(destination)
    } else {
      router.push({ name: 'Home' })
    }
  }
}
</script>

<style scoped>
/* Transition smooth pour l'apparition du panneau de validation */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
